// src/components/ScreenContainer.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Props {
    title: string;
    subtitle?: string;
    pillLabel?: string;
    children: React.ReactNode;
    showBack?: boolean;
}

export const ScreenContainer: React.FC<Props> = ({
    title,
    subtitle,
    pillLabel,
    children,
    showBack,
}) => {
    const { theme, themeName, toggleTheme } = useTheme();
    const router = useRouter();

    const isDark = themeName === 'dark';

    return (
        <ScrollView>
            <ThemedView padded={false} style={{ backgroundColor: theme.background }}>
                {/* HEADER */}
                <View
                    style={[
                        styles.headerWrapper,
                        { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border },
                    ]}
                >
                    <View style={styles.headerTopRow}>
                        {/* Botão de voltar (quando showBack = true) */}
                        {showBack ? (
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={[
                                    styles.iconButton,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                ]}
                            >
                                <Ionicons name="chevron-back" size={20} color={theme.text} />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 40 }} />
                        )}

                        {/* Pill central (Innoma CRM, seção etc.) */}
                        <View
                            style={[
                                styles.pill,
                                { backgroundColor: theme.primarySoft },
                            ]}
                        >
                            <View
                                style={[
                                    styles.pillDot,
                                    { backgroundColor: theme.primary },
                                ]}
                            />
                            <ThemedText variant="caption" bold>
                                {pillLabel || 'Innoma CRM'}
                            </ThemedText>
                        </View>

                        {/* Toggle de tema (sol/lua) */}
                        <TouchableOpacity
                            onPress={toggleTheme}
                            style={[
                                styles.iconButton,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}
                        >
                            <Ionicons
                                name={isDark ? 'sunny-outline' : 'moon-outline'}
                                size={20}
                                color={theme.text}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Título + subtítulo da tela */}
                    <View style={styles.headerText}>
                        <ThemedText variant="title" bold>
                            {title}
                        </ThemedText>
                        {subtitle && (
                            <ThemedText variant="subtitle" style={{ marginTop: 4 }}>
                                {subtitle}
                            </ThemedText>
                        )}
                    </View>
                </View>

                {/* CONTEÚDO */}
                <View style={styles.contentWrapper}>{children}</View>
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    headerWrapper: {
        paddingTop: 26,
        paddingBottom: 18,
        paddingHorizontal: 24,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        marginTop: 18,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        gap: 8,
    },
    pillDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 24,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
