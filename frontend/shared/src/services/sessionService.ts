import { ref, push, set, onValue, update, serverTimestamp, off, type Database, type DataSnapshot } from 'firebase/database';

export interface SessionRecord {
  id: string;
  device: string; // e.g. "Desktop", "Mobile", "iPhone 14" — best-effort, not a hardware ID
  browser: string; // e.g. "Chrome", "iOS App", "Android App"
  loginAt: number;
  lastSeenAt: number;
  revoked: boolean;
  current?: boolean; // set client-side, not stored — true for the session reading this record
}

export interface DeviceInfo {
  device: string;
  browser: string;
}

/** Best-effort device/browser parse for web (React Native passes its own via Platform). */
export function parseUserAgent(ua: string): DeviceInfo {
  const device = /Mobi|Android/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop';
  let browser = 'Unknown browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/')) browser = 'Safari';
  return { device, browser };
}

function detectDeviceInfo(): DeviceInfo {
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return parseUserAgent(navigator.userAgent);
  }
  return { device: 'Unknown device', browser: 'Unknown' };
}

/**
 * sessionService — per-device session records at `sessions/{uid}/{sessionId}`
 * plus an append-only `login_history/{uid}` log.
 *
 * Deliberately takes a `db: Database` instance as its first argument rather
 * than importing one internally: the admin dashboard / product-website
 * (web, Vite) and the mobile app (React Native, Metro/Expo) each initialize
 * their OWN separate Firebase app instance (different bundlers, different
 * persistence setup — RN needs `getReactNativePersistence`, web doesn't).
 * A version of this file that imported shared/src/firebase/config.ts
 * directly would drag in `import.meta.env` (Vite-only syntax) into the
 * mobile bundle, which Metro cannot parse. Dependency-injecting `db` keeps
 * this one implementation usable from both.
 *
 * IMPORTANT (see ARCHITECTURE.md): revoking a session sets a `revoked` flag
 * that the target device's own client checks and acts on. It is NOT a
 * server-side token revocation — there's no backend in this repo to call
 * Firebase Admin's `revokeRefreshTokens`. Treat this as "ask that device to
 * log itself out," which in practice is fast (the app holds a live listener)
 * but is not a cryptographic guarantee against a compromised/offline device.
 */
export const sessionService = {
  /**
   * Call once per successful login. Pass `deviceInfo` explicitly on
   * platforms where `navigator.userAgent` isn't meaningful (React Native);
   * omitted, it's detected from the browser's user agent.
   */
  async startSession(db: Database, uid: string, deviceInfo?: DeviceInfo): Promise<string> {
    const { device, browser } = deviceInfo ?? detectDeviceInfo();
    const sessionRef = push(ref(db, `sessions/${uid}`));
    const sessionId = sessionRef.key as string;

    await set(sessionRef, {
      device,
      browser,
      loginAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      revoked: false,
    });

    // Append-only login history entry, independent of the live session
    // record above (kept even after the session ends or is revoked).
    await push(ref(db, `login_history/${uid}`), {
      device,
      browser,
      loginAt: serverTimestamp(),
    });

    return sessionId;
  },

  /** Heartbeat — call periodically (e.g. every few minutes) while active. */
  async touchSession(db: Database, uid: string, sessionId: string): Promise<void> {
    await update(ref(db, `sessions/${uid}/${sessionId}`), { lastSeenAt: serverTimestamp() });
  },

  /** Live list of this user's sessions (for the "active sessions" panel/screen). */
  subscribeSessions(db: Database, uid: string, callback: (sessions: SessionRecord[]) => void) {
    const sessionsRef = ref(db, `sessions/${uid}`);
    onValue(sessionsRef, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: SessionRecord[] = Object.entries(val).map(([id, v]) => ({
        id,
        ...(v as Omit<SessionRecord, 'id'>),
      }));
      callback(list.sort((a, b) => b.loginAt - a.loginAt));
    });
    return () => off(sessionsRef);
  },

  /** Mark a session revoked — see the "soft revocation" caveat above. */
  async revokeSession(db: Database, uid: string, sessionId: string): Promise<void> {
    await update(ref(db, `sessions/${uid}/${sessionId}`), { revoked: true });
  },

  /** Revoke every session except the current one ("log out other devices"). */
  async revokeAllOtherSessions(db: Database, uid: string, currentSessionId: string, sessions: SessionRecord[]): Promise<void> {
    await Promise.all(
      sessions
        .filter((s) => s.id !== currentSessionId && !s.revoked)
        .map((s) => sessionService.revokeSession(db, uid, s.id))
    );
  },

  /**
   * Subscribe to whether THIS device's own session has been revoked (by
   * another device, or an admin). Call the callback to sign the user out
   * locally when it fires true.
   */
  subscribeRevoked(db: Database, uid: string, sessionId: string, onRevoked: () => void) {
    const revokedRef = ref(db, `sessions/${uid}/${sessionId}/revoked`);
    onValue(revokedRef, (snap: DataSnapshot) => {
      if (snap.val() === true) onRevoked();
    });
    return () => off(revokedRef);
  },
};
