// app/(app)/(tabs)/deals/index.tsx
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
import { DealDoc } from '../../../../src/services/firebase/dealService';
import { useAuthStore } from '../../../../src/store/authStore';
import { StageFilter, useDealsStore } from '../../../../src/store/dealsStore';

export default function DealsListScreen() {
    const user = useAuthStore((s) => s.user);
    const tenantId = user?.tenantId;
    const { theme } = useTheme();
    const router = useRouter();

    const {
        items,
        stageFilter,
        setStageFilter,
        loadingInitial,
        loadingMore,
        hasMore,
        fetchInitial,
        fetchMore,
    } = useDealsStore();

    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchInitial(tenantId);
        }
    }, [tenantId, fetchInitial]);

    const filteredDeals = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;

        return items.filter((d) => {
            const title = d.title?.toLowerCase() || '';
            const contact = d.contactName?.toLowerCase() || '';
            return title.includes(term) || contact.includes(term);
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
                title="Negócios"
                subtitle="Você precisa estar vinculado a uma empresa para gerenciar o pipeline."
                pillLabel="Pipeline"
            >
                <EmptyState
                    title="Sem empresa vinculada"
                    description="Peça para o administrador MASTER associar sua conta a um tenant antes de usar o módulo de negócios."
                />
            </ScreenContainer>
        );
    }

    const openDeals = items.filter((d) => d.status === 'open');
    const wonDeals = items.filter((d) => d.status === 'won');
    const lostDeals = items.filter((d) => d.status === 'lost');

    const openAmount = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonAmount = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    return (
        <ScreenContainer
            title="Negócios"
            subtitle="Gerencie seu funil de vendas no Innoma CRM."
            pillLabel="Pipeline"
        >
            {/* KPIs do Pipeline */}
            <SectionCard
                title="Resumo do funil"
                subtitle="Acompanhe volume e valor das oportunidades."
                badge="Pipeline"
            >
                <View style={styles.metricsRow}>
                    <MetricCard
                        label="Abertos"
                        value={openDeals.length}
                        helper={formatCurrency(openAmount)}
                    />
                    <MetricCard
                        label="Ganho (Won)"
                        value={wonDeals.length}
                        helper={formatCurrency(wonAmount)}
                        tone="success"
                    />
                    <MetricCard
                        label="Perdidos (Lost)"
                        value={lostDeals.length}
                        helper=""
                        tone="muted"
                    />
                </View>
            </SectionCard>

            {/* Painel: busca + filtros + CTA */}
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
                        placeholder="Buscar por título ou contato"
                        placeholderTextColor={theme.textSoft}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Filtros de estágio */}
                <ScrollStagesRow
                    currentStage={stageFilter}
                    onChangeStage={(stage) => setStageFilter(stage)}
                />

                {/* CTA criar negócio */}
                <PrimaryButton
                    label="Novo negócio"
                    variant="secondary"
                    onPress={() => router.push('/(app)/(tabs)/deals/create')}
                />
            </View>

            {/* Lista de negócios */}
            <SectionCard
                title="Negócios"
                subtitle={
                    filteredDeals.length
                        ? 'Toque em um negócio para ver detalhes ou atualizar estágio.'
                        : loadingInitial
                            ? 'Carregando negócios...'
                            : 'Nenhuma oportunidade encontrada com os filtros atuais.'
                }
                badge="Oportunidades"
            >
                <FlatList
                    data={filteredDeals}
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
                                title="Nenhum negócio ainda"
                                description="Crie seu primeiro negócio para começar a organizar o funil."
                            />
                        ) : null
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ThemedText variant="caption" style={{ marginTop: 8 }}>
                                Carregando mais negócios...
                            </ThemedText>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <DealRow
                            deal={item}
                            onPress={() => router.push(`/(app)/(tabs)/deals/${item.id}`)}
                        />
                    )}
                />
            </SectionCard>
        </ScreenContainer>
    );
}

/* ---- Componentes auxiliares de UI ---- */

