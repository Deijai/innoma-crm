// app/(app)/company/create.tsx
import React, { useState } from 'react';
import { Input } from '../../../src/components/Input';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { SectionCard } from '../../../src/components/SectionCard';
import { tenantService } from '../../../src/services/firebase/tenantService';
import { useAuthStore } from '../../../src/store/authStore';

export default function CreateCompanyScreen() {
    const user = useAuthStore((s) => s.user);
    const setState = useAuthStore.setState;
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        if (!user || !name) return;

        setLoading(true);
        try {
            const tenantId = await tenantService.createTenant(user.id, {
                name,
                document,
            });

            setState((prev: any) => ({
                ...prev,
                user: prev.user
                    ? {
                        ...prev.user,
                        tenantId,
                    }
                    : prev.user,
            }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer
            title="Cadastrar empresa"
            subtitle="Antes de usar o Innoma CRM, precisamos saber qual é a empresa que você vai gerenciar."
            pillLabel="Passo 2 de 2"
        >
            <SectionCard
                title="Dados da empresa"
                subtitle="Essas informações podem ser ajustadas depois."
            >
                <Input
                    label="Nome da empresa"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Innoma Tecnologia"
                />

                <Input
                    label="Documento (CNPJ/CPF – opcional)"
                    value={document}
                    onChangeText={setDocument}
                    placeholder="00.000.000/0000-00"
                />

                <PrimaryButton
                    label="Criar empresa"
                    loading={loading}
                    onPress={handleCreate}
                />
            </SectionCard>
        </ScreenContainer>
    );
}
