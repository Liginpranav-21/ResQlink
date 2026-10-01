// Copies the self-contained mobile demo (ResQLink-Mobile.html) into
// public/mobile/ so the "/mobile" link and the Live Demo phone iframe work in
// production. In `npm run dev` the vite.config.ts middleware serves it instead.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../mobile-app/ResQLink-Mobile.html');
const outDir = path.resolve(here, '../public/mobile');

if (!fs.existsSync(src)) {
  console.warn('[copy-mobile-demo] ResQLink-Mobile.html not found, /mobile will 404');
  process.exit(0);
}
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, path.join(outDir, 'index.html'));
console.log('[copy-mobile-demo] copied mobile demo -> public/mobile/index.html');
