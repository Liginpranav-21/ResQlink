import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEmergencies } from '../hooks/useEmergencies';
import { useDashboardStore } from '../store/dashboardStore';
import { useEmergencyStore } from '../store/emergencyStore';
import { useAuthStore } from '../store/authStore';
import {
  commandCenterService,
  LiveMap,
  type MapMarker,
  hasCoords,
  nearbyHospitals,
  formatDistance,
  estimateEtaMinutes,
  googleMapsDirectionsUrl,
  type Hospital,
} from '@resqlink/shared';
import { TypeBadge, LevelBadge } from '../components/dashboard/EmergencyBadge';
import { MapPin, Siren, Navigation2, Mail, MessageSquare, Building2 } from 'lucide-react';

/** Build the alert message, embedding the SOS context when one is selected. */
function buildMessage(sos?: {
  userName: string;
  type: string;
  level: number;
  location?: { latitude: number; longitude: number };
}): string {
  if (sos) {
    const loc = sos.location;
    const hasLoc = !!loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';
    const locStr = hasLoc
      ? ` Patient location: ${loc!.latitude.toFixed(5)}, ${loc!.longitude.toFixed(5)}.`
      : '';
    return (
      `ResQLink Command Center: Incoming emergency patient (${sos.userName}) — ` +
      `${sos.type.replace(/_/g, ' ')}, severity level ${sos.level}.${locStr} ` +
      `Please confirm bed availability and emergency readiness.`
    );
  }
  return (
    'ResQLink Command Center: Please prepare to receive an incoming emergency patient. ' +
    'Confirm bed availability and emergency readiness.'
  );
}

