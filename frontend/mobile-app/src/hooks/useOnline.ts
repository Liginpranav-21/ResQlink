// useOnline — reports network connectivity.
// Web: uses navigator.onLine + online/offline events.
// Native: uses @react-native-community/netinfo when installed; otherwise
// assumes online (the Firebase calls will surface real errors).
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useOnline(): boolean {
  const [online, setOnline] = useState(
    Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.onLine !== false : true
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      const on = () => setOnline(true);
      const off = () => setOnline(false);
      window.addEventListener('online', on);
      window.addEventListener('offline', off);
      return () => {
        window.removeEventListener('online', on);
        window.removeEventListener('offline', off);
      };
    }

    let mounted = true;
    let unsub: (() => void) | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NetInfo = require('@react-native-community/netinfo').default;
      unsub = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
        if (mounted) setOnline(state.isConnected !== false);
      });
    } catch {
      // NetInfo not installed — leave optimistic default.
    }
    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  return online;
}
