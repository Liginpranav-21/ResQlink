// useLocation — requests permission and tracks the device GPS position.
// gpsStatus mirrors the prototype: 'loading' | 'granted' | 'denied'.
import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import type { GPSCoordinates } from '../types';

export type GpsStatus = 'loading' | 'granted' | 'denied';

export function useLocation() {
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('loading');

  const refresh = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('denied');
        return;
      }
      setGpsStatus('granted');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude ?? undefined,
        accuracy: pos.coords.accuracy ?? undefined,
        timestamp: pos.timestamp,
      });
    } catch (err) {
      console.error('[useLocation]', err);
      setGpsStatus('denied');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, gpsStatus, refresh };
}
