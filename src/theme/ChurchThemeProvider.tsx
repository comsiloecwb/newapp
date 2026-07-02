import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export interface ChurchTheme {
  primary: string;
  secondary: string;
  accent: string;
  cream: string;
  background: string;
  surface: string;
  elevated: string;
  text: string;
  textMuted: string;
  goldText: string;
}

const DEFAULT_THEME: ChurchTheme = {
  primary: '#1A2744',
  secondary: '#3B6CB7',
  accent: '#C9954A',
  cream: '#D4AF7A',
  background: '#FDFCF8',
  surface: '#F5F0E8',
  elevated: '#EDE8DF',
  text: '#1C1917',
  textMuted: '#6E5E50',
  goldText: '#7D6300',
};

const ChurchThemeContext = createContext<ChurchTheme>(DEFAULT_THEME);

export function ChurchThemeProvider({ children }: { children: ReactNode }) {
  const church = useAuthStore((s) => s.church);

  const theme = useMemo<ChurchTheme>(() => ({
    primary: church?.primary_color ?? DEFAULT_THEME.primary,
    secondary: church?.secondary_color ?? DEFAULT_THEME.secondary,
    accent: '#C9954A',
    cream: '#D4AF7A',
    background: '#FDFCF8',
    surface: '#F5F0E8',
    elevated: '#EDE8DF',
    text: '#1C1917',
    textMuted: '#6E5E50',
    goldText: '#7D6300',
  }), [church]);

  return (
    <ChurchThemeContext.Provider value={theme}>{children}</ChurchThemeContext.Provider>
  );
}

export function useChurchTheme() {
  return useContext(ChurchThemeContext);
}
