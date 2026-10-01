import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@resqlink/shared';

// Re-exported so existing `import type { AuthUser } from '../store/authStore'`
// call sites elsewhere in this app keep working — the type itself now lives
// in @resqlink/shared (single source of truth for the role model instead of
// a second, driftable copy here).
export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  // Per-tab/device session id, set on successful login (see
  // hooks/useAuth.ts + @resqlink/shared sessionService). Used for the
  // "active sessions" list and for soft "log out this device".
  sessionId: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setSessionId: (id: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      // CRITICAL FIX: isLoading must NOT be persisted. If it were persisted as
      // `true` (e.g. from a previous session that was interrupted), the app
      // would show the loading spinner forever on the next load because
      // onAuthStateChanged might never set it to false again for a signed-out
      // user. We default to true at runtime (not from storage) so the spinner
      // always shows until the first Firebase auth callback fires.
      isLoading: true,
      error: null,
      sessionId: null,
      setUser: (user) => {
        console.log('[authStore] setUser:', user ? `${user.email} (${user.role})` : 'null');
        set({ user, error: null });
      },
      setLoading: (isLoading) => {
        console.log('[authStore] setLoading:', isLoading);
        set({ isLoading });
      },
      setError: (error) => {
        if (error) console.warn('[authStore] setError:', error);
        set({ error });
      },
      setSessionId: (sessionId) => set({ sessionId }),
      logout: () => {
        console.log('[authStore] logout');
        set({ user: null, error: null, sessionId: null });
      },
    }),
    {
      name: 'resqlink-auth-admin',
      // Only persist the user object, NOT isLoading/error/sessionId.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
