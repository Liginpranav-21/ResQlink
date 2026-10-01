// Firestore Collections Schema - ResQLink
// Run once to seed demo data

/*
COLLECTION: users/{uid}
{
  uid: string,
  email: string,
  displayName: string,
  role: 'user' | 'rescue_team' | 'admin',
  phone: string,
  createdAt: timestamp,
  lastActive: timestamp
}

COLLECTION: emergencies/{id}
{
  id: string,
  userId: string,
  userName: string,
  userPhone: string,
  type: EmergencyType,
  level: 1|2|3,
  status: 'active'|'assigned'|'resolved'|'cancelled',
  location: { latitude, longitude, altitude, accuracy, timestamp },
  description: string,
  bloodGroup: string,
  assignedTeamId: string,
  assignedTeamName: string,
  droneId: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  resolvedAt: timestamp,
  eta: number
}

COLLECTION: medical_profiles/{uid}
{
  uid: string,
  fullName: string,
  age: number,
  gender: string,
  height: number,
  weight: number,
  bloodGroup: string,
  allergies: string[],
  medications: string[],
  medicalConditions: string[],
  organDonor: boolean,
  emergencyContacts: [{name, relation, phone}],
  updatedAt: timestamp
}

COLLECTION: rescue_teams/{id}
{
  id: string,
  name: string,
  members: number,
  status: 'available'|'busy'|'en_route'|'on_mission',
  location: { latitude, longitude, timestamp },
  currentMissionId: string,
  phone: string,
  specialization: string[]
}

COLLECTION: hospitals/{id}
{
  id: string,
  name: string,
  address: string,
  phone: string,
  location: { latitude, longitude },
  type: 'government'|'private'|'clinic',
  beds: number,
  availableBeds: number,
  isOpen: boolean
}

COLLECTION: drone_logs/{id}
{
  id: string,
  name: string,
  status: DroneStatus,
  battery: number,
  altitude: number,
  speed: number,
  location: { latitude, longitude, timestamp },
  missionId: string,
  lastUpdated: timestamp
}

COLLECTION: bluetooth_signals/{id}
{
  id: string,
  userId: string,
  emergencyType: EmergencyType,
  bloodGroup: string,
  battery: number,
  location: { latitude, longitude, timestamp },
  signalStrength: 'strong'|'medium'|'weak',
  timestamp: timestamp
}

COLLECTION: incident_history/{id}
{
  id: string,
  emergencyId: string,
  action: string,
  actor: string,
  timestamp: timestamp,
  details: string
}

COLLECTION: analytics/{date}  // e.g. analytics/2024-01
{
  totalEmergencies: number,
  resolvedCount: number,
  avgResponseTime: number,
  emergenciesByType: Record<EmergencyType, number>,
  successRate: number,
  month: string
}
*/

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  EMERGENCIES: 'emergencies',
  MEDICAL_PROFILES: 'medical_profiles',
  RESCUE_TEAMS: 'rescue_teams',
  HOSPITALS: 'hospitals',
  DRONE_LOGS: 'drone_logs',
  BLUETOOTH_SIGNALS: 'bluetooth_signals',
  INCIDENT_HISTORY: 'incident_history',
  ANALYTICS: 'analytics',
} as const;
