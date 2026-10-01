import { useState } from 'react';
import { useEmergencies } from '../hooks/useEmergencies';
import { useDashboardStore } from '../store/dashboardStore';
import { dashboardService, type Drone } from '@resqlink/shared';
import { Plane, Rocket, Undo2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  standby: 'text-slate-400 bg-slate-800/40 border-slate-700/60',
  searching: 'text-[#2563EB] bg-[#2563EB]/6 border-[#2563EB]/15',
  en_route: 'text-[#F59E0B] bg-[#F59E0B]/6 border-[#F59E0B]/15',
  victim_located: 'text-[#FF3B30] bg-[#FF3B30]/6 border-[#FF3B30]/15',
  rescue_complete: 'text-[#10B981] bg-[#10B981]/6 border-[#10B981]/15',
};

export default function DroneControl() {
  useEmergencies();
  const { drones, updateDrone } = useDashboardStore();
  const [launching, setLaunching] = useState<string | null>(null);

  const handleLaunch = async (drone: Drone) => {
    setLaunching(drone.id);
    try {
      await dashboardService.updateDroneStatus(drone.id, 'searching');
      updateDrone(drone.id, { status: 'searching', altitude: 80, speed: 45 });
      setTimeout(async () => {
        await dashboardService.updateDroneStatus(drone.id, 'en_route');
        updateDrone(drone.id, { status: 'en_route', altitude: 120, speed: 60 });
      }, 3000);
    } finally {
      setLaunching(null);
    }
  };

  const handleReturn = async (drone: Drone) => {
    await dashboardService.updateDroneStatus(drone.id, 'standby');
    updateDrone(drone.id, { status: 'standby', altitude: 0, speed: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {drones.map((d) => (
          <div key={d.id} className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:-translate-y-0.5 transition-all">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">{d.name}</p>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">{d.id.toUpperCase()}</p>
              </div>
              <Plane size={28} strokeWidth={1.5} className="text-slate-500" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Status</span>
                <span className={`label-tactical px-2 py-0.5 rounded-lg border capitalize ${statusColors[d.status]}`}>
                  {d.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Battery</span>
                  <span className={`font-mono font-semibold ${d.battery > 50 ? 'text-[#10B981]' : d.battery > 20 ? 'text-[#F59E0B]' : 'text-[#FF3B30]'}`}>
                    {d.battery}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full transition-all ${d.battery > 50 ? 'bg-[#10B981]' : d.battery > 20 ? 'bg-[#F59E0B]' : 'bg-[#FF3B30]'}`}
                    style={{ width: `${d.battery}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-2.5">
                  <p className="text-slate-500 mb-0.5 font-medium">Altitude</p>
                  <p className="text-white font-bold">{d.altitude}m</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-2.5">
                  <p className="text-slate-500 mb-0.5 font-medium">Speed</p>
                  <p className="text-white font-bold">{d.speed} km/h</p>
                </div>
              </div>
              <div className="text-xs bg-slate-800/40 border border-slate-800 rounded-xl p-2.5">
                <p className="text-slate-500 mb-0.5 font-medium">Location</p>
                <p className="text-white font-mono font-semibold">
                  {d.location ? `${d.location.latitude.toFixed(4)}, ${d.location.longitude.toFixed(4)}` : '—'}
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                {d.status === 'standby' && (
                  <button
                    onClick={() => handleLaunch(d)}
                    disabled={launching === d.id}
                    className="flex-1 py-2.5 text-xs font-bold bg-[#2563EB]/10 hover:bg-[#2563EB]/25 text-[#2563EB] border border-[#2563EB]/20 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Rocket size={13} /> {launching === d.id ? 'Launching…' : 'Launch'}
                  </button>
                )}
                {d.status !== 'standby' && (
                  <button
                    onClick={() => handleReturn(d)}
                    className="flex-1 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Undo2 size={13} /> Return
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {drones.length === 0 && (
          <div className="col-span-3 bg-slate-900 rounded-2xl border border-slate-800 py-8 flex items-center justify-center">
            <p className="text-slate-500 text-sm font-medium">No live data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
