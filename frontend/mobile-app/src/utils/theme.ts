// Theme tokens ported from the ResQLink HTML prototype, adapted for React Native.
// Colors are plain strings (no CSS vars) so they can feed StyleSheet / inline styles.
//
// Same brand system as the portfolio (frontend/product-website): deep navy
// background, glass-panel surfaces, brand red as the primary identity
// colour (logo, primary actions, SOS) and blue as the secondary/live accent.
// React Native can't do real backdrop-blur without a native module
// (expo-blur isn't installed) — "glass" is approximated with layered
// translucency + soft shadow, which reads the same as blur when there's no
// fine detail behind the panel to blur out in the first place.

export interface ThemeTokens {
  bg: string;
  gradA: string;
  gradB: string;
  surface: string;
  surface2: string;
  /** Translucent glass-panel fill — layer this OVER `surface`, not instead of it. */
  glass: string;
  glassRaised: string;
  glassHighlight: string;
  border: string;
  border2: string;
  text: string;
  muted: string;
  dim: string;
  soft: string;
  inputBg: string;
}

export const THEME_TOKENS: Record<'dark' | 'light', ThemeTokens> = {
  dark: {
    bg: '#0B1220', gradA: '#111827', gradB: '#0B1220', surface: '#111827', surface2: '#1F2937',
    glass: 'rgba(31,41,55,0.6)', glassRaised: 'rgba(31,41,55,0.75)', glassHighlight: 'rgba(255,255,255,0.10)',
    border: 'rgba(51,65,85,0.3)', border2: 'rgba(51,65,85,0.5)', text: '#F8FAFC', muted: '#94A3B8', dim: '#64748B',
    soft: '#CBD5E1', inputBg: 'rgba(255,255,255,0.05)',
  },
  light: {
    bg: '#F8FAFC', gradA: '#FFFFFF', gradB: '#EEF2F6', surface: '#FFFFFF', surface2: '#F1F5F9',
    glass: 'rgba(255,255,255,0.6)', glassRaised: 'rgba(255,255,255,0.8)', glassHighlight: 'rgba(255,255,255,0.9)',
    border: 'rgba(15,23,42,0.08)', border2: 'rgba(15,23,42,0.14)', text: '#0F172A', muted: '#64748B', dim: '#94A3B8',
    soft: '#334155', inputBg: 'rgba(15,23,42,0.04)',
  },
};

// Brand red — primary identity colour, same as the portfolio's logo/CTA red.
// Used for SOS/emergency AND everyday brand moments (nav, primary buttons),
// matching the portfolio, which doesn't hold red back for alerts only.
export const ACCENT = '#FF3B30';
export const ACCENT_DARK = '#D32F2F';
// Kept as a separate export for call sites that use SIGNAL as "the everyday
// interactive accent" — now also red, so the whole app reads as one
// consistent brand rather than two competing accent colours.
export const SIGNAL = '#FF3B30';
export const SECONDARY = '#2563EB';
export const SUCCESS = '#10B981';
export const WARNING = '#F59E0B';
