// app/(public)/auth/login.tsx
import React, { useState } from 'react';
import { Input } from '../../../src/components/Input';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SectionCard } from '../../../src/components/SectionCard';
import { useAuthStore } from '../../../src/store/authStore';

export default function LoginScreen() {
    const login = useAuthStore((s) => s.login);
    const loading = useAuthStore((s) => s.loading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
        await login(email.trim(), password);
    }

    return (
        <ScreenContainer
            title="Entrar no Innoma CRM"
            subtitle="Acesse com seu e-mail e senha cadastrados."
            pillLabel="Autenticação"
            showBack
        >
            <SectionCard title="Suas credenciais" subtitle="Informe seus dados para continuar.">
                <Input
                    label="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seuemail@empresa.com"
                />

                <Input
                    label="Senha"
                    secure
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Digite sua senha"
                />

                <PrimaryButton label="Entrar" loading={loading} onPress={handleLogin} />
            </SectionCard>
        </ScreenContainer>
    );
}