type MetricCardProps = {
    label: string;
    value: number;
    helper?: string;
    tone?: 'default' | 'success' | 'muted';
};

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    helper,
    tone = 'default',
}) => {
    const { theme } = useTheme();

    const color =
        tone === 'success'
            ? theme.primary
            : tone === 'muted'
                ? theme.textSoft
                : theme.text;

    return (
        <View style={styles.metricCard}>
            <ThemedText variant="caption" style={{ color: theme.textSoft }}>
                {label}
            </ThemedText>
            <ThemedText bold style={[styles.metricValue, { color }]}>
                {value}
            </ThemedText>
            {helper ? (
                <ThemedText variant="caption" style={{ marginTop: 2, color: theme.textSoft }}>
                    {helper}
                </ThemedText>
            ) : null}
        </View>
    );
};

type ScrollStagesRowProps = {
    currentStage: StageFilter;
    onChangeStage: (stage: StageFilter) => void;
};

const ScrollStagesRow: React.FC<ScrollStagesRowProps> = ({
    currentStage,
    onChangeStage,
}) => {
    const stages: { label: string; value: StageFilter }[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Novo', value: 'new' },
        { label: 'Qualificado', value: 'qualified' },
        { label: 'Proposta', value: 'proposal' },
        { label: 'Negociação', value: 'negotiation' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
    ];

    return (
        <View style={styles.stagesRow}>
            {stages.map((s) => (
                <StageChip
                    key={s.value}
                    label={s.label}
                    selected={currentStage === s.value}
                    onPress={() => onChangeStage(s.value)}
                    stage={s.value}
                />
            ))}
        </View>
    );
};

type StageChipProps = {
    label: string;
    selected: boolean;
    stage: StageFilter;
    onPress: () => void;
};

const StageChip: React.FC<StageChipProps> = ({ label, selected, stage, onPress }) => {
    const { theme } = useTheme();

    const stageColorMap: Partial<Record<StageFilter, string>> = {
        new: theme.primarySoft,
        qualified: '#A7F3D0',
        proposal: '#DBEAFE',
        negotiation: '#FDE68A',
        won: '#BBF7D0',
        lost: '#FECACA',
    };

    const background = selected ? stageColorMap[stage] ?? theme.primarySoft : theme.background;
    const borderColor = selected ? theme.primary : theme.border;
    const textColor = selected ? theme.primary : theme.textSoft;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.stageChip,
                {
                    backgroundColor: background,
                    borderColor,
                },
            ]}
        >
            <ThemedText variant="caption" style={{ color: textColor }}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

type DealRowProps = {
    deal: DealDoc;
    onPress: () => void;
};

const DealRow: React.FC<DealRowProps> = ({ deal, onPress }) => {
    const { theme } = useTheme();

    const stageLabelMap: Record<string, string> = {
        new: 'Novo',
        qualified: 'Qualificado',
        proposal: 'Proposta',
        negotiation: 'Negociação',
        won: 'Won',
        lost: 'Lost',
    };

    const stageColorMap: Record<string, string> = {
        new: theme.primarySoft,
        qualified: '#A7F3D0',
        proposal: '#DBEAFE',
        negotiation: '#FDE68A',
        won: '#BBF7D0',
        lost: '#FECACA',
    };

    const stageLabel = stageLabelMap[deal.stage] ?? deal.stage;
    const stageColor = stageColorMap[deal.stage] ?? theme.primarySoft;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                styles.dealRow,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
        >
            <View style={{ flex: 1 }}>
                <ThemedText bold>{deal.title}</ThemedText>
                {deal.contactName && (
                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                        {deal.contactName}
                    </ThemedText>
                )}
                <ThemedText variant="caption" style={{ marginTop: 4 }}>
                    {formatCurrency(deal.amount)} • {stageLabel}
                </ThemedText>
            </View>

            <View style={styles.dealRight}>
                <View
                    style={[
                        styles.stageBadge,
                        {
                            backgroundColor: stageColor,
                        },
                    ]}
                >
                    <ThemedText variant="caption">{stageLabel}</ThemedText>
                </View>
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
                <Ionicons name="podium-outline" size={30} color={theme.primary} />
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

function formatCurrency(value: number) {
    if (!value) return 'R$ 0,00';
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    } catch {
        return `R$ ${value.toFixed(2)}`;
    }
}

const styles = StyleSheet.create({
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metricCard: {
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
    stagesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    stageChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    dealRow: {
        flexDirection: 'row',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    dealRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 6,
        marginLeft: 10,
    },
    stageBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
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
