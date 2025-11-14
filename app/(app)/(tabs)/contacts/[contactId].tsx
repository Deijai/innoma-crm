// app/(app)/(tabs)/contacts/[contactId].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Input } from '../../../../src/components/Input';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import {
    ContactDoc,
    contactService,
} from '../../../../src/services/firebase/contactService';

export default function EditContactScreen() {
    const { contactId } = useLocalSearchParams<{ contactId: string }>();
    const router = useRouter();

    const [contact, setContact] = useState<ContactDoc | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [tagsText, setTagsText] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!contactId) return;
            setLoading(true);
            try {
                const data = await contactService.getContact(String(contactId));
                setContact(data || null);
                if (data) {
                    setName(data.name || '');
                    setEmail(data.email || '');
                    setPhone(data.phone || '');
                    setCompanyName(data.companyName || '');
                    setTagsText((data.tags || []).join(', '));
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [contactId]);

    async function handleSave() {
        if (!contact || !contactId) return;
        if (!name) return;

        setSaving(true);
        try {
            const tags = tagsText
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            await contactService.updateContact(String(contactId), {
                name,
                email: email || null,
                phone: phone || null,
                companyName: companyName || null,
                tags,
            });

            router.back();
        } finally {
            setSaving(false);
        }
    }

    async function handleArchive() {
        if (!contact || !contactId) return;

        setArchiving(true);
        try {
            await contactService.softDeleteContact(String(contactId));
            router.back();
        } finally {
            setArchiving(false);
        }
    }

    if (loading || !contactId) {
        return (
            <ScreenContainer
                title="Contato"
                subtitle="Carregando dados..."
                pillLabel="Contatos"
                showBack
            >
                <ThemedText>Carregando...</ThemedText>
            </ScreenContainer>
        );
    }

    if (!contact) {
        return (
            <ScreenContainer
                title="Contato não encontrado"
                subtitle="Verifique se o contato ainda existe."
                pillLabel="Contatos"
                showBack
            >
                <ThemedText variant="caption">
                    Este contato pode ter sido removido ou o link está incorreto.
                </ThemedText>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer
            title="Editar contato"
            subtitle="Atualize os dados ou arquive este contato."
            pillLabel="Contatos"
            showBack
        >
            <SectionCard
                title="Dados principais"
                subtitle="Ajuste as informações do contato."
                badge={contact.isActive ? 'Ativo' : 'Arquivado'}
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
                subtitle="Tags e status do contato."
                badge="Tags"
            >
                <Input
                    label="Tags (separadas por vírgula)"
                    value={tagsText}
                    onChangeText={setTagsText}
                    placeholder="Ex: cliente, lead quente, parceiro"
                />

                <PrimaryButton
                    label="Salvar alterações"
                    loading={saving}
                    onPress={handleSave}
                />

                <PrimaryButton
                    label="Arquivar contato"
                    variant="outline"
                    loading={archiving}
                    onPress={handleArchive}
                />
            </SectionCard>
        </ScreenContainer>
    );
}
