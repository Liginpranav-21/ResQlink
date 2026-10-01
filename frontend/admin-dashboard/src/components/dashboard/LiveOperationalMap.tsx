import { useState, useMemo } from 'react';
import {
  LiveMap,
  type MapMarker,
  hasCoords,
  type LatLng,
  type Emergency,
  type Hospital,
  type FleetUnit,
  type RescueTeam,
  type Drone,
} from '@resqlink/shared';
import { Layers, Maximize2, Minimize2, Target } from 'lucide-react';

interface LiveOperationalMapProps {
  emergencies: Emergency[];
  ambulances: FleetUnit[];
  rescueTeams: RescueTeam[];
  drones: Drone[];
  hospitals: Hospital[];
  operatorLocation?: LatLng | null;
  selectedEmergencyId?: string | null;
  onEmergencySelect?: (id: string) => void;
  className?: string;
}

export default function LiveOperationalMap({
  emergencies,
  ambulances,
  rescueTeams,
  drones,
  hospitals,
  operatorLocation,
  selectedEmergencyId,
  onEmergencySelect,
  className = '',
}: LiveOperationalMapProps) {
  // Layer visibility state
  const [layers, setLayers] = useState({
    emergencies: true,
    ambulances: true,
    rescueTeams: true,
    drones: true,
    hospitals: true,
    police: false,
    fire: false,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [mapCenterFocus, setMapCenterFocus] = useState<LatLng | null>(null);

  const selectedEmergency = useMemo(
    () => emergencies.find((e) => e.id === selectedEmergencyId) || null,
    [emergencies, selectedEmergencyId]
  );

  // Compute map markers cleanly based on active layer selections
  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];

    // 1. Emergencies (Active & Assigned)
    if (layers.emergencies) {
      emergencies
        .filter((e) => e.status !== 'resolved' && e.status !== 'cancelled' && hasCoords(e.location))
        .forEach((e) => {
          list.push({
            id: e.id,
            latitude: e.location.latitude,
            longitude: e.location.longitude,
            kind: 'sos',
            title: e.userName || 'Emergency Incident',
            pulse: true,
            popupHtml: `<div style="min-width:160px; font-size:12px;">
              <strong style="color:#FF3B30;">🚨 ${escapeHtml(e.userName || 'Victim')}</strong><br/>
              <span>${escapeHtml((e.type || 'Emergency').replace(/_/g, ' '))} · Level ${e.level}</span><br/>
              <span style="color:#94a3b8; font-size:11px;">Status: ${e.status}</span>
            </div>`,
          });
        });
    }

    // 2. Ambulances
    if (layers.ambulances) {
      ambulances
        .filter((a) => a.location && hasCoords(a.location))
        .forEach((a) => {
          list.push({
            id: `amb_${a.id}`,
            latitude: a.location!.latitude,
            longitude: a.location!.longitude,
            kind: 'ambulance',
            title: a.name || `Ambulance ${a.id}`,
            popupHtml: `<div style="min-width:140px; font-size:12px;">
              <strong style="color:#2563EB;">🚑 ${escapeHtml(a.name || a.id)}</strong><br/>
              <span style="color:#94a3b8; font-size:11px;">Status: ${a.status || 'Active'}</span>
            </div>`,
          });
        });
    }

    // 3. Rescue Teams
    if (layers.rescueTeams) {
      rescueTeams
        .filter((t) => t.location && hasCoords(t.location))
        .forEach((t) => {
          list.push({
            id: `team_${t.id}`,
            latitude: t.location.latitude,
            longitude: t.location.longitude,
            kind: 'team',
            title: t.name || `Team ${t.id}`,
            popupHtml: `<div style="min-width:140px; font-size:12px;">
              <strong style="color:#F59E0B;">🦺 ${escapeHtml(t.name || t.id)}</strong><br/>
              <span style="color:#94a3b8; font-size:11px;">Status: ${t.status || 'Active'}</span>
            </div>`,
          });
        });
    }

    // 4. Drones
    if (layers.drones) {
      drones
        .filter((d) => d.location && hasCoords(d.location))
        .forEach((d) => {
          list.push({
            id: `drone_${d.id}`,
            latitude: d.location.latitude,
            longitude: d.location.longitude,
            kind: 'drone',
            title: d.name || `Drone ${d.id}`,
            popupHtml: `<div style="min-width:140px; font-size:12px;">
              <strong style="color:#10B981;">🚁 ${escapeHtml(d.name || d.id)}</strong><br/>
              <span style="color:#94a3b8; font-size:11px;">Battery: ${d.battery ?? 100}% · Alt: ${d.altitude ?? 0}m</span>
            </div>`,
          });
        });
    }

    // 5. Hospitals
    if (layers.hospitals) {
      hospitals
        .filter((h) => h.location && hasCoords(h.location))
        .forEach((h) => {
          list.push({
            id: `hosp_${h.id}`,
            latitude: h.location.latitude,
            longitude: h.location.longitude,
            kind: 'hospital',
            title: h.name || 'Hospital',
            popupHtml: `<div style="min-width:150px; font-size:12px;">
              <strong style="color:#38BDF8;">🏥 ${escapeHtml(h.name || 'Hospital')}</strong><br/>
              <span style="color:#94a3b8; font-size:11px;">Status: ${h.isOpen ? 'OPEN' : 'CLOSED'}</span>
            </div>`,
          });
        });
    }

    // 6. Operator location
    if (operatorLocation && hasCoords(operatorLocation)) {
      list.push({
        id: '__operator__',
        latitude: operatorLocation.latitude,
        longitude: operatorLocation.longitude,
        kind: 'self',
        title: 'Command Center',
        popupHtml: '<strong>Command Center (Operator)</strong>',
      });
    }

    return list;
  }, [layers, emergencies, ambulances, rescueTeams, drones, hospitals, operatorLocation, selectedEmergencyId]);

  const activeFocus = useMemo(() => {
    if (mapCenterFocus) return mapCenterFocus;
    if (selectedEmergency && hasCoords(selectedEmergency.location)) return selectedEmergency.location;
    return null;
  }, [mapCenterFocus, selectedEmergency]);

  const routeLine = useMemo(() => {
    if (selectedEmergency && hasCoords(selectedEmergency.location) && operatorLocation && hasCoords(operatorLocation)) {
      return [operatorLocation, selectedEmergency.location] as [LatLng, LatLng];
    }
    return null;
  }, [selectedEmergency, operatorLocation]);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRecenter = () => {
    if (selectedEmergency && hasCoords(selectedEmergency.location)) {
      setMapCenterFocus({ ...selectedEmergency.location });
    } else if (operatorLocation && hasCoords(operatorLocation)) {
      setMapCenterFocus({ ...operatorLocation });
    } else {
      setMapCenterFocus(null);
    }
  };

  return (
    <div className={`relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[460px]'} ${className}`}>
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <h2 className="text-white font-semibold text-xs tracking-wide uppercase font-mono">
            Live Operational Map
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {markers.length} Active Units
          </span>
        </div>

        {/* Map Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              showLayerPanel
                ? 'bg-[#2563EB]/20 border-[#2563EB]/40 text-[#2563EB]'
                : 'bg-slate-800 border-slate-700/70 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers size={13} />
            <span>Layers</span>
          </button>

          <button
            onClick={handleRecenter}
            title="Recenter Map"
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/70 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Target size={13} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/70 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Layer selector popover panel */}
      {showLayerPanel && (
        <div className="absolute top-12 right-4 z-20 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-200">Map Layers</span>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Emergencies
              </span>
              <input
                type="checkbox"
                checked={layers.emergencies}
                onChange={() => toggleLayer('emergencies')}
                className="accent-[#FF3B30] rounded"
              />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Ambulances
              </span>
              <input
                type="checkbox"
                checked={layers.ambulances}
                onChange={() => toggleLayer('ambulances')}
                className="accent-[#2563EB] rounded"
              />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Rescue Teams
              </span>
              <input
                type="checkbox"
                checked={layers.rescueTeams}
                onChange={() => toggleLayer('rescueTeams')}
                className="accent-[#F59E0B] rounded"
              />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Drones
              </span>
              <input
                type="checkbox"
                checked={layers.drones}
                onChange={() => toggleLayer('drones')}
                className="accent-[#10B981] rounded"
              />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Hospitals
              </span>
              <input
                type="checkbox"
                checked={layers.hospitals}
                onChange={() => toggleLayer('hospitals')}
                className="accent-[#38BDF8] rounded"
              />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 opacity-60 cursor-not-allowed">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Police (N/A)
              </span>
              <input type="checkbox" disabled checked={false} className="rounded" />
            </label>
            <label className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 opacity-60 cursor-not-allowed">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-600" /> Fire (N/A)
              </span>
              <input type="checkbox" disabled checked={false} className="rounded" />
            </label>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="flex-1 w-full h-full relative">
        <LiveMap
          className="w-full h-full"
          markers={markers}
          focus={activeFocus}
          routeLine={routeLine}
          onMarkerClick={(id) => {
            if (!id.startsWith('amb_') && !id.startsWith('team_') && !id.startsWith('drone_') && !id.startsWith('hosp_') && id !== '__operator__') {
              onEmergencySelect?.(id);
            }
          }}
        />

        {/* Quick Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3 text-[11px] text-slate-300 pointer-events-none">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Emergency</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Ambulance</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Rescue</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Drone</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Hospital</span>
        </div>
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
