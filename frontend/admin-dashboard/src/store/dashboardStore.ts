import { create } from 'zustand';
import type { Analytics, Drone, RescueTeam, Hospital } from '../types';

interface DashboardState {
  analytics: Analytics | null;
  drones: Drone[];
  rescueTeams: RescueTeam[];
  hospitals: Hospital[];
  isLoading: boolean;
  lastUpdated: number;
  setAnalytics: (a: Analytics) => void;
  setDrones: (d: Drone[]) => void;
  setRescueTeams: (t: RescueTeam[]) => void;
  setHospitals: (h: Hospital[]) => void;
  setLoading: (v: boolean) => void;
  updateDrone: (id: string, data: Partial<Drone>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  analytics: null,
  drones: [],
  rescueTeams: [],
  hospitals: [],
  isLoading: false,
  lastUpdated: 0,
  setAnalytics: (analytics) => set({ analytics, lastUpdated: Date.now() }),
  setDrones: (drones) => set({ drones }),
  setRescueTeams: (rescueTeams) => set({ rescueTeams }),
  setHospitals: (hospitals) => set({ hospitals }),
  setLoading: (isLoading) => set({ isLoading }),
  updateDrone: (id, data) =>
    set((s) => ({
      drones: s.drones.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),
}));
