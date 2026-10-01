export type UserRole = 'user' | 'rescue_team' | 'admin';
export type EmergencyType =
  | 'snake_bite' | 'animal_attack' | 'landslide' | 'flood' | 'fire'
  | 'earthquake' | 'fracture' | 'heavy_bleeding' | 'heart_attack'
  | 'lost_in_forest' | 'breathing_problem' | 'accident';
export type EmergencyLevel = 1 | 2 | 3;
export type EmergencyStatus = 'active' | 'assigned' | 'resolved' | 'cancelled';
export type DroneStatus = 'standby' | 'searching' | 'en_route' | 'victim_located' | 'rescue_complete';
export type RescueTeamStatus = 'available' | 'busy' | 'en_route' | 'on_mission';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
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
  type: 'government' | 'private' | 'clinic' | 'hospital';
  beds?: number;
  availableBeds?: number;
  isOpen: boolean;
  distance?: number;
  source?: string;
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

export interface Analytics {
  totalEmergencies: number;
  activeEmergencies: number;
  resolvedToday: number;
  avgResponseTime: number;
  dronesOnline: number;
  teamsAvailable: number;
  hospitalsAvailable: number;
  emergenciesByType: Partial<Record<EmergencyType, number>>;
  emergenciesByMonth: { month: string; count: number }[];
  successRate: number;
}