export default function Hospitals() {
  useEmergencies();
  const { hospitals } = useDashboardStore();
  const { emergencies, selectedEmergencyId, setSelectedEmergencyId } = useEmergencyStore();
  const { user } = useAuthStore();

  const [alertTarget, setAlertTarget] = useState<(Hospital & { distance?: number }) | null>(null);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [sending, setSending] = useState(false);

  // The SOS we are routing hospitals around. Prefer the explicitly selected
  // incident; otherwise fall back to the newest active SOS with a location.
  const activeWithLoc = useMemo(
    () =>
      emergencies
        .filter((e) => e.status === 'active' && hasCoords(e.location))
        .sort((a, b) => (b.createdAt as number) - (a.createdAt as number)),
    [emergencies]
  );
  const sos =
    emergencies.find((e) => e.id === selectedEmergencyId && hasCoords(e.location)) ||
    activeWithLoc[0] ||
    null;

  // Hospitals ranked by proximity to the SOS location (Haversine).
  const ranked = useMemo(
    () => nearbyHospitals(sos?.location, hospitals),
    [sos, hospitals]
  );

  // Map markers: SOS (if any) + all hospitals.
  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];
    if (sos && hasCoords(sos.location)) {
      list.push({
        id: sos.id,
        latitude: sos.location.latitude,
        longitude: sos.location.longitude,
        kind: 'sos',
        title: sos.userName,
        pulse: true,
        popupHtml: `<strong>${sos.userName}</strong><br/>${sos.type.replace(/_/g, ' ')}`,
      });
    }
    ranked.forEach((h: Hospital & { distance: number }) => {
      if (hasCoords(h.location)) {
        list.push({
          id: h.id,
          latitude: h.location.latitude,
          longitude: h.location.longitude,
          kind: 'hospital',
          title: h.name,
          popupHtml: `<strong>${h.name}</strong>${
            h.distance ? `<br/>${formatDistance(h.distance)} from SOS` : ''
          }`,
        });
      }
    });
    return list;
  }, [sos, ranked]);

  const openAlert = (h: Hospital & { distance?: number }) => {
    setAlertTarget(h);
    setMessage(buildMessage(sos || undefined));
    setChannel(h.phone ? 'sms' : 'email');
  };

  const sendAlert = async () => {
    if (!alertTarget) return;
    setSending(true);
    try {
      await commandCenterService.sendHospitalAlert({
        hospitalId: alertTarget.id,
        hospitalName: alertTarget.name,
        hospitalPhone: alertTarget.phone,
        message,
        channel,
        sentBy: user?.email || 'admin',
      });

      if (channel === 'sms' && alertTarget.phone) {
        const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? '&' : '?';
        window.open(`sms:${alertTarget.phone}${sep}body=${encodeURIComponent(message)}`, '_blank');
      } else {
        const subject = encodeURIComponent('ResQLink Emergency Alert');
        window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(message)}`, '_blank');
      }

      toast.success(`Alert recorded & ${channel === 'sms' ? 'SMS' : 'email'} composer opened`);
      setAlertTarget(null);
    } catch (err) {
      console.error('[Hospitals] sendAlert failed:', err);
      toast.error('Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SOS context bar */}
      <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          {sos ? (
            <>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-white font-semibold text-sm">
                  Nearest hospitals to {sos.userName}'s SOS
                </span>
                <TypeBadge type={sos.type} />
                <LevelBadge level={sos.level} />
              </div>
              <p className="text-slate-400 text-xs font-mono inline-flex items-center gap-1">
                <MapPin size={11} /> {sos.location.latitude.toFixed(5)}, {sos.location.longitude.toFixed(5)}
                {ranked[0]?.distance
                  ? ` · closest facility ${formatDistance(ranked[0].distance)} away`
                  : ''}
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-semibold text-sm">All hospitals</p>
              <p className="text-slate-400 text-xs mt-0.5">
                No active SOS selected — showing facilities unranked. Trigger an SOS or pick one in{' '}
                <Link to="../sos-navigator" className="text-[#2563EB] hover:underline font-semibold">
                  SOS Navigator
                </Link>
                .
              </p>
            </>
          )}
        </div>

        {/* Switch SOS context */}
        {activeWithLoc.length > 0 && (
          <select
            value={sos?.id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEmergencyId(e.target.value || null)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-[#FF3B30]/50"
          >
            {activeWithLoc.map((e) => (
              <option key={e.id} value={e.id}>
                {e.userName} · {e.type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Map of SOS + hospitals */}
      {sos && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="h-72 p-3">
            <LiveMap
              className="w-full h-full"
              markers={markers}
              onMarkerClick={(id: string) => {
                const h = ranked.find((x: Hospital & { distance: number }) => x.id === id);
                if (h) openAlert(h);
              }}
            />
          </div>
        </div>
      )}

      {/* Hospital cards (ranked nearest-first when an SOS is active) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ranked.map((h: Hospital & { distance: number }, idx: number) => {
          const hasBeds = typeof h.beds === 'number' && h.beds > 0;
          const occupancy = hasBeds
            ? Math.round(((h.beds! - (h.availableBeds ?? 0)) / h.beds!) * 100)
            : null;
          const showDistance = sos && h.distance > 0;
          return (
            <div key={h.id} className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {sos && (
                      <span className="text-[10px] font-mono font-bold text-[#07080A] bg-[#2563EB] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <p className="text-white font-semibold text-sm truncate">{h.name}</p>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{h.address || 'Address unavailable'}</p>
                </div>
                <span className={`label-tactical px-2 py-0.5 rounded-lg border shrink-0 ${h.isOpen ? 'text-[#10B981] bg-[#10B981]/8 border-[#10B981]/15' : 'text-[#FF3B30] bg-[#FF3B30]/8 border-[#FF3B30]/15'}`}>
                  {h.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {showDistance && (
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#2563EB]/8 text-[#2563EB] border border-[#2563EB]/15 font-semibold font-mono">
                    {formatDistance(h.distance)} away
                  </span>
                  <span className="text-slate-400 font-medium">~{estimateEtaMinutes(h.distance)} min by road</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-300 capitalize font-medium">{h.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-[#2563EB] font-mono font-semibold">{h.phone || '—'}</span>
                </div>
                {h.location && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-slate-300 font-mono text-[11px] font-semibold">
                      {h.location.latitude.toFixed(3)}, {h.location.longitude.toFixed(3)}
                    </span>
                  </div>
                )}
                {hasBeds && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Beds</span>
                      <span className="text-slate-300 font-medium">{h.beds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available</span>
                      <span className={`font-mono ${(h.availableBeds ?? 0) > 20 ? 'text-[#10B981] font-bold' : (h.availableBeds ?? 0) > 5 ? 'text-[#F59E0B] font-bold' : 'text-[#FF3B30] font-bold'}`}>
                        {h.availableBeds ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {occupancy !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Occupancy</span>
                    <span className="text-slate-400 font-semibold">{occupancy}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-[#2563EB] transition-all" style={{ width: `${occupancy}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openAlert(h)}
                  className="flex-1 px-3 py-2 text-xs bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/20 rounded-xl transition-all font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <Siren size={13} /> Send Alert
                </button>
                {h.location && (
                  <a
                    href={googleMapsDirectionsUrl(
                      h.location,
                      sos && hasCoords(sos.location) ? sos.location : undefined
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-2 text-xs bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/20 rounded-xl transition-all font-bold text-center inline-flex items-center justify-center gap-1.5"
                  >
                    <Navigation2 size={13} /> Route
                  </a>
                )}
              </div>

              {h.source === 'osm' && (
                <p className="text-slate-600 text-[10px] mt-2 font-medium">Discovered via live GPS lookup</p>
              )}
            </div>
          );
        })}
        {ranked.length === 0 && (
          <div className="col-span-3 bg-slate-900 rounded-2xl border border-slate-800 py-8 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-3">
            <Building2 size={24} className="text-slate-700" />
            No hospitals yet. Open the mobile app's <span className="text-slate-300 font-semibold">Nearby → Hospitals</span> with location
            enabled to populate real, GPS-based facilities here — or run the seed script.
          </div>
        )}
      </div>

      {/* Send Alert modal */}
      {alertTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setAlertTarget(null)}>
          <div className="hud-frame bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-sm mb-1">Send Alert</h2>
            <p className="text-slate-400 text-xs mb-1 font-semibold">{alertTarget.name}</p>
            {sos && (
              <p className="text-slate-500 text-[11px] mb-4 font-semibold">
                Re: {sos.userName}'s SOS{alertTarget.distance ? ` · ${formatDistance(alertTarget.distance)} away` : ''}
              </p>
            )}

            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Channel</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setChannel('email')}
                className={`flex-1 py-2.5 rounded-xl border text-sm transition-all inline-flex items-center justify-center gap-1.5 ${channel === 'email' ? 'border-[#FF3B30]/35 bg-[#FF3B30]/8 text-[#FF3B30] font-bold' : 'border-slate-700 text-slate-400 hover:bg-slate-800 font-medium'}`}
              >
                <Mail size={14} /> Email
              </button>
              <button
                onClick={() => setChannel('sms')}
                disabled={!alertTarget.phone}
                className={`flex-1 py-2.5 rounded-xl border text-sm transition-all disabled:opacity-40 inline-flex items-center justify-center gap-1.5 ${channel === 'sms' ? 'border-[#FF3B30]/35 bg-[#FF3B30]/8 text-[#FF3B30] font-bold' : 'border-slate-700 text-slate-400 hover:bg-slate-800 font-medium'}`}
              >
                <MessageSquare size={14} /> SMS{!alertTarget.phone ? ' (no #)' : ''}
              </button>
            </div>

            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FF3B30]/50 resize-none mb-4 font-medium"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setAlertTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={sendAlert}
                disabled={sending || !message.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-60 text-white text-sm font-bold transition-all"
              >
                {sending ? 'Sending…' : 'Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
