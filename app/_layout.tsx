// app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider } from '../src/theme/ThemeProvider';

function AuthGate() {
    const segments = useSegments();
    const router = useRouter();
    const { theme } = useTheme();

    const user = useAuthStore((s) => s.user);
    const initialized = useAuthStore((s) => s.initialized);
    const initAuthListener = useAuthStore((s) => s.initAuthListener);

    useEffect(() => {
        initAuthListener();
    }, [initAuthListener]);

    useEffect(() => {
        if (!initialized) return;

        const group = segments[0];            // '(public)' | '(app)' | undefined
        const subGroup = segments[1];         // 'auth' | 'company' | '(tabs)' | ...
        const inPublicGroup = group === '(public)';
        const inAppGroup = group === '(app)';
        const inTabsGroup = inAppGroup && subGroup === '(tabs)';

        // 🔓 Não logado → sempre fica no grupo público
        if (!user) {
            if (!inPublicGroup) {
                router.replace('/(public)');
            }
            return;
        }

        // 🔐 Logado:
        // MASTER sem empresa → força ir para cadastro de empresa
        if (user.role === 'MASTER' && !user.tenantId) {
            // queremos garantir que está em /(app)/company/create
            const isInCompanyCreate =
                inAppGroup && subGroup === 'company' && segments[2] === 'create';

            if (!isInCompanyCreate) {
                router.replace('/(app)/company/create');
            }
            return;
        }

        // MASTER com empresa OU USER → devem estar sempre nas tabs
        if (!inTabsGroup) {
            router.replace('/(app)/(tabs)/home');
        }
    }, [initialized, user, segments, router]);

    if (!initialized) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator color={theme.primary} />
            </View>
        );
    }

    return <Slot />;
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthGate />
        </ThemeProvider>
    );
}
