// app/(app)/(tabs)/contacts/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import { ContactDoc } from '../../../../src/services/firebase/contactService';
import { useAuthStore } from '../../../../src/store/authStore';
import { useContactsStore } from '../../../../src/store/contactsStore';

export default function ContactsListScreen() {
    const user = useAuthStore((s) => s.user);
    const tenantId = user?.tenantId;
    const { theme } = useTheme();
    const router = useRouter();

    const {
        items,
        statusFilter,
        setStatusFilter,
        loadingInitial,
        loadingMore,
        hasMore,
        fetchInitial,
        fetchMore,
    } = useContactsStore();

    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Carrega página inicial quando tiver tenant
    useEffect(() => {
        if (tenantId) {
            fetchInitial(tenantId);
        }
    }, [tenantId, fetchInitial]);

    const filteredContacts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;

        return items.filter((c) => {
            const name = c.name?.toLowerCase() || '';
            const email = c.email?.toLowerCase() || '';
            const company = c.companyName?.toLowerCase() || '';
            return (
                name.includes(term) ||
                email.includes(term) ||
                company.includes(term)
            );
        });
    }, [items, search]);

    function handleRefresh() {
        if (!tenantId) return;
        setRefreshing(true);
        fetchInitial(tenantId).finally(() => setRefreshing(false));
    }

    if (!user || !tenantId) {
        return (
            <ScreenContainer
                title="Contatos"
                subtitle="Você precisa estar vinculado a uma empresa para gerenciar contatos."
                pillLabel="Contatos"
            >
                <EmptyState
                    title="Sem empresa vinculada"
                    description="Peça para o administrador MASTER associar sua conta a um tenant antes de usar o módulo de contatos."
                />
            </ScreenContainer>
        );
    }

    const totalCount = items.length;
    const activeCount = items.filter((c) => c.isActive).length;
    const archivedCount = items.filter((c) => !c.isActive).length;

    return (
        <ScreenContainer
            title="Contatos"
            subtitle="Central de contatos do Innoma CRM."
            pillLabel="Contatos"
        >
            {/* RESUMO RÁPIDO (KPI) */}
            <SectionCard
                title="Visão geral"
                subtitle="Acompanhe o volume de contatos do seu CRM."
                badge="Resumo"
            >
                <View style={styles.metricsRow}>
                    <MetricBadge label="Total" value={totalCount} />
                    <MetricBadge label="Ativos" value={activeCount} tone="success" />
                    <MetricBadge label="Arquivados" value={archivedCount} tone="muted" />
                </View>
            </SectionCard>

            {/* PAINEL SUPERIOR: busca, filtros, CTA */}
            <View
                style={[
                    styles.filterPanel,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
            >
                {/* Busca */}
                <View
                    style={[
                        styles.searchWrapper,
                        {
                            backgroundColor: theme.background,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Ionicons name="search-outline" size={18} color={theme.textSoft} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar por nome, e-mail ou empresa"
                        placeholderTextColor={theme.textSoft}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Filtros de status */}
                <View style={styles.chipsRow}>
                    <FilterChip
                        label="Ativos"
                        selected={statusFilter === 'active'}
                        onPress={() => setStatusFilter('active')}
                    />
                    <FilterChip
                        label="Arquivados"
                        selected={statusFilter === 'archived'}
                        onPress={() => setStatusFilter('archived')}
                    />
                    <FilterChip
                        label="Todos"
                        selected={statusFilter === 'all'}
                        onPress={() => setStatusFilter('all')}
                    />
                </View>

                {/* CTA */}
                <PrimaryButton
                    label="Novo contato"
                    variant="secondary"
                    onPress={() => router.push('/(app)/(tabs)/contacts/create')}
                />
            </View>

            {/* LISTAGEM */}
            <SectionCard
                title="Lista de contatos"
                subtitle={
                    filteredContacts.length
                        ? 'Toque em um contato para editar ou ver mais detalhes.'
                        : loadingInitial
                            ? 'Carregando contatos...'
                            : 'Nenhum contato encontrado com os filtros atuais.'
                }
                badge="Base de contatos"
            >
                <FlatList
                    data={filteredContacts}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    onEndReached={() => {
                        if (!loadingMore && hasMore && !loadingInitial) {
                            fetchMore();
                        }
                    }}
                    onEndReachedThreshold={0.4}
                    ListEmptyComponent={
                        !loadingInitial ? (
                            <EmptyState
                                title="Nada por aqui ainda"
                                description="Crie seu primeiro contato para começar a alimentar o CRM."
                            />
                        ) : null
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ThemedText variant="caption" style={{ marginTop: 8 }}>
                                Carregando mais contatos...
                            </ThemedText>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <ContactRow
                            contact={item}
                            onPress={() => router.push(`/(app)/(tabs)/contacts/${item.id}`)}
                        />
                    )}
                />
            </SectionCard>
        </ScreenContainer>
    );
}

/* ---------- COMPONENTES DE UI ESPECÍFICOS ---------- */

type MetricBadgeProps = {
    label: string;
    value: number;
    tone?: 'default' | 'success' | 'muted';
};

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, tone = 'default' }) => {
    const { theme } = useTheme();

    const toneColor =
        tone === 'success'
            ? theme.primary
            : tone === 'muted'
                ? theme.textSoft
                : theme.text;

    return (
        <View style={styles.metricBadge}>
            <ThemedText variant="caption" style={{ color: theme.textSoft }}>
                {label}
            </ThemedText>
            <ThemedText bold style={[styles.metricValue, { color: toneColor }]}>
                {value}
            </ThemedText>
        </View>
    );
};

type FilterChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterChip,
                {
                    backgroundColor: selected ? theme.primarySoft : theme.background,
                    borderColor: selected ? theme.primary : theme.border,
                },
            ]}
        >
            <ThemedText
                variant="caption"
                style={{
                    color: selected ? theme.primary : theme.textSoft,
                }}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

type ContactRowProps = {
    contact: ContactDoc;
    onPress: () => void;
};

const ContactRow: React.FC<ContactRowProps> = ({ contact, onPress }) => {
    const { theme } = useTheme();
    const initials = getInitials(contact.name);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                styles.contactRow,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
        >
            {/* Avatar com iniciais */}
            <View
                style={[
                    styles.avatar,
                    { backgroundColor: theme.primarySoft },
                ]}
            >
                <ThemedText bold style={{ fontSize: 14, color: theme.primary }}>
                    {initials}
                </ThemedText>
            </View>

            {/* Conteúdo principal */}
            <View style={{ flex: 1 }}>
                <ThemedText bold>{contact.name}</ThemedText>
                {contact.companyName && (
                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                        {contact.companyName}
                    </ThemedText>
                )}
                {contact.email && (
                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                        {contact.email}
                    </ThemedText>
                )}
            </View>

            {/* Tags / status */}
            <View style={styles.rowRight}>
                {contact.tags && contact.tags.length > 0 && (
                    <View style={styles.tagsWrapper}>
                        {contact.tags.slice(0, 2).map((tag) => (
                            <View
                                key={tag}
                                style={[
                                    styles.tagChip,
                                    { backgroundColor: theme.primarySoft },
                                ]}
                            >
                                <ThemedText variant="caption">{tag}</ThemedText>
                            </View>
                        ))}
                        {contact.tags.length > 2 && (
                            <ThemedText variant="caption">+{contact.tags.length - 2}</ThemedText>
                        )}
                    </View>
                )}

                <Ionicons name="chevron-forward" size={18} color={theme.textSoft} />
            </View>
        </TouchableOpacity>
    );
};

type EmptyStateProps = {
    title: string;
    description: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
    const { theme } = useTheme();
    return (
        <View style={styles.emptyState}>
            <View
                style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: theme.primarySoft },
                ]}
            >
                <Ionicons name="people-circle-outline" size={30} color={theme.primary} />
            </View>
            <ThemedText bold style={{ marginTop: 4 }}>
                {title}
            </ThemedText>
            <ThemedText
                variant="caption"
                style={{
                    marginTop: 4,
                    textAlign: 'center',
                }}
            >
                {description}
            </ThemedText>
        </View>
    );
};

function getInitials(name?: string) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const styles = StyleSheet.create({
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metricBadge: {
        flex: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'transparent',
    },
    metricValue: {
        marginTop: 2,
        fontSize: 18,
    },
    filterPanel: {
        marginTop: 14,
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 14,
        borderWidth: 1,
        height: 42,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    contactRow: {
        flexDirection: 'row',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    rowRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 6,
        marginLeft: 10,
    },
    tagsWrapper: {
        flexDirection: 'row',
        gap: 4,
    },
    tagChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
