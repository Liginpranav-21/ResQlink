// Small helpers ported from the HTML prototype.
import { Linking, Platform } from 'react-native';
import type { GPSCoordinates } from '../types';

export const timeAgo = (ts: number): string => {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const genId = (): string =>
  Math.random().toString(36).slice(2, 11).toUpperCase();

export const mapsLink = (lat: number, lng: number): string =>
  `https://www.google.com/maps?q=${lat},${lng}`;

export const navLink = (lat: number, lng: number): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

// Open a GPS point in Google Maps. Tries the native geo: / maps: scheme first
// (so it opens the Google Maps app when installed) and falls back to the
// https://www.google.com/maps web link, which works everywhere — including
// when no maps app is installed (opens in browser).
export const openInGoogleMaps = async (lat: number, lng: number, label?: string): Promise<void> => {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  const nativeUrl =
    Platform.OS === 'ios'
      ? `maps:0,0?q=${query}@${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}(${query})`;
  const webUrl = mapsLink(lat, lng);
  // Browsers report canOpenURL=true for anything, then fail on geo:/maps:.
  if (Platform.OS === 'web') {
    await Linking.openURL(webUrl).catch(() => {});
    return;
  }
  try {
    const canOpenNative = await Linking.canOpenURL(nativeUrl);
    await Linking.openURL(canOpenNative ? nativeUrl : webUrl);
  } catch (err) {
    console.error('[openInGoogleMaps]', err);
    await Linking.openURL(webUrl).catch(() => {});
  }
};

// Haversine distance in km between two GPS points.
export const haversineKm = (
  a: GPSCoordinates | null,
  b: GPSCoordinates | null
): number | null => {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

export const fmtDistance = (km: number | null): string =>
  km == null ? '—' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

// Rough ETA assuming 30 km/h average emergency response speed.
export const etaMinutes = (km: number | null): number | null =>
  km == null ? null : Math.max(1, Math.round((km / 30) * 60));

export const fmtEta = (km: number | null): string => {
  const m = etaMinutes(km);
  return m == null ? '—' : m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

// Race a promise against a timeout so the UI always recovers from a hung network call.
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 15000,
  message = 'Request timed out. Check your internet connection and try again.'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Retry a failing async op with linear backoff.
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, delay = 800, label = 'operation' }: { retries?: number; delay?: number; label?: string } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(`[withRetry] ${label} attempt ${i + 1} failed:`, err);
      if (i < retries) await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastErr;
}
