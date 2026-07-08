import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Theme } from '@radix-ui/themes';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'sensory-profile-theme';

const LIGHT_THEME_COLOR = '#FFFEF5';
const DARK_THEME_COLOR = '#121218';

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

export function readStoredThemePreference(storage: Pick<Storage, 'getItem'> = localStorage): ThemePreference {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

interface ThemeApi {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeApi | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeApi {
  const api = useContext(ThemeContext);
  if (!api) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return api;
}

/**
 * Fonte única de verdade para claro/escuro/sistema: grava data-theme no
 * <html> (consumido pelos tokens em src/index.css) e sincroniza o
 * appearance do Radix Theme, para que componentes Gumroad e Radix nunca
 * fiquem em temas diferentes.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStoredThemePreference());
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const api = useMemo<ThemeApi>(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={api}>
      <Theme accentColor="teal" grayColor="sand" radius="large" scaling="100%" appearance={resolvedTheme}>
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
};
