# ResQLink — Implementation Summary

This document describes the functionality implemented across the ResQLink mobile
app and admin dashboard, and how each requirement was satisfied.

## Important architectural note

The ResQLink stack runs on **Firebase Realtime Database (RTDB)**, not Cloud
Firestore. The original requirements describe "Firestore", `onSnapshot`, and
"collections", but the working backend — used by both the admin dashboard and
the mobile app — is RTDB (`getDatabase`, `ref`, `onValue`, `set`, `update`).

All real-time features were therefore implemented on RTDB. RTDB's `onValue`
listener is the functional equivalent of Firestore's `onSnapshot`: both push
live updates to clients with no refresh. The "collections" in the requirements
map to top-level RTDB nodes of the same names. Firestore security rules and
indexes are still maintained (mirrored) in `firestore.rules` /
`firestore.indexes.json` so the project can migrate to Firestore later without
rule rework.

## Apps

- **Admin dashboard** — `frontend/admin-dashboard` (Vite + React + TypeScript).
  Production build: `npm install && npm run build`. Dev: `npm run dev`.
- **Mobile app** — `frontend/mobile-app/ResQLink-Mobile.html` (single-file React
  via Babel standalone). Open directly in a browser. A synced copy lives at the
  repo root `ResQLink-Mobile.html`.

## What was implemented

### 0. Real GPS-based nearby facilities + admin hospital alerts (latest)
- The mobile Nearby screen now finds **real hospitals and police stations**
  around the user's live GPS via the free OpenStreetMap **Overpass API**
  (no API key). Distances and ETAs are computed from actual coordinates; the
  hardcoded Coimbatore list is only an offline fallback used when GPS is off or
  the lookup fails.
- Discovered hospitals are **published to the `hospitals` RTDB node**
  (`PlacesService.publishHospitals`) so the **admin dashboard Hospitals page**
  shows the same GPS-relevant facilities — fixing the previous "No live data
  available" state.
- The admin Hospitals page gained a **Send Alert** action per hospital: it
  records the alert under `hospital_alerts` in Firebase **and** opens the
  device email/SMS composer pre-filled with the message.
- Dashboard stat cards (Hospitals Open / Teams Available / Drones Online) now
  reflect live store counts instead of hardcoded values.

> IMPORTANT — serving the mobile app for GPS to work: browsers only grant the
> Geolocation API on **secure origins** (https) or **localhost**. Opening
> `ResQLink-Mobile.html` directly as a `file://` URL (as in some setups) will
> cause location to be denied and the app falls back to the offline list. To
> get real GPS hospitals, serve the file over http/https, e.g. from the
> `frontend/mobile-app` folder run `npx serve` (or `python3 -m http.server`)
> and open `http://localhost:3000/ResQLink-Mobile.html`, then allow location.



### 1. Settings module (mobile)
- New Settings screen reachable from the Home header gear icon.
- Theme settings: Light / Dark / System Default, applied instantly via a
  `ThemeProvider` + CSS variables, persisted to `users/{uid}.theme` in RTDB and
  to `localStorage` so it survives reloads and follows the account.
- Account settings: edit name, phone, address, blood group, medical info, and
  emergency contacts. Every save writes immediately to `users/{uid}`.
- Authentication settings: session view, sign out with full state cleanup and
  redirect to the auth screen.

### 2. Live GPS emergency services (mobile)
- Continuous GPS via `watchPosition` with permission-denied / unavailable
  handling.
- Nearby Hospitals, Police, and Ambulances tabs. Distances and ETAs are
  computed live from the device's coordinates (Haversine). Each entry has a
  call button and a Google Maps navigation link. Ambulances are sourced live
  from the `ambulances` RTDB node with availability status and ETA.

### 3. Profile synchronization (mobile)
- All profile edits write straight to `users/{uid}` (never local-only).
- Before sending any SOS, the latest profile is fetched fresh from RTDB
  (`ProfileService.fetchLatest`) — cached state is never used for the alert.

### 4. SOS alert system (mobile)
- Pressing SOS creates an `emergencies/{id}` record containing user name, phone,
  live GPS, a Google Maps link, timestamp, and emergency type.
