import { create } from 'zustand';
export interface AuthUser { uid: string; email: string; displayName: string; role: 'user' | 'rescue_team' | 'admin'; phone?: string; }
interface AuthState {
  user: AuthUser | null; isLoading: boolean; error: string | null;
  // Per-install session id, set on successful login (see services/sessionService.ts).
  // Used for the "active sessions" list on the Profile screen and for
  // "log out this device" (soft revocation — see that file's header note).
  sessionId: string | null;
  setUser: (u: AuthUser | null) => void; setLoading: (v: boolean) => void;
  setError: (e: string | null) => void; setSessionId: (id: string | null) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null, isLoading: false, error: null, sessionId: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSessionId: (sessionId) => set({ sessionId }),
  logout: () => set({ user: null, sessionId: null }),
}));
