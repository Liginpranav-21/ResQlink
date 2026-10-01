import { ref, onValue, update, type DataSnapshot } from 'firebase/database';
import { db } from '../firebase/config';
import type { Emergency, EmergencyStatus } from '../types';

export const emergencyService = {
  subscribeToEmergencies(callback: (list: Emergency[]) => void) {
    const dbRef = ref(db, 'emergencies');
    return onValue(dbRef, (snapshot: DataSnapshot) => {
      console.log("Database connection success for /emergencies");
      const data = snapshot.val();
      if (!data) {
        console.log("Number of records fetched from /emergencies: 0");
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as Emergency));
      const ts = (e: Emergency) => {
        const v = (e as any).createdAt;
        return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
      };
      list.sort((a, b) => ts(b) - ts(a));
      console.log(`Number of records fetched from /emergencies: ${list.length}`);
      callback(list);
    }, (error: any) => {
      console.error("Database read error for /emergencies: ", error);
    });
  },

  subscribeToActive(callback: (list: Emergency[]) => void) {
    const dbRef = ref(db, 'emergencies');
    return onValue(dbRef, (snapshot: DataSnapshot) => {
      console.log("Database connection success for active /emergencies");
      const data = snapshot.val();
      if (!data) {
        console.log("Number of records fetched from active /emergencies: 0");
        callback([]);
        return;
      }
      const list = Object.keys(data)
        .map((key) => ({ id: key, ...data[key] } as Emergency))
        .filter((e) => e.status === 'active');
      const tsA = (e: Emergency) => {
        const v = (e as any).createdAt;
        return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
      };
      list.sort((a, b) => tsA(b) - tsA(a));
      console.log(`Number of records fetched from active /emergencies: ${list.length}`);
      callback(list);
    }, (error: any) => {
      console.error("Database read error for active /emergencies: ", error);
    });
  },

  async updateStatus(id: string, status: EmergencyStatus): Promise<void> {
    await update(ref(db, `emergencies/${id}`), {
      status,
      updatedAt: Date.now(),
      ...(status === 'resolved' ? { resolvedAt: Date.now() } : {}),
    });
    console.log(`Updated emergency ${id} status to ${status}`);
  },

  async assignTeam(emergencyId: string, teamId: string, teamName: string): Promise<void> {
    await update(ref(db, `emergencies/${emergencyId}`), {
      assignedTeamId: teamId,
      assignedTeamName: teamName,
      status: 'assigned',
      updatedAt: Date.now(),
    });
    console.log(`Assigned team ${teamName} to emergency ${emergencyId}`);
  },

  async assignDrone(emergencyId: string, droneId: string): Promise<void> {
    await update(ref(db, `emergencies/${emergencyId}`), {
      droneId,
      updatedAt: Date.now(),
    });
    console.log(`Assigned drone ${droneId} to emergency ${emergencyId}`);
  },
};
