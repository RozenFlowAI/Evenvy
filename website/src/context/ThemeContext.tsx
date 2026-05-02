'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme, ThemeType, ThemeName } from '@/lib/theme';

// 'system' = urmărește setarea telefonului/browser-ului
export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ThemeType;
  themeName: ThemeName;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ThemeName {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<ThemeName>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('evenvy_theme_pref') as ThemePreference | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      setPreferenceState(saved);
    }
    setSystemTheme(getSystemTheme());

    // Ascultă schimbările sistemului
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    localStorage.setItem('evenvy_theme_pref', p);
  };

  // Calculăm tema activă
  const themeName: ThemeName = preference === 'system' ? systemTheme : preference;
  const theme = themeName === 'dark' ? darkTheme : lightTheme;
  const isDark = themeName === 'dark';

  // toggleTheme rămâne pentru compatibilitate cu cod vechi
  const toggleTheme = () => {
    setPreference(themeName === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, preference, setPreference, toggleTheme, isDark }}>
      <div style={{
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        minHeight: '100vh',
        transition: mounted ? 'background 0.3s, color 0.3s' : 'none',
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: darkTheme,
      themeName: 'dark' as ThemeName,
      preference: 'system' as ThemePreference,
      setPreference: () => {},
      toggleTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
