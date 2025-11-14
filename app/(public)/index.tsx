// app/(public)/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ThemedText } from '../../src/components/ThemedText';
import { ThemedView } from '../../src/components/ThemedView';
import { useTheme } from '../../src/hooks/useTheme';

export default function OnboardingScreen() {
    const router = useRouter();
    const { theme, themeName, toggleTheme } = useTheme();

    return (
        <ThemedView padded={false} style={{ backgroundColor: theme.background }}>
            <View style={[styles.hero, { backgroundColor: theme.surfaceAlt }]}>
                <View style={styles.heroBadge}>
                    <ThemedText variant="caption" bold>
                        Novo • Innoma CRM
                    </ThemedText>
                </View>

                <ThemedText variant="title" bold style={styles.heroTitle}>
                    Relacionamentos organizados,
                    {'\n'}
                    pipeline sempre em dia.
                </ThemedText>

                <ThemedText variant="subtitle" style={{ marginTop: 12 }}>
                    Gerencie empresas, usuários e negócios em um CRM pensado para times modernos
                    e mobile-first.
                </ThemedText>
            </View>

            <View style={styles.content}>
                <View style={styles.highlightRow}>
                    <View
                        style={[
                            styles.highlightDot,
                            { backgroundColor: theme.primary },
                        ]}
                    />
                    <ThemedText variant="caption">
                        Controle de acesso por usuário MASTER e USER
                    </ThemedText>
                </View>

                <View style={styles.highlightRow}>
                    <View
                        style={[
                            styles.highlightDot,
                            { backgroundColor: theme.accent },
                        ]}
                    />
                    <ThemedText variant="caption">
                        Multi-empresa, multi-tenant, simples de usar
                    </ThemedText>
                </View>

                <View style={{ marginTop: 32 }}>
                    <PrimaryButton
                        label="Começar agora"
                        onPress={() => router.push('/(public)/auth-options')}
                    />

                    <PrimaryButton
                        label={
                            themeName === 'light'
                                ? 'Ativar modo escuro'
                                : 'Ativar modo claro'
                        }
                        variant="ghost"
                        onPress={toggleTheme}
                    />
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    hero: {
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#D1FAE5',
    },
    heroTitle: {
        marginTop: 18,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    highlightDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
});
