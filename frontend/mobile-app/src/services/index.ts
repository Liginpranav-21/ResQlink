// Service layer for ResQLink mobile — talks directly to Firebase (Auth + RTDB).
// No demo/offline fallbacks: every call hits the live backend.

import {
  ref,
  set,
  update,
  get,
  serverTimestamp,
} from 'firebase/database';
import {
  db,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from '../firebase/config';
import { withTimeout, withRetry, genId, mapsLink } from '../utils/helpers';
import type { AuthUser } from '../store/authStore';
import type { Emergency, EmergencyContact } from '../types';

// Firebase errors look like "Firebase: Error (auth/xyz)." — the code in
// brackets is the only useful part, so map it to a clear message.
const AUTH_MESSAGES: Record<string, string> = {
  'auth/operation-not-allowed':
    'Email/password sign-in is not enabled for this app. In Firebase console → Authentication → Sign-in method, enable Email/Password.',
  'auth/configuration-not-found':
    'Firebase Authentication is not set up for this project. In Firebase console → Authentication, click "Get started" and enable Email/Password.',
  'auth/email-already-in-use': 'An account with this email already exists. Go back and sign in instead.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/weak-password': 'Password is too weak — use at least 6 characters.',
  'auth/missing-password': 'Please enter a password.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'No account found with this email. Create one first.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error — could not reach Firebase. Check your internet connection.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'The Firebase API key is invalid. Check the key in src/firebase/config.ts.',
  'auth/requests-from-referer-are-blocked.':
    'This website address is not allowed to use the Firebase API key. Add it under the key\'s HTTP referrers in Google Cloud Console.',
  'auth/unauthorized-domain':
    'This domain is not authorised. Add it in Firebase console → Authentication → Settings → Authorized domains.',
  'auth/internal-error': 'Firebase returned an internal error. Try again in a moment.',
  'PERMISSION_DENIED': 'Permission denied by the database rules. Deploy database.rules.json to Firebase.',
};

const cleanError = (err: unknown): string => {
  const anyErr = err as { code?: string; message?: string } | undefined;
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const code =
    (anyErr && typeof anyErr.code === 'string' && anyErr.code) ||
    (msg.match(/\((auth\/[^)]+)\)/)?.[1] ?? '') ||
    (/permission[_ ]denied/i.test(msg) ? 'PERMISSION_DENIED' : '');
  if (code) {
    const key = Object.keys(AUTH_MESSAGES).find((k) => code.toLowerCase().startsWith(k.toLowerCase()));
    if (key) return AUTH_MESSAGES[key];
  }
  const text = msg
    .replace(/^Firebase:\s*/, '')
    .replace(/\s*\(auth\/[^)]+\)\.?/, '')
    .replace(/^Error\s*\.?$/, '')
    .trim();
  if (text) return text;
  return code ? `Sign-in failed (${code}).` : 'Something went wrong. Please try again.';
};

// ─── Auth ────────────────────────────────────────────────────────────────
export const AuthService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const c = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      15000,
      'Sign-in timed out. Check your connection (or any VPN/security app blocking Google services) and try again.'
    );
    // Signed in. A slow/blocked database must not lock the user out of an
    // emergency app — fall back to defaults and let the profile load later.
    let d: Partial<AuthUser> = {};
    try {
      const snap = await withTimeout(get(ref(db, 'users/' + c.user.uid)), 8000, 'Profile load timed out');
      if (snap.exists()) d = snap.val() as Partial<AuthUser>;
    } catch (e) {
      console.warn('[AuthService.login] profile load failed, continuing with defaults', e);
    }
    return {
      uid: c.user.uid,
      email: c.user.email || email,
      displayName: d.displayName || (c.user.email || email).split('@')[0] || 'User',
      role: d.role || 'user',
      phone: d.phone || '',
    };
  },

  async register(email: string, password: string, name: string, phone: string): Promise<AuthUser> {
    const c = await withTimeout(
      createUserWithEmailAndPassword(auth, email, password),
      15000,
      'Sign-up timed out. Check your connection and try again.'
    );
    const userData = {
      uid: c.user.uid, email, displayName: name, role: 'user', phone,
      bloodGroup: 'O+', medicalInfo: '', emergencyContacts: [], createdAt: serverTimestamp(),
    };
    await withTimeout(
      set(ref(db, 'users/' + c.user.uid), userData),
      10000,
      'Account created, but saving your profile timed out. Please try signing in.'
    );
    return { uid: c.user.uid, email, displayName: name, role: 'user', phone };
  },

  async resetPassword(email: string): Promise<void> {
    await withTimeout(sendPasswordResetEmail(auth, email), 15000, 'Request timed out. Check your connection and try again.');
  },

  async logout(): Promise<void> {
    await signOut(auth).catch(() => {});
  },

  cleanError,
};

// ─── Profile ─────────────────────────────────────────────────────────────
export const ProfileService = {
  async fetchLatest(uid: string): Promise<Record<string, any> | null> {
    if (!uid) return null;
    const snap = await withTimeout(get(ref(db, 'users/' + uid)), 10000, 'Loading your profile timed out.');
    return snap.exists() ? snap.val() : null;
  },
  async update(uid: string, patch: Record<string, any>): Promise<void> {
    if (!uid) return;
    await withRetry(
      () => withTimeout(update(ref(db, 'users/' + uid), { ...patch, updatedAt: serverTimestamp() }), 10000, 'Saving your changes timed out.'),
      { label: 'profile update' }
    );
  },
};

