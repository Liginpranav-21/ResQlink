import { create } from 'zustand';
import type { Emergency } from '../types';

interface EmergencyState {
  emergencies: Emergency[];
  selectedEmergency: Emergency | null;
  /** Shared SOS focus id — read by the SOS Navigator map and Hospitals page. */
  selectedEmergencyId: string | null;
  isLoading: boolean;
  setEmergencies: (list: Emergency[]) => void;
  addEmergency: (e: Emergency) => void;
  updateEmergency: (id: string, data: Partial<Emergency>) => void;
  selectEmergency: (e: Emergency | null) => void;
  setSelectedEmergencyId: (id: string | null) => void;
  setLoading: (v: boolean) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  emergencies: [],
  selectedEmergency: null,
  selectedEmergencyId: null,
  isLoading: false,
  setEmergencies: (emergencies) => set({ emergencies }),
  addEmergency: (e) => set((s) => ({ emergencies: [e, ...s.emergencies] })),
  updateEmergency: (id, data) =>
    set((s) => ({
      emergencies: s.emergencies.map((em) =>
        em.id === id ? { ...em, ...data, updatedAt: Date.now() } : em
      ),
    })),
  selectEmergency: (selectedEmergency) => set({ selectedEmergency }),
  setSelectedEmergencyId: (selectedEmergencyId) => set({ selectedEmergencyId }),
  setLoading: (isLoading) => set({ isLoading }),
}));
