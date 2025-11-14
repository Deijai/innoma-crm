// src/hooks/useTheme.ts
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
    const theme = useThemeStore((s) => s.theme);
    const themeName = useThemeStore((s) => s.themeName);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);

    return { theme, themeName, toggleTheme };
}
