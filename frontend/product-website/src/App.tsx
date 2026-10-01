import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@resqlink/admin-dashboard/hooks/useAuth';
import LandingPage from './pages/LandingPage';

// The admin dashboard is code-split and lazy-loaded: marketing-site visitors
// never pay its bundle cost, but once someone logs in it's a normal in-app
// route transition — no full page reload, no separate tab, no separate app.
const AdminApp = lazy(() =>
  import('@resqlink/admin-dashboard').then((m) => ({ default: m.AdminApp }))
);

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FF3B30] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#FF3B30]/20 animate-pulse">
          R
        </div>
        <div className="w-6 h-6 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

/**
 * Crossfades between the two "modes" of the app — marketing site and admin
 * dashboard — instead of a hard cut, so logging in (or navigating back to
 * the marketing site) feels like one continuous app rather than two glued
 * together.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const mode = location.pathname.startsWith('/admin') ? 'admin' : 'marketing';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminApp />
              </Suspense>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Subscribed once, for the lifetime of the app — this is what lets the
  // marketing navbar (LandingPage) know the real login state without
  // waiting for the admin routes to ever mount.
  useAuth();

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
