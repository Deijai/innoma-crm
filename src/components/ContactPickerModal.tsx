// src/components/ContactPickerModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ContactDoc } from '../services/firebase/contactService';
import { useContactsStore } from '../store/contactsStore';
import { ThemedText } from './ThemedText';

export type SelectedContact = {
    id: string;
    name: string;
    email?: string | null;
    companyName?: string | null;
};

type Props = {
    visible: boolean;
    tenantId: string;
    onClose: () => void;
    onSelect: (contact: SelectedContact) => void;
};

export const ContactPickerModal: React.FC<Props> = ({
    visible,
    tenantId,
    onClose,
    onSelect,
}) => {
    const { theme } = useTheme();

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

    // Quando o modal abre, carrega contatos (se ainda não tiver carregado)
    useEffect(() => {
        if (visible && tenantId) {
            fetchInitial(tenantId);
        }
    }, [visible, tenantId, fetchInitial]);

    // Sempre que o modal abre, zera busca para não confundir o usuário
    useEffect(() => {
        if (visible) {
            setSearch('');
        }
    }, [visible]);

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

    function handleSelect(contact: ContactDoc) {
        onSelect({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            companyName: contact.companyName,
        });
        onClose();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View
                style={[
                    styles.overlay,
                    { backgroundColor: theme.overlay },
                ]}
            >
                <View
                    style={[
                        styles.container,
                        { backgroundColor: theme.surface },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <ThemedText bold style={{ fontSize: 16 }}>
                                Selecionar contato
                            </ThemedText>
                            <ThemedText
                                variant="caption"
                                style={{ marginTop: 2 }}
                            >
                                Toque em um contato para vinculá-lo ao negócio.
                            </ThemedText>
                        </View>

                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={22}
                                color={theme.textSoft}
                            />
                        </TouchableOpacity>
                    </View>

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
                        <Ionicons
                            name="search-outline"
                            size={18}
                            color={theme.textSoft}
                        />
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

                    {/* Lista de contatos */}
                    <FlatList
                        style={styles.list}
                        data={filteredContacts}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 8 }} />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={theme.primary}
                            />
                        }
                        onEndReached={() => {
                            if (!loadingMore && hasMore && !loadingInitial) {
                                fetchMore();
                            }
                        }}
                        onEndReachedThreshold={0.4}
                        ListEmptyComponent={
                            !loadingInitial ? (
                                <EmptyState
                                    title="Nenhum contato encontrado"
                                    description="Ajuste a busca ou cadastre um novo contato no módulo de Contatos."
                                />
                            ) : (
                                <EmptyState
                                    title="Carregando..."
                                    description="Buscando contatos da sua empresa."
                                />
                            )
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <ThemedText
                                    variant="caption"
                                    style={{
                                        marginTop: 8,
                                        textAlign: 'center',
                                    }}
                                >
                                    Carregando mais contatos...
                                </ThemedText>
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <ContactItem
                                contact={item}
                                onPress={() => handleSelect(item)}
                            />
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};

/* ---------- Componentes auxiliares ---------- */

type FilterChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

const FilterChip: React.FC<FilterChipProps> = ({
    label,
    selected,
    onPress,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterChip,
                {
                    backgroundColor: selected
                        ? theme.primarySoft
                        : theme.background,
                    borderColor: selected
                        ? theme.primary
                        : theme.border,
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

type ContactItemProps = {
    contact: ContactDoc;
    onPress: () => void;
};

const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    onPress,
}) => {
    const { theme } = useTheme();
    const initials = getInitials(contact.name);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                styles.contactRow,
                {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                },
            ]}
        >
            <View
                style={[
                    styles.avatar,
                    { backgroundColor: theme.primarySoft },
                ]}
            >
                <ThemedText
                    bold
                    style={{ color: theme.primary }}
                >
                    {initials}
                </ThemedText>
            </View>

            <View style={{ flex: 1 }}>
                <ThemedText bold>{contact.name}</ThemedText>

                {contact.companyName && (
                    <ThemedText
                        variant="caption"
                        style={{ marginTop: 2 }}
                    >
                        {contact.companyName}
                    </ThemedText>
                )}

                {contact.email && (
                    <ThemedText
                        variant="caption"
                        style={{ marginTop: 2 }}
                    >
                        {contact.email}
                    </ThemedText>
                )}
            </View>
        </TouchableOpacity>
    );
};

type EmptyStateProps = {
    title: string;
    description: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
}) => {
    const { theme } = useTheme();
    return (
        <View style={styles.emptyState}>
            <View
                style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: theme.primarySoft },
                ]}
            >
                <Ionicons
                    name="people-circle-outline"
                    size={26}
                    color={theme.primary}
                />
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
    if (parts.length === 1)
        return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end', // bottom sheet
    },
    container: {
        width: '100%',
        maxHeight: '85%',        // 🔹 ocupa bem mais a tela
        minHeight: '60%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
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
        marginTop: 10,
        marginBottom: 6,
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    list: {
        flexGrow: 0,
        marginTop: 4,
    },
    contactRow: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
