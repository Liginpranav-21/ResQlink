import { useEffect, useRef, useState } from 'react';
import type { LatLng } from '@resqlink/shared';

interface GeoState {
  position: LatLng | null;
  error: string | null;
  loading: boolean;
}

/**
 * useCurrentLocation — watches the admin operator's own device location.
 * Used as the origin for "navigate to SOS" routing and to plot a "you are
 * here" marker on the command map. Falls back gracefully if the browser
 * blocks or lacks geolocation.
 */
export function useCurrentLocation(enabled = true): GeoState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      setLoading(false);
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled]);

  return { position, error, loading };
}
