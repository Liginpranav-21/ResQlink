// Theme context for ResQLink. Preference (system/light/dark) is persisted via
// AsyncStorage; resolved tokens are exposed through useTheme().
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_TOKENS, type ThemeTokens } from '../utils/theme';

type Pref = 'system' | 'light' | 'dark';
type Resolved = 'light' | 'dark';

interface ThemeContextValue {
  pref: Pref;
  resolved: Resolved;
  t: ThemeTokens;
  setPref: (p: Pref) => void;
}

const resolveTheme = (pref: Pref): Resolved => {
  if (pref === 'light' || pref === 'dark') return pref;
  return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
};

const ThemeContext = createContext<ThemeContextValue>({
  pref: 'system',
  resolved: 'dark',
  t: THEME_TOKENS.dark,
  setPref: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'resqlink-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<Pref>('dark');
  const [resolved, setResolved] = useState<Resolved>('dark');

  // Load saved preference once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') {
          setPrefState(v);
          setResolved(resolveTheme(v));
        }
      })
      .catch(() => {});
  }, []);

  // Persist + resolve on change.
  useEffect(() => {
    setResolved(resolveTheme(pref));
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, [pref]);

  // Follow OS changes when on "system".
  useEffect(() => {
    if (pref !== 'system') return;
    const sub = Appearance.addChangeListener(() => setResolved(resolveTheme('system')));
    return () => sub.remove();
  }, [pref]);

  const setPref = useCallback((p: Pref) => setPrefState(p), []);
  const t = THEME_TOKENS[resolved as 'dark' | 'light'] || THEME_TOKENS.dark;

  return (
    <ThemeContext.Provider value={{ pref, resolved, t, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}
