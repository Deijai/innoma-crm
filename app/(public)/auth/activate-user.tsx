// app/(public)/auth/activate-user.tsx
import { Input } from '@/src/components/Input';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SectionCard } from '../../../src/components/SectionCard';
import { ThemedText } from '../../../src/components/ThemedText';
import { authService } from '../../../src/services/firebase/authService';
import { userInviteService } from '../../../src/services/firebase/userInviteService';
import { userService } from '../../../src/services/firebase/userService';

export default function ActivateUserScreen() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteInfo, setInviteInfo] = useState<{
        inviteId: string;
        tenantId: string;
        name: string;
    } | null>(null);

    const router = useRouter();

    async function handleValidateInvite() {
        setLoading(true);
        try {
            const invite = await userInviteService.findValidInvite(
                email.trim().toLowerCase(),
                code.trim().toUpperCase(),
            );

            if (!invite) {
                // aqui pode entrar um toast depois
                setInviteInfo(null);
                return;
            }

            setInviteInfo({
                inviteId: invite.id!,
                tenantId: invite.tenantId,
                name: invite.name,
            });
            setStep(2);
        } finally {
            setLoading(false);
        }
    }

    async function handleActivateUser() {
        if (!inviteInfo) return;
        if (!password || password !== confirm) return;

        setLoading(true);
        try {
            // 1. Cria usuário no Firebase Auth
            const fbUser = await authService.registerWithEmail(
                email.trim().toLowerCase(),
                password,
            );

            // 2. Cria doc em `users`
            await userService.createUser(fbUser.uid, {
                name: inviteInfo.name,
                email: email.trim().toLowerCase(),
                role: 'USER',
                tenantId: inviteInfo.tenantId,
                isActive: true,
            });

            // 3. Marca convite como usado
            await userInviteService.markInviteAsUsed(inviteInfo.inviteId);

            // 4. Volta para login
            router.replace('/(public)/auth/login');
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer
            title="Ativar conta USER"
            subtitle={
                step === 1
                    ? 'Use o e-mail e o código recebidos do administrador MASTER.'
                    : 'Defina sua senha para concluir a ativação.'
            }
            pillLabel="Ativação de usuário"
            showBack
        >
            {step === 1 && (
                <SectionCard
                    title="Confirmar convite"
                    subtitle="Valide as informações do convite recebido."
                    badge="Passo 1 de 2"
                >
                    <Input
                        label="E-mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email cadastrado pelo MASTER"
                    />

                    <Input
                        label="Código de ativação"
                        value={code}
                        onChangeText={setCode}
                        placeholder="Ex: ABC123"
                    />

                    <PrimaryButton
                        label="Validar convite"
                        loading={loading}
                        onPress={handleValidateInvite}
                    />

                    <ThemedText variant="caption" style={{ marginTop: 10 }}>
                        Se algo não funcionar, confirme com seu administrador se o código ainda é válido.
                    </ThemedText>
                </SectionCard>
            )}

            {step === 2 && inviteInfo && (
                <SectionCard
                    title="Criar senha de acesso"
                    subtitle={`Convite encontrado para ${inviteInfo.name}. Defina sua senha.`}
                    badge="Passo 2 de 2"
                >
                    <Input
                        label="Senha"
                        secure
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Crie uma senha"
                    />

                    <Input
                        label="Confirmar senha"
                        secure
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder="Repita a senha"
                    />

                    <PrimaryButton
                        label="Ativar minha conta"
                        loading={loading}
                        onPress={handleActivateUser}
                    />

                    <ThemedText variant="caption" style={{ marginTop: 10 }}>
                        Após ativar, você poderá fazer login normalmente com seu e-mail e senha.
                    </ThemedText>
                </SectionCard>
            )}
        </ScreenContainer>
    );
}
