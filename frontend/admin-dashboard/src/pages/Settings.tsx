import { useState } from 'react';
import toast from 'react-hot-toast';
import { ref, update } from 'firebase/database';
import { db, authService } from '@resqlink/shared';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type ThemePref } from '../store/themeStore';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react';
import SessionsPanel from '../components/SessionsPanel';

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const { pref, setPref } = useThemeStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const themes = [
    { key: 'light' as ThemePref, icon: Sun, label: 'Light Mode' },
    { key: 'dark' as ThemePref, icon: Moon, label: 'Dark Mode' },
    { key: 'system' as ThemePref, icon: Monitor, label: 'System Default' },
  ];

  const saveProfile = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await update(ref(db, `users/${user.uid}`), {
        displayName: displayName.trim(),
        phone: phone.trim(),
        updatedAt: Date.now(),
      });
      setUser({ ...user, displayName: displayName.trim(), phone: phone.trim() });
      toast.success('Profile updated');
    } catch (err) {
      console.error('[Settings] save failed:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    logout();
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Admin profile */}
      <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold text-sm mb-4">Admin Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30] text-xl font-mono font-extrabold">
            {user?.displayName?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-white font-bold">{user?.displayName}</p>
            <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
            <span className="inline-block label-tactical px-2 py-0.5 rounded-lg bg-[#FF3B30]/8 text-[#FF3B30] border border-[#FF3B30]/25 mt-1.5">Admin</span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block label-tactical text-slate-400 mb-1.5">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FF3B30]/50 font-medium transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block label-tactical text-slate-400 mb-1.5">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FF3B30]/50 font-medium transition-all"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-4 py-2.5 bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-60 text-[#07080A] text-sm font-bold rounded-xl transition-all"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold text-sm mb-1">Appearance</h2>
        <p className="text-slate-400 text-xs mb-4">Saved to your account and applied across sessions.</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((th) => (
            <button
              key={th.key}
              onClick={() => {
                setPref(th.key);
                toast.success(`Theme: ${th.label}`);
              }}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                pref === th.key
                  ? 'border-[#FF3B30]/35 bg-[#FF3B30]/8 text-[#FF3B30] font-bold'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800 font-medium'
              }`}
            >
              <th.icon size={20} strokeWidth={1.75} />
              <span className="text-xs font-semibold">{th.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold text-sm mb-4">System Information</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'App Version', value: '1.0.0' },
            { label: 'Firebase Project', value: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resqlink-862d5' },
            { label: 'Environment', value: import.meta.env.MODE || 'development' },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-2.5 border-b border-slate-800/80 last:border-0">
              <span className="label-tactical text-slate-400">{r.label}</span>
              <span className="text-slate-300 font-mono text-xs font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <SessionsPanel />

      {/* Session */}
      <div className="hud-frame hud-frame--critical bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold text-sm mb-4">Session</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-[#FF3B30]/8 hover:bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/20 text-sm font-bold rounded-xl transition-all inline-flex items-center gap-2"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
