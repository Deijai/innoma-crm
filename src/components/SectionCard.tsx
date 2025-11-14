// src/components/SectionCard.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from './ThemedText';

interface Props extends ViewProps {
    title?: string;
    subtitle?: string;
    badge?: string;
}

export const SectionCard: React.FC<Props> = ({
    title,
    subtitle,
    badge,
    children,
    style,
    ...rest
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: theme.name === 'light' ? '#000' : '#000',
                },
                style,
            ]}
            {...rest}
        >
            {(title || subtitle || badge) && (
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        {badge && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: theme.primarySoft },
                                ]}
                            >
                                <ThemedText variant="caption" bold>
                                    {badge}
                                </ThemedText>
                            </View>
                        )}
                        {title && (
                            <ThemedText bold style={{ marginTop: badge ? 6 : 0 }}>
                                {title}
                            </ThemedText>
                        )}
                        {subtitle && (
                            <ThemedText variant="caption" style={{ marginTop: 4 }}>
                                {subtitle}
                            </ThemedText>
                        )}
                    </View>
                </View>
            )}

            <View style={{ marginTop: title || subtitle || badge ? 14 : 0 }}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 4,
    },
    header: {
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
});
