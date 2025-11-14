// app/(app)/(tabs)/settings/index.tsx
import React from 'react';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useAuthStore } from '../../../../src/store/authStore';

export default function SettingsScreen() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

    return (
        <ScreenContainer
            title="Configurações"
            subtitle="Ajuste preferências da conta e sessão."
            pillLabel="Configurações"
        >
            <SectionCard
                title="Preferências gerais"
                subtitle="Tema, idioma, notificações e comportamento do app."
                badge="Interface"
            >
                <ThemedText variant="caption">
                    O tema claro/escuro pode ser alternado pelo botão no topo das telas.
                    {'\n'}
                    Em versões futuras podemos adicionar:
                    {'\n'}• Idioma
                    {'\n'}• Configurações de notificação
                    {'\n'}• Preferências de privacidade
                </ThemedText>
            </SectionCard>

            <SectionCard
                title="Sessão e segurança"
                subtitle="Gerencie sua sessão atual no Innoma CRM."
                badge="Sessão"
            >
                <ThemedText variant="caption" style={{ marginBottom: 10 }}>
                    Você está conectado como:{' '}
                    <ThemedText variant="caption" bold>
                        {user?.email}
                    </ThemedText>
                </ThemedText>

                <PrimaryButton
                    label="Sair da conta"
                    variant="outline"
                    onPress={logout}
                />
            </SectionCard>
        </ScreenContainer>
    );
}
