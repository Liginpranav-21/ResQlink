# ResQLink 🚨
> "Connecting Help When Networks Fail"

AI-powered emergency rescue ecosystem — snake bites, heart attacks, landslides, floods, fires, and more.

---

## 🚀 Quick Start (3 Minutes)

### Option A — Demo Mode (No Firebase needed)
1. Open `frontend/admin-dashboard/dist/index.html` in any browser → Admin Dashboard
2. Open `frontend/mobile-app/ResQLink-Mobile.html` in any browser → Mobile App
3. Enter **any email/password** to log in — demo data is pre-loaded

### Option B — Live Firebase Mode
Follow the Firebase setup below, then open both HTML files.

---

## 🔥 Firebase Setup

### Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"** → Name: `ResQLink` → Create
3. **Authentication** → Sign-in method → Enable: Email/Password + Phone
4. **Firestore Database** → Create database → Start in test mode
5. **Storage** → Get started
6. **Project Settings** → Your apps → Add app → Web (`</>`)
7. Copy the `firebaseConfig` object shown

### Step 2 — Add Config to Both Apps

In **`frontend/admin-dashboard/dist/index.html`**, find this block near the top:
```javascript
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  ...
```
Replace all `"PASTE_YOUR_*_HERE"` values with your actual Firebase config.

Do the same in **`frontend/mobile-app/ResQLink-Mobile.html`**.

### Step 3 — Create Admin Account
1. Open admin dashboard → click "Create admin account"
2. Register with your email/password
3. Log in — demo data seeds automatically

### Step 4 — Deploy Firebase Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
# Copy content from backend/firebase/firestore.rules
firebase deploy --only firestore:rules
```

---

## 🗂 Project Structure

```
ResQLink/
├── frontend/
│   ├── admin-dashboard/
│   │   ├── dist/index.html          ← OPEN THIS for admin dashboard
│   │   └── src/                     ← Full React+TS source (Vite)
│   └── mobile-app/
│       ├── ResQLink-Mobile.html     ← OPEN THIS for mobile app
│       └── src/                     ← Full React Native source (Expo)
├── backend/
│   └── firebase/
│       ├── firestore-schema.ts      ← All collection schemas
│       └── firestore.rules          ← Security rules
└── shared/
    ├── types/index.ts               ← Shared TypeScript types
    └── constants/index.ts           ← Emergency data, first aid
```

---

## 📱 Mobile App — All Screens

| Screen | Description |
|--------|-------------|
| Splash | Logo, Get Started, Emergency Mode |
| Auth | Login, Register, Forgot Password |
| Home Dashboard | GPS status, BLE beacon, Quick actions, Drone card |
| Emergency Types | 12 emergency categories with severity levels |
| First Aid Guide | Step-by-step per emergency type |
| Smart SOS | 3-level SOS with GPS location + team dispatch |
| ResQAI Assistant | AI chat with OpenAI API or demo mode |
| BlueBeacon BLE | Offline Bluetooth emergency broadcasting |
| ResQDrone-X | Drone launch simulation with mission stages |
| Medical Profile | ICE card, blood group, contacts, medications |
| Nearby Services | Hospitals, Police, Fire stations |
| Emergency History | Timeline of all SOS events |

---

## 🖥 Admin Dashboard — All Pages

| Page | Description |
|------|-------------|
| Dashboard | Stats, live emergency feed, pie chart, bar chart, drone fleet |
| Live Emergencies | Full incident table, dispatch teams, resolve/cancel |
| Rescue Teams | Team table, status filters, member count |
| Drone Control | Launch/return drones, battery, altitude, speed |
| Victim Monitoring | Patient database, blood groups, GPS coordinates |
| Hospitals | Facility cards, bed availability, occupancy |
| Analytics | Monthly trend chart, emergency type breakdown |
| Settings | Admin profile, Firebase info |

---

## 🔧 Production Build (npm available)

```bash
# Admin Dashboard (React + Vite)
cd frontend/admin-dashboard
npm install
cp .env.example .env    # fill in Firebase config
npm run dev             # development: http://localhost:5173
npm run build           # production build → dist/

# Mobile App (Expo + React Native)
cd frontend/mobile-app
npm install
npx expo start          # scan QR with Expo Go app
npx expo build:android  # APK build
```

---

## 🤖 Enable Real AI (OpenAI)

1. Get API key from https://platform.openai.com
2. In mobile app, open **ResQAI** screen → tap ⚙️ API
3. Select "OpenAI GPT" and paste your `sk-...` key
4. AI now responds with real emergency guidance

---

## 🗄 Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | Auth profiles + roles |
| `emergencies` | All SOS events (real-time) |
| `medical_profiles` | ICE cards + contacts |
| `rescue_teams` | Team status + location |
| `hospitals` | Facility data |
| `drone_logs` | Fleet status |
| `bluetooth_signals` | BLE broadcast records |
| `incident_history` | Audit trail |
| `analytics` | Monthly aggregates |

---

## 🎯 Viva Demo Script

1. **Open mobile app** → Show Splash → Auth → Home with live GPS
2. **Select emergency type** → Snake Bite → Show first aid guide
3. **Press SOS** → Level 3 → Watch it send and confirm
4. **Open admin dashboard** → Emergency appears instantly (real-time)
5. **Dispatch team** → Status changes to "assigned" in both apps
6. **ResQAI** → Type "snake bite" → Show AI guidance
7. **BlueBeacon** → Activate → Show nearby devices
8. **Drone Control** → Launch → Watch mission simulation
9. **Analytics** → Show charts and monthly trends

---

## ✅ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Mobile**: React Native (Expo) — screens in `src/`
- **Backend**: Firebase (Auth + Firestore + Storage + FCM)
- **Charts**: Recharts
- **AI**: OpenAI API (GPT-3.5) / Demo fallback
- **Maps**: Google Maps API ready (Phase 5)
- **BLE**: Simulated (Phase 10 real implementation)
- **Deployment**: Vercel + Firebase Hosting

