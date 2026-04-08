'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme, ThemeType, ThemeName } from '@/lib/theme';

type ThemeContextType = {
  theme: ThemeType;
  themeName: ThemeName;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('evenvy_theme') as ThemeName | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeName(saved);
    }
  }, []);

  const theme = themeName === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newTheme = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(newTheme);
    localStorage.setItem('evenvy_theme', newTheme);
  };

  // Always provide context, even before mount
  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, isDark: themeName === 'dark' }}>
      <div style={{ 
        background: theme.colors.background, 
        color: theme.colors.textPrimary,
        minHeight: '100vh',
        transition: mounted ? 'background 0.3s, color 0.3s' : 'none'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default dark theme if context not ready
    return {
      theme: darkTheme,
      themeName: 'dark' as ThemeName,
      toggleTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
