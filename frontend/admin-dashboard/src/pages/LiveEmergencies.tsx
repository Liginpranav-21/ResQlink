import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmergencies } from '../hooks/useEmergencies';
import { useEmergencyStore } from '../store/emergencyStore';
import { useDashboardStore } from '../store/dashboardStore';
import {
  emergencyService,
  LiveMap,
  type MapMarker,
  hasCoords,
  googleMapsDirectionsUrl,
  type EmergencyStatus,
} from '@resqlink/shared';
import { TypeBadge, LevelBadge, StatusBadge } from '../components/dashboard/EmergencyBadge';
import { formatTimeAgo } from '../lib/utils';
import { MapPin, Droplet, Shield, Compass, Building2, Radio } from 'lucide-react';

const FIRST_AID: Record<string, string[]> = {
  snake_bite: ['Keep calm, immobilize bitten limb', 'Remove jewelry near bite', 'Rush for antivenom'],
  heart_attack: ['Sit patient upright', 'Loosen clothing', 'Give aspirin if available', 'Begin CPR if needed'],
  heavy_bleeding: ['Apply direct firm pressure', 'Elevate injured area', 'Do not remove cloth'],
  fracture: ['Immobilize with splint', 'Apply ice pack', 'Do not realign bone'],
  fire: ['Stop, Drop, Roll', 'Cool burns with water 10min', 'Do not use ice or butter'],
  flood: ['Move to high ground', 'Avoid moving water', 'Signal for help'],
  earthquake: ['Drop, Cover, Hold On', 'Away from windows', 'Prepare for aftershocks'],
  default: ['Keep victim calm', 'Call emergency services', 'Apply first aid as needed'],
};

