// app/(app)/(tabs)/company/index.tsx
import React from 'react';
import { ScreenContainer } from '../../../../src/components/ScreenContainer';
import { SectionCard } from '../../../../src/components/SectionCard';
import { ThemedText } from '../../../../src/components/ThemedText';

export default function CompanyScreen() {
    return (
        <ScreenContainer
            title="Dados da empresa"
            subtitle="Resumo das informações da empresa vinculada a este tenant."
            pillLabel="Empresa"
        >
            <SectionCard
                title="Visão geral"
                subtitle="Nome, documento, status e configuração do tenant."
                badge="Em construção"
            >
                <ThemedText variant="caption">
                    Mais pra frente podemos mostrar aqui:
                    {'\n'}• Nome fantasia e razão social
                    {'\n'}• Documento (CNPJ/CPF)
                    {'\n'}• Status, datas de criação e plano
                </ThemedText>
            </SectionCard>
        </ScreenContainer>
    );
}
