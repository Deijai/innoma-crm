// src/components/Input.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from './ThemedText';

interface Props extends TextInputProps {
    label?: string;
    secure?: boolean;
}

export const Input: React.FC<Props> = ({ label, secure, style, ...rest }) => {
    const { theme } = useTheme();
    const [show, setShow] = useState(false);

    const isPassword = !!secure;

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText variant="caption" style={styles.label} bold>
                    {label}
                </ThemedText>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.text,
                        },
                        style,
                    ]}
                    placeholderTextColor={theme.textSoft}
                    secureTextEntry={isPassword && !show}
                    {...rest}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShow((prev) => !prev)}>
                        <Ionicons
                            name={show ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={theme.textSoft}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        borderRadius: 999,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
});
