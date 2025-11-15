// app/(app)/(tabs)/deals/create.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ContactPickerModal,
    SelectedContact,
} from '../../../../src/components/ContactPickerModal';
import { Input } from '../../../../src/components/Input';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { useTheme } from '../../../../src/hooks/useTheme';
import {
    dealService,
    DealStage,
} from '../../../../src/services/firebase/dealService';
import { useAuthStore } from '../../../../src/store/authStore';

const stages: { label: string; value: DealStage }[] = [
    { label: 'Novo', value: 'new' },
    { label: 'Qualificado', value: 'qualified' },
    { label: 'Proposta', value: 'proposal' },
    { label: 'Negociação', value: 'negotiation' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
];

export default function CreateDealScreen() {
    const user = useAuthStore((s) => s.user);
    const tenantId = user?.tenantId;
    const router = useRouter();
    const { theme } = useTheme();

    const [title, setTitle] = useState('');
    const [amountText, setAmountText] = useState('');
    const [stage, setStage] = useState<DealStage>('new');
    const [saving, setSaving] = useState(false);

    const [selectedContact, setSelectedContact] =
        useState<SelectedContact | null>(null);
    const [contactModalVisible, setContactModalVisible] =
        useState(false);

    if (!user || !tenantId) {
        return (
            <ScreenContainer
                title="Novo negócio"
                subtitle="Você precisa estar vinculado a uma empresa para criar negócios."
                pillLabel="Pipeline"
                showBack
            >
                <ThemedText variant="caption">
                    Confirme com o administrador MASTER se sua conta está
                    vinculada a um tenant.
                </ThemedText>
            </ScreenContainer>
        );
    }

    async function handleSave() {
        if (!title) return;

        const amount = parseFloat(
            amountText.replace('.', '').replace(',', '.'),
        );
        const safeAmount = isNaN(amount) ? 0 : amount;

        setSaving(true);
        try {
            await dealService.createDeal({
                tenantId: tenantId as any,
                title,
                amount: safeAmount,
                // dados do contato
                contactName: selectedContact?.name ?? null,
                contactEmail: selectedContact?.email ?? null,
                contactId: selectedContact?.id ?? null,
                stage,
                ownerUserId: user?.id,
            });

            router.back();
        } finally {
            setSaving(false);
        }
    }

    function handleSelectContact(contact: SelectedContact) {
        setSelectedContact(contact);
    }

    function clearContact() {
        setSelectedContact(null);
    }

    const contactSubtitle = selectedContact
        ? 'Contato vinculado ao negócio.'
        : 'Selecione um contato da sua base (opcional).';

    return (
        <ScreenContainer
            title="Novo negócio"
            subtitle="Cadastre uma nova oportunidade no funil."
            pillLabel="Pipeline"
            showBack
        >
            <SectionCard
                title="Dados principais"
                subtitle="Defina o que está sendo negociado e o valor."
                badge="Passo 1"
            >
                <Input
                    label="Título do negócio"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Ex: Contrato anual - Cliente XPTO"
                />

                <Input
                    label="Valor estimado (R$)"
                    value={amountText}
                    onChangeText={setAmountText}
                    placeholder="Ex: 1500,00"
                    keyboardType="numeric"
                />
            </SectionCard>

            <SectionCard
                title="Contato"
                subtitle={contactSubtitle}
                badge="Passo 2"
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                        styles.contactCard,
                        {
                            backgroundColor: theme.surfaceAlt,
                            borderColor: theme.border,
                        },
                    ]}
                    onPress={() => setContactModalVisible(true)}
                >
                    <View
                        style={[
                            styles.contactAvatar,
                            { backgroundColor: theme.primarySoft },
                        ]}
                    >
                        <Ionicons
                            name="person-add-outline"
                            size={20}
                            color={theme.primary}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <ThemedText bold>
                            {selectedContact
                                ? selectedContact.name
                                : 'Selecionar contato'}
                        </ThemedText>

                        <ThemedText
                            variant="caption"
                            style={{ marginTop: 2 }}
                        >
                            {selectedContact
                                ? selectedContact.email ||
                                selectedContact.companyName ||
                                'Contato da base'
                                : 'Toque para escolher um contato existente'}
                        </ThemedText>
                    </View>

                    {selectedContact && (
                        <TouchableOpacity onPress={clearContact}>
                            <Ionicons
                                name="close-circle-outline"
                                size={20}
                                color={theme.textSoft}
                            />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <ThemedText
                    variant="caption"
                    style={{ marginTop: 8 }}
                >
                    Para vincular um novo contato, cadastre-o primeiro no
                    módulo de Contatos.
                </ThemedText>
            </SectionCard>

            <SectionCard
                title="Estágio no funil"
                subtitle="Comece o negócio no estágio adequado."
                badge="Passo 3"
            >
                <View style={styles.stagesRow}>
                    {stages.map((s) => (
                        <TouchableOpacity
                            key={s.value}
                            onPress={() => setStage(s.value)}
                            style={[
                                styles.stageChip,
                                {
                                    backgroundColor:
                                        stage === s.value
                                            ? theme.primarySoft
                                            : theme.background,
                                    borderColor:
                                        stage === s.value
                                            ? theme.primary
                                            : theme.border,
                                },
                            ]}
                        >
                            <ThemedText
                                variant="caption"
                                style={{
                                    color:
                                        stage === s.value
                                            ? theme.primary
                                            : theme.textSoft,
                                }}
                            >
                                {s.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <PrimaryButton
                    label="Salvar negócio"
                    loading={saving}
                    onPress={handleSave}
                />
            </SectionCard>

            {/* MODAL DE CONTATOS */}
            <ContactPickerModal
                visible={contactModalVisible}
                tenantId={tenantId}
                onClose={() => setContactModalVisible(false)}
                onSelect={handleSelectContact}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    stagesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    stageChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        padding: 10,
        borderWidth: 1,
    },
    contactAvatar: {
        width: 34,
        height: 34,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
});
