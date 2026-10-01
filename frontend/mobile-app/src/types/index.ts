export type UserRole = 'user' | 'rescue_team' | 'admin';
export type EmergencyType =
  | 'snake_bite' | 'animal_attack' | 'landslide' | 'flood' | 'fire'
  | 'earthquake' | 'fracture' | 'heavy_bleeding' | 'heart_attack'
  | 'lost_in_forest' | 'breathing_problem' | 'accident';
export type EmergencyLevel = 1 | 2 | 3;
export type EmergencyStatus = 'active' | 'assigned' | 'resolved' | 'cancelled';
export type DroneStatus = 'standby' | 'searching' | 'en_route' | 'victim_located' | 'rescue_complete';
export interface GPSCoordinates { latitude: number; longitude: number; altitude?: number; accuracy?: number; timestamp: number; }
export interface EmergencyContact { name: string; relation: string; phone: string; }
export interface MedicalProfile {
  uid: string; fullName: string; age: number; gender: 'male' | 'female' | 'other';
  height: number; weight: number;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[]; medications: string[]; medicalConditions: string[];
  organDonor: boolean; emergencyContacts: EmergencyContact[]; updatedAt: number;
}
export interface User {
  uid: string; email: string; displayName: string; role: UserRole; phone?: string;
  createdAt: number; lastActive: number;
}
export interface Emergency {
  id: string; userId: string; userName: string; userPhone?: string;
  type: EmergencyType; level: EmergencyLevel; status: EmergencyStatus;
  location: GPSCoordinates; description?: string; bloodGroup?: string;
  assignedTeamId?: string; assignedTeamName?: string; droneId?: string;
  createdAt: number; updatedAt: number; resolvedAt?: number; eta?: number;
}
