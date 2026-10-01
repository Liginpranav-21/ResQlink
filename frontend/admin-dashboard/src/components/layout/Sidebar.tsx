import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Siren, Compass, Shield, Plane, UserRound,
  Building2, BarChart3, Settings as SettingsIcon, LogOut, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService, hasSectionAccess, type DashboardSection } from '@resqlink/shared';
import { cn } from '../../lib/utils';

const navItems: { to: string; label: string; icon: typeof LayoutGrid; exact?: boolean; section: DashboardSection }[] = [
  { to: '', label: 'Dashboard', icon: LayoutGrid, exact: true, section: 'dashboard' },
  { to: 'emergencies', label: 'Live Emergencies', icon: Siren, section: 'emergencies' },
  { to: 'sos-navigator', label: 'SOS Navigator', icon: Compass, section: 'sos-navigator' },
  { to: 'rescue-teams', label: 'Rescue Teams', icon: Shield, section: 'rescue-teams' },
  { to: 'drone-control', label: 'Drone Control', icon: Plane, section: 'drone-control' },
  { to: 'victims', label: 'Victim Monitoring', icon: UserRound, section: 'victims' },
  { to: 'hospitals', label: 'Hospitals', icon: Building2, section: 'hospitals' },
  { to: 'analytics', label: 'Analytics', icon: BarChart3, section: 'analytics' },
  { to: 'settings', label: 'Settings', icon: SettingsIcon, section: 'settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    logout();
  };

  return (
    <aside className="hud-frame hud-frame--muted w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF3B30] flex items-center justify-center text-white font-black text-base shrink-0 shadow-[0_4px_16px_-2px_rgba(255,59,48,0.5)]">
            R
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight tracking-wide truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
              ResQLink
            </p>
            <p className="label-tactical text-slate-500">Command Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="label-tactical text-slate-600 px-3 pt-2 pb-2">Operations</p>
        {navItems
          .filter((item) => !user || hasSectionAccess(user.role, item.section))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative',
                    isActive
                      ? 'bg-[#FF3B30]/[0.12] text-[#FF3B30] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )
                }
              >
                <Icon size={16} strokeWidth={2} className="shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* System Status Panel */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-[11px] font-mono space-y-1.5">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">
          <span className="flex items-center gap-1"><Activity size={11} className="text-[#10B981]" /> System Status</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-500">Firebase</span>
          <span className="text-[#10B981] font-semibold">● ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-500">RTDB Feed</span>
          <span className="text-[#10B981] font-semibold">● LIVE</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-500">GPS Tracker</span>
          <span className="text-[#10B981] font-semibold">● ACTIVE</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-500">Map Engine</span>
          <span className="text-[#10B981] font-semibold">● ONLINE</span>
        </div>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-mono font-bold shrink-0">
            {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.displayName || 'Admin Operator'}</p>
            <p className="text-slate-500 text-[11px] font-mono truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-[#FF3B30] transition-colors shrink-0 p-1"
            title="Logout"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
