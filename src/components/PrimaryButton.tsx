// src/components/PrimaryButton.tsx
import React from 'react';
import {
    ActivityIndicator,
    GestureResponderEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
    variant?: 'primary' | 'ghost' | 'outline' | 'secondary';
    loading?: boolean;
}

export const PrimaryButton: React.FC<Props> = ({
    label,
    onPress,
    variant = 'primary',
    loading,
}) => {
    const { theme } = useTheme();

    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    const backgroundColor = isPrimary
        ? theme.primary
        : isSecondary
            ? theme.accent
            : 'transparent';

    const textColor = isPrimary || isSecondary ? '#FFFFFF' : theme.text;
    const borderColor = isOutline ? theme.border : 'transparent';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderColor,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.85}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        borderWidth: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
});
