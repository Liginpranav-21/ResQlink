import { create } from 'zustand';
import type { MedicalProfile } from '../types';
interface MedicalState {
  profile: MedicalProfile | null; isLoading: boolean;
  setProfile: (p: MedicalProfile | null) => void; setLoading: (v: boolean) => void;
}
export const useMedicalStore = create<MedicalState>((set) => ({
  profile: null, isLoading: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
