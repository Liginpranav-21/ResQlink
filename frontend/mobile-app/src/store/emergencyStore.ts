import { create } from 'zustand';
import type { Emergency, GPSCoordinates } from '../types';
interface EmergencyState {
  currentEmergency: Emergency | null; history: Emergency[]; location: GPSCoordinates | null;
  isSOSActive: boolean; sosLevel: 1 | 2 | 3;
  setCurrentEmergency: (e: Emergency | null) => void; setHistory: (h: Emergency[]) => void;
  setLocation: (l: GPSCoordinates) => void; setSOSActive: (v: boolean) => void;
  setSOSLevel: (l: 1 | 2 | 3) => void;
}
export const useEmergencyStore = create<EmergencyState>((set) => ({
  currentEmergency: null, history: [], location: null, isSOSActive: false, sosLevel: 1,
  setCurrentEmergency: (currentEmergency) => set({ currentEmergency }),
  setHistory: (history) => set({ history }),
  setLocation: (location) => set({ location }),
  setSOSActive: (isSOSActive) => set({ isSOSActive }),
  setSOSLevel: (sosLevel) => set({ sosLevel }),
}));
