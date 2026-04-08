// Theme configuration matching mobile app
export const darkTheme = {
  colors: {
    background: '#0A0A0F',
    surface: '#14141F',
    surfaceHighlight: '#1E1E2D',
    primary: '#D4AF37',
    primaryLight: '#F4D03F',
    primaryDark: '#B8860B',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    border: '#27272A',
    borderLight: '#3F3F46',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHighlight: '#F1F5F9',
    primary: '#B8860B',
    primaryLight: '#D4AF37',
    primaryDark: '#8B6914',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#CBD5E1',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
};

export type ThemeType = typeof darkTheme;
export type ThemeName = 'dark' | 'light';
