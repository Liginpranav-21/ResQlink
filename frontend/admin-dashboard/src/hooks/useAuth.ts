import { useEffect, useRef } from 'react';
import { authService, sessionService, isStaffRole, db } from '@resqlink/shared';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

/**
 * useAuth — subscribes to Firebase auth state and syncs it into Zustand.
 *
 * Also owns session lifecycle (see @resqlink/shared's sessionService):
 * starts a session record + login-history entry once per login, and
 * subscribes to that session's `revoked` flag so this device signs itself
 * out if another device (or an admin) revokes it.
 */
export function useAuth() {
  const { user, isLoading, setUser, setLoading, setError, setSessionId } = useAuthStore();
  // Tracks which uid we've already started a session for, so the profile
  // listener re-firing doesn't spawn a new session record every time.
  const sessionStartedForUid = useRef<string | null>(null);
  const revokedUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log('[useAuth] Subscribing to Firebase auth state…');
    let cancelled = false;

    const safetyTimer = window.setTimeout(() => {
      if (!cancelled) {
        console.warn('[useAuth] Firebase auth did not respond in time — forcing loading=false.');
        setLoading(false);
      }
    }, 6000);

    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (cancelled) return;
      console.log('[useAuth] Auth state changed:', firebaseUser ? `uid=${firebaseUser.uid}` : 'signed out');
      window.clearTimeout(safetyTimer);

      if (revokedUnsubscribeRef.current) {
        revokedUnsubscribeRef.current();
        revokedUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        try {
          const profile = await authService.getUserProfile(firebaseUser.uid);
          if (cancelled) return;

          // Widened from the old "role === 'admin'" check: any staff role
          // (dispatcher, hospital, police, fire_department, rescue_team,
          // drone_operator, admin, super_admin) may reach the dashboard.
          // 'user' (the mobile-app citizen role) is still rejected here.
          if (profile && isStaffRole(profile.role)) {
            console.log('[useAuth] Staff profile loaded:', profile.email, profile.role);
            setUser(profile);
            if (profile.theme) useThemeStore.getState().init(profile.theme);

            // Start a session (once per login, not per profile update).
            if (sessionStartedForUid.current !== firebaseUser.uid) {
              sessionStartedForUid.current = firebaseUser.uid;
              try {
                const sessionId = await sessionService.startSession(db, firebaseUser.uid);
                if (cancelled) return;
                setSessionId(sessionId);
                revokedUnsubscribeRef.current = sessionService.subscribeRevoked(db, firebaseUser.uid, sessionId, () => {
                  console.warn('[useAuth] This session was revoked (e.g. from another device) — signing out.');
                  authService.logout().catch(() => {});
                });
              } catch (err) {
                // Session tracking is a nice-to-have, not a login blocker.
                console.error('[useAuth] Failed to start session record:', err);
              }
            }
          } else {
            console.warn('[useAuth] User has no dashboard access — signing out. Role:', profile?.role);
            setError(profile ? 'This account does not have dashboard access.' : 'Your account profile was disabled or deleted.');
            sessionStartedForUid.current = null;
            await authService.logout();
            if (cancelled) return;
            setUser(null);
          }
        } catch (err) {
          console.error('[useAuth] Failed to load user profile:', err);
          if (cancelled) return;
          setError('Failed to load user profile. Please try logging in again.');
          setUser(null);
        }
      } else {
        console.log('[useAuth] No authenticated user.');
        sessionStartedForUid.current = null;
        setSessionId(null);
        setUser(null);
      }

      if (!cancelled) setLoading(false);
    });

    return () => {
      console.log('[useAuth] Unsubscribing from Firebase auth state.');
      cancelled = true;
      window.clearTimeout(safetyTimer);
      unsubscribe();
      if (revokedUnsubscribeRef.current) revokedUnsubscribeRef.current();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — intentionally run once. setUser/setLoading are stable Zustand actions.

  return { user, isLoading };
}
