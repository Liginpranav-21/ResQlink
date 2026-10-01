import { create } from 'zustand';
import { ref, update } from 'firebase/database';
import { db, auth } from '@resqlink/shared';

export type ThemePref = 'light' | 'dark' | 'system';

interface ThemeState {
  pref: ThemePref;
  resolved: 'light' | 'dark';
  setPref: (p: ThemePref) => void;
  init: (p?: ThemePref) => void;
}

function resolve(pref: ThemePref): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

function apply(pref: ThemePref): 'light' | 'dark' {
  const r = resolve(pref);
  document.documentElement.setAttribute('data-theme', r);
  return r;
}

const stored = (() => {
  try {
    return (localStorage.getItem('resqlink-admin-theme') as ThemePref) || 'dark';
  } catch {
    return 'dark';
  }
})();

export const useThemeStore = create<ThemeState>((set) => ({
  pref: stored,
  resolved: apply(stored),
  setPref: (pref) => {
    const resolved = apply(pref);
    try {
      localStorage.setItem('resqlink-admin-theme', pref);
    } catch {
      /* ignore */
    }
    // Persist to RTDB so the preference follows the admin across sessions/devices.
    const uid = auth.currentUser?.uid;
    if (uid) update(ref(db, `users/${uid}`), { theme: pref }).catch(() => {});
    set({ pref, resolved });
  },
  init: (p) => {
    const pref = p || stored;
    const resolved = apply(pref);
    try {
      localStorage.setItem('resqlink-admin-theme', pref);
    } catch {
      /* ignore */
    }
    set({ pref, resolved });
  },
}));

// React to OS theme changes when in "system" mode.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => {
    const { pref, setPref } = useThemeStore.getState();
    if (pref === 'system') setPref('system');
  });
}
