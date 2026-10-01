import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencyStore } from '../../store/emergencyStore';
import { formatTimeAgo } from '../../lib/utils';
import type { Emergency } from '../../types';
import { Siren, ChevronRight, MapPin } from 'lucide-react';

/** Severity dot color mapping matching EmergencyHeatmap legend */
function severityDotColor(level: number): string {
  if (level >= 3) return '#FF3B30'; // Critical
  if (level === 2) return '#F59E0B'; // Medium
  return '#10B981'; // Minor
}

/** Assignment status badge styling and label mapping */
function getAssignmentBadge(e: Emergency): { label: string; className: string } {
  const statusStr = e.status as string;
  const isAssigned = Boolean(e.assignedTeamId || e.droneId || statusStr === 'assigned');
  
  if (statusStr === 'en_route') {
    return {
      label: 'En Route',
      className: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20',
    };
  }
  
  if (statusStr === 'on_scene' || statusStr === 'resolved') {
    return {
      label: 'On Scene',
      className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    };
  }
  
  if (isAssigned) {
    return {
      label: 'Team Dispatched',
      className: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    };
  }

  return {
    label: 'Unassigned',
    className: 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20',
  };
}

export default function LiveEmergenciesFeed() {
  const navigate = useNavigate();
  const { emergencies, setSelectedEmergencyId, selectedEmergencyId } = useEmergencyStore();
  const [, setTick] = useState(0);

  // Live-ticking elapsed time update every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Active incidents filter: excluding resolved and cancelled
  const activeEmergencies = emergencies.filter(
    (e) => e.status !== 'resolved' && e.status !== 'cancelled'
  );

  const handleRowClick = (id: string) => {
    setSelectedEmergencyId(id);
    const targetPath = window.location.pathname.startsWith('/admin')
      ? '/admin/sos-navigator'
      : '/sos-navigator';
    navigate(targetPath);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-sm">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren size={16} className="text-[#FF3B30]" />
          <div>
            <h2 className="text-white font-semibold text-sm">Live Emergencies & Assignment</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {activeEmergencies.length} active incident{activeEmergencies.length === 1 ? '' : 's'} needing dispatch
            </p>
          </div>
        </div>
        {activeEmergencies.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="label-tactical text-[#FF3B30]">Live</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-72 flex-1">
        {activeEmergencies.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium">
            No active emergencies right now
          </div>
        ) : (
          activeEmergencies.map((e) => {
            const badge = getAssignmentBadge(e);
            const dotColor = severityDotColor(e.level);
            const isSelected = e.id === selectedEmergencyId;

            return (
              <div
                key={e.id}
                onClick={() => handleRowClick(e.id)}
                className={`px-5 py-3.5 cursor-pointer transition-all hover:bg-slate-800/60 ${
                  isSelected ? 'bg-slate-800/90 border-l-2 border-l-[#FF3B30]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Severity dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: dotColor }}
                      title={`Level ${e.level} Severity`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-xs font-semibold truncate">
                          {e.userName || 'Anonymous Victim'}
                        </span>
                        <span className="text-slate-300 text-xs capitalize font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                          {e.type ? e.type.replace(/_/g, ' ') : 'Emergency'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                        {e.location && typeof e.location.latitude === 'number' && (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin size={10} /> {e.location.latitude.toFixed(3)}, {e.location.longitude.toFixed(3)}
                          </span>
                        )}
                        <span>· {e.createdAt ? formatTimeAgo(e.createdAt as number) : 'just now'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
