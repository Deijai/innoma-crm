// app/(public)/auth-options.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { SectionCard } from '../../src/components/SectionCard';
import { ThemedText } from '../../src/components/ThemedText';

export default function AuthOptionsScreen() {
    const router = useRouter();

    return (
        <ScreenContainer
            title="Como deseja entrar?"
            subtitle="Defina se você vai criar uma nova conta como MASTER ou acessar algo que já foi configurado."
            pillLabel="Acesso ao Innoma CRM"
        >
            <SectionCard
                title="Já tenho acesso"
                subtitle="Se você já possui login (MASTER ou USER), entre aqui."
                badge="Login"
            >
                <PrimaryButton
                    label="Fazer login"
                    onPress={() => router.push('/(public)/auth/login')}
                />
            </SectionCard>

            <SectionCard
                title="Sou novo por aqui"
                subtitle="Crie uma nova conta com perfil MASTER para configurar sua empresa e convidar usuários."
                badge="Novo MASTER"
            >
                <PrimaryButton
                    label="Criar conta como MASTER"
                    variant="secondary"
                    onPress={() => router.push('/(public)/auth/register-master')}
                />
            </SectionCard>

            <SectionCard
                title="Ativar conta USER"
                subtitle="Seu administrador MASTER já criou seu acesso? Ative sua conta e personalize seus dados."
                badge="Convite recebido"
            >
                <ThemedText variant="caption" style={{ marginBottom: 10 }}>
                    Use o e-mail e o código/senha temporária enviados pelo seu administrador.
                </ThemedText>
                <PrimaryButton
                    label="Ativar minha conta USER"
                    variant="outline"
                    onPress={() => router.push('/(public)/auth/activate-user')}
                />
            </SectionCard>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({});
