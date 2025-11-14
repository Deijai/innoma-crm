// app/(app)/(tabs)/users/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import {
    UserInviteDoc,
    userInviteService,
} from '../../../../src/services/firebase/userInviteService';
import { UserDoc, userService } from '../../../../src/services/firebase/userService';
import { useAuthStore } from '../../../../src/store/authStore';

export default function UsersScreen() {
    const user = useAuthStore((s) => s.user);
    const [invites, setInvites] = useState<UserInviteDoc[]>([]);
    const [activeUsers, setActiveUsers] = useState<UserDoc[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const { theme } = useTheme();
    const router = useRouter();

    const isMaster = user?.role === 'MASTER';
    const tenantId = user?.tenantId;

    useEffect(() => {
        if (!tenantId) return;

        const loadInvites = async () => {
            setLoadingInvites(true);
            try {
                const data = await userInviteService.listInvitesByTenant(tenantId);
                setInvites(data.filter((i) => !i.isUsed));
            } finally {
                setLoadingInvites(false);
            }
        };

        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const data = await userService.listUsersByTenant(tenantId);
                // por enquanto mostra todos, mas dá pra filtrar role: 'USER' se quiser
                setActiveUsers(data);
            } finally {
                setLoadingUsers(false);
            }
        };

        loadInvites();
        loadUsers();
    }, [tenantId]);

    if (!user) {
        return (
            <ScreenContainer
                title="Usuários da empresa"
                subtitle="Aguarde, carregando informações..."
                pillLabel="Equipe"
            >
                <ThemedText>Carregando...</ThemedText>
            </ScreenContainer>
        );
    }

    // USER comum (não MASTER) vê só um resumo
    if (!isMaster) {
        return (
            <ScreenContainer
                title="Usuários da empresa"
                subtitle="Veja quem faz parte do seu time no Innoma CRM."
                pillLabel="Equipe"
            >
                <SectionCard
                    title="Visão da equipe"
                    subtitle="Seu administrador MASTER gerencia todos os acessos."
                >
                    <ThemedText variant="caption">
                        Em versões futuras, você poderá ver aqui a lista de usuários da sua empresa,
                        com formas de contato e funções.
                    </ThemedText>
                </SectionCard>
            </ScreenContainer>
        );
    }

    // MASTER: vê gestão completa
    return (
        <ScreenContainer
            title="Usuários da empresa"
            subtitle="Gerencie convites e acessos do seu time ao Innoma CRM."
            pillLabel="Equipe"
        >
            {/* Gestão geral / botão criar USER */}
            <SectionCard
                title="Gerenciar equipe"
                subtitle="Cadastrar, ativar e acompanhar acessos do tipo USER."
                badge="MASTER"
            >
                <PrimaryButton
                    label="Cadastrar novo usuário USER"
                    variant="secondary"
                    onPress={() => router.push('/(app)/(tabs)/users/create')}
                />
            </SectionCard>

            {/* Usuários ativos */}
            <SectionCard
                title="Usuários ativos"
                subtitle={
                    activeUsers.length
                        ? 'Pessoas que já possuem acesso à empresa neste tenant.'
                        : 'Nenhum usuário ativo ainda, além do MASTER.'
                }
                badge="Usuários"
            >
                {loadingUsers ? (
                    <ThemedText>Carregando usuários...</ThemedText>
                ) : activeUsers.length === 0 ? (
                    <ThemedText variant="caption">
                        Assim que usuários ativarem seus convites, eles aparecerão aqui.
                    </ThemedText>
                ) : (
                    <FlatList
                        data={activeUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.userItem,
                                    {
                                        borderColor: theme.border,
                                        backgroundColor: theme.surface,
                                    },
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <ThemedText bold>{item.name}</ThemedText>
                                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                                        {item.email}
                                    </ThemedText>
                                    <ThemedText variant="caption" style={{ marginTop: 4 }}>
                                        Perfil: {item.role}
                                        {item.role === 'MASTER' ? ' (administrador)' : ''}
                                    </ThemedText>
                                </View>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    />
                )}
            </SectionCard>

            {/* Convites pendentes */}
            <SectionCard
                title="Convites pendentes"
                subtitle={
                    invites.length
                        ? 'Convites enviados que ainda não foram ativados.'
                        : 'Nenhum convite pendente no momento.'
                }
                badge="Convites"
            >
                {loadingInvites ? (
                    <ThemedText>Carregando convites...</ThemedText>
                ) : invites.length === 0 ? (
                    <ThemedText variant="caption">
                        Depois de gerar um convite, ele aparecerá aqui até que o usuário ative o acesso.
                    </ThemedText>
                ) : (
                    <FlatList
                        data={invites}
                        keyExtractor={(item) => item.id!}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.inviteItem,
                                    {
                                        borderColor: theme.border,
                                        backgroundColor: theme.surface,
                                    },
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <ThemedText bold variant="body">
                                        {item.name}
                                    </ThemedText>
                                    <ThemedText variant="caption" style={{ marginTop: 2 }}>
                                        {item.email}
                                    </ThemedText>
                                    <ThemedText variant="caption" style={{ marginTop: 4 }}>
                                        Código: {item.activationCode}
                                    </ThemedText>
                                </View>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    />
                )}
            </SectionCard>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    userItem: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
    },
    inviteItem: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
    },
});
