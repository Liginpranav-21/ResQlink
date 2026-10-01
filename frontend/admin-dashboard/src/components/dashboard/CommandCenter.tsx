import type { LucideIcon } from 'lucide-react';
import { LifeBuoy, XCircle, UserRound, Ambulance, Shield, Plane, Pin, Radio } from 'lucide-react';
import { useCommandCenter } from '../../hooks/useCommandCenter';
import { useEmergencyStore } from '../../store/emergencyStore';
import { formatTimeAgo } from '../../lib/utils';
import type { Emergency } from '../../types';
import LiveEmergenciesFeed from './LiveEmergenciesFeed';

/** A single live metric tile. */
function LiveTile({
  label,
  value,
  icon,
  accent,
  pulse,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  pulse?: boolean;
}) {
  const Icon = icon;
  return (
    <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-tactical text-slate-400">{label}</p>
          <p className="text-white text-2xl font-mono font-bold mt-1.5 tracking-tight">{value}</p>
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          <Icon size={18} strokeWidth={1.75} style={{ color: accent }} />
        </div>
      </div>
      {pulse && value > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight SVG "heatmap" of emergency locations. Plots active incidents
 * onto a normalized grid so clusters become visible without a maps SDK.
 */
function EmergencyHeatmap({ emergencies }: { emergencies: Emergency[] }) {
  const located = emergencies.filter(
    (e) => e.location && typeof e.location.latitude === 'number' && typeof e.location.longitude === 'number' && !Number.isNaN(e.location.latitude) && !Number.isNaN(e.location.longitude) && e.status !== 'resolved' && e.status !== 'cancelled'
  );

  if (located.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
        No active incidents to map
      </div>
    );
  }

  const lats = located.map((e) => e.location!.latitude);
  const lngs = located.map((e) => e.location!.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 0.001;
  const spanLng = maxLng - minLng || 0.001;

  const project = (e: Emergency) => {
    const x = 20 + ((e.location!.longitude - minLng) / spanLng) * 360;
    const y = 200 - ((e.location!.latitude - minLat) / spanLat) * 160;
    return { x, y };
  };

  const levelColor = (level: number) => (level >= 3 ? '#FF3B30' : level === 2 ? '#F59E0B' : '#10B981');

  return (
    <svg viewBox="0 0 400 220" className="w-full" style={{ background: 'rgba(255,138,30,0.02)', borderRadius: 4, border: '1px solid #21252B' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={i * 100} y1="0" x2={i * 100} y2="220" stroke="#1A1E23" strokeWidth="0.5" />
          <line x1="0" y1={i * 55} x2="400" y2={i * 55} stroke="#1A1E23" strokeWidth="0.5" />
        </g>
      ))}
      {located.map((e) => {
        const p = project(e);
        const c = levelColor(e.level);
        return (
          <g key={e.id}>
            <circle cx={p.x} cy={p.y} r="20" fill={c} opacity="0.1" />
            <circle cx={p.x} cy={p.y} r="10" fill={c} opacity="0.2" />
            <circle cx={p.x} cy={p.y} r="4.5" fill={c}>
              <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export default function CommandCenter() {
  const { ambulances, drones, alerts, activity, activeAmbulances, activeDrones, activeTeams } = useCommandCenter();
  const { emergencies } = useEmergencyStore();

  const activeSosCount = emergencies.filter((e) => e.status === 'active' || e.status === 'assigned').length;

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-green-400/10 text-green-400',
      assigned: 'bg-amber-400/10 text-amber-400',
      en_route: 'bg-blue-400/10 text-blue-400',
      on_scene: 'bg-purple-400/10 text-purple-400',
      completed: 'bg-slate-600/30 text-slate-300',
      offline: 'bg-slate-700/40 text-slate-500',
      queued: 'bg-blue-400/10 text-blue-400',
      sent: 'bg-green-400/10 text-green-400',
      failed: 'bg-red-400/10 text-red-400',
    };
    return map[status] || 'bg-slate-700 text-slate-400';
  };

  const actionIcon = (action: string): LucideIcon => {
    if (action.includes('sos_created')) return LifeBuoy;
    if (action.includes('sos_cancelled')) return XCircle;
    if (action.includes('profile')) return UserRound;
    if (action.includes('ambulance')) return Ambulance;
    if (action.includes('team')) return Shield;
    if (action.includes('drone')) return Plane;
    return Pin;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Command Center</h2>
          <p className="text-slate-400 text-xs mt-0.5">Live operational overview · updates in real time</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/10 border border-[#10B981]/20">
          <Radio size={11} className="text-[#10B981]" />
          <span className="label-tactical text-[#10B981]">Real-Time</span>
        </div>
      </div>

      {/* Live metric tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LiveTile label="Active SOS" value={activeSosCount} icon={LifeBuoy} accent="#FF3B30" pulse />
        <LiveTile label="Active Ambulances" value={activeAmbulances} icon={Ambulance} accent="#F59E0B" />
        <LiveTile label="Active Rescue Teams" value={activeTeams} icon={Shield} accent="#10B981" />
        <LiveTile label="Active Drones" value={activeDrones} icon={Plane} accent="#2563EB" />
      </div>

      {/* Heatmap & Live Emergencies Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="xl:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Emergency Heatmap</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Critical</span>
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Medium</span>
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Minor</span>
            </div>
          </div>
          <EmergencyHeatmap emergencies={emergencies} />
        </div>

        {/* Live Emergencies & Assignment Status Panel */}
        <div className="xl:col-span-1">
          <LiveEmergenciesFeed />
        </div>
      </div>

      {/* Recent Alerts & Latest Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent alerts feed */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold text-sm">Recent Alerts</h2>
            <p className="text-slate-400 text-xs mt-0.5">Contact notifications</p>
          </div>
          <div className="divide-y divide-slate-800 overflow-y-auto max-h-72">
            {alerts.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No alerts yet</div>
            ) : (
              alerts.slice(0, 12).map((a) => (
                <div key={a.alertId} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-xs font-medium truncate">{a.contactName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 text-[11px] font-mono uppercase tracking-wide ${statusPill(a.deliveryStatus)}`}>
                      {a.deliveryStatus}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {a.contactPhone} · {a.sentAt ? formatTimeAgo(a.sentAt) : 'just now'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="xl:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold text-sm">Latest Activity</h2>
            <p className="text-slate-400 text-xs mt-0.5">System-wide event log</p>
          </div>
          <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No activity yet</div>
            ) : (
              activity.slice(0, 15).map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  {(() => { const Icon = actionIcon(log.action); return <Icon size={15} className="text-slate-500 shrink-0 mt-0.5" strokeWidth={1.75} />; })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs">{log.detail}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {log.action.replace(/_/g, ' ')} · {log.createdAt ? formatTimeAgo(log.createdAt) : 'just now'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ambulance fleet */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Ambulance Fleet</h2>
          <div className="space-y-2.5">
            {ambulances.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No ambulances online</p>
            ) : (
              ambulances.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{a.name || a.id}</p>
                    <p className="text-slate-500 text-xs">{a.id}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded shrink-0 text-[11px] font-mono uppercase tracking-wide ${statusPill(a.status)}`}>
                    {(a.status || 'offline').replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
          {drones.length > 0 && (
            <>
              <h3 className="text-white font-semibold text-xs mt-5 mb-3">Drones</h3>
              <div className="space-y-2.5">
                {drones.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                    <p className="text-white text-xs font-medium truncate">{d.name || d.id}</p>
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 text-[11px] font-mono uppercase tracking-wide ${statusPill(d.status)}`}>
                      {(d.status || 'offline').replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
