import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useAuthStore } from '@/stores/auth-store';

export interface ChurchTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

const DEFAULT_THEME: ChurchTheme = {
  primary: '#1E3A5F',
  secondary: '#4A90D9',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B7280',
};

const ChurchThemeContext = createContext<ChurchTheme>(DEFAULT_THEME);

export function ChurchThemeProvider({ children }: { children: ReactNode }) {
  const church = useAuthStore((s) => s.church);
  const scheme = useColorScheme();

  const theme = useMemo<ChurchTheme>(() => {
    const isDark = scheme === 'dark';
    return {
      primary: church?.primary_color ?? DEFAULT_THEME.primary,
      secondary: church?.secondary_color ?? DEFAULT_THEME.secondary,
      background: isDark ? '#0F1419' : '#F5F7FA',
      surface: isDark ? '#1A2332' : '#FFFFFF',
      text: isDark ? '#F9FAFB' : '#1A1A2E',
      textMuted: isDark ? '#9CA3AF' : '#6B7280',
    };
  }, [church, scheme]);

  return (
    <ChurchThemeContext.Provider value={theme}>{children}</ChurchThemeContext.Provider>
  );
}

export function useChurchTheme() {
  return useContext(ChurchThemeContext);
}
