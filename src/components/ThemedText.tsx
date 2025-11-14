// src/components/ThemedText.tsx
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props extends TextProps {
    variant?: 'title' | 'subtitle' | 'body' | 'caption';
    bold?: boolean;
}

export const ThemedText: React.FC<Props> = ({
    children,
    style,
    variant = 'body',
    bold,
    ...rest
}) => {
    const { theme } = useTheme();

    const baseStyle = [
        styles.base,
        { color: theme.text },
        variant === 'title' && styles.title,
        variant === 'subtitle' && [styles.subtitle, { color: theme.textSoft }],
        variant === 'caption' && styles.caption,
        bold && styles.bold,
        style,
    ];

    return (
        <Text style={baseStyle} {...rest}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
    },
    bold: {
        fontWeight: '600',
    },
});
