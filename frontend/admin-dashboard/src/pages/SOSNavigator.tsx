import { useEffect, useMemo } from 'react';
import { useEmergencies } from '../hooks/useEmergencies';
import { useEmergencyStore } from '../store/emergencyStore';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import {
  LiveMap,
  type MapMarker,
  hasCoords,
  formatDistance,
  haversineKm,
  estimateEtaMinutes,
  googleMapsDirectionsUrl,
  type Emergency,
} from '@resqlink/shared';
import { TypeBadge, LevelBadge } from '../components/dashboard/EmergencyBadge';
import { formatTimeAgo } from '../lib/utils';
import { Compass, MapPin, Phone } from 'lucide-react';

/**
 * SOS Navigator — a dedicated map section that displays the location of every
 * SOS the moment it is triggered from the mobile app, and lets the operator
 * focus on and navigate to any single incident in real time.
 *
 * Behaviour:
 *  - Subscribes to /emergencies (live). When a new SOS arrives it appears here.
 *  - Auto-selects the most recent ACTIVE SOS so the map jumps to it instantly.
 *  - Plots the victim's reported GPS, the operator's own live location, and a
 *    dashed line between them.
 *  - "Navigate" opens real Google Maps turn-by-turn directions to the SOS.
 */
export default function SOSNavigator() {
  const { isLoading } = useEmergencies();
  const { emergencies, selectedEmergencyId, setSelectedEmergencyId } =
    useEmergencyStore();
  const { position: adminPos } = useCurrentLocation(true);

  // Active incidents with usable coordinates, newest first.
  const activeWithLoc = useMemo(
    () =>
      emergencies
        .filter((e) => e.status === 'active' && hasCoords(e.location))
        .sort((a, b) => (b.createdAt as number) - (a.createdAt as number)),
    [emergencies]
  );

  // Auto-select the newest active SOS when nothing is selected (or the
  // selected one is no longer active).
  useEffect(() => {
    const stillValid = activeWithLoc.some((e: Emergency) => e.id === selectedEmergencyId);
    if (!stillValid && activeWithLoc.length > 0) {
      setSelectedEmergencyId(activeWithLoc[0].id);
    }
  }, [activeWithLoc, selectedEmergencyId, setSelectedEmergencyId]);

  const selected = emergencies.find((e) => e.id === selectedEmergencyId) || null;

  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];

    // All active SOS markers (pulsing). The selected one shows a popup.
    activeWithLoc.forEach((e: Emergency) => {
      list.push({
        id: e.id,
        latitude: e.location.latitude,
        longitude: e.location.longitude,
        kind: 'sos',
        title: e.userName,
        pulse: true,
        popupHtml: `<div style="min-width:150px">
            <strong>${escapeHtml(e.userName)}</strong><br/>
            ${escapeHtml(e.type.replace(/_/g, ' '))} · L${e.level}<br/>
            ${e.userPhone ? `${escapeHtml(e.userPhone)}<br/>` : ''}
            <span style="color:#767C87;font-size:11px">${formatTimeAgo(
              e.createdAt as number
            )}</span>
          </div>`,
      });
    });

    // Operator's own location.
    if (hasCoords(adminPos)) {
      list.push({
        id: '__self__',
        latitude: adminPos.latitude,
        longitude: adminPos.longitude,
        kind: 'self',
        title: 'Your location',
        popupHtml: '<strong>Command Center (you)</strong>',
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWithLoc, adminPos]);

  const focus = selected && hasCoords(selected.location) ? selected.location : null;
  const routeLine =
    focus && hasCoords(adminPos) ? ([adminPos, focus] as [typeof adminPos, typeof focus]) : null;

  const distanceKm =
    focus && hasCoords(adminPos) ? haversineKm(adminPos, focus) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Map */}
      <div className="flex-1 min-w-0 bg-slate-900 hud-frame hud-frame--critical rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold text-sm">SOS Navigator</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {activeWithLoc.length} active incident
              {activeWithLoc.length === 1 ? '' : 's'} on map
            </p>
          </div>
          {selected && focus && (
            <a
              href={googleMapsDirectionsUrl(focus, adminPos)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/25 rounded-xl font-bold transition-all inline-flex items-center gap-1.5"
            >
              <Compass size={13} /> Navigate in Google Maps
            </a>
          )}
        </div>
        <div className="flex-1 p-4">
          <LiveMap
            className="w-full h-full"
            markers={markers}
            focus={focus}
            routeLine={routeLine}
          />
        </div>
      </div>

      {/* Incident switcher / detail */}
      <div className="w-full lg:w-80 shrink-0 bg-slate-900 hud-frame rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-white font-semibold text-sm">Live SOS Triggers</p>
          <p className="text-slate-400 text-xs mt-0.5">Tap to focus the map</p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeWithLoc.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm px-4 text-center">
            No active SOS right now. New triggers from the mobile app appear here
            instantly.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {activeWithLoc.map((e: Emergency) => {
              const dist =
                hasCoords(adminPos) && hasCoords(e.location)
                  ? haversineKm(adminPos, e.location)
                  : null;
              const active = e.id === selectedEmergencyId;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmergencyId(e.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    active ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-white text-sm font-medium truncate">
                      {e.userName}
                    </span>
                    <span className="text-slate-500 text-[11px] shrink-0">
                      {formatTimeAgo(e.createdAt as number)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <TypeBadge type={e.type} />
                    <LevelBadge level={e.level} />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1">
                    <MapPin size={10} /> {e.location.latitude.toFixed(4)}, {e.location.longitude.toFixed(4)}
                  </div>
                  {dist !== null && (
                    <div className="text-[11px] text-[#2563EB] mt-1 font-mono">
                      {formatDistance(dist)} away · ~{estimateEtaMinutes(dist)} min
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Selected detail footer */}
        {selected && (
          <div className="border-t border-slate-800 p-4 space-y-2">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              Focused incident
            </p>
            <p className="text-white text-sm font-semibold">{selected.userName}</p>
            {selected.userPhone && (
              <a
                href={`tel:${selected.userPhone}`}
                className="inline-flex items-center gap-1 text-[#2563EB] text-xs hover:underline mt-0.5"
              >
                <Phone size={11} /> {selected.userPhone}
              </a>
            )}
            {distanceKm !== null && (
              <p className="text-slate-300 text-xs mt-1">
                {formatDistance(distanceKm)} away · ETA ~{estimateEtaMinutes(distanceKm)} min
              </p>
            )}
            {focus && (
              <a
                href={googleMapsDirectionsUrl(focus, adminPos)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-center mt-3 px-3 py-2.5 text-xs bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-xl font-bold transition-all"
              >
                <Compass size={13} /> Start Navigation
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
