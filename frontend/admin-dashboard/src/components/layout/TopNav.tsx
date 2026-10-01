import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Radio } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Command Dashboard', subtitle: 'Real-time emergency monitoring' },
  '/emergencies': { title: 'Live Emergencies', subtitle: 'Active incident feed' },
  '/sos-navigator': { title: 'SOS Navigator', subtitle: 'Real-time map & navigation to SOS locations' },
  '/rescue-teams': { title: 'Rescue Teams', subtitle: 'Team status and deployment' },
  '/drone-control': { title: 'Drone Control', subtitle: 'Fleet management and dispatch' },
  '/victims': { title: 'Victim Monitoring', subtitle: 'Patient database and tracking' },
  '/hospitals': { title: 'Hospitals', subtitle: 'Facility availability' },
  '/analytics': { title: 'Analytics', subtitle: 'Incident trends and insights' },
  '/settings': { title: 'Settings', subtitle: 'System configuration' },
};

export default function TopNav() {
  const { pathname } = useLocation();
  const { resolved, setPref } = useThemeStore();
  // Strip an optional "/admin" prefix so this matches whether AdminApp is
  // running standalone (its own dev server) or nested under the
  // product-website shell at /admin/*.
  const normalizedPath = pathname.replace(/^\/admin/, '') || '/';
  const page = pageTitles[normalizedPath] || { title: 'ResQLink', subtitle: 'Command Center' };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-20">
      <div className="flex items-center gap-3">
        <span className="w-1 h-8 rounded-full bg-[#FF3B30]" />
        <div>
          <h1 className="text-white font-semibold text-base tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>{page.title}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{page.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPref(resolved === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          className="w-9 h-9 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-300"
        >
          {resolved === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <div className="text-right leading-none">
          <p className="text-slate-300 text-xs font-mono font-semibold">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </p>
          <p className="label-tactical text-slate-500 mt-1">
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · IST
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/25">
          <Radio size={11} className="text-[#FF3B30]" />
          <span className="label-tactical text-[#FF3B30]">Live</span>
        </div>
      </div>
    </header>
  );
}