// ─── Notifications + activity ──────────────────────────────────────────────
export const NotificationService = {
  async push(uid: string, notif: { type: string; title: string; body: string }): Promise<void> {
    if (!uid) return;
    const id = genId();
    await set(ref(db, `notifications/${uid}/${id}`), {
      id, read: false, createdAt: serverTimestamp(), ...notif,
    }).catch((e) => console.error('[NotificationService.push]', e));
  },
};

export const ActivityService = {
  async log(action: string, detail: string, meta: Record<string, any> = {}): Promise<void> {
    const id = genId();
    await set(ref(db, 'activity_logs/' + id), { id, action, detail, ...meta, createdAt: serverTimestamp() })
      .catch((e) => console.error('[ActivityService.log]', e));
  },
};

// ─── Alerts (notify emergency contacts) ─────────────────────────────────────
export const AlertService = {
  async notifyContacts(sos: Emergency, contacts: EmergencyContact[]): Promise<any[]> {
    const results: any[] = [];
    for (const c of contacts || []) {
      if (!c || !c.phone) continue;
      const alertId = genId();
      const link = sos.location ? mapsLink(sos.location.latitude, sos.location.longitude) : '';
      const record = {
        alertId, sosId: sos.id, contactName: c.name || 'Contact', contactPhone: c.phone,
        deliveryStatus: 'queued', channel: 'sms',
        message: `🆘 EMERGENCY: ${sos.userName} needs help (${(sos.type || '').replace(/_/g, ' ')}). Location: ${link} Time: ${new Date().toLocaleString()}`,
        sentAt: serverTimestamp(),
      };
      try {
        await set(ref(db, 'emergency_alerts/' + alertId), record);
        results.push({ ...record, deliveryStatus: 'queued' });
      } catch (err) {
        console.error('[AlertService.notifyContacts]', err);
        await set(ref(db, 'emergency_alerts/' + alertId), { ...record, deliveryStatus: 'failed' }).catch(() => {});
        results.push({ ...record, deliveryStatus: 'failed' });
      }
    }
    return results;
  },
  // Build an `sms:` deep-link the OS dialer/composer can open — the offline fallback.
  smsHref(phone: string, body: string): string {
    return `sms:${phone}?body=${encodeURIComponent(body)}`;
  },
};

// ─── Emergency dispatch ─────────────────────────────────────────────────────
export const EmergencyService = {
  async create(emergency: Emergency): Promise<void> {
    // Build a clean payload. RTDB strips keys whose value is `undefined` or an
    // empty object, and `serverTimestamp()` writes a sentinel object (not a
    // number) which breaks the dashboard's numeric sort + time-ago rendering.
    // So we keep the real numeric timestamps the caller already set, and we
    // only include `location` when it has valid coordinates — never `{}`.
    const hasCoords =
      !!emergency.location &&
      typeof emergency.location.latitude === 'number' &&
      typeof emergency.location.longitude === 'number' &&
      !Number.isNaN(emergency.location.latitude) &&
      !Number.isNaN(emergency.location.longitude);

    const now = Date.now();
    const payload: Record<string, any> = {
      id: emergency.id,
      userId: emergency.userId,
      userName: emergency.userName,
      userPhone: emergency.userPhone || '',
      type: emergency.type,
      level: emergency.level,
      status: emergency.status || 'active',
      bloodGroup: emergency.bloodGroup || '',
      createdAt: typeof emergency.createdAt === 'number' ? emergency.createdAt : now,
      updatedAt: now,
      // Mirror to a server-resolved field for audit, without clobbering the
      // numeric createdAt the dashboard relies on for sorting.
      serverReceivedAt: serverTimestamp(),
    };

    if (hasCoords) {
      payload.location = {
        latitude: emergency.location.latitude,
        longitude: emergency.location.longitude,
        ...(typeof emergency.location.altitude === 'number' ? { altitude: emergency.location.altitude } : {}),
        ...(typeof emergency.location.accuracy === 'number' ? { accuracy: emergency.location.accuracy } : {}),
        timestamp: typeof emergency.location.timestamp === 'number' ? emergency.location.timestamp : now,
      };
      payload.hasLocation = true;
    } else {
      // Explicit flag so the dashboard can show "location unavailable" instead
      // of silently dropping or crashing on a missing coordinate.
      payload.hasLocation = false;
    }

    await withRetry(
      () =>
        withTimeout(
          set(ref(db, 'emergencies/' + emergency.id), payload),
          12000,
          'Sending SOS timed out. Retrying…'
        ),
      { label: 'SOS create' }
    );
  },
  async cancel(id: string): Promise<void> {
    await update(ref(db, 'emergencies/' + id), { status: 'cancelled', updatedAt: serverTimestamp() }).catch((e) =>
      console.error('[EmergencyService.cancel]', e)
    );
  },
};
