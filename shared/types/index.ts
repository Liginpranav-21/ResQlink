export type UserRole = 'user' | 'rescue_team' | 'admin';

export type EmergencyType =
  | 'snake_bite'
  | 'animal_attack'
  | 'landslide'
  | 'flood'
  | 'fire'
  | 'earthquake'
  | 'fracture'
  | 'heavy_bleeding'
  | 'heart_attack'
  | 'lost_in_forest'
  | 'breathing_problem'
  | 'accident';

export type EmergencyLevel = 1 | 2 | 3;
export type EmergencyStatus = 'active' | 'assigned' | 'resolved' | 'cancelled';
export type DroneStatus = 'standby' | 'searching' | 'en_route' | 'victim_located' | 'rescue_complete';
export type RescueTeamStatus = 'available' | 'busy' | 'en_route' | 'on_mission';

// Unified real-time unit status used by ambulances / rescue_teams / drones nodes.
export type UnitStatus =
  | 'available' | 'assigned' | 'en_route' | 'on_scene' | 'completed' | 'offline';

export type AlertChannel = 'sms' | 'push' | 'email';
export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  createdAt: number;
  lastActive: number;
}

export interface MedicalProfile {
  uid: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  organDonor: boolean;
  emergencyContacts: EmergencyContact[];
  updatedAt: number;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Emergency {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  type: EmergencyType;
  level: EmergencyLevel;
  status: EmergencyStatus;
  location: GPSCoordinates;
  description?: string;
  bloodGroup?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  droneId?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  eta?: number;
}

export interface RescueTeam {
  id: string;
  name: string;
  members: number;
  status: RescueTeamStatus;
  location: GPSCoordinates;
  currentMissionId?: string;
  phone: string;
  specialization: string[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: GPSCoordinates;
  type: 'government' | 'private' | 'clinic';
  beds: number;
  availableBeds: number;
  isOpen: boolean;
  distance?: number;
}

export interface Drone {
  id: string;
  name: string;
  status: DroneStatus;
  battery: number;
  altitude: number;
  speed: number;
  location: GPSCoordinates;
  missionId?: string;
  lastUpdated: number;
}

export interface BluetoothSignal {
  id: string;
  userId: string;
  emergencyType: EmergencyType;
  bloodGroup?: string;
  battery: number;
  location: GPSCoordinates;
  signalStrength: 'strong' | 'medium' | 'weak';
  timestamp: number;
}

export interface IncidentLog {
  id: string;
  emergencyId: string;
  action: string;
  actor: string;
  timestamp: number;
  details?: string;
}

export interface Analytics {
  totalEmergencies: number;
  activeEmergencies: number;
  resolvedToday: number;
  avgResponseTime: number;
  dronesOnline: number;
  teamsAvailable: number;
  hospitalsAvailable: number;
  emergenciesByType: Record<EmergencyType, number>;
  emergenciesByMonth: { month: string; count: number }[];
  successRate: number;
}

// ─── Real-time fleet units (ambulances / drones / rescue_teams nodes) ─────────
export interface FleetUnit {
  id: string;
  name: string;
  status: UnitStatus;
  latitude?: number;
  longitude?: number;
  location?: GPSCoordinates;
  phone?: string;
  updatedAt?: number;
}

// ─── Per-SOS contact alert delivery record (emergency_alerts) ─────────────────
export interface EmergencyAlert {
  alertId: string;
  sosId: string;
  contactName: string;
  contactPhone: string;
  deliveryStatus: DeliveryStatus;
  channel?: AlertChannel;
  message?: string;
  sentAt?: number;
}

// ─── Per-user notification (notifications/{uid}/{id}) ─────────────────────────
export interface AppNotification {
  id: string;
  type: 'sos' | 'rescue' | 'ambulance' | 'drone' | 'contact' | 'profile';
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

// ─── System-wide activity log (activity_logs) ─────────────────────────────────
export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  userId?: string;
  sosId?: string;
  level?: number;
  createdAt: number;
}
