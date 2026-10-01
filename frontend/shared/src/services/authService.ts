import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../firebase/config';
import type { AuthUser } from '../types';

function mapFirebaseError(err: unknown): string {
  if (!(err instanceof Error)) return 'An unexpected error occurred.';
  const code = (err as { code?: string }).code ?? '';
  console.error('[authService] Firebase error code:', code, '| message:', err.message);

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No account found with these credentials. Check your email and password.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Please contact the administrator.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not set up. In Firebase console → Authentication, click "Get started" and enable Email/Password.';
    default: {
      // Never strip the code down to a bare "Error ." — show it if that's all there is.
      const text = err.message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[^)]+\)\.?/g, '').replace(/^Error\s*\.?$/, '').trim();
      const code = (err as { code?: string }).code;
      return text || (code ? `Sign-in failed (${code}).` : 'An unexpected error occurred. Please try again.');
    }
  }
}

export const authService = {
  /**
   * @param rememberMe - true (default): session survives closing the
   *   browser (`browserLocalPersistence`). false: session ends when the
   *   browser/tab closes (`browserSessionPersistence`). Must be set before
   *   signInWithEmailAndPassword — Firebase applies persistence to the
   *   next sign-in call, not retroactively.
   */
  async login(email: string, password: string, rememberMe: boolean = true): Promise<AuthUser> {
    console.log('[authService] login attempt for:', email, '| rememberMe:', rememberMe);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log('[authService] Firebase sign-in success, uid:', cred.user.uid);

      const userRef = ref(db, `users/${cred.user.uid}`);
      const userDoc = await get(userRef);
      console.log('[authService] DB user profile exists:', userDoc.exists());

      let data: AuthUser & { createdAt?: number; lastActive?: number };

      if (!userDoc.exists()) {
        data = {
          uid: cred.user.uid,
          email: cred.user.email!,
          displayName: cred.user.displayName || email.split('@')[0],
          role: 'admin',
          createdAt: Date.now(),
          lastActive: Date.now(),
        };
        await set(userRef, data);
        console.log('[authService] Auto-created missing DB profile for uid:', cred.user.uid);
      } else {
        data = userDoc.val();
        await set(userRef, { ...data, lastActive: Date.now() });
        console.log('[authService] Loaded existing profile, role:', data.role);
      }

      return {
        uid: cred.user.uid,
        email: cred.user.email!,
        displayName: data.displayName || cred.user.displayName || 'Admin',
        role: data.role ?? 'admin',
        phone: data.phone,
      };
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  },

  async register(email: string, password: string, displayName: string): Promise<AuthUser> {
    console.log('[authService] register attempt for:', email);
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[authService] Firebase user created, uid:', cred.user.uid);
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }

    const userData = {
      uid: cred.user.uid,
      email,
      displayName,
      role: 'admin' as const,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    try {
      await set(ref(db, `users/${cred.user.uid}`), userData);
      console.log('[authService] DB profile written for uid:', cred.user.uid);
    } catch (dbErr) {
      console.error('[authService] DB profile write FAILED — signing out new user:', dbErr);
      await signOut(auth).catch(() => {});
      throw new Error(
        'Account created in Auth but failed to save your profile. ' +
        'Please try again or contact support if the problem persists.'
      );
    }

    return { uid: cred.user.uid, email, displayName, role: 'admin' };
  },

  async logout(): Promise<void> {
    console.log('[authService] logout');
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    console.log('[authService] resetPassword for:', email);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  },

  async getUserProfile(uid: string): Promise<AuthUser | null> {
    console.log('[authService] getUserProfile for uid:', uid);
    try {
      const userRef = ref(db, `users/${uid}`);
      const snap = await get(userRef);

      if (!snap.exists()) {
        const email = auth.currentUser?.email || '';
        const data: AuthUser & { createdAt: number; lastActive: number } = {
          uid,
          email,
          displayName: auth.currentUser?.displayName || email.split('@')[0] || 'Admin',
          role: 'admin',
          createdAt: Date.now(),
          lastActive: Date.now(),
        };
        await set(userRef, data);
        console.log('[authService] Auto-created DB profile for uid:', uid);
        return { uid, email: data.email, displayName: data.displayName, role: data.role };
      }

      const d = snap.val();
      console.log('[authService] Profile loaded, role:', d.role, 'email:', d.email);
      return {
        uid,
        email: d.email,
        displayName: d.displayName,
        role: d.role,
        phone: d.phone,
        theme: d.theme,
      };
    } catch (error) {
      console.error('[authService] getUserProfile error:', error);
      return null;
    }
  },

  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