export default function LiveEmergencies() {
  const { isLoading } = useEmergencies();
  const { emergencies, updateEmergency, selectedEmergencyId, setSelectedEmergencyId } =
    useEmergencyStore();
  const { rescueTeams } = useDashboardStore();
  const [filter, setFilter] = useState<EmergencyStatus | 'all'>('all');

  // Selection is shared via the store so the SOS Navigator + Hospitals pages
  // stay in sync with the incident the operator is looking at here.
  const selected = selectedEmergencyId;
  const setSelected = (id: string | null) => setSelectedEmergencyId(id);

  const filtered = filter === 'all' ? emergencies : emergencies.filter((e) => e.status === filter);
  const selectedEmergency = emergencies.find((e) => e.id === selected);
  const activeCount = emergencies.filter((e) => e.status === 'active').length;

  // Map markers: every incident in the current filter that has coordinates,
  // active ones pulse. The selected incident drives the map focus.
  const mapMarkers: MapMarker[] = useMemo(
    () =>
      filtered
        .filter((e) => hasCoords(e.location))
        .map((e) => ({
          id: e.id,
          latitude: e.location.latitude,
          longitude: e.location.longitude,
          kind: 'sos' as const,
          title: e.userName,
          pulse: e.status === 'active',
          popupHtml: `<strong>${e.userName}</strong><br/>${e.type.replace(
            /_/g,
            ' '
          )} · L${e.level}`,
        })),
    [filtered]
  );

  const focus =
    selectedEmergency && hasCoords(selectedEmergency.location)
      ? selectedEmergency.location
      : null;

  const handleStatusChange = async (id: string, status: EmergencyStatus) => {
    await emergencyService.updateStatus(id, status);
    updateEmergency(id, { status });
  };

  const handleAssign = async (emergencyId: string) => {
    const team = rescueTeams.find((t) => t.status === 'available');
    if (!team) return alert('No available rescue teams');
    await emergencyService.assignTeam(emergencyId, team.id, team.name);
    updateEmergency(emergencyId, { status: 'assigned', assignedTeamId: team.id, assignedTeamName: team.name });
  };

  const aid = selectedEmergency
    ? (FIRST_AID[selectedEmergency.type] || FIRST_AID.default)
    : [];

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Table panel */}
      <div className="flex-1 min-w-0 bg-slate-900 hud-frame rounded-2xl border border-slate-800 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-white font-semibold text-sm">Emergency Feed</h2>
            <p className="text-slate-400 text-xs mt-0.5">{filtered.length} incidents</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['all', 'active', 'assigned', 'resolved'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all capitalize font-medium ${
                    filter === f
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20 font-semibold'
                      : 'text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF3B30]/10 border border-[#FF3B30]/20">
                <Radio size={11} className="text-[#FF3B30]" />
                <span className="label-tactical text-[#FF3B30]">Live</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Loading…</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                No live data available
              </div>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelected(selected === e.id ? null : e.id)}
                  className={`px-5 py-4 cursor-pointer transition-colors ${
                    selected === e.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-white text-sm font-medium">{e.userName}</span>
                        {e.userPhone && <span className="text-slate-500 text-xs">{e.userPhone}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <TypeBadge type={e.type} />
                        <LevelBadge level={e.level} />
                        <StatusBadge status={e.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap">
                        {hasCoords(e.location) ? (
                          <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.location.latitude.toFixed(4)}, {e.location.longitude.toFixed(4)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#F59E0B]"><MapPin size={11} /> location unavailable</span>
                        )}
                        <span>· {formatTimeAgo(e.createdAt as number)}</span>
                        {e.bloodGroup && <span className="inline-flex items-center gap-1">· <Droplet size={11} /> {e.bloodGroup}</span>}
                        {e.assignedTeamName && <span className="inline-flex items-center gap-1">· <Shield size={11} /> {e.assignedTeamName}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {e.status === 'active' && (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleAssign(e.id); }}
                          className="px-2.5 py-1.5 text-xs bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/20 rounded-xl font-medium"
                        >
                          Dispatch
                        </button>
                      )}
                      {e.status === 'assigned' && (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleStatusChange(e.id, 'resolved'); }}
                          className="px-2.5 py-1.5 text-xs bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20 rounded-xl font-medium"
                        >
                          Resolve
                        </button>
                      )}
                      {e.status === 'active' && (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleStatusChange(e.id, 'cancelled'); }}
                          className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/50 rounded-xl font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right column: live map + detail */}
      <div className="w-96 shrink-0 flex flex-col gap-4">
        {/* Real-time mini map */}
        <div className="bg-slate-900 hud-frame rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <p className="text-white font-semibold text-xs">Incident Map</p>
            <Link to="../sos-navigator" className="text-[#2563EB] text-[11px] hover:underline font-semibold inline-flex items-center gap-1">
              Open full navigator <Compass size={11} />
            </Link>
          </div>
          <div className="h-56">
            <LiveMap
              className="w-full h-full"
              markers={mapMarkers}
              focus={focus}
              defaultZoom={11}
              onMarkerClick={(id) => setSelected(id)}
            />
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-h-0">
        {selectedEmergency ? (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 h-full flex flex-col overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-white font-semibold text-sm">Incident Detail</p>
              <p className="text-slate-400 text-xs mt-0.5">{selectedEmergency.id.toUpperCase()}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">Victim</p>
                <p className="text-white text-sm font-medium">{selectedEmergency.userName}</p>
                {selectedEmergency.userPhone && <p className="text-slate-400 text-xs">{selectedEmergency.userPhone}</p>}
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Emergency</p>
                <TypeBadge type={selectedEmergency.type} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Level</p>
                  <LevelBadge level={selectedEmergency.level} />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <StatusBadge status={selectedEmergency.status} />
                </div>
              </div>
              {selectedEmergency.bloodGroup && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Blood Group</p>
                  <p className="text-red-400 text-sm font-bold">{selectedEmergency.bloodGroup}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-1">GPS Location</p>
                <p className="text-white text-xs font-mono">
                  {hasCoords(selectedEmergency.location) ? (
                    <>
                      {selectedEmergency.location.latitude.toFixed(6)}<br />
                      {selectedEmergency.location.longitude.toFixed(6)}
                    </>
                  ) : (
                    'Not available'
                  )}
                </p>
              </div>
              {hasCoords(selectedEmergency.location) && (
                <div className="flex gap-2">
                  <a
                    href={googleMapsDirectionsUrl(selectedEmergency.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center px-3 py-2 text-xs bg-[#2563EB]/10 hover:bg-[#2563EB]/25 text-[#2563EB] border border-[#2563EB]/20 rounded-xl font-bold transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    <Compass size={13} /> Navigate
                  </a>
                  <Link
                    to="../hospitals"
                    className="flex-1 text-center px-3 py-2 text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-bold transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    <Building2 size={13} /> Hospitals
                  </Link>
                </div>
              )}
              {selectedEmergency.assignedTeamName && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Assigned Team</p>
                  <p className="text-[#F59E0B] text-sm inline-flex items-center gap-1.5"><Shield size={13} /> {selectedEmergency.assignedTeamName}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-2">First Aid Guide</p>
                <div className="space-y-1.5">
                  {aid.map((step, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-slate-500 shrink-0">{i + 1}.</span>
                      <span className="text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 h-full flex items-center justify-center shadow-sm">
            <p className="text-slate-500 text-sm text-center px-4 font-medium">Select an incident to view details</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
