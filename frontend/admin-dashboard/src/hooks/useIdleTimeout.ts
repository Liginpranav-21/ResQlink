import { useEffect, useRef } from 'react';
import { authService } from '@resqlink/shared';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Signs the user out after `timeoutMinutes` of no mouse/keyboard/touch
 * activity. Only active while `enabled` is true (i.e. while a user is
 * actually logged in — no point running this on the login page).
 */
export function useIdleTimeout(enabled: boolean, timeoutMinutes: number = 15) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        console.log(`[useIdleTimeout] No activity for ${timeoutMinutes}m — signing out.`);
        authService.logout().catch(() => {});
      }, timeoutMinutes * 60 * 1000);
    };

    reset();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, reset, { passive: true }));

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [enabled, timeoutMinutes]);
}
