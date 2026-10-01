import type { GPSCoordinates, Hospital } from '../types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export function hasCoords(loc?: Partial<LatLng> | null): loc is LatLng {
  return (
    !!loc &&
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number' &&
    !Number.isNaN(loc.latitude) &&
    !Number.isNaN(loc.longitude)
  );
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius, km
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function estimateEtaMinutes(km: number, avgKmh = 40): number {
  return Math.max(1, Math.round((km / avgKmh) * 60));
}

export function nearbyHospitals(
  origin: LatLng | undefined | null,
  hospitals: Hospital[],
  limit?: number
): (Hospital & { distance: number })[] {
  if (!hasCoords(origin)) {
    const passthrough = hospitals.map((h) => ({ ...h, distance: 0 }));
    return limit ? passthrough.slice(0, limit) : passthrough;
  }
  const ranked = hospitals
    .filter((h) => hasCoords(h.location))
    .map((h) => ({
      ...h,
      distance: haversineKm(origin, h.location as GPSCoordinates),
    }))
    .sort((a, b) => a.distance - b.distance);

  return limit ? ranked.slice(0, limit) : ranked;
}

export function googleMapsDirectionsUrl(
  destination: LatLng,
  origin?: LatLng | null
): string {
  const dest = `${destination.latitude},${destination.longitude}`;
  const base = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
  if (hasCoords(origin)) {
    return `${base}&origin=${origin.latitude},${origin.longitude}`;
  }
  return base;
}

export function googleMapsPlaceUrl(point: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}
