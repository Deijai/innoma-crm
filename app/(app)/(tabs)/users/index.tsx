// app/(app)/(tabs)/users/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import { UserInviteDoc } from '../../../../src/services/firebase/userInviteService';
import { UserDoc } from '../../../../src/services/firebase/userService';
import { useAuthStore } from '../../../../src/store/authStore';
import { useUsersStore } from '../../../../src/store/usersStore';

type RoleFilter = 'all' | 'MASTER' | 'USER';

export default function UsersScreen() {
    const user = useAuthStore((s) => s.user);
    const { theme } = useTheme();
    const router = useRouter();

    const isMaster = user?.role === 'MASTER';
    const tenantId = user?.tenantId;

    const {
        items,
        loadingInitial,
        loadingMore,
        hasMore,
        fetchInitial,
        fetchMore,
        invites,
        invitesLoading,
        loadInvites,
    } = useUsersStore();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Carrega usuários e convites quando MASTER + tenantId
    useEffect(() => {
        if (tenantId && isMaster) {
            fetchInitial(tenantId);
            loadInvites(tenantId);
        }
    }, [tenantId, isMaster, fetchInitial, loadInvites]);

    const filteredUsers = useMemo(() => {
        let list = [...items];

        if (roleFilter !== 'all') {
            list = list.filter((u) => u.role === roleFilter);
        }

        const term = search.trim().toLowerCase();
        if (!term) return list;

        return list.filter((u) => {
            const name = u.name?.toLowerCase() || '';
            const email = u.email?.toLowerCase() || '';
            return name.includes(term) || email.includes(term);
        });
    }, [items, roleFilter, search]);

    function handleRefresh() {
        if (!tenantId || !isMaster) return;
        setRefreshing(true);
        Promise.all([fetchInitial(tenantId), loadInvites(tenantId)]).finally(() =>
            setRefreshing(false),
        );
    }

    if (!user) {
        return (
            <ScreenContainer
                title="Usuários da empresa"
                subtitle="Carregando..."
                pillLabel="Equipe"
            >
                <ThemedText>Carregando...</ThemedText>
            </ScreenContainer>
        );
    }

    if (!isMaster) {
        // visão simplificada para USER comum
        return (
            <ScreenContainer
                title="Usuários da empresa"
                subtitle="Seu acesso é gerenciado pelo administrador MASTER."
                pillLabel="Equipe"
            >
                <SectionCard
                    title="Acesso controlado"
                    subtitle="Apenas usuários MASTER podem gerenciar a equipe."
                >
                    <ThemedText variant="caption">
                        Em atualizações futuras, você poderá ver aqui quem participa da empresa e qual o papel
                        de cada um.
                    </ThemedText>
                </SectionCard>
            </ScreenContainer>
        );
    }

    const totalUsers = items.length;
    const totalMasters = items.filter((u) => u.role === 'MASTER').length;
    const totalUsersRole = items.filter((u) => u.role === 'USER').length;

    return (
        <ScreenContainer
            title="Usuários da empresa"
            subtitle="Organize quem tem acesso ao Innoma CRM."
            pillLabel="Equipe"
        >
            {/* RESUMO / KPIs */}
            <SectionCard
                title="Visão da equipe"
                subtitle="Distribuição dos perfis de acesso."
                badge="Resumo"
            >
                <View style={styles.metricsRow}>
                    <MetricBadge label="Total" value={totalUsers} />
                    <MetricBadge label="MASTER" value={totalMasters} tone="highlight" />
                    <MetricBadge label="USER" value={totalUsersRole} tone="muted" />
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
                        placeholder="Buscar por nome ou e-mail"
                        placeholderTextColor={theme.textSoft}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Filtros de role */}
                <View style={styles.chipsRow}>
                    <FilterChip
                        label="Todos"
                        selected={roleFilter === 'all'}
                        onPress={() => setRoleFilter('all')}
                    />
                    <FilterChip
                        label="MASTER"
                        selected={roleFilter === 'MASTER'}
                        onPress={() => setRoleFilter('MASTER')}
                    />
                    <FilterChip
                        label="USER"
                        selected={roleFilter === 'USER'}
                        onPress={() => setRoleFilter('USER')}
                    />
                </View>

                {/* CTA cadastrar USER */}
                <PrimaryButton
                    label="Convidar usuário USER"
                    variant="secondary"
                    onPress={() => router.push('/(app)/(tabs)/users/create')}
                />
            </View>

            {/* LISTA DE USUÁRIOS */}
            <SectionCard
                title="Usuários ativos"
                subtitle={
                    filteredUsers.length
                        ? 'Veja quem faz parte da sua empresa.'
                        : loadingInitial
                            ? 'Carregando usuários...'
                            : 'Nenhum usuário encontrado com os filtros atuais.'
                }
                badge="Equipe"
            >
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    onEndReached={() => {
                        if (!loadingMore && hasMore && !loadingInitial) {
                            fetchMore();
                        }
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        loadingMore ? (
                            <ThemedText variant="caption" style={{ marginTop: 8 }}>
                                Carregando mais usuários...
                            </ThemedText>
                        ) : null
                    }
                    renderItem={({ item }) => <UserRow user={item} />}
                />
            </SectionCard>

            {/* CONVITES PENDENTES */}
            <SectionCard
                title="Convites pendentes"
                subtitle={
                    invites.length
                        ? 'Convites enviados que ainda aguardam ativação.'
                        : invitesLoading
                            ? 'Carregando convites...'
                            : 'Nenhum convite pendente no momento.'
                }
                badge="Convites"
            >
                {invitesLoading && <ThemedText>Carregando convites...</ThemedText>}

                {!invitesLoading && invites.length === 0 && <EmptyInvitesState />}

                {!invitesLoading && invites.length > 0 && (
                    <FlatList
                        data={invites}
                        keyExtractor={(item) => item.id!}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        renderItem={({ item }) => <InviteRow invite={item} />}
                    />
                )}
            </SectionCard>
        </ScreenContainer>
    );
}

