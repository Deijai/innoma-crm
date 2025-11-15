// app/(app)/(tabs)/deals/[dealId].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    DealDoc,
    dealService,
    DealStage,
} from '../../../../src/services/firebase/dealService';

const stages: { label: string; value: DealStage }[] = [
    { label: 'Novo', value: 'new' },
    { label: 'Qualificado', value: 'qualified' },
    { label: 'Proposta', value: 'proposal' },
    { label: 'Negociação', value: 'negotiation' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
];

export default function DealDetailScreen() {
    const { dealId } =
        useLocalSearchParams<{ dealId: string }>();
    const router = useRouter();
    const { theme } = useTheme();

    const [deal, setDeal] = useState<DealDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const [title, setTitle] = useState('');
    const [amountText, setAmountText] = useState('');
    const [stage, setStage] = useState<DealStage>('new');

    const [selectedContact, setSelectedContact] =
        useState<SelectedContact | null>(null);
    const [contactModalVisible, setContactModalVisible] =
        useState(false);

    useEffect(() => {
        const load = async () => {
            if (!dealId) return;
            setLoading(true);
            try {
                const data = await dealService.getDeal(
                    String(dealId),
                );
                setDeal(data);
                if (data) {
                    setTitle(data.title);
                    setStage(data.stage);

                    const amountStr = (data.amount || 0).toLocaleString(
                        'pt-BR',
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        },
                    );
                    setAmountText(amountStr);

                    // se já existe contato vinculado, popula o estado
                    if (data.contactId || data.contactName) {
                        setSelectedContact({
                            id: data.contactId || 'manual',
                            name: data.contactName || 'Contato',
                            email: (data as any).contactEmail ?? null,
                        });
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [dealId]);

    async function handleSave() {
        if (!dealId || !deal) return;
        if (!title) return;

        const amount = parseFloat(
            amountText.replace('.', '').replace(',', '.'),
        );
        const safeAmount = isNaN(amount) ? 0 : amount;

        setSaving(true);
        try {
            await dealService.updateDeal(String(dealId), {
                title,
                amount: safeAmount,
                stage,
                // dados do contato
                contactName: selectedContact?.name ?? null,
                contactEmail: selectedContact?.email ?? null,
                contactId:
                    selectedContact && selectedContact.id !== 'manual'
                        ? selectedContact.id
                        : null,
            });

            router.back();
        } finally {
            setSaving(false);
        }
    }

    async function handleArchiveAsLost() {
        if (!dealId || !deal) return;
        setArchiving(true);
        try {
            await dealService.softDeleteDeal(String(dealId));
            router.back();
        } finally {
            setArchiving(false);
        }
    }

    function handleSelectContact(contact: SelectedContact) {
        setSelectedContact(contact);
    }

    function clearContact() {
        setSelectedContact(null);
    }

    if (loading) {
        return (
            <ScreenContainer
                title="Negócio"
                subtitle="Carregando..."
                pillLabel="Pipeline"
                showBack
            >
                <ThemedText>
                    Carregando dados do negócio...
                </ThemedText>
            </ScreenContainer>
        );
    }

    if (!deal) {
        return (
            <ScreenContainer
                title="Negócio não encontrado"
                subtitle="Verifique se o link ainda é válido."
                pillLabel="Pipeline"
                showBack
            >
                <ThemedText variant="caption">
                    Este negócio pode ter sido removido ou o
                    identificador está incorreto.
                </ThemedText>
            </ScreenContainer>
        );
    }

    const isWon = deal.status === 'won';
    const isLost = deal.status === 'lost';

    const contactSubtitle = selectedContact
        ? 'Contato vinculado ao negócio.'
        : 'Selecione um contato da sua base (opcional).';

    return (
        <ScreenContainer
            title="Detalhes do negócio"
            subtitle="Atualize informações e estágio do funil."
            pillLabel="Pipeline"
            showBack
        >
            <SectionCard
                title="Dados principais"
                subtitle="Edite o título e valor."
                badge={
                    isWon ? 'Won' : isLost ? 'Lost' : 'Aberto'
                }
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
                badge="Contato"
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
                            name="person-outline"
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
            </SectionCard>

            <SectionCard
                title="Estágio no funil"
                subtitle="Mova o negócio ao longo do pipeline."
                badge="Funil"
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
                    label="Salvar alterações"
                    loading={saving}
                    onPress={handleSave}
                />

                {!isLost && (
                    <PrimaryButton
                        label="Marcar como Lost"
                        variant="outline"
                        loading={archiving}
                        onPress={handleArchiveAsLost}
                    />
                )}
            </SectionCard>

            {/* MODAL DE CONTATOS */}
            <ContactPickerModal
                visible={contactModalVisible}
                tenantId={deal.tenantId}
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
