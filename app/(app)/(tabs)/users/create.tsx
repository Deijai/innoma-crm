// app/(app)/(tabs)/users/create.tsx
import React, { useState } from 'react';
import { Input } from '../../../../src/components/Input';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { userInviteService } from '../../../../src/services/firebase/userInviteService';
import { useAuthStore } from '../../../../src/store/authStore';

function generateActivationCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export default function CreateUserInviteScreen() {
    const user = useAuthStore((s) => s.user);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const tenantId = user?.tenantId;

    async function handleCreateInvite() {
        if (!tenantId) return;
        if (!name || !email) return;

        setLoading(true);
        try {
            const code = generateActivationCode();
            const invite = await userInviteService.createInvite({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: 'USER',
                tenantId,
                activationCode: code,
            });

            setGeneratedCode(invite.activationCode);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer
            title="Convidar usuário USER"
            subtitle="Crie um convite para alguém acessar sua empresa no Innoma CRM."
            pillLabel="Novo usuário"
            showBack
        >
            <SectionCard
                title="Dados do convidado"
                subtitle="Informe quem você deseja convidar."
                badge="Passo 1"
            >
                <Input
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    placeholder="Nome completo"
                />
                <Input
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <PrimaryButton
                    label="Gerar convite"
                    loading={loading}
                    onPress={handleCreateInvite}
                />
            </SectionCard>

            {generatedCode && (
                <SectionCard
                    title="Convite gerado"
                    subtitle="Envie estas informações para o usuário ativar a conta."
                    badge="Passo 2"
                >
                    <ThemedText variant="caption" style={{ marginBottom: 8 }}>
                        Envie para o usuário:
                    </ThemedText>
                    <ThemedText variant="caption">
                        • E-mail: <ThemedText bold variant="caption">{email}</ThemedText>
                    </ThemedText>
                    <ThemedText variant="caption" style={{ marginTop: 4 }}>
                        • Código de ativação:{' '}
                        <ThemedText bold variant="caption">{generatedCode}</ThemedText>
                    </ThemedText>

                    <ThemedText variant="caption" style={{ marginTop: 12 }}>
                        Ele deverá acessar a opção <ThemedText bold>“Ativar conta USER”</ThemedText> no app
                        e informar esse e-mail e código.
                    </ThemedText>
                </SectionCard>
            )}
        </ScreenContainer>
    );
}
