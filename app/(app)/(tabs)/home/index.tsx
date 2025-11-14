// app/(app)/(tabs)/home/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useAuthStore } from '../../../../src/store/authStore';

export default function HomeScreen() {
    const user = useAuthStore((s) => s.user);
    const { theme } = useTheme();

    const isMaster = user?.role === 'MASTER';
    const hasCompany = !!user?.tenantId;

    if (!user) {
        return (
            <ScreenContainer
                title="Carregando..."
                subtitle="Aguarde um instante."
                pillLabel="Innoma CRM"
            >
                <ThemedText>Carregando informações do usuário...</ThemedText>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer
            title="Dashboard"
            subtitle={
                isMaster
                    ? 'Visão geral da sua conta e da empresa.'
                    : 'Resumo rápido do que está acontecendo no CRM.'
            }
            pillLabel={isMaster ? 'MASTER dashboard' : 'USER dashboard'}
        >
            {/* Resumo da conta */}
            <SectionCard
                title={
                    isMaster
                        ? `Olá, ${user.name || 'usuário MASTER'}`
                        : `Olá, ${user.name || 'usuário'}`
                }
                subtitle={
                    isMaster
                        ? hasCompany
                            ? 'Sua empresa já está configurada. Em breve você verá indicadores em tempo real aqui.'
                            : 'Você ainda não concluiu o cadastro da empresa. Esse é o próximo passo do onboarding.'
                        : 'Seu acesso é gerenciado pelo administrador MASTER da sua empresa.'
                }
                badge="Resumo"
            >
                <ThemedText variant="caption">
                    Perfil: {user.role}
                    {user.tenantId ? ' • Vinculado a uma empresa' : ''}
                </ThemedText>
            </SectionCard>

            {/* Indicadores rápidos (cards em grid) */}
            <SectionCard
                title="Indicadores rápidos"
                subtitle="Uma visão geral dos principais números."
                badge="Em breve"
            >
                <View style={styles.metricsGrid}>
                    <MetricCard
                        icon="people-outline"
                        label="Contatos"
                        value="0"
                        hint="Importação em breve"
                    />
                    <MetricCard
                        icon="podium-outline"
                        label="Negócios"
                        value="0"
                        hint="Funis personalizados"
                    />
                    {isMaster && (
                        <MetricCard
                            icon="person-add-outline"
                            label="Usuários"
                            value="0"
                            hint="Gerencie o time"
                        />
                    )}
                    <MetricCard
                        icon="calendar-outline"
                        label="Atividades"
                        value="0"
                        hint="Tarefas do dia"
                    />
                </View>
            </SectionCard>

            {/* Atalhos rápidos para MASTER */}
            {isMaster && (
                <SectionCard
                    title="Atalhos rápidos"
                    subtitle="Ações que você fará com frequência como administrador."
                    badge="MASTER"
                >
                    <View style={styles.quickActionsRow}>
                        <QuickActionChip
                            icon="business-outline"
                            label={hasCompany ? 'Ver empresa' : 'Cadastrar empresa'}
                            color={theme.primary}
                        />
                        <QuickActionChip
                            icon="people-outline"
                            label="Gerenciar usuários"
                            color={theme.accent}
                        />
                    </View>
                    <View style={styles.quickActionsRow}>
                        <QuickActionChip
                            icon="person-add-outline"
                            label="Novo contato"
                        />
                        <QuickActionChip
                            icon="podium-outline"
                            label="Novo negócio"
                        />
                    </View>
                </SectionCard>
            )}

            {/* Timeline / atividades futuras */}
            <SectionCard
                title="Timeline"
                subtitle="Últimas atividades e novidades (placeholder)."
                badge="Em construção"
            >
                <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                    <View style={{ flex: 1 }}>
                        <ThemedText bold variant="caption">
                            Módulo de contatos
                        </ThemedText>
                        <ThemedText variant="caption" style={{ marginTop: 2 }}>
                            Em breve você poderá ver aqui as últimas interações com seus clientes.
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: theme.accent }]} />
                    <View style={{ flex: 1 }}>
                        <ThemedText bold variant="caption">
                            Gestão de usuários
                        </ThemedText>
                        <ThemedText variant="caption" style={{ marginTop: 2 }}>
                            Vamos adicionar a lista de usuários com filtros, status e convites pendentes.
                        </ThemedText>
                    </View>
                </View>
            </SectionCard>
        </ScreenContainer>
    );
}

type MetricCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    hint?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, hint }) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.metricCard,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: theme.name === 'light' ? '#000' : '#000',
                },
            ]}
        >
            <View style={styles.metricHeader}>
                <Ionicons name={icon} size={18} color={theme.primary} />
                <ThemedText variant="caption">{label}</ThemedText>
            </View>
            <ThemedText bold style={styles.metricValue}>
                {value}
            </ThemedText>
            {hint && (
                <ThemedText variant="caption" style={styles.metricHint}>
                    {hint}
                </ThemedText>
            )}
        </View>
    );
};

type QuickActionChipProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color?: string;
};

const QuickActionChip: React.FC<QuickActionChipProps> = ({ icon, label, color }) => {
    const { theme } = useTheme();
    const bg = color ? `${color}33` : theme.surfaceAlt;

    return (
        <View
            style={[
                styles.quickAction,
                {
                    backgroundColor: bg,
                    borderColor: theme.border,
                },
            ]}
        >
            <Ionicons name={icon} size={16} color={color || theme.textSoft} />
            <ThemedText variant="caption" style={{ marginLeft: 6 }}>
                {label}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        flexBasis: '48%',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 22,
        marginTop: 2,
    },
    metricHint: {
        marginTop: 4,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginTop: 4,
    },
});
