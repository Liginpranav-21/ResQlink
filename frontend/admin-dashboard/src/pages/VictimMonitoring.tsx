import { useEmergencies } from '../hooks/useEmergencies';
import { useEmergencyStore } from '../store/emergencyStore';
import { TypeBadge, StatusBadge } from '../components/dashboard/EmergencyBadge';
import { formatTimeAgo } from '../lib/utils';
import { hasCoords } from '@resqlink/shared';

export default function VictimMonitoring() {
  useEmergencies();
  const { emergencies } = useEmergencyStore();

  return (
    <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-white font-semibold text-sm">Victim Database</h2>
        <p className="text-slate-400 text-xs mt-0.5">{emergencies.length} total records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/40 border-b border-slate-800">
            <tr>
              {['Victim','Blood Group','Emergency','Status','GPS Location','Time','Team'].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left label-tactical text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {emergencies.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-4">
                  <p className="text-white text-sm font-semibold">{e.userName}</p>
                  {e.userPhone && <p className="text-slate-500 text-xs mt-0.5">{e.userPhone}</p>}
                </td>
                <td className="px-4 py-4">
                  <span className="text-[#FF3B30] font-mono font-bold text-sm">{e.bloodGroup || '—'}</span>
                </td>
                <td className="px-4 py-4"><TypeBadge type={e.type} /></td>
                <td className="px-4 py-4"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-4 font-mono text-xs text-slate-400 font-semibold">
                  {hasCoords(e.location) ? `${e.location.latitude.toFixed(4)}, ${e.location.longitude.toFixed(4)}` : '—'}
                </td>
                <td className="px-4 py-4 text-slate-400 text-xs font-semibold whitespace-nowrap">
                  {formatTimeAgo(e.createdAt as number)}
                </td>
                <td className="px-4 py-4 text-slate-300 text-xs font-medium">{e.assignedTeamName || '—'}</td>
              </tr>
            ))}
            {emergencies.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm font-medium">No live data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
