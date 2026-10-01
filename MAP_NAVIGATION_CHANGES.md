# Real-Time SOS Map & Navigation — Change Notes

This update adds live Google Maps–style navigation to the admin dashboard for
SOS triggers coming from the mobile app, a dedicated map section, and a
location-aware Hospitals tab.

## What was added

### 1. Live map engine (no API key, no install needed)
- `src/hooks/useLeaflet.ts` — loads the map library at runtime from a CDN.
  This avoids `npm install` issues and needs **no map API key** (uses free
  OpenStreetMap / CARTO dark tiles).
- `src/components/maps/LiveMap.tsx` — reusable dark-themed map: pulsing SOS
  markers, hospital/self/team markers, auto-fit to all markers, fly-to focus,
  a dashed route line, and popups. Matches the dashboard's slate theme.
- `src/hooks/useCurrentLocation.ts` — watches the admin operator's own device
  location (used as the routing origin and a "you are here" marker).
- `src/lib/geo.ts` — Haversine distance, nearest-hospital ranking, ETA
  estimates, and Google Maps directions deep-links.

### 2. SOS Navigator (new dedicated map section)  →  `/sos-navigator`
- `src/pages/SOSNavigator.tsx`
- Subscribes to `/emergencies` in real time. When a new SOS is triggered it
  appears instantly and the map auto-focuses the newest active incident.
- Shows the victim's reported GPS, the operator's live location, and a route
  line between them.
- "Navigate in Google Maps" opens real turn-by-turn directions to the SOS.
- Side list lets the operator switch focus between all active SOS triggers,
  with distance + ETA for each.

### 3. Live Emergencies — embedded incident map
- `src/pages/LiveEmergencies.tsx`
- A real-time mini-map now sits beside the feed, plotting every incident and
  focusing the selected one. Clicking a map marker selects that incident.
- Added "Navigate" and "Nearby hospitals" quick actions in the detail panel.
- Selection is now shared app-wide via the store, so the Hospitals page and
  SOS Navigator stay in sync.

### 4. Hospitals tab — nearby to the SOS location
- `src/pages/Hospitals.tsx`
- Hospitals are now ranked by straight-line distance to the **SOS-triggered
  location** (nearest first, numbered), each showing distance + road ETA.
- A map shows the SOS plus all hospitals together.
- A dropdown switches which active SOS to route hospitals around.
- "Send Alert" (SMS/email) now pre-fills the patient's name, emergency type,
  severity, and exact coordinates so the hospital gets full context. The alert
  is still recorded in Firebase (`hospital_alerts`) and logged for audit.

### 5. Misc
- `src/store/emergencyStore.ts` — added shared `selectedEmergencyId`.
- `src/App.tsx`, `Sidebar.tsx`, `TopNav.tsx` — registered the new route/nav.
- `.env` / `.env.example` — fixed the corrupted `VITE_GOOGLE_MAPS_API_KEY`
  value (it previously contained pasted sample code).

## On "Google Maps"
The in-dashboard live map uses free OpenStreetMap tiles, and real Google Maps
turn-by-turn navigation is delivered via `google.com/maps/dir` deep-links
(the same pattern the original Hospitals page used). This works out of the box
with no key. If you later want native Google Maps JS tiles, add a key to
`VITE_GOOGLE_MAPS_API_KEY` and swap the tile layer in `LiveMap.tsx` — the
component's props stay the same.

## How to run
```bash
cd frontend/admin-dashboard
npm install
npm run seed:rtdb   # optional: seeds sample Chennai emergencies + hospitals
npm run dev
```
Then open the dashboard, allow the browser location prompt (for operator
position + routing), and use the **SOS Navigator** tab. Trigger an SOS from the
mobile app and it will appear on the map in real time.
