// app/(app)/company/edit.tsx
import { Input } from '@/src/components/Input';
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';
import { TenantDoc, tenantService } from '../../../../src/services/firebase/tenantService';
import { useAuthStore } from '../../../../src/store/authStore';
export default function EditCompanyScreen() {
    const user = useAuthStore((s) => s.user);
    const tenantId = user?.tenantId;

    const [tenant, setTenant] = useState<TenantDoc | null>(null);
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadTenant = async () => {
            if (!tenantId) return;
            setLoading(true);
            try {
                const data = await tenantService.getTenant(tenantId);
                setTenant(data);
                if (data) {
                    setName(data.name || '');
                    setDocument(data.document || '');
                }
            } finally {
                setLoading(false);
            }
        };

        loadTenant();
    }, [tenantId]);

    async function handleSave() {
        if (!tenantId) return;
        if (!name) return;

        setSaving(true);
        try {
            await tenantService.updateTenant(tenantId, {
                name,
                document: document || null,
            });
            // opcional: você pode recarregar ou só confiar que deu certo
        } finally {
            setSaving(false);
        }
    }

    return (
        <ScreenContainer
            title="Editar empresa"
            subtitle="Altere os dados básicos da empresa vinculada a este tenant."
            pillLabel="Empresa"
            showBack
        >
            <SectionCard
                title="Dados da empresa"
                subtitle="Nome e documento podem ser ajustados a qualquer momento."
                badge="Edição"
            >
                {loading ? (
                    <ThemedText>Carregando dados da empresa...</ThemedText>
                ) : (
                    <>
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
                            label="Salvar alterações"
                            loading={saving}
                            onPress={handleSave}
                        />
                    </>
                )}
            </SectionCard>

            {tenant && (
                <SectionCard
                    title="Informações técnicas"
                    subtitle="Dados internos usados pelo sistema."
                    badge="Somente leitura"
                >
                    <ThemedText variant="caption">
                        ID do tenant: <ThemedText bold variant="caption">{tenant.id}</ThemedText>
                    </ThemedText>
                    <ThemedText variant="caption" style={{ marginTop: 4 }}>
                        Owner (MASTER):{' '}
                        <ThemedText bold variant="caption">{tenant.ownerUserId}</ThemedText>
                    </ThemedText>
                    <ThemedText variant="caption" style={{ marginTop: 4 }}>
                        Criado em:{' '}
                        {new Date(tenant.createdAt).toLocaleString()}
                    </ThemedText>
                </SectionCard>
            )}
        </ScreenContainer>
    );
}
