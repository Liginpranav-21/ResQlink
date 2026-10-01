// Serves the built web app. Builds it first if dist/ is missing, so
// `npm run serve:web` never shows a wall of 404s.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const index = path.join(__dirname, '..', 'dist', 'index.html');
const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

if (!fs.existsSync(index)) {
  console.log('\n[serve-web] No build found in dist/ - building the web app first (takes ~1 min)...\n');
  run('npm run build:web');
}
run('npx --yes serve dist --single');
