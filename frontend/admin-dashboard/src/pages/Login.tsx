import { useState } from 'react';
import { Siren, Plane, Shield, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '@resqlink/shared';
import { useAuthStore } from '../store/authStore';

/**
 * Login page — handles sign-in, registration, and password reset.
 *
 * IMPORTANT: This component does NOT manually navigate after auth.
 * Navigation is handled entirely by the AuthRoute wrapper in App.tsx,
 * which redirects authenticated users to "/" once the Zustand store
 * has a non-null user. This avoids a race condition where manual
 * navigation fires before the onAuthStateChanged listener has run.
 *
 * Flow:
 *   1. User submits form → authService.login/register is called
 *   2. Firebase sets the auth session
 *   3. onAuthStateChanged in useAuth fires
 *   4. useAuth calls getUserProfile and sets the Zustand user
 *   5. AuthRoute in App.tsx sees user != null → redirects to "/"
 */
export default function Login() {
  const { setError, error } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const update = (k: string, v: string) => setForm((f: typeof form) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('[Login] Attempting sign-in for:', form.email);
        // authService.login throws on failure with a clean message.
        // On success, onAuthStateChanged fires → useAuth sets the store user
        // → AuthRoute redirects. We do NOT call setUser or navigate here.
        await authService.login(form.email, form.password, rememberMe);
        console.log('[Login] Sign-in call succeeded — waiting for auth state change…');

      } else if (mode === 'register') {
        console.log('[Login] Attempting registration for:', form.email);
        await authService.register(form.email, form.password, form.displayName);
        console.log('[Login] Registration succeeded — waiting for auth state change…');

      } else {
        await authService.resetPassword(form.email);
        setSuccess('Password reset email sent. Check your inbox.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('[Login] Auth error:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Siren, label: 'Live Emergency Feed' },
    { icon: Plane, label: 'Drone Fleet Control' },
    { icon: Shield, label: 'Rescue Team Dispatch' },
    { icon: BarChart3, label: 'Real-time Analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 border-r border-slate-800/80 overflow-hidden">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: 'radial-gradient(500px circle at 50% 20%, rgba(108,142,239,0.12), transparent 65%), radial-gradient(400px circle at 20% 80%, rgba(179,157,251,0.08), transparent 65%)',
          }}
        />
        <div className="max-w-md text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-[#FF3B30] flex items-center justify-center text-white text-3xl font-black mx-auto mb-8 hud-frame shadow-[0_8px_28px_-6px_rgba(108,142,239,0.55)]">R</div>
          <p className="label-tactical text-[#FF3B30] mb-3">Command Console</p>
          <h1 className="text-white text-4xl font-extrabold tracking-tight mb-4">ResQLink</h1>
          <p className="text-slate-400 text-base italic mb-8">"Connecting Help When Networks Fail"</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            AI-powered emergency rescue ecosystem. Monitor live incidents, dispatch rescue teams,
            control drones, and coordinate hospitals — all from one command center.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 text-slate-400 text-sm font-medium border border-slate-800 rounded-xl px-3 py-2.5">
                <f.icon size={15} className="text-[#FF3B30] shrink-0" strokeWidth={1.75} />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3B30] flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-[0_8px_28px_-6px_rgba(108,142,239,0.55)]">R</div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">ResQLink Admin</h1>
          </div>

          <div className="hud-frame bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <h2 className="text-white text-xl font-bold mb-1">
              {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
            </h2>
            <p className="text-slate-400 text-sm mb-6 font-medium">
              {mode === 'login'
                ? 'Access the emergency command center'
                : mode === 'register'
                ? 'Register a new admin account'
                : 'Enter your email to reset password'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-[#FF3B30]/8 border border-[#FF3B30]/20 text-[#FF3B30] text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-[#10B981]/8 border border-[#10B981]/20 text-[#10B981] text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text" required value={form.displayName}
                    onChange={(e) => update('displayName', e.target.value)}
                    placeholder="Admin Name"
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#FF3B30]/50 transition-all font-medium"
                  />
                </div>
              )}
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="admin@resqlink.com"
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#FF3B30]/50 transition-all font-medium"
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password" required value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#FF3B30]/50 transition-all font-medium"
                  />
                </div>
              )}

              {mode === 'login' && (
                <label className="flex items-center gap-2 text-slate-400 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-850 accent-[#FF3B30]"
                  />
                  Remember me on this device
                </label>
              )}

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                {isLoading
                  ? 'Processing…'
                  : mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Send Reset Email'}
              </button>
            </form>

            <div className="mt-5 space-y-2 text-center">
              {mode === 'login' && (
                <>
                  <button onClick={() => { setError(null); setMode('reset'); }} className="text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors block w-full">
                    Forgot password?
                  </button>
                  <button onClick={() => { setError(null); setMode('register'); }} className="text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors block w-full">
                    Create admin account
                  </button>
                </>
              )}
              {(mode === 'register' || mode === 'reset') && (
                <button onClick={() => { setError(null); setMode('login'); }} className="text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors">
                  ← Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
