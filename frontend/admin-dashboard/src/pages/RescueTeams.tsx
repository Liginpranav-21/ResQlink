import { useEmergencies } from '../hooks/useEmergencies';
import { useDashboardStore } from '../store/dashboardStore';

const statusColors: Record<string, string> = {
  available: 'text-[#10B981] bg-[#10B981]/6 border-[#10B981]/15',
  busy: 'text-[#FF3B30] bg-[#FF3B30]/6 border-[#FF3B30]/15',
  en_route: 'text-[#F59E0B] bg-[#F59E0B]/6 border-[#F59E0B]/15',
  on_mission: 'text-[#2563EB] bg-[#2563EB]/6 border-[#2563EB]/15',
};

export default function RescueTeams() {
  useEmergencies();
  const { rescueTeams } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['available','busy','en_route','on_mission'] as const).map((s) => {
          const count = rescueTeams.filter((t) => t.status === s).length;
          return (
            <div key={s} className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <p className="label-tactical text-slate-400 mb-2">{s.replace('_',' ')}</p>
              <p className="text-3xl font-mono font-bold tracking-tight text-white">{count}</p>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">teams</p>
            </div>
          );
        })}
      </div>

      <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-sm">All Rescue Teams</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/40 border-b border-slate-800">
              <tr>
                {['Team Name','Members','Specialization','Phone','Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left label-tactical text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rescueTeams.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 text-white text-sm font-semibold">{t.name}</td>
                  <td className="px-5 py-4 text-slate-300 text-sm font-medium">{t.members}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {t.specialization.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-300 capitalize font-medium">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm font-mono font-semibold">{t.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`label-tactical px-2.5 py-1 rounded-lg border capitalize ${statusColors[t.status]}`}>
                      {t.status.replace('_',' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {rescueTeams.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm font-medium">No live data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
