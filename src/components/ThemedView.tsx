// src/components/ThemedView.tsx
import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

interface Props extends ViewProps {
    padded?: boolean;
}

export const ThemedView: React.FC<Props> = ({ children, style, padded = true, ...rest }) => {
    const { theme } = useTheme();

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.background },
                padded && styles.padded,
                style,
            ]}
            {...rest}
        >
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    padded: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
});
