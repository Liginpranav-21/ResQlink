import { useEffect, useState } from 'react';
import {
  commandCenterService,
  type Ambulance,
  type RescueUnit,
  type EmergencyAlert,
  type ActivityLog,
} from '@resqlink/shared';

/**
 * useCommandCenter — wires up real-time RTDB listeners for the live admin
 * command center. Every collection updates the dashboard instantly via
 * onValue (RTDB's equivalent of Firestore onSnapshot) — no refresh required.
 */
export function useCommandCenter() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [drones, setDrones] = useState<RescueUnit[]>([]);
  const [teams, setTeams] = useState<RescueUnit[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const unsubA = commandCenterService.subscribeToAmbulances(setAmbulances);
    const unsubD = commandCenterService.subscribeToDrones(setDrones);
    const unsubT = commandCenterService.subscribeToRescueTeams(setTeams);
    const unsubAl = commandCenterService.subscribeToAlerts(setAlerts);
    const unsubAc = commandCenterService.subscribeToActivity(setActivity);
    return () => {
      unsubA();
      unsubD();
      unsubT();
      unsubAl();
      unsubAc();
    };
  }, []);

  const activeStatuses = ['available', 'assigned', 'en_route', 'on_scene'];
  return {
    ambulances,
    drones,
    teams,
    alerts,
    activity,
    activeAmbulances: ambulances.filter((a) => activeStatuses.includes(a.status)).length,
    activeDrones: drones.filter((d) => d.status && d.status !== 'offline' && d.status !== 'completed').length,
    activeTeams: teams.filter((t) => t.status && activeStatuses.includes(t.status)).length,
  };
}
