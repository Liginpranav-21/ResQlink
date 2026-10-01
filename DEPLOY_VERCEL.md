# Deploy ResQLink to Vercel

The mobile app (`frontend/mobile-app`, Expo / React Native) is built for the web
with `expo export -p web`. You get an installable web app (PWA) that runs in any
phone browser and talks to the same Firebase backend as the Android build.

## Option A: Vercel dashboard (easiest)

1. Push this folder to a GitHub repository.
2. On https://vercel.com, click **Add New → Project** and import the repo.
3. Leave **Root Directory** as the repo root. The root `vercel.json` already
   sets the install command, build command and output folder.
   - Framework Preset: **Other**
   - Build / output settings: leave them empty (they come from `vercel.json`)
4. Click **Deploy**. The first build takes about 2 minutes.

> You can also set **Root Directory = `frontend/mobile-app`**. That folder has
> its own `vercel.json`, so either choice works.

## Option B: Vercel CLI

```bash
npm i -g vercel
cd ResQlink-4            # repo root
vercel                   # first time: answer the prompts, accept the defaults
vercel --prod            # production deploy
```

## Test locally before deploying

```bash
cd frontend/mobile-app
npm ci                   # first time only
npm run serve:web        # builds if needed, then open http://localhost:3000
```

If you change code, run `npm run build:web` again before `serve:web`.
Running `npx serve dist` on its own, without a build, returns
**404 for every page** because the zip ships without `dist/`.


## After the first deploy (one-time Firebase checks)

Firebase project: `resqlink-862d5`

1. **Authentication → Sign-in method → Email/Password**: must be **Enabled**.
2. **Realtime Database rules**: deploy `database.rules.json`
   (`firebase deploy --only database`).
3. **If you restricted the API key** in Google Cloud Console (HTTP referrers),
   add `https://<your-project>.vercel.app/*` to the allowed referrers.
   Otherwise sign-in will fail on the deployed site.

## Install on a phone

Open the Vercel URL in the phone's browser:
- **Android / Chrome**: menu → **Add to Home screen / Install app**
- **iPhone / Safari**: Share → **Add to Home Screen**

The app then opens full-screen with the ResQLink icon. After the first visit, the
app shell loads even with no network, and the SMS fallback and 112 dial still work.
GPS needs HTTPS, which Vercel provides automatically.

## What was fixed for the web / Vercel build

| Problem | Fix |
|---|---|
| Firebase auth used a React-Native-only persistence API, which broke session restore in the browser | `src/firebase/config.ts` uses IndexedDB/localStorage persistence on web |
| Alert pop-ups (save profile, SMS errors, sign out of other devices) did nothing in browsers | New `src/utils/alert.ts` uses `window.alert` on web |
| "View on Maps" opened a `geo:` link that browsers can't handle | `openInGoogleMaps` goes straight to Google Maps on web |
| Offline banner never showed on web | `useOnline` uses `navigator.onLine` plus online/offline events |
| **Slow or blocked database left the user stuck on the sign-in screen after a successful login** | The profile load now times out after 8s and the user continues with defaults. Session bookkeeping runs in the background. |
| SOS failure still said "Retrying…" after the last retry | Now tells the user to use the SMS fallback or call 112 |
| Light mode: page titles and selected chips were white-on-white | Titles follow the theme, chips use solid backgrounds, and the default theme is dark (matches `app.json`) |
| Vercel won't serve files under `assets/node_modules/`, so all icons would be blank | `scripts/fix-web-assets.js` moves them to `assets/vendor/` after every build |
| No app icon / installability | Added the manifest, icons, a service worker for offline loading, and phone meta tags (`public/`) |
| Expo SDK version mismatches | `react-native` 0.74.1 → 0.74.5, `react-native-safe-area-context` 4.10.1 → 4.10.5 |


---

# Admin Dashboard and Product Website

The repo holds **three** web apps. In Vercel, each one is its own project, and
all three import the **same GitHub repo**. The only difference is the
**Root Directory** setting:

| Vercel project | Root Directory | What you get |
|---|---|---|
| ResQLink Mobile | *(repo root)* | The mobile app (installable PWA) |
| ResQLink Website | `frontend/product-website` | Landing page + `/mobile` demo + full admin dashboard at `/admin` |
| ResQLink Admin *(optional)* | `frontend/admin-dashboard` | The dashboard on its own URL (e.g. `admin-resqlink.vercel.app`) |

The website already contains the whole admin dashboard at `/admin`, so the
separate Admin project is only needed if you want the dashboard on its own
address.

## Steps (website or admin)

1. Vercel → **Add New → Project** → import the same repo again.
2. Click **Edit** next to *Root Directory* and pick the folder from the table.
3. Framework Preset: **Vite** (picked up automatically). Leave the build and
   install settings alone; each folder's `vercel.json` sets them.
4. Keep **"Include files outside the root directory in the Build Step"**
   switched **ON** (it is on by default). Both apps import code from
   `frontend/shared`, and the website also imports from `frontend/admin-dashboard`.
5. Deploy.

With the CLI: `cd frontend/product-website && vercel --prod` (same for `admin-dashboard`).

### Environment variables (optional)

No variables are required, because the Firebase web config is built in.
To point a deployment at a different Firebase project, add these in
Vercel → Project → Settings → Environment Variables:
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
`VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_DATABASE_URL`.

### Admin login

Create the admin account from the dashboard's **Create admin account** link,
or use an existing Firebase Auth user whose `users/<uid>/role` is `admin`.

## What was fixed for the website and dashboard

| Problem | Fix |
|---|---|
| `.env` files are git-ignored, so a Vercel build from GitHub used the placeholder `demo-api-key` and **admin login would fail** | `frontend/shared/src/firebase/config.ts` now falls back to the real ResQLink Firebase config, and Vercel env vars still override it. Also removed a `console.log` that printed the config. |
| **`/admin` crashed with a blank page whenever Google Fonts couldn't load** (blocked network, firewall, poor signal) | Removed the CSS `@import` of the font. The fonts now load via a `<link>` tag that can't stop the page from rendering. |
| `/mobile` (the "Launch App" button and the Live Demo phone) only worked on the dev server, and **returned the landing page in production** | The build copies `frontend/mobile-app/ResQLink-Mobile.html` into `/mobile/`, and a Vercel rewrite serves it |
| Refreshing on a sub-page like `/admin/analytics` would 404 on Vercel | Added SPA rewrites in both `vercel.json` files |
| The dashboard pointed to a missing `favicon.svg` | Added it |
| The repo-root `ResQLink-Mobile.html` is **corrupted** (a JSX line is cut off around line 1568) | Not used anywhere. The intact copy in `frontend/mobile-app/` is the one that ships. You can delete the root copy. |
| Maps showed "API KEY REQUIRED" tiles (CARTO basemaps now need a paid key) | `frontend/shared/src/components/LiveMap.tsx` uses free OpenStreetMap tiles, darkened with CSS to match the dashboard. To use another tile provider, set the `VITE_MAP_TILE_URL` environment variable. |
| Every dashboard page had a full screen of empty space above its content | The sidebar's `fixed` position was overridden by the `.hud-frame` style, so the sidebar pushed every page down. `.hud-frame` now lives in Tailwind's `@layer components` (`admin-dashboard/src/index.css`). |
