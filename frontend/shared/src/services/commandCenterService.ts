import { ref, onValue, update, set, type DataSnapshot } from 'firebase/database';
import { db } from '../firebase/config';
import type { FleetUnit, EmergencyAlert, ActivityLog } from '../types';

export type Ambulance = FleetUnit;
export type RescueUnit = FleetUnit;

function subscribeCollection<T>(
  path: string,
  callback: (list: T[]) => void,
  sortFn?: (a: T, b: T) => number
) {
  const dbRef = ref(db, path);
  return onValue(
    dbRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (!data) {
        console.log(`Number of records fetched from /${path}: 0`);
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as T));
      if (sortFn) list.sort(sortFn);
      console.log(`Number of records fetched from /${path}: ${list.length}`);
      callback(list);
    },
    (error: unknown) => console.error(`Database read error for /${path}:`, error)
  );
}

export const commandCenterService = {
  subscribeToAmbulances(cb: (list: Ambulance[]) => void) {
    return subscribeCollection<Ambulance>('ambulances', cb, (a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  subscribeToDrones(cb: (list: RescueUnit[]) => void) {
    return subscribeCollection<RescueUnit>('drones', cb, (a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  subscribeToRescueTeams(cb: (list: RescueUnit[]) => void) {
    return subscribeCollection<RescueUnit>('rescue_teams', cb, (a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  subscribeToAlerts(cb: (list: EmergencyAlert[]) => void) {
    const dbRef = ref(db, 'emergency_alerts');
    return onValue(
      dbRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (!data) {
          cb([]);
          return;
        }
        const list = Object.keys(data).map((key) => ({ alertId: key, ...data[key] } as EmergencyAlert));
        list.sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
        cb(list);
      },
      (error: unknown) => console.error('Database read error for /emergency_alerts:', error)
    );
  },

  subscribeToActivity(cb: (list: ActivityLog[]) => void) {
    const dbRef = ref(db, 'activity_logs');
    return onValue(
      dbRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (!data) {
          cb([]);
          return;
        }
        const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as ActivityLog));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        cb(list);
      },
      (error: unknown) => console.error('Database read error for /activity_logs:', error)
    );
  },

  async updateAmbulanceStatus(id: string, status: Ambulance['status']): Promise<void> {
    await update(ref(db, `ambulances/${id}`), { status, updatedAt: Date.now() });
  },

  async assignAmbulance(emergencyId: string, ambulanceId: string, ambulanceName: string): Promise<void> {
    await update(ref(db, `emergencies/${emergencyId}`), {
      assignedAmbulanceId: ambulanceId,
      assignedAmbulanceName: ambulanceName,
      status: 'assigned',
      updatedAt: Date.now(),
    });
    await update(ref(db, `ambulances/${ambulanceId}`), { status: 'assigned', updatedAt: Date.now() });
  },

  async logActivity(action: string, detail: string, meta: Record<string, unknown> = {}): Promise<void> {
    const id = Math.random().toString(36).slice(2, 11).toUpperCase();
    await set(ref(db, `activity_logs/${id}`), { id, action, detail, ...meta, createdAt: Date.now() });
  },

  async sendHospitalAlert(params: {
    hospitalId: string;
    hospitalName: string;
    hospitalPhone?: string;
    message: string;
    channel: 'email' | 'sms';
    sentBy?: string;
  }): Promise<string> {
    const alertId = Math.random().toString(36).slice(2, 11).toUpperCase();
    await set(ref(db, `hospital_alerts/${alertId}`), {
      alertId,
      hospitalId: params.hospitalId,
      hospitalName: params.hospitalName,
      hospitalPhone: params.hospitalPhone || '',
      message: params.message,
      channel: params.channel,
      deliveryStatus: 'queued',
      sentBy: params.sentBy || 'admin',
      sentAt: Date.now(),
    });
    await this.logActivity(
      'hospital_alert',
      `Alert sent to ${params.hospitalName} via ${params.channel}`,
      { hospitalId: params.hospitalId }
    );
    return alertId;
  },
};
