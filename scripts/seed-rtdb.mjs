/**
 * Seed script for Firebase Realtime Database.
 *
 * Populates the paths consumed by the admin dashboard so that the
 * Rescue Teams, Drone Control, Nearby Hospitals, Victim Monitoring,
 * Live Emergencies, and Analytics pages have live data to render and
 * sync against in real time.
 *
 * Usage:
 *   node scripts/seed-rtdb.mjs
 *
 * Requires the same Firebase web config used by the admin dashboard.
 * Reads from frontend/admin-dashboard/.env (VITE_FIREBASE_*) or env vars.
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve firebase SDK dynamically from admin-dashboard or shared node_modules if needed
let initializeApp, getDatabase, ref, set;
try {
  const fbApp = await import('firebase/app');
  const fbDb = await import('firebase/database');
  initializeApp = fbApp.initializeApp;
  getDatabase = fbDb.getDatabase;
  ref = fbDb.ref;
  set = fbDb.set;
} catch {
  const adminDbNodeModules = path.join(__dirname, '..', 'frontend', 'admin-dashboard', 'node_modules');
  const fbApp = await import(pathToFileURL(path.join(adminDbNodeModules, 'firebase', 'app', 'dist', 'index.mjs')).href);
  const fbDb = await import(pathToFileURL(path.join(adminDbNodeModules, 'firebase', 'database', 'dist', 'index.mjs')).href);
  initializeApp = fbApp.initializeApp;
  getDatabase = fbDb.getDatabase;
  ref = fbDb.ref;
  set = fbDb.set;
}

function loadEnv() {
  const envPath = path.join(__dirname, '..', 'frontend', 'admin-dashboard', '.env');
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID,
  databaseURL:
    process.env.VITE_FIREBASE_DATABASE_URL ||
    'https://resqlink-862d5-default-rtdb.asia-southeast1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const now = Date.now();
const minutesAgo = (m) => now - m * 60 * 1000;

// ---------------------------------------------------------------------------
// Rescue Teams
// ---------------------------------------------------------------------------
const rescueTeams = {
  team_alpha: {
    name: 'Alpha Rescue Squad',
    members: 6,
    status: 'available',
    location: { latitude: 13.0827, longitude: 80.2707, timestamp: now },
    phone: '+91-9840012345',
    specialization: ['water_rescue', 'first_aid', 'rope_rescue'],
  },
  team_bravo: {
    name: 'Bravo Response Unit',
    members: 5,
    status: 'en_route',
    location: { latitude: 13.0569, longitude: 80.2425, timestamp: now },
    currentMissionId: 'em_1002',
    phone: '+91-9840012346',
    specialization: ['medical', 'extraction'],
  },
  team_charlie: {
    name: 'Charlie Mountain Team',
    members: 8,
    status: 'on_mission',
    location: { latitude: 13.1143, longitude: 80.2906, timestamp: now },
    currentMissionId: 'em_1001',
    phone: '+91-9840012347',
    specialization: ['mountain_rescue', 'rope_rescue', 'first_aid'],
  },
  team_delta: {
    name: 'Delta Flood Response',
    members: 7,
    status: 'busy',
    location: { latitude: 13.0418, longitude: 80.2341, timestamp: now },
    phone: '+91-9840012348',
    specialization: ['water_rescue', 'evacuation'],
  },
  team_echo: {
    name: 'Echo Fire & Hazmat',
    members: 6,
    status: 'available',
    location: { latitude: 13.0674, longitude: 80.2376, timestamp: now },
    phone: '+91-9840012349',
    specialization: ['fire_response', 'hazmat', 'first_aid'],
  },
};

// ---------------------------------------------------------------------------
// Drones (drone_logs)
// ---------------------------------------------------------------------------
const droneLogs = {
  drone_01: {
    name: 'Falcon-1',
    status: 'searching',
    battery: 78,
    altitude: 120,
    speed: 55,
    location: { latitude: 13.1143, longitude: 80.2906, timestamp: now },
    missionId: 'em_1001',
    lastUpdated: now,
  },
  drone_02: {
    name: 'Falcon-2',
    status: 'standby',
    battery: 100,
    altitude: 0,
    speed: 0,
    location: { latitude: 13.0827, longitude: 80.2707, timestamp: now },
    lastUpdated: now,
  },
  drone_03: {
    name: 'Hawk-1',
    status: 'en_route',
    battery: 62,
    altitude: 95,
    speed: 48,
    location: { latitude: 13.0569, longitude: 80.2425, timestamp: now },
    missionId: 'em_1002',
    lastUpdated: now,
  },
};

// ---------------------------------------------------------------------------
// Hospitals
// ---------------------------------------------------------------------------
const hospitals = {
  hosp_apollo: {
    name: 'Apollo Hospital',
    address: '21 Greams Lane, Thousand Lights, Chennai',
    phone: '+91-44-28290200',
    location: { latitude: 13.0604, longitude: 80.2496, timestamp: now },
    type: 'private',
    beds: 250,
    availableBeds: 34,
    isOpen: true,
  },
  hosp_govt_general: {
    name: 'Government General Hospital',
    address: 'Park Town, Chennai',
    phone: '+91-44-25305000',
    location: { latitude: 13.0827, longitude: 80.2785, timestamp: now },
    type: 'government',
    beds: 600,
    availableBeds: 112,
    isOpen: true,
  },
  hosp_fortis_malar: {
    name: 'Fortis Malar Hospital',
    address: '52 1st Main Rd, Gandhi Nagar, Adyar, Chennai',
    phone: '+91-44-42892222',
    location: { latitude: 13.0067, longitude: 80.2569, timestamp: now },
    type: 'private',
    beds: 180,
    availableBeds: 9,
    isOpen: true,
  },
  hosp_sims: {
    name: 'Stanley Medical College Hospital',
    address: 'Old Jail Rd, Periyamet, Chennai',
    phone: '+91-44-25281351',
    location: { latitude: 13.1018, longitude: 80.2853, timestamp: now },
    type: 'government',
    beds: 400,
    availableBeds: 58,
    isOpen: true,
  },
  hosp_billroth: {
    name: 'Billroth Hospitals',
    address: '43, Lakshmi Talkies Rd, Shenoy Nagar, Chennai',
    phone: '+91-44-42004500',
    location: { latitude: 13.0732, longitude: 80.2218, timestamp: now },
    type: 'private',
    beds: 150,
    availableBeds: 21,
    isOpen: false,
  },
};

// ---------------------------------------------------------------------------
// Emergencies
// ---------------------------------------------------------------------------
const emergencies = {
  em_1001: {
    userId: 'user_1001',
    userName: 'Ramesh Kumar',
    userPhone: '+91-9876543210',
    type: 'landslide',
    level: 3,
    status: 'assigned',
    location: { latitude: 13.1143, longitude: 80.2906, accuracy: 8, timestamp: minutesAgo(35) },
    description: 'Landslide near hillside village, multiple people trapped.',
    bloodGroup: 'O+',
    assignedTeamId: 'team_charlie',
    assignedTeamName: 'Charlie Mountain Team',
    droneId: 'drone_01',
    createdAt: minutesAgo(35),
    updatedAt: minutesAgo(20),
    eta: 12,
  },
  em_1002: {
    userId: 'user_1002',
    userName: 'Priya Subramaniam',
    userPhone: '+91-9876501234',
    type: 'heart_attack',
    level: 3,
    status: 'assigned',
    location: { latitude: 13.0569, longitude: 80.2425, accuracy: 5, timestamp: minutesAgo(15) },
    description: 'Elderly male, chest pain and shortness of breath.',
    bloodGroup: 'A+',
    assignedTeamId: 'team_bravo',
    assignedTeamName: 'Bravo Response Unit',
    droneId: 'drone_03',
    createdAt: minutesAgo(15),
    updatedAt: minutesAgo(10),
    eta: 6,
  },
  em_1003: {
    userId: 'user_1003',
    userName: 'Arjun Iyer',
    userPhone: '+91-9123456780',
    type: 'snake_bite',
    level: 2,
    status: 'active',
    location: { latitude: 13.0418, longitude: 80.2341, accuracy: 10, timestamp: minutesAgo(5) },
    description: 'Snake bite on forearm while gardening, swelling visible.',
    bloodGroup: 'B+',
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
  },
  em_1004: {
    userId: 'user_1004',
    userName: 'Lakshmi Narayanan',
    userPhone: '+91-9988776655',
    type: 'fracture',
    level: 1,
    status: 'resolved',
    location: { latitude: 13.0674, longitude: 80.2376, accuracy: 6, timestamp: minutesAgo(180) },
    description: 'Fell from stairs, suspected ankle fracture.',
    bloodGroup: 'AB+',
    assignedTeamId: 'team_alpha',
    assignedTeamName: 'Alpha Rescue Squad',
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(120),
    resolvedAt: minutesAgo(120),
    eta: 0,
  },
  em_1005: {
    userId: 'user_1005',
    userName: 'Vikram Raj',
    userPhone: '+91-9012345678',
    type: 'flood',
    level: 2,
    status: 'active',
    location: { latitude: 13.0298, longitude: 80.2209, accuracy: 12, timestamp: minutesAgo(2) },
    description: 'Water level rising rapidly near riverside settlement.',
    createdAt: minutesAgo(2),
    updatedAt: minutesAgo(2),
  },
  em_1006: {
    userId: 'user_1006',
    userName: 'Deepa Chandran',
    userPhone: '+91-9345678901',
    type: 'accident',
    level: 3,
    status: 'cancelled',
    location: { latitude: 13.0904, longitude: 80.2754, accuracy: 7, timestamp: minutesAgo(240) },
    description: 'Two-wheeler collision reported, later confirmed false alarm.',
    createdAt: minutesAgo(240),
    updatedAt: minutesAgo(230),
  },
};

// ---------------------------------------------------------------------------
// Ambulances
// ---------------------------------------------------------------------------
const ambulances = {
  amb_01: { name: 'City Ambulance 1', status: 'available', latitude: 13.0827, longitude: 80.2707, phone: '108', updatedAt: now },
  amb_02: { name: 'Rapid Response 2', status: 'en_route', latitude: 13.0569, longitude: 80.2425, phone: '108', updatedAt: now },
  amb_03: { name: 'MICU Unit 3', status: 'on_scene', latitude: 13.1143, longitude: 80.2906, phone: '108', updatedAt: now },
  amb_04: { name: 'Basic Life Support 4', status: 'available', latitude: 13.0418, longitude: 80.2341, phone: '108', updatedAt: now },
  amb_05: { name: 'Reserve Unit 5', status: 'offline', latitude: 13.0674, longitude: 80.2376, phone: '108', updatedAt: now },
};

// ---------------------------------------------------------------------------
// Drones (new /drones node used by the command center)
// ---------------------------------------------------------------------------
const drones = {
  drone_01: { name: 'Falcon-1', status: 'en_route', latitude: 13.1143, longitude: 80.2906, updatedAt: now },
  drone_02: { name: 'Falcon-2', status: 'available', latitude: 13.0827, longitude: 80.2707, updatedAt: now },
  drone_03: { name: 'Hawk-1', status: 'on_scene', latitude: 13.0569, longitude: 80.2425, updatedAt: now },
  drone_04: { name: 'Hawk-2', status: 'offline', latitude: 13.0418, longitude: 80.2341, updatedAt: now },
};

// ---------------------------------------------------------------------------
// Activity logs
// ---------------------------------------------------------------------------
const activityLogs = {
  act_01: { id: 'act_01', action: 'sos_created', detail: 'Arjun Kumar triggered a snake bite SOS (L3)', createdAt: minutesAgo(5) },
  act_02: { id: 'act_02', action: 'team_assigned', detail: 'Alpha Rescue Squad dispatched to em_1001', createdAt: minutesAgo(4) },
  act_03: { id: 'act_03', action: 'ambulance_assigned', detail: 'Rapid Response 2 dispatched', createdAt: minutesAgo(3) },
  act_04: { id: 'act_04', action: 'drone_assigned', detail: 'Falcon-1 launched for aerial search', createdAt: minutesAgo(2) },
  act_05: { id: 'act_05', action: 'profile_updated', detail: 'Priya Sharma updated their profile', createdAt: minutesAgo(1) },
};

async function seed() {
  console.log('Seeding Firebase Realtime Database…');
  console.log('Database URL:', firebaseConfig.databaseURL);

  await set(ref(db, 'rescue_teams'), rescueTeams);
  console.log(`✔ rescue_teams (${Object.keys(rescueTeams).length} records)`);

  await set(ref(db, 'drone_logs'), droneLogs);
  console.log(`✔ drone_logs (${Object.keys(droneLogs).length} records)`);

  await set(ref(db, 'drones'), drones);
  console.log(`✔ drones (${Object.keys(drones).length} records)`);

  await set(ref(db, 'ambulances'), ambulances);
  console.log(`✔ ambulances (${Object.keys(ambulances).length} records)`);

  await set(ref(db, 'hospitals'), hospitals);
  console.log(`✔ hospitals (${Object.keys(hospitals).length} records)`);

  await set(ref(db, 'emergencies'), emergencies);
  console.log(`✔ emergencies (${Object.keys(emergencies).length} records)`);

  await set(ref(db, 'activity_logs'), activityLogs);
  console.log(`✔ activity_logs (${Object.keys(activityLogs).length} records)`);

  console.log('\nSeed complete. Admin dashboard pages should now show live data.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
