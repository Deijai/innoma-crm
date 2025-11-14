// app/(public)/auth/register-master.tsx
import React, { useState } from 'react';
import { Input } from '../../../src/components/Input';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SectionCard } from '../../../src/components/SectionCard';
import { useAuthStore } from '../../../src/store/authStore';

export default function RegisterMasterScreen() {
    const registerMaster = useAuthStore((s) => s.registerMaster);
    const loading = useAuthStore((s) => s.loading);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    async function handleRegister() {
        if (!name || !email || !password || password !== confirm) {
            // Depois você pode colocar toast.
            return;
        }
        await registerMaster(name.trim(), email.trim(), password);
    }

    return (
        <ScreenContainer
            title="Criar conta MASTER"
            subtitle="Esse usuário será o dono da conta e poderá cadastrar empresas e usuários."
            pillLabel="Novo MASTER"
            showBack
        >
            <SectionCard title="Dados do responsável" badge="Passo 1 de 2">
                <Input
                    label="Nome completo"
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                />

                <Input
                    label="E-mail corporativo"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seuemail@empresa.com"
                />

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
                    label="Criar conta MASTER"
                    loading={loading}
                    onPress={handleRegister}
                />
            </SectionCard>
        </ScreenContainer>
    );
}
