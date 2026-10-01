# ResQLink Mobile — Run Guide (Live Firebase backend)

React Native (Expo) build of ResQLink. It runs entirely against your Firebase
project `resqlink-862d5` — there is no demo mode. Auth and every read/write go
to live Firebase Authentication + Realtime Database.

## How to run

Requires Node.js 18+.

```bash
cd frontend/mobile-app
npm install
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator), or scan the QR code
with the Expo Go app on a physical phone.

## Firebase project checklist (must be done once, in the Firebase console)

The app will not work until these are configured in
https://console.firebase.google.com → project `resqlink-862d5`:

1. **Enable Email/Password sign-in**
   Authentication → Sign-in method → Email/Password → Enable.
   Without this, register/login fails with `auth/operation-not-allowed`.

2. **Realtime Database exists and rules are deployed**
   The database URL is the Singapore instance:
   `resqlink-862d5-default-rtdb.asia-southeast1.firebasedatabase.app`.
   Deploy the rules in the repo root (`database.rules.json`). Every node
   requires `auth != null`, so an unauthenticated app gets permission-denied —
   that is expected; sign in first.

3. **(Recommended) Restrict the API key**
   The Web API key is embedded in the client (this is normal for Firebase —
   security comes from the database rules, not the key). In Google Cloud
   console you can restrict it to your app's bundle IDs:
   iOS `com.resqlink.mobile`, Android `com.resqlink.mobile`.

## What runs where

- **Sign up / sign in** → Firebase Auth. New users get a `users/$uid` record.
- **Session** → persisted via AsyncStorage; you stay logged in across restarts.
  On launch the app shows a splash, restores the session, loads your profile.
- **Send SOS** → writes to `emergencies/$id`, queues `emergency_alerts/*` for
  each emergency contact, pushes a `notifications/$uid/*` entry, and logs to
  `activity_logs/*`. These are the same nodes your admin dashboard reads.
- **Profile** → blood group + emergency contacts saved to `users/$uid`.

## Verifying it talks to Firebase

1. Register a new account in the app.
2. In the Firebase console → Authentication → Users, the new user appears.
3. Realtime Database → Data, a `users/<uid>` node appears.
4. Send an SOS → an `emergencies/<id>` node appears with status `active`.

If any of these don't show up, check the Metro logs in your terminal — the
service layer logs the exact Firebase error.

## SOS without network

The SOS screen has a "Send emergency SMS" button: it opens your phone's
Messages app pre-filled with your name, emergency type, and a Google Maps
location link. SMS often gets through on weak cell signal where mobile data
does not. With no cell signal at all, nothing can transmit — true offline SOS
needs satellite messaging (a phone OS feature) or a Bluetooth mesh, which is
future native work.

## Optional: real offline detection

```bash
npx expo install @react-native-community/netinfo
```
Enables the live offline banner. Without it the app assumes it is online.
