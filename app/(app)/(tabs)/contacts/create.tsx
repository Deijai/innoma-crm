// app/(app)/(tabs)/contacts/create.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Input } from '../../../../src/components/Input';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { contactService } from '../../../../src/services/firebase/contactService';
import { useAuthStore } from '../../../../src/store/authStore';

export default function CreateContactScreen() {
    const user = useAuthStore((s) => s.user);
    const tenantId = user?.tenantId;
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [saving, setSaving] = useState(false);

    if (!user || !tenantId) {
        return (
            <ScreenContainer
                title="Novo contato"
                subtitle="Você precisa estar vinculado a uma empresa para criar contatos."
                pillLabel="Contatos"
                showBack
            >
                <ThemedText variant="caption">
                    Confirme com o administrador MASTER se sua conta está corretamente vinculada.
                </ThemedText>
            </ScreenContainer>
        );
    }

    async function handleSave() {
        if (!name) return;

        setSaving(true);
        try {
            const tags = tagsText
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            await contactService.createContact({
                tenantId: tenantId as any,
                name,
                email: email || null,
                phone: phone || null,
                companyName: companyName || null,
                ownerUserId: user?.id,
                tags,
            });

            router.back();
        } finally {
            setSaving(false);
        }
    }

    return (
        <ScreenContainer
            title="Novo contato"
            subtitle="Cadastre um novo cliente, lead ou parceiro."
            pillLabel="Contatos"
            showBack
        >
            <SectionCard
                title="Dados principais"
                subtitle="Campos essenciais para identificar o contato."
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
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Input
                    label="Telefone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                />

                <Input
                    label="Empresa (opcional)"
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Empresa relacionada"
                />
            </SectionCard>

            <SectionCard
                title="Organização"
                subtitle="Use tags para segmentar seu contato."
                badge="Tags"
            >
                <Input
                    label="Tags (separadas por vírgula)"
                    value={tagsText}
                    onChangeText={setTagsText}
                    placeholder="Ex: cliente, lead quente, parceiro"
                />

                <PrimaryButton
                    label="Salvar contato"
                    loading={saving}
                    onPress={handleSave}
                />
            </SectionCard>
        </ScreenContainer>
    );
}
