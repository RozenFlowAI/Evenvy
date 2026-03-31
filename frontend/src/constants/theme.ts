// Theme configuration with Light and Dark modes
// Each event type has its own accent color

export const EVENT_COLORS: Record<string, { primary: string; light: string; gradient: string[] }> = {
  wedding: { primary: '#E91E63', light: '#FCE4EC', gradient: ['#E91E63', '#F48FB1'] },      // Pink/Rose
  baptism: { primary: '#2196F3', light: '#E3F2FD', gradient: ['#2196F3', '#90CAF9'] },      // Blue
  corporate: { primary: '#607D8B', light: '#ECEFF1', gradient: ['#607D8B', '#B0BEC5'] },    // Blue Grey
  civil_wedding: { primary: '#9C27B0', light: '#F3E5F5', gradient: ['#9C27B0', '#CE93D8'] }, // Purple
  party: { primary: '#FF9800', light: '#FFF3E0', gradient: ['#FF9800', '#FFCC80'] },        // Orange
  birthday: { primary: '#4CAF50', light: '#E8F5E9', gradient: ['#4CAF50', '#A5D6A7'] },     // Green
  conference: { primary: '#795548', light: '#EFEBE9', gradient: ['#795548', '#BCAAA4'] },   // Brown
};

// Dark Theme (Elegant with gold accents)
export const darkTheme = {
  name: 'dark' as const,
  colors: {
    // Backgrounds
    background: '#0A0A0F',
    surface: '#14141F',
    surfaceHighlight: '#1E1E2D',
    
    // Primary accent (Gold/Amber)
    primary: '#D4AF37',
    primaryLight: '#F4D03F',
    primaryDark: '#B8860B',
    
    // Secondary accents
    secondary: '#6366F1',
    accent: '#8B5CF6',
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    
    // Borders
    border: '#27272A',
    borderLight: '#3F3F46',
    
    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Gradients
    gradientStart: '#1a1a2e',
    gradientEnd: '#0f0f1a',
    
    // Card overlay
    cardOverlay: 'rgba(0,0,0,0.6)',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Typography
  typography: {
    display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
    h2: { fontSize: 22, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    bodyLg: { fontSize: 16, fontWeight: '400' as const },
    bodySm: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  },
  
  // Shadows (subtle for dark mode)
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 },
  },
};

// Light Theme (Fresh and modern)
export const lightTheme = {
  name: 'light' as const,
  colors: {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHighlight: '#F1F5F9',
    
    // Primary accent (Deep purple/indigo)
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    
    // Secondary accents
    secondary: '#D4AF37',
    accent: '#8B5CF6',
    
    // Text
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    
    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Gradients
    gradientStart: '#F8FAFC',
    gradientEnd: '#FFFFFF',
    
    // Card overlay
    cardOverlay: 'rgba(0,0,0,0.4)',
  },
  
  // Same spacing
  spacing: darkTheme.spacing,
  radius: darkTheme.radius,
  typography: darkTheme.typography,
  
  // Shadows (more visible for light mode)
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  },
};

export type ThemeType = typeof darkTheme;
export type ThemeName = 'light' | 'dark';

// Default exports for backward compatibility
export const colors = darkTheme.colors;
export const spacing = darkTheme.spacing;
export const radius = darkTheme.radius;
export const typography = darkTheme.typography;
export const shadows = darkTheme.shadows;
