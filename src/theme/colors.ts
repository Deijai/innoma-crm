// src/theme/colors.ts
export const palette = {
    // Verdes principais (Emerald)
    emerald100: '#D1FAE5',
    emerald200: '#A7F3D0',
    emerald300: '#6EE7B7',
    emerald400: '#34D399',
    emerald500: '#10B981',
    emerald600: '#059669',
    emerald700: '#047857',
    emerald800: '#065F46',
    emerald900: '#064E3B',

    // Neutros claros
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',

    // Neutros escuros
    gray800: '#1F2937',
    gray900: '#111827',
    gray950: '#030712',

    // Acento azul
    blue500: '#3B82F6',
};

export const lightTheme = {
    name: 'light' as const,
    background: palette.gray50,
    surface: '#FFFFFF',
    surfaceAlt: palette.gray100,
    primary: palette.emerald500,
    primarySoft: palette.emerald100,
    primaryHover: palette.emerald600,
    text: palette.gray900,
    textSoft: '#6B7280',
    border: palette.gray200,
    accent: palette.blue500,
    overlay: 'rgba(15, 23, 42, 0.35)', // 🔹 fundo esfumaçado escuro
};

export const darkTheme = {
    name: 'dark' as const,
    background: palette.gray950,
    surface: palette.gray900,
    surfaceAlt: palette.gray800,
    primary: palette.emerald400,
    primarySoft: palette.emerald900,
    primaryHover: palette.emerald300,
    text: '#F9FAFB',
    textSoft: '#9CA3AF',
    border: '#374151',
    accent: palette.blue500,
    overlay: 'rgba(15, 23, 42, 0.35)', // 🔹 fundo esfumaçado escuro
};

export type AppTheme = typeof lightTheme;
