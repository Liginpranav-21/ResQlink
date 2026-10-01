import { ref, onValue, update, type DataSnapshot } from 'firebase/database';
import { db } from '../firebase/config';
import type { RescueTeam, Hospital, Drone, Analytics } from '../types';

export const dashboardService = {
  subscribeToRescueTeams(callback: (teams: RescueTeam[]) => void) {
    const dbRef = ref(db, 'rescue_teams');
    return onValue(dbRef, (snapshot: DataSnapshot) => {
      console.log("Database connection success for /rescue_teams");
      const data = snapshot.val();
      if (!data) {
        console.log("Number of records fetched from /rescue_teams: 0");
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as RescueTeam));
      list.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`Number of records fetched from /rescue_teams: ${list.length}`);
      callback(list);
    }, (error: any) => {
      console.error("Database read error for /rescue_teams: ", error);
    });
  },

  subscribeToHospitals(callback: (hospitals: Hospital[]) => void) {
    const dbRef = ref(db, 'hospitals');
    return onValue(dbRef, (snapshot: DataSnapshot) => {
      console.log("Database connection success for /hospitals");
      const data = snapshot.val();
      if (!data) {
        console.log("Number of records fetched from /hospitals: 0");
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as Hospital));
      list.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`Number of records fetched from /hospitals: ${list.length}`);
      callback(list);
    }, (error: any) => {
      console.error("Database read error for /hospitals: ", error);
    });
  },

  subscribeToDrones(callback: (drones: Drone[]) => void) {
    const dbRef = ref(db, 'drone_logs');
    return onValue(dbRef, (snapshot: DataSnapshot) => {
      console.log("Database connection success for /drone_logs");
      const data = snapshot.val();
      if (!data) {
        console.log("Number of records fetched from /drone_logs: 0");
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] } as Drone));
      list.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`Number of records fetched from /drone_logs: ${list.length}`);
      callback(list);
    }, (error: any) => {
      console.error("Database read error for /drone_logs: ", error);
    });
  },

  async updateDroneStatus(id: string, status: Drone['status']): Promise<void> {
    await update(ref(db, `drone_logs/${id}`), {
      status,
      lastUpdated: Date.now(),
    });
    console.log(`Updated drone status for ID ${id} to ${status}`);
  },

  generateAnalytics(emergencies: { status: string; type: string; createdAt: number }[]): Analytics {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const active = emergencies.filter((e) => e.status === 'active').length;
    const resolvedToday = emergencies.filter(
      (e) => e.status === 'resolved' && e.createdAt > todayStart.getTime()
    ).length;
    const byType = emergencies.reduce((acc, e) => {
      acc[e.type as keyof typeof acc] = (acc[e.type as keyof typeof acc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const byMonth = months.map((month, i) => ({
      month,
      count: emergencies.filter((e) => new Date(e.createdAt).getMonth() === i).length,
    }));
    return {
      totalEmergencies: emergencies.length,
      activeEmergencies: active,
      resolvedToday,
      avgResponseTime: 8.4,
      dronesOnline: 2,
      teamsAvailable: 2,
      hospitalsAvailable: 3,
      emergenciesByType: byType as Analytics['emergenciesByType'],
      emergenciesByMonth: byMonth,
      successRate: emergencies.length > 0
        ? Math.round((emergencies.filter((e) => e.status === 'resolved').length / emergencies.length) * 100)
        : 0,
    };
  },
};
