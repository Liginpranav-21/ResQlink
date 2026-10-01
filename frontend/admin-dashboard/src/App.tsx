import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireSection } from './components/RequireSection';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveEmergencies from './pages/LiveEmergencies';
import SOSNavigator from './pages/SOSNavigator';
import RescueTeams from './pages/RescueTeams';
import DroneControl from './pages/DroneControl';
import VictimMonitoring from './pages/VictimMonitoring';
import Hospitals from './pages/Hospitals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

/**
 * ProtectedRoute — blocks unauthenticated access.
 * Only renders children once loading is complete AND the user is set.
 * While loading, renders nothing (the AppRoutes loading spinner handles it).
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  // Relative (no leading slash): resolves to "/login" standalone or
  // "/admin/login" when nested under the product-website shell.
  if (!user) return <Navigate to="login" replace />;
  return <>{children}</>;
}

/**
 * AuthRoute — blocks authenticated users from seeing the login page.
 *
 * CRITICAL FIX: The original code redirected immediately if `user` was set,
 * even before the first onAuthStateChanged callback had fired. Because
 * Zustand's persist middleware can restore a stale `user` from localStorage,
 * this caused a flash-redirect loop where a user who had just registered was
 * immediately bounced away from the Login page before the new session was
 * confirmed by Firebase.
 *
 * Fix: wait for isLoading=false before deciding to redirect. During loading,
 * show the loading spinner. Only after Firebase confirms the session do we
 * redirect authenticated users to the dashboard.
 */
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">R</div>
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Initializing ResQLink…</p>
        </div>
      </div>
    );
  }

  // Relative ".." from "login" resolves back to this app's own root —
  // "/" standalone, "/admin" when nested.
  if (user) return <Navigate to=".." replace />;
  return <>{children}</>;
}

/**
 * AdminApp — the admin dashboard's route tree, WITHOUT its own <BrowserRouter>.
 *
 * This is intentional: to give users a seamless, single-page-app experience
 * across the marketing site and the dashboard (no full page reload, no
 * separate tab, shared login session), the product-website hosts ONE
 * top-level <BrowserRouter> and mounts this component at "/admin/*".
 *
 * All paths inside are relative (no leading "/") so this exact same route
 * tree also works correctly if AdminApp is rendered standalone at the root
 * (this package's own `npm run dev`, via the default export below).
 */
export function AdminApp() {
  const { isLoading } = useAuth();
  const { user } = useAuthStore();
  // 15 minutes of inactivity signs the user out. Only runs once actually
  // logged in — no point idling-out the login page.
  useIdleTimeout(!!user, 15);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">R</div>
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Initializing ResQLink…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', fontSize: 13 },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
      <Routes>
        <Route path="login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="emergencies" element={<LiveEmergencies />} />
          <Route path="sos-navigator" element={<RequireSection section="sos-navigator"><SOSNavigator /></RequireSection>} />
          <Route path="rescue-teams" element={<RequireSection section="rescue-teams"><RescueTeams /></RequireSection>} />
          <Route path="drone-control" element={<RequireSection section="drone-control"><DroneControl /></RequireSection>} />
          <Route path="victims" element={<RequireSection section="victims"><VictimMonitoring /></RequireSection>} />
          <Route path="hospitals" element={<RequireSection section="hospitals"><Hospitals /></RequireSection>} />
          <Route path="analytics" element={<RequireSection section="analytics"><Analytics /></RequireSection>} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </>
  );
}

/**
 * Standalone entry point — used only when running this package on its own
 * (`npm run dev` inside frontend/admin-dashboard). The production build
 * mounts <AdminApp /> directly from the product-website shell instead.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AdminApp />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
