import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { auth, signOut } from '../firebase/config';

/**
 * Signs the user out if the app has been backgrounded for longer than
 * `timeoutMinutes`. This is the mobile equivalent of the admin dashboard's
 * mouse/keyboard idle timeout — there's no notion of "no mouse movement" on
 * a phone, but "left the app in the background for a long time" is the
 * analogous signal for a shared/lost/found device.
 *
 * Deliberately generous by default (mobile users expect to stay signed in
 * far longer than a desktop dispatch console) — this is a background-safety
 * net, not a short active-use timeout.
 */
export function useBackgroundTimeout(enabled: boolean, timeoutMinutes: number = 60) {
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleChange = (state: AppStateStatus) => {
      if (state === 'background') {
        backgroundedAtRef.current = Date.now();
      } else if (state === 'active') {
        const backgroundedAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (backgroundedAt && Date.now() - backgroundedAt > timeoutMinutes * 60 * 1000) {
          console.log(`[useBackgroundTimeout] App was backgrounded for over ${timeoutMinutes}m — signing out.`);
          signOut(auth).catch(() => {});
        }
      }
    };

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [enabled, timeoutMinutes]);
}
