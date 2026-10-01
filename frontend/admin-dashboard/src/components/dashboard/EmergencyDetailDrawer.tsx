import type { Emergency, LatLng } from '@resqlink/shared';
import { hasCoords, haversineKm, formatDistance, estimateEtaMinutes, googleMapsDirectionsUrl } from '@resqlink/shared';
import { TypeBadge, LevelBadge, StatusBadge } from './EmergencyBadge';
import { formatTimeAgo } from '../../lib/utils';
import { X, MapPin, Phone, Compass, Send, Shield, Ambulance, Plane } from 'lucide-react';

interface EmergencyDetailDrawerProps {
  emergency: Emergency | null;
  operatorLocation?: LatLng | null;
  onClose: () => void;
  onOpenDispatch: () => void;
}

export default function EmergencyDetailDrawer({
  emergency,
  operatorLocation,
  onClose,
  onOpenDispatch,
}: EmergencyDetailDrawerProps) {
  if (!emergency) return null;

  const distanceKm =
    hasCoords(operatorLocation) && hasCoords(emergency.location)
      ? haversineKm(operatorLocation, emergency.location)
      : null;

  const assignedAmbulanceName = (emergency as any).assignedAmbulanceName || (emergency as any).assignedAmbulanceId || 'Unassigned';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide font-mono">
              Emergency Incident Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Incident title and badges */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-slate-400 text-xs font-mono">INCIDENT ID: {emergency.id}</span>
              <StatusBadge status={emergency.status} />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">{emergency.userName || 'Anonymous Victim'}</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Reported {emergency.createdAt ? formatTimeAgo(emergency.createdAt as number) : 'just now'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/60">
              <TypeBadge type={emergency.type} />
              <LevelBadge level={emergency.level} />
              {emergency.bloodGroup && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  Blood: {emergency.bloodGroup}
                </span>
              )}
            </div>
          </div>

          {/* Victim contact details */}
          <div className="space-y-2">
            <p className="text-slate-400 text-xs uppercase font-mono tracking-wider font-semibold">Victim Contact</p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-medium">{emergency.userName || 'N/A'}</span>
              </div>
              {emergency.userPhone && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">Phone</span>
                  <a
                    href={`tel:${emergency.userPhone}`}
                    className="text-[#2563EB] hover:underline font-mono inline-flex items-center gap-1"
                  >
                    <Phone size={12} /> {emergency.userPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Location & Navigation */}
          <div className="space-y-2">
            <p className="text-slate-400 text-xs uppercase font-mono tracking-wider font-semibold">Location & Distance</p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              {hasCoords(emergency.location) ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><MapPin size={12} /> Coordinates</span>
                    <span className="text-slate-200 font-mono">
                      {emergency.location.latitude.toFixed(4)}, {emergency.location.longitude.toFixed(4)}
                    </span>
                  </div>
                  {distanceKm !== null && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 font-mono">
                      <span className="text-slate-400">Distance / ETA</span>
                      <span className="text-[#2563EB] font-bold">
                        {formatDistance(distanceKm)} · ~{estimateEtaMinutes(distanceKm)} min
                      </span>
                    </div>
                  )}
                  <a
                    href={googleMapsDirectionsUrl(emergency.location, operatorLocation)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 px-3 bg-[#2563EB]/10 hover:bg-[#2563EB]/20 border border-[#2563EB]/30 text-[#2563EB] rounded-lg font-semibold transition-colors text-xs"
                  >
                    <Compass size={14} /> Open Google Maps Directions
                  </a>
                </>
              ) : (
                <p className="text-slate-500 italic">No GPS coordinates available</p>
              )}
            </div>
          </div>

          {/* Current Assignments */}
          <div className="space-y-2">
            <p className="text-slate-400 text-xs uppercase font-mono tracking-wider font-semibold">Assigned Resources</p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1"><Shield size={12} className="text-[#F59E0B]" /> Rescue Team</span>
                <span className="text-slate-200 font-medium">{emergency.assignedTeamName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1"><Ambulance size={12} className="text-[#2563EB]" /> Ambulance</span>
                <span className="text-slate-200 font-medium">{assignedAmbulanceName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1"><Plane size={12} className="text-[#10B981]" /> Drone</span>
                <span className="text-slate-200 font-medium">{emergency.droneId ? `Drone ${emergency.droneId}` : 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
          <button
            onClick={onOpenDispatch}
            className="flex-1 py-2.5 px-4 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(255,59,48,0.3)]"
          >
            <Send size={14} /> Quick Dispatch Center
          </button>
        </div>
      </div>
    </div>
  );
}
