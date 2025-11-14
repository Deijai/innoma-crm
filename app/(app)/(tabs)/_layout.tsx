// app/(app)/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../src/hooks/useTheme';

export default function TabsLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSoft,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                    height: 64,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                },
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="users/index"
                options={{
                    title: 'Usuários',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="company/index"
                options={{
                    title: 'Empresa',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Configurações',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="users/create"
                options={{
                    title: 'Criar usuario',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                    href: null,
                }}
            />
        </Tabs>
    );
}
