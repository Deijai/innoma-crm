// src/theme/ThemeProvider.tsx
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { darkTheme, lightTheme } from './colors';

type Props = {
    children: React.ReactNode;
};

export const ThemeProvider: React.FC<Props> = ({ children }) => {
    const themeName = useThemeStore((s) => s.themeName);

    const navTheme =
        themeName === 'light'
            ? {
                dark: false,
                colors: {
                    primary: lightTheme.primary,
                    background: lightTheme.background,
                    card: lightTheme.surface,
                    text: lightTheme.text,
                    border: lightTheme.border,
                    notification: lightTheme.accent,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' as const },
                    medium: { fontFamily: 'System', fontWeight: '500' as const },
                    bold: { fontFamily: 'System', fontWeight: '700' as const },
                    heavy: { fontFamily: 'System', fontWeight: '900' as const },
                },
            }
            : {
                dark: true,
                colors: {
                    primary: darkTheme.primary,
                    background: darkTheme.background,
                    card: darkTheme.surface,
                    text: darkTheme.text,
                    border: darkTheme.border,
                    notification: darkTheme.accent,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' as const },
                    medium: { fontFamily: 'System', fontWeight: '500' as const },
                    bold: { fontFamily: 'System', fontWeight: '700' as const },
                    heavy: { fontFamily: 'System', fontWeight: '900' as const },
                },
            };

    return (
        <NavThemeProvider value={navTheme}>
            <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
            {children}
        </NavThemeProvider>
    );
};
