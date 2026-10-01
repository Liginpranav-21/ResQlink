// useAuthListener — restores the signed-in session on app launch.
// Firebase persists the auth token (via AsyncStorage); this listens for that
// token, loads the user's profile from RTDB, and populates the auth store.
// Returns `initializing` so the UI can show a splash until the check resolves.
//
// Also owns session lifecycle (see services/sessionService.ts): starts a
// session record + login-history entry once per sign-in, and subscribes to
// that session's `revoked` flag so this device signs itself out if another
// device (or an admin) revokes it.
import { useEffect, useRef, useState } from 'react';
import { ref, get } from 'firebase/database';
import { onAuthStateChanged, auth, db, signOut } from '../firebase/config';
import { useAuthStore, type AuthUser } from '../store/authStore';
import { sessionService } from '../services/sessionService';
import { withTimeout } from '../utils/helpers';

export function useAuthListener(): { initializing: boolean } {
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionId = useAuthStore((s) => s.setSessionId);
  const [initializing, setInitializing] = useState(true);
  // Tracks which uid we've already started a session for this app launch,
  // so a re-render/re-auth-check doesn't spawn duplicate session records.
  const sessionStartedForUid = useRef<string | null>(null);
  const revokedUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (revokedUnsubscribeRef.current) {
        revokedUnsubscribeRef.current();
        revokedUnsubscribeRef.current = null;
      }

      if (fbUser) {
        let profile: Partial<AuthUser> = {};
        try {
          const snap = await withTimeout(get(ref(db, 'users/' + fbUser.uid)), 8000, 'Profile load timed out');
          if (snap.exists()) profile = snap.val();
        } catch (e) {
          console.error('[useAuthListener] profile load failed', e);
        }
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || profile.email || '',
          displayName: profile.displayName || (fbUser.email || '').split('@')[0] || 'User',
          role: profile.role || 'user',
          phone: profile.phone || '',
        });

        // Leave the splash now — session bookkeeping runs in the background
        // so a slow network never blocks access to SOS.
        setInitializing(false);

        if (sessionStartedForUid.current !== fbUser.uid) {
          sessionStartedForUid.current = fbUser.uid;
          try {
            const sessionId = await withTimeout(sessionService.startSession(fbUser.uid), 15000, 'Session start timed out');
            setSessionId(sessionId);
            revokedUnsubscribeRef.current = sessionService.subscribeRevoked(fbUser.uid, sessionId, () => {
              console.warn('[useAuthListener] This session was revoked (e.g. from another device) — signing out.');
              signOut(auth).catch(() => {});
            });
          } catch (err) {
            // Session tracking is a nice-to-have, not a login blocker.
            console.error('[useAuthListener] Failed to start session record:', err);
          }
        }
      } else {
        sessionStartedForUid.current = null;
        setSessionId(null);
        setUser(null);
      }
      setInitializing(false);
    });
    return () => {
      unsub();
      if (revokedUnsubscribeRef.current) revokedUnsubscribeRef.current();
    };
  }, [setUser, setSessionId]);

  return { initializing };
}
