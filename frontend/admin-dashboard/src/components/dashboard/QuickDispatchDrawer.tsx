import { useState } from 'react';
import type { Emergency, Hospital, FleetUnit, RescueTeam, Drone, LatLng } from '@resqlink/shared';
import { emergencyService, commandCenterService, hasCoords, haversineKm, formatDistance, estimateEtaMinutes } from '@resqlink/shared';
import { X, Shield, Ambulance, Plane, Building2, CheckCircle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuickDispatchDrawerProps {
  emergency: Emergency | null;
  ambulances: FleetUnit[];
  rescueTeams: RescueTeam[];
  drones: Drone[];
  hospitals: Hospital[];
  operatorLocation?: LatLng | null;
  onClose: () => void;
  onDispatchSuccess?: () => void;
}

export default function QuickDispatchDrawer({
  emergency,
  ambulances,
  rescueTeams,
  drones,
  hospitals,
  operatorLocation,
  onClose,
  onDispatchSuccess,
}: QuickDispatchDrawerProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'ambulance' | 'drone' | 'hospital'>('ambulance');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!emergency) return null;

  const loc = emergency.location;

  // Available resources sorted by distance if coordinates are present
  const sortedAmbulances = [...ambulances]
    .filter((a) => a.status === 'available' || !a.status)
    .sort((a, b) => {
      if (hasCoords(loc) && hasCoords(a.location)) {
        return haversineKm(loc, a.location!) - haversineKm(loc, b.location!);
      }
      return 0;
    });

  const sortedTeams = [...rescueTeams]
    .filter((t) => t.status === 'available' || !t.status)
    .sort((a, b) => {
      if (hasCoords(loc) && hasCoords(a.location)) {
        return haversineKm(loc, a.location) - haversineKm(loc, b.location);
      }
      return 0;
    });

  const sortedDrones = [...drones]
    .filter((d) => d.status === 'standby' || !d.status)
    .sort((a, b) => {
      if (hasCoords(loc) && hasCoords(a.location)) {
        return haversineKm(loc, a.location) - haversineKm(loc, b.location);
      }
      return 0;
    });

  const sortedHospitals = [...hospitals]
    .filter((h) => h.isOpen)
    .sort((a, b) => {
      if (hasCoords(loc) && hasCoords(a.location)) {
        return haversineKm(loc, a.location) - haversineKm(loc, b.location);
      }
      return 0;
    });

  const handleDispatchAmbulance = async (ambulance: FleetUnit) => {
    try {
      setLoadingId(ambulance.id);
      await commandCenterService.assignAmbulance(emergency.id, ambulance.id, ambulance.name || `Ambulance ${ambulance.id}`);
      toast.success(`Ambulance ${ambulance.name || ambulance.id} dispatched!`);
      onDispatchSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to dispatch ambulance: ${err?.message || 'Error'}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssignTeam = async (team: RescueTeam) => {
    try {
      setLoadingId(team.id);
      await emergencyService.assignTeam(emergency.id, team.id, team.name || `Team ${team.id}`);
      toast.success(`Rescue Team ${team.name || team.id} assigned!`);
      onDispatchSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to assign team: ${err?.message || 'Error'}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssignDrone = async (drone: Drone) => {
    try {
      setLoadingId(drone.id);
      await emergencyService.assignDrone(emergency.id, drone.id);
      toast.success(`Drone ${drone.name || drone.id} launched!`);
      onDispatchSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to launch drone: ${err?.message || 'Error'}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAlertHospital = async (hospital: Hospital) => {
    try {
      setLoadingId(hospital.id);
      await commandCenterService.sendHospitalAlert({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        hospitalPhone: hospital.phone || '',
        message: `EMERGENCY ALERT: ${emergency.type?.replace(/_/g, ' ') || 'Incident'} for victim ${emergency.userName || 'Unknown'} (Level ${emergency.level})`,
        channel: 'sms',
        sentBy: 'Command Center',
      });
      toast.success(`Hospital alert sent to ${hospital.name}!`);
      onDispatchSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to alert hospital: ${err?.message || 'Error'}`);
    } finally {
      setLoadingId(null);
    }
  };

  const assignedAmbulanceId = (emergency as any).assignedAmbulanceId;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wide font-mono flex items-center gap-2">
              <Send size={15} className="text-[#FF3B30]" /> Quick Dispatch Center
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Incident: <span className="text-white font-semibold">{emergency.userName || 'Victim'}</span> ({emergency.type?.replace(/_/g, ' ')})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resource Category Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs font-semibold font-mono">
          <button
            onClick={() => setActiveTab('ambulance')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ambulance'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ambulance size={14} /> Ambulances ({sortedAmbulances.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'team'
                ? 'border-[#F59E0B] text-[#F59E0B]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} /> Teams ({sortedTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('drone')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'drone'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane size={14} /> Drones ({sortedDrones.length})
          </button>
          <button
            onClick={() => setActiveTab('hospital')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'hospital'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={14} /> Hospitals ({sortedHospitals.length})
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. Ambulances Tab */}
          {activeTab === 'ambulance' && (
            sortedAmbulances.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">No available ambulances online</div>
            ) : (
              sortedAmbulances.map((amb) => {
                const dist = hasCoords(loc) && hasCoords(amb.location) ? haversineKm(loc, amb.location!) : null;
                const isAssigned = assignedAmbulanceId === amb.id;
                return (
                  <div key={amb.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-white font-semibold">{amb.name || amb.id}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        {dist !== null ? `${formatDistance(dist)} away · ETA ~${estimateEtaMinutes(dist)}m` : 'Location active'}
                      </p>
                    </div>
                    {isAssigned ? (
                      <span className="px-3 py-1.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle size={12} /> Dispatched
                      </span>
                    ) : (
                      <button
                        disabled={loadingId === amb.id}
                        onClick={() => handleDispatchAmbulance(amb)}
                        className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white rounded-lg font-bold text-[11px] transition-colors"
                      >
                        {loadingId === amb.id ? 'Dispatching...' : 'DISPATCH'}
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}

          {/* 2. Teams Tab */}
          {activeTab === 'team' && (
            sortedTeams.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">No available rescue teams online</div>
            ) : (
              sortedTeams.map((team) => {
                const dist = hasCoords(loc) && hasCoords(team.location) ? haversineKm(loc, team.location) : null;
                const isAssigned = emergency.assignedTeamId === team.id;
                return (
                  <div key={team.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-white font-semibold">{team.name || team.id}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        {dist !== null ? `${formatDistance(dist)} away · ETA ~${estimateEtaMinutes(dist)}m` : 'Ready to deploy'}
                      </p>
                    </div>
                    {isAssigned ? (
                      <span className="px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle size={12} /> Assigned
                      </span>
                    ) : (
                      <button
                        disabled={loadingId === team.id}
                        onClick={() => handleAssignTeam(team)}
                        className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-slate-950 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        {loadingId === team.id ? 'Assigning...' : 'ASSIGN'}
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}

          {/* 3. Drones Tab */}
          {activeTab === 'drone' && (
            sortedDrones.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">No drones available on standby</div>
            ) : (
              sortedDrones.map((drone) => {
                const dist = hasCoords(loc) && hasCoords(drone.location) ? haversineKm(loc, drone.location) : null;
                const isAssigned = emergency.droneId === drone.id;
                return (
                  <div key={drone.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-white font-semibold">{drone.name || drone.id}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        Battery: {drone.battery ?? 100}% · {dist !== null ? `${formatDistance(dist)} away` : 'Standby'}
                      </p>
                    </div>
                    {isAssigned ? (
                      <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle size={12} /> Launched
                      </span>
                    ) : (
                      <button
                        disabled={loadingId === drone.id}
                        onClick={() => handleAssignDrone(drone)}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#10B981]/90 text-slate-950 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        {loadingId === drone.id ? 'Launching...' : 'LAUNCH'}
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}

          {/* 4. Hospitals Tab */}
          {activeTab === 'hospital' && (
            sortedHospitals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">No open hospitals listed</div>
            ) : (
              sortedHospitals.map((hosp) => {
                const dist = hasCoords(loc) && hasCoords(hosp.location) ? haversineKm(loc, hosp.location) : null;
                return (
                  <div key={hosp.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-white font-semibold">{hosp.name}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        {dist !== null ? `${formatDistance(dist)} away · ETA ~${estimateEtaMinutes(dist)}m` : 'Facility open'}
                      </p>
                    </div>
                    <button
                      disabled={loadingId === hosp.id}
                      onClick={() => handleAlertHospital(hosp)}
                      className="px-3 py-1.5 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 rounded-lg font-bold text-[11px] transition-colors"
                    >
                      {loadingId === hosp.id ? 'Alerting...' : 'ALERT'}
                    </button>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
