// Post-build step for `expo export -p web`.
// Expo writes icon fonts to dist/assets/node_modules/... but Vercel (and many
// static hosts) refuse to serve/upload any path containing "node_modules",
// which makes every icon render as an empty box. Move them to
// dist/assets/vendor/ and rewrite references in the JS bundles.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules');
const to = path.join(dist, 'assets', 'vendor');

if (!fs.existsSync(from)) {
  console.log('[fix-web-assets] nothing to move');
  process.exit(0);
}
fs.rmSync(to, { recursive: true, force: true });
fs.renameSync(from, to);

let patched = 0;
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(js|html|json|css)$/.test(name)) {
      const src = fs.readFileSync(p, 'utf8');
      if (src.includes('/assets/node_modules/')) {
        fs.writeFileSync(p, src.split('/assets/node_modules/').join('/assets/vendor/'));
        patched++;
      }
    }
  }
};
walk(dist);
console.log(`[fix-web-assets] moved assets/node_modules -> assets/vendor, patched ${patched} file(s)`);
