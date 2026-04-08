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

  if (!mounted) {
    return <div style={{ background: darkTheme.colors.background, minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, isDark: themeName === 'dark' }}>
      <div style={{ 
        background: theme.colors.background, 
        color: theme.colors.textPrimary,
        minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
