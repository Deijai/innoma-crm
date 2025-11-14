// app/(app)/(tabs)/company/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import { TenantDoc, tenantService } from '../../../../src/services/firebase/tenantService';
import { useAuthStore } from '../../../../src/store/authStore';

export default function CompanyScreen() {
    const user = useAuthStore((s) => s.user);
    const [tenant, setTenant] = useState<TenantDoc | null>(null);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const router = useRouter();

    const isMaster = user?.role === 'MASTER';
    const tenantId = user?.tenantId;

    useEffect(() => {
        const loadTenant = async () => {
            if (!tenantId) return;
            setLoading(true);
            try {
                const data = await tenantService.getTenant(tenantId);
                setTenant(data);
            } finally {
                setLoading(false);
            }
        };

        loadTenant();
    }, [tenantId]);

    if (!user) {
        return (
            <ScreenContainer
                title="Dados da empresa"
                subtitle="Carregando informações..."
                pillLabel="Empresa"
            >
                <ThemedText>Carregando...</ThemedText>
            </ScreenContainer>
        );
    }

    if (!tenantId) {
        // teoricamente o AuthGate já impede esse cenário, mas por segurança:
        return (
            <ScreenContainer
                title="Dados da empresa"
                subtitle="Nenhuma empresa vinculada ao seu usuário."
                pillLabel="Empresa"
            >
                <SectionCard
                    title="Nenhuma empresa encontrada"
                    subtitle={
                        isMaster
                            ? 'Conclua o cadastro de empresa para liberar as funcionalidades do CRM.'
                            : 'Fale com o administrador MASTER para associar seu usuário a uma empresa.'
                    }
                    badge="Atenção"
                >
                    <ThemedText variant="caption">
                        Usuários MASTER precisam cadastrar uma empresa antes de usar o CRM.
                    </ThemedText>
                </SectionCard>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer
            title="Dados da empresa"
            subtitle="Resumo das informações da empresa (tenant) vinculada a este usuário."
            pillLabel="Empresa"
        >
            <SectionCard
                title={tenant?.name || 'Nome não definido'}
                subtitle={tenant?.document || 'Documento não informado'}
                badge={tenant?.isActive ? 'Ativa' : 'Inativa'}
            >
                {loading ? (
                    <ThemedText>Carregando dados da empresa...</ThemedText>
                ) : tenant ? (
                    <>
                        <View style={styles.row}>
                            <ThemedText variant="caption">ID do tenant</ThemedText>
                            <ThemedText variant="caption" bold>
                                {tenant.id}
                            </ThemedText>
                        </View>

                        <View style={styles.row}>
                            <ThemedText variant="caption">Owner (MASTER)</ThemedText>
                            <ThemedText variant="caption" bold>
                                {tenant.ownerUserId}
                            </ThemedText>
                        </View>

                        <View style={styles.row}>
                            <ThemedText variant="caption">Criada em</ThemedText>
                            <ThemedText variant="caption">
                                {new Date(tenant.createdAt).toLocaleString()}
                            </ThemedText>
                        </View>
                    </>
                ) : (
                    <ThemedText variant="caption">
                        Não foi possível carregar os dados da empresa.
                    </ThemedText>
                )}
            </SectionCard>

            {isMaster && tenant && (
                <SectionCard
                    title="Manutenção dos dados"
                    subtitle="Atualize os dados básicos da empresa."
                    badge="MASTER"
                >
                    <ThemedText variant="caption" style={{ marginBottom: 10 }}>
                        Você pode alterar o nome e o documento da empresa. Outras
                        configurações poderão ser adicionadas futuramente (endereço, logotipo, plano etc.).
                    </ThemedText>

                    <PrimaryButton
                        label="Editar dados da empresa"
                        variant="secondary"
                        onPress={() => router.push('/(app)/(tabs)/company/edit')}
                    />
                </SectionCard>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
});
