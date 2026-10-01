// sessionService — per-device session records at `sessions/{uid}/{sessionId}`
// plus an append-only `login_history/{uid}` log, same RTDB shape the admin
// dashboard uses (frontend/shared/src/services/sessionService.ts).
//
// This is intentionally a SEPARATE, self-contained implementation rather
// than an import from @resqlink/shared: that package's barrel entry
// (src/index.ts) re-exports ./firebase/config, which reads
// `import.meta.env` — Vite-only syntax. Metro (Expo's bundler) can't parse
// that, so pulling in @resqlink/shared here would break the mobile build.
// Duplicating this ~60-line service is a smaller, safer cost than wiring up
// a cross-package Metro monorepo config I have no way to test end-to-end.
//
// See ARCHITECTURE.md for what "revoke" does and doesn't guarantee — same
// caveat applies here: it's a flag this device's own listener checks, not a
// server-side token kill (no backend in this repo to do that).

import { Platform } from 'react-native';
import { ref, push, set, onValue, update, serverTimestamp, off } from 'firebase/database';
import { db } from '../firebase/config';

export interface SessionRecord {
  id: string;
  device: string;
  browser: string;
  loginAt: number;
  lastSeenAt: number;
  revoked: boolean;
}

function currentDeviceInfo(): { device: string; browser: string } {
  const device = Platform.OS === 'ios' ? 'iPhone/iPad' : Platform.OS === 'android' ? 'Android device' : 'Device';
  const browser = `${Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS} app`;
  return { device, browser };
}

export const sessionService = {
  async startSession(uid: string): Promise<string> {
    const { device, browser } = currentDeviceInfo();
    const sessionRef = push(ref(db, `sessions/${uid}`));
    const sessionId = sessionRef.key as string;

    await set(sessionRef, {
      device,
      browser,
      loginAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      revoked: false,
    });

    await push(ref(db, `login_history/${uid}`), {
      device,
      browser,
      loginAt: serverTimestamp(),
    });

    return sessionId;
  },

  async touchSession(uid: string, sessionId: string): Promise<void> {
    await update(ref(db, `sessions/${uid}/${sessionId}`), { lastSeenAt: serverTimestamp() });
  },

  subscribeSessions(uid: string, callback: (sessions: SessionRecord[]) => void) {
    const sessionsRef = ref(db, `sessions/${uid}`);
    onValue(sessionsRef, (snap) => {
      const val = snap.val() || {};
      const list: SessionRecord[] = Object.entries(val).map(([id, v]) => ({
        id,
        ...(v as Omit<SessionRecord, 'id'>),
      }));
      callback(list.sort((a, b) => b.loginAt - a.loginAt));
    });
    return () => off(sessionsRef);
  },

  async revokeSession(uid: string, sessionId: string): Promise<void> {
    await update(ref(db, `sessions/${uid}/${sessionId}`), { revoked: true });
  },

  async revokeAllOtherSessions(uid: string, currentSessionId: string, sessions: SessionRecord[]): Promise<void> {
    await Promise.all(
      sessions
        .filter((s) => s.id !== currentSessionId && !s.revoked)
        .map((s) => sessionService.revokeSession(uid, s.id))
    );
  },

  subscribeRevoked(uid: string, sessionId: string, onRevoked: () => void) {
    const revokedRef = ref(db, `sessions/${uid}/${sessionId}/revoked`);
    onValue(revokedRef, (snap) => {
      if (snap.val() === true) onRevoked();
    });
    return () => off(revokedRef);
  },
};