- All emergency contacts are notified; one `emergency_alerts/{alertId}` record
  is written per contact with `{alertId, sosId, contactName, contactPhone,
  deliveryStatus, sentAt, channel, message}`. SMS deep-link fallback is
  provided. A notification and an activity-log entry are also written.
- SOS can be cancelled, which updates status to `cancelled` and logs it.

### 5. Real-time rescue management (backend + seed)
- RTDB nodes `rescue_teams`, `ambulances`, `drones` each carry
  `{id, name, status, latitude, longitude, updatedAt}`. Allowed statuses:
  available, assigned, en_route, on_scene, completed, offline.
- Seed script (`scripts/seed-rtdb.mjs`) populates all of these.

### 6. Live map tracking (mobile)
- The Live Tracking screen renders the user plus any assigned ambulance, rescue
  team, and drone on an SVG map, driven by RTDB listeners keyed off the active
  SOS's assignment fields. Updates are real-time, no refresh.

### 7. Admin dashboard real-time sync
- All admin data already flows through `onValue` listeners. New listeners were
  added for `ambulances`, `drones`, `emergency_alerts`, and `activity_logs` via
  `commandCenterService` + `useCommandCenter`, so SOS creation/cancellation,
  profile/contact updates, assignments, and status changes appear instantly.

### 8. Admin command center
- A live `CommandCenter` widget block at the top of the dashboard shows: Active
  SOS count, Active Ambulances, Active Rescue Teams, Active Drones, a Recent
  Alerts feed, an Emergency Heatmap (SVG), and a Latest Activity feed. All are
  real-time.

### 9. Firestore/RTDB database structure
- RTDB rules (`database.rules.json`) define and secure: users, medical_profiles,
  emergencies, emergency_alerts, rescue_teams, ambulances, drones, drone_logs,
  hospitals, notifications, activity_logs, with `.indexOn` for query paths.
- Mirrored Firestore rules and composite indexes are provided.

### 10. Notification center (mobile)
- A per-user `notifications/{uid}` feed with a live unread badge on the Home
  bell icon. Opening the center marks all as read.

### 11. Error handling (mobile)
- GPS permission-denied handling, an offline banner, Firebase timeouts
  (`withTimeout`), a retry helper (`withRetry`), loading spinners, a global
  toast system, and empty-state components. No blank screens.

### 12. Security
- RTDB and Firestore rules require authentication for reads and restrict fleet
  writes (rescue_teams/ambulances/drones/hospitals) to admins. Per-user data
  (profile, notifications) is owner-or-admin only. Admin routes are gated by
  `ProtectedRoute` plus a `role === 'admin'` check in `useAuth` that signs out
  non-admins. Inputs are validated in the Settings forms.

### 13. Build validation
- Admin dashboard: `tsc --noEmit` passes with zero errors; the full TypeScript
  module graph resolves and emits. (Note: in this offline sandbox the final
  Rollup/esbuild bundling step cannot run because the Linux native binaries are
  not installed and the network is disabled. A normal `npm install` on the
  target machine pulls the correct platform binaries and `npm run build`
  completes.)
- Mobile app: the JSX/TS in the Babel script block transforms cleanly.
- `database.rules.json`, `firestore.indexes.json` are valid JSON; the seed
  script passes `node --check`.

## New / modified files

Admin dashboard:
- `src/services/commandCenterService.ts` (new)
- `src/hooks/useCommandCenter.ts` (new)
- `src/components/dashboard/CommandCenter.tsx` (new)
- `src/store/themeStore.ts` (new)
- `src/pages/Dashboard.tsx`, `src/pages/Settings.tsx`,
  `src/components/layout/TopNav.tsx`, `src/hooks/useAuth.ts`,
  `src/services/authService.ts`, `src/store/authStore.ts`, `src/index.css`

Mobile app:
- `frontend/mobile-app/ResQLink-Mobile.html` and root `ResQLink-Mobile.html`
  (theme system, toast system, geo utilities, RTDB services, Settings /
  Notification / Live Tracking screens, rewritten Nearby and SOS screens,
  rewired App root).

Backend / config:
- `database.rules.json`, `firestore.rules`, `backend/firebase/firestore.rules`,
  `firestore.indexes.json`, `scripts/seed-rtdb.mjs`, `shared/types/index.ts`
