# ResQLink — Agent Rules & Constraints

## Context

You are working inside an existing, production-ready codebase called ResQLink — AI-Powered Emergency Rescue Ecosystem. It has three parts:

1. **Mobile app** — React Native (Expo) + a synced standalone ResQLink-Mobile.html (single-file React via Babel standalone, no build step).
2. **Admin dashboard** — Vite + React + TypeScript + Tailwind, built with `npm run build`.
3. **Backend** — Firebase. Realtime Database (RTDB) is the live backend in actual use (`getDatabase`, `ref`, `onValue`, `set`, `update`). Firestore rules/indexes (`firestore.rules`, `firestore.indexes.json`) are kept in sync as a mirror for a possible future migration, but are not the live data path — don't assume `onSnapshot`/Firestore collections are what's running.

Core RTDB nodes: `users`, `medical_profiles`, `emergencies`, `emergency_alerts`, `rescue_teams`, `ambulances`, `drones`, `drone_logs`, `hospitals`, `hospital_alerts`, `notifications`, `activity_logs`, `bluetooth_signals`. Rules live in `database.rules.json`.

The project already has: Firebase Auth, GPS/live tracking, SOS dispatch (3 severity levels), nearby hospitals/police (OpenStreetMap Overpass API), emergency contacts + alert fan-out, an AI assistant (OpenAI API with demo fallback), drone/ambulance/rescue-team fleet tracking, an admin command center with a live map (Leaflet + free OSM/CARTO tiles, no API key), and analytics.

---

## Non-negotiable preservation rules

This is a targeted change, not a rewrite. Unless the task explicitly says otherwise, do NOT touch:
- Firebase config, Auth, RTDB reads/writes, Firestore mirror files, Storage, security rules
- Any hook (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks), Zustand stores, Context providers
- API calls, service files, business/emergency logic, async flows
- Navigation structure, route names, deep links
- Database schema, field names, RTDB node paths
- Function names, variable names, file names, imports

---

## Architecture Preservation (Critical)

The current ResQLink architecture is production-ready.

Do NOT:
- Change the project architecture.
- Introduce new design patterns.
- Replace existing libraries.
- Split existing screens into multiple files unless explicitly requested.
- Merge unrelated components.
- Move business logic into UI components.
- Move UI code into service files.
- Rename folders.
- Change import paths unnecessarily.
- Upgrade package versions unless required for the requested task.
- Install new dependencies unless there is no existing solution.

Always extend the existing implementation instead of replacing it.

---

## Allowed Changes

You may ONLY modify:
- JSX structure
- TSX structure
- CSS
- Tailwind classes
- React Native StyleSheet objects
- Theme tokens
- Colors
- Typography
- Shadows
- Icons
- Images
- Border Radius
- Padding
- Margin
- Glassmorphism
- Animations
- Responsive Layout
- Accessibility styling

Every existing:
- `onPress`
- `onLongPress`
- `onChange`
- `onSubmit`
- callback
- event handler
- hook
- Firebase call
- API request

must remain connected to the exact same logic.

---

## Runtime Safety Rule

Never assume runtime success.

Compilation success does NOT imply runtime success.

If runtime execution cannot be performed in the current environment, clearly state:

"Requires Manual Testing"

instead of claiming:
- Verified
- Tested
- Working
- Successful

for features involving:
- Firebase Authentication
- Firebase RTDB
- GPS
- Notifications
- Maps
- SOS
- Live Tracking
- Camera
- Bluetooth
- SMS
- Email
- Push Notifications
- Device Permissions

---

## Design System (when the task involves UI)

Follow the "Kinetic Sentinel" design tokens defined in DESIGN.md — do not invent new colors or type scales. Highlights:
- **Background/surfaces**: deep navy (`#0c1322` base, surface-container variants), glassmorphic cards at 60–80% opacity with 20px blur, 1px 10%-opacity borders
- **Primary (Emergency Red, `#ffb3b6`/`#ff5168`)**: reserved strictly for critical/SOS actions, with an outer glow when active
- **Secondary (Action Blue, `#adc6ff`/`#0566d9`)**: navigation and non-critical interactive elements
- **Tertiary (`#4ae176`)**: success/positive status (e.g. "GPS Locked")
- **Type**: Inter for UI text, JetBrains Mono (label-caps, status-numeric) for labels/coordinates/status data
- **Radius**: 24px for cards/containers, 16px for buttons/inputs, full circle for the SOS trigger
- **SOS button**: long-press (2s) to activate with a circular progress stroke; idle state has a subtle 5px glow, active state ripples
- **Nav**: floating pill-shaped bottom bar, high blur, thin-stroke icons that solid-fill when active

Reference the existing screen.png / current implementation to check what's already been applied before redoing work.

---

## Final Acceptance Criteria

The task is complete only if:
✓ Requested UI matches DESIGN.md
✓ Existing functionality remains unchanged
✓ No TypeScript errors
✓ Admin Dashboard builds successfully
✓ No broken imports
✓ No broken exports
✓ Git diff contains only intended changes
✓ No Firebase logic changes
✓ No API changes
✓ No service changes
✓ No navigation changes
✓ No database schema changes
✓ Runtime-only features are clearly marked as "Requires Manual Testing" if they cannot be executed.

---

## Task Execution Workflow

Before making any changes:

1. Read the complete file(s) related to the requested task.
2. Understand the existing implementation before editing.
3. Preserve all existing functionality.
4. Modify only the minimum amount of code required.
5. Do not introduce unrelated refactoring.
6. If the requested change would require modifying business logic, stop and explain why instead of making the change.
7. Complete one screen or one component at a time.
8. Validate the changes before proceeding to the next component.

After every change:

- Ensure there are no broken imports.
- Ensure there are no removed exports.
- Ensure no existing event handlers have changed.
- Ensure all Firebase interactions remain identical.
- Ensure all API requests remain identical.
- Ensure navigation remains unchanged.
- Ensure TypeScript compilation succeeds.
- Ensure Admin Dashboard builds successfully.

---

## Deliverable

When the task is complete, provide:

### Files Changed

List every modified file with a one-line explanation.

Example:

`frontend/mobile-app/src/screens/Home/HomeScreen.tsx`
Reason: Updated layout and styling to match Kinetic Sentinel design.

---

### Classification

For every modified file classify it as:

- UI-only
- Configuration
- Documentation
- Logic

If any file required logic changes, explain why.

---

### Verification

Include actual command outputs where available.

Show:

- `npx tsc --noEmit`
- `npm run build`
- `git diff --stat`

Do not claim successful execution unless the commands were actually run.

---

### Manual Testing Required

If runtime testing cannot be performed, clearly list the features requiring manual verification, including:

- Authentication
- SOS
- GPS
- Nearby Services
- Live Tracking
- Notifications
- Firebase Read/Write
- Admin Dashboard Synchronization
- Device Permissions

Do not mark these as "Verified" unless they were actually executed.

---

### Final Summary

Briefly summarize:

- What changed
- What remained unchanged
- Compilation/build status
- Remaining manual validation tasks