/* ---------- COMPONENTES ESPECÍFICOS ---------- */

type MetricBadgeProps = {
    label: string;
    value: number;
    tone?: 'default' | 'highlight' | 'muted';
};

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, tone = 'default' }) => {
    const { theme } = useTheme();

    let color = theme.text;
    if (tone === 'highlight') color = theme.primary;
    if (tone === 'muted') color = theme.textSoft;

    return (
        <View style={styles.metricBadge}>
            <ThemedText variant="caption" style={{ color: theme.textSoft }}>
                {label}
            </ThemedText>
            <ThemedText bold style={[styles.metricValue, { color }]}>
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
        <View
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
                onPress={onPress}
            >
                {label}
            </ThemedText>
        </View>
    );
};

type UserRowProps = {
    user: UserDoc;
};

const UserRow: React.FC<UserRowProps> = ({ user }) => {
    const { theme } = useTheme();
    const initials = getInitials(user.name);
    const isMaster = user.role === 'MASTER';

    return (
        <View
            style={[
                styles.userRow,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
        >
            <View
                style={[
                    styles.avatar,
                    {
                        backgroundColor: isMaster ? theme.primarySoft : theme.background,
                    },
                ]}
            >
                <ThemedText
                    bold
                    style={{
                        fontSize: 14,
                        color: isMaster ? theme.primary : theme.textSoft,
                    }}
                >
                    {initials}
                </ThemedText>
            </View>

            <View style={{ flex: 1 }}>
                <ThemedText bold>{user.name}</ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 2 }}>
                    {user.email}
                </ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 4 }}>
                    Perfil:{' '}
                    <ThemedText
                        variant="caption"
                        bold
                        style={{
                            color: isMaster ? theme.primary : theme.text,
                        }}
                    >
                        {user.role}
                    </ThemedText>
                </ThemedText>
            </View>
        </View>
    );
};

type InviteRowProps = {
    invite: UserInviteDoc;
};

const InviteRow: React.FC<InviteRowProps> = ({ invite }) => {
    const { theme } = useTheme();
    const initials = getInitials(invite.name);

    return (
        <View
            style={[
                styles.inviteRow,
                {
                    backgroundColor: theme.surface,
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
                <ThemedText bold style={{ color: theme.primary }}>
                    {initials}
                </ThemedText>
            </View>

            <View style={{ flex: 1 }}>
                <ThemedText bold>{invite.name}</ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 2 }}>
                    {invite.email}
                </ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 4 }}>
                    Código:{' '}
                    <ThemedText variant="caption" bold>
                        {invite.activationCode}
                    </ThemedText>
                </ThemedText>
            </View>
        </View>
    );
};

const EmptyInvitesState: React.FC = () => {
    const { theme } = useTheme();
    return (
        <View style={styles.emptyState}>
            <View
                style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: theme.primarySoft },
                ]}
            >
                <Ionicons name="mail-unread-outline" size={28} color={theme.primary} />
            </View>
            <ThemedText bold style={{ marginTop: 4 }}>
                Nenhum convite pendente
            </ThemedText>
            <ThemedText
                variant="caption"
                style={{
                    marginTop: 4,
                    textAlign: 'center',
                }}
            >
                Use o botão “Convidar usuário USER” acima para gerar novos convites.
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
    userRow: {
        flexDirection: 'row',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    inviteRow: {
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: 18,
    },
    emptyIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
