// app/(app)/(tabs)/home/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';

import { useAuthStore } from '../../../../src/store/authStore';
import { useContactsStore } from '../../../../src/store/contactsStore';
import { useDealsStore } from '../../../../src/store/dealsStore';
import { useUsersStore } from '../../../../src/store/usersStore';

import { FunnelBarChart } from '../../../../src/components/charts/FunnelBarChart';
import { useTheme } from '../../../../src/hooks/useTheme';

export default function HomeDashboardScreen() {
    const user = useAuthStore((s) => s.user);
    const { theme } = useTheme();
    const router = useRouter();

    const tenantId = user?.tenantId;
    const isMaster = user?.role === 'MASTER';

    // ---------- STORES ----------
    const {
        items: deals,
        fetchInitial: fetchDealsInitial,
    } = useDealsStore();

    const {
        items: contacts,
        fetchInitial: fetchContactsInitial,
    } = useContactsStore();

    const {
        items: users,
        fetchInitial: fetchUsersInitial,
    } = useUsersStore();

    // ---------- LOAD SNAPSHOT ----------
    useEffect(() => {
        if (!tenantId) return;

        fetchDealsInitial(tenantId);
        fetchContactsInitial(tenantId);
        fetchUsersInitial(tenantId);
    }, [tenantId, fetchDealsInitial, fetchContactsInitial, fetchUsersInitial]);

    // ---------- MÉTRICAS DE NEGÓCIOS ----------
    const dealsMetrics = useMemo(() => {
        const openDeals = deals.filter((d) => d.status === 'open');
        const wonDeals = deals.filter((d) => d.status === 'won');
        const lostDeals = deals.filter((d) => d.status === 'lost');

        const openAmount = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
        const wonAmount = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

        const stagesConfig = [
            { key: 'new', label: 'Novo' },
            { key: 'qualified', label: 'Qualificado' },
            { key: 'proposal', label: 'Proposta' },
            { key: 'negotiation', label: 'Negociação' },
            { key: 'won', label: 'Won' },
            { key: 'lost', label: 'Lost' },
        ] as const;

        const stageData = stagesConfig.map((stage) => ({
            stageKey: stage.key,
            stageLabel: stage.label,
            value: deals.filter((d) => d.stage === stage.key).length,
        }));

        const outcomeTotal = wonDeals.length + lostDeals.length;
        const winRate =
            outcomeTotal === 0 ? 0 : (wonDeals.length / outcomeTotal) * 100;

        return {
            total: deals.length,
            openCount: openDeals.length,
            wonCount: wonDeals.length,
            lostCount: lostDeals.length,
            openAmount,
            wonAmount,
            winRate,
            stageData,
        };
    }, [deals]);

    // ---------- MÉTRICAS DE CONTATOS ----------
    const contactsMetrics = useMemo(() => {
        const active = contacts.filter((c) => c.isActive);
        const archived = contacts.filter((c) => !c.isActive);

        return {
            total: contacts.length,
            activeCount: active.length,
            archivedCount: archived.length,
        };
    }, [contacts]);

    // ---------- MÉTRICAS DE USUÁRIOS ----------
    const usersMetrics = useMemo(() => {
        const masters = users.filter((u) => u.role === 'MASTER');
        const normalUsers = users.filter((u) => u.role === 'USER');

        return {
            total: users.length,
            mastersCount: masters.length,
            usersCount: normalUsers.length,
        };
    }, [users]);

    // ---------- ATIVIDADE RECENTE ----------
    const latestDeals = useMemo(() => {
        return [...deals]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 5);
    }, [deals]);

    const welcomeTitle = user
        ? `Olá, ${user.name?.split(' ')[0] ?? 'bem-vindo'}`
        : 'Bem-vindo';

    const subtitle = tenantId
        ? 'Visão geral do seu CRM Innoma.'
        : 'Associe-se a uma empresa para começar a usar o Innoma CRM.';

    const hasData = dealsMetrics.total > 0 || contactsMetrics.total > 0;

    return (
        <ScreenContainer
            title={welcomeTitle}
            subtitle={subtitle}
            pillLabel="Dashboard"
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. RESUMO DA CONTA */}
                <SectionCard
                    title="Resumo da conta"
                    subtitle={
                        tenantId
                            ? 'Acompanhe seu funil, base de contatos e equipe em um só lugar.'
                            : 'Você ainda não está vinculado a uma empresa.'
                    }
                    badge={tenantId ? 'Ativo' : 'Configuração'}
                >
                    {!tenantId ? (
                        <>
                            <ThemedText variant="caption">
                                Use a opção de <ThemedText bold>“Criar conta / Ativar conta”</ThemedText> na tela
                                inicial para configurar sua empresa (tenant) e liberar todos os módulos.
                            </ThemedText>

                            <View style={styles.actionsRow}>
                                <PrimaryButton
                                    label="Ir para empresa"
                                    variant="secondary"
                                    onPress={() =>
                                        router.push('/(app)/(tabs)/company/index')
                                    }
                                />
                                <PrimaryButton
                                    label="Configurações"
                                    variant="outline"
                                    onPress={() =>
                                        router.push('/(app)/(tabs)/settings/index')
                                    }
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.kpiRow}>
                                <KpiCard
                                    label="Negócios abertos"
                                    value={dealsMetrics.openCount}
                                    helper={formatCurrency(dealsMetrics.openAmount)}
                                />
                                <KpiCard
                                    label="Contatos"
                                    value={contactsMetrics.total}
                                    tone="info"
                                    helper={`${contactsMetrics.activeCount} ativos`}
                                />
                                <KpiCard
                                    label="Equipe"
                                    value={usersMetrics.total}
                                    tone="muted"
                                    helper={
                                        isMaster
                                            ? `${usersMetrics.mastersCount} MASTER`
                                            : 'Acesso controlado'
                                    }
                                />
                            </View>

                            <View style={styles.actionsRow}>
                                <PrimaryButton
                                    label="Novo negócio"
                                    onPress={() =>
                                        router.push('/(app)/(tabs)/deals/create')
                                    }
                                />
                                <PrimaryButton
                                    label="Ver pipeline"
                                    variant="secondary"
                                    onPress={() =>
                                        router.push('/(app)/(tabs)/deals/index')
                                    }
                                />
                            </View>
                        </>
                    )}
                </SectionCard>

                {/* 2. FUNIL COM GRÁFICO */}
                {tenantId && (
                    <SectionCard
                        title="Funil de vendas"
                        subtitle={
                            hasData
                                ? 'Distribuição de negócios por estágio do pipeline.'
                                : 'Crie seu primeiro negócio para ver o funil em ação.'
                        }
                        badge="Pipeline"
                    >
                        {dealsMetrics.total === 0 ? (
                            <ThemedText variant="caption">
                                Você ainda não tem negócios cadastrados. Use o botão “Novo negócio”
                                acima para começar.
                            </ThemedText>
                        ) : (
                            <FunnelBarChart data={dealsMetrics.stageData} />
                        )}
                    </SectionCard>
                )}

                {/* 3. DESEMPENHO DE VENDAS */}
                {tenantId && dealsMetrics.total > 0 && (
                    <SectionCard
                        title="Desempenho de vendas"
                        subtitle="Taxa de conversão considerando negócios Won e Lost."
                        badge="Performance"
                    >
                        <View style={styles.conversionRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText variant="caption">
                                    Taxa de conversão
                                </ThemedText>
                                <ThemedText bold style={styles.conversionValue}>
                                    {dealsMetrics.winRate.toFixed(1)}%
                                </ThemedText>
                                <ThemedText variant="caption" style={{ marginTop: 4 }}>
                                    {dealsMetrics.wonCount} Won · {dealsMetrics.lostCount} Lost
                                </ThemedText>
                            </View>

                            <View style={styles.conversionBarWrapper}>
                                <View
                                    style={[
                                        styles.conversionBarTrack,
                                        { backgroundColor: theme.surfaceAlt },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.conversionBarFill,
                                            {
                                                backgroundColor: theme.primary,
                                                width: `${dealsMetrics.winRate}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <ThemedText variant="caption" style={{ marginTop: 4 }}>
                                    Quanto mais verde, maior a conversão.
                                </ThemedText>
                            </View>
                        </View>
                    </SectionCard>
                )}

                {/* 4. ATIVIDADE RECENTE */}
                {tenantId && (
                    <SectionCard
                        title="Atividade recente"
                        subtitle={
                            latestDeals.length
                                ? 'Últimos negócios criados ou atualizados.'
                                : 'Nenhuma atividade recente registrada ainda.'
                        }
                        badge="Timeline"
                    >
                        {latestDeals.length === 0 ? (
                            <ThemedText variant="caption">
                                Crie novos negócios para acompanhar o histórico aqui.
                            </ThemedText>
                        ) : (
                            <View style={{ gap: 8 }}>
                                {latestDeals.map((deal) => (
                                    <TimelineItem
                                        key={deal.id}
                                        title={deal.title}
                                        contactName={deal.contactName}
                                        stage={deal.stage}
                                        amount={deal.amount}
                                    />
                                ))}
                            </View>
                        )}
                    </SectionCard>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

/* ---------- COMPONENTES AUXILIARES ---------- */

type KpiCardProps = {
    label: string;
    value: number;
    helper?: string;
    tone?: 'default' | 'info' | 'muted';
};

const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    helper,
    tone = 'default',
}) => {
    const { theme } = useTheme();

    let color = theme.text;
    if (tone === 'info') color = theme.primary;
    if (tone === 'muted') color = theme.textSoft;

    return (
        <View style={styles.kpiCard}>
            <ThemedText variant="caption" style={{ color: theme.textSoft }}>
                {label}
            </ThemedText>
            <ThemedText bold style={[styles.kpiValue, { color }]}>
                {value}
            </ThemedText>
            {helper ? (
                <ThemedText
                    variant="caption"
                    style={{ marginTop: 2, color: theme.textSoft }}
                >
                    {helper}
                </ThemedText>
            ) : null}
        </View>
    );
};

type TimelineItemProps = {
    title: string;
    contactName?: string | null;
    stage: string;
    amount: number;
};

const TimelineItem: React.FC<TimelineItemProps> = ({
    title,
    contactName,
    stage,
    amount,
}) => {
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

    const label = stageLabelMap[stage] ?? stage;
    const color = stageColorMap[stage] ?? theme.primarySoft;

    return (
        <View style={styles.timelineRow}>
            <View style={styles.timelineBulletWrapper}>
                <View
                    style={[
                        styles.timelineBullet,
                        { backgroundColor: color, borderColor: theme.border },
                    ]}
                />
            </View>
            <View style={{ flex: 1 }}>
                <ThemedText bold>{title}</ThemedText>
                {contactName && (
                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                        {contactName}
                    </ThemedText>
                )}
                <ThemedText variant="caption" style={{ marginTop: 2 }}>
                    {formatCurrency(amount)} · {label}
                </ThemedText>
            </View>
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
    kpiRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    kpiCard: {
        flex: 1,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'transparent',
    },
    kpiValue: {
        marginTop: 2,
        fontSize: 18,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    conversionRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    conversionValue: {
        fontSize: 24,
        marginTop: 4,
    },
    conversionBarWrapper: {
        flex: 1.2,
    },
    conversionBarTrack: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
    },
    conversionBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    timelineBulletWrapper: {
        width: 18,
        alignItems: 'center',
        paddingTop: 4,
    },
    timelineBullet: {
        width: 10,
        height: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
});
