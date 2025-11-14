// src/store/themeStore.ts
import { create } from 'zustand';
import { AppTheme, darkTheme, lightTheme } from '../theme/colors';

type ThemeName = 'light' | 'dark';

interface ThemeState {
    themeName: ThemeName;
    theme: AppTheme;
    toggleTheme: () => void;
    setTheme: (name: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    themeName: 'light',
    theme: lightTheme,
    toggleTheme: () => {
        const current = get().themeName;
        const next = current === 'light' ? 'dark' : 'light';
        set({
            themeName: next,
            theme: (next === 'light' ? lightTheme : darkTheme) as AppTheme,
        });
    },
    setTheme: (name) =>
        set({
            themeName: name,
            theme: (name === 'light' ? lightTheme : darkTheme) as AppTheme,
        }),
}));
