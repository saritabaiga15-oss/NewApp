const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distPath = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
  console.log('[compress-dist] No dist folder found. Skipping compression.');
  process.exit(0);
}

const compressibleExts = new Set(['.js', '.css', '.html', '.svg', '.json', '.ttf', '.map']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (compressibleExts.has(ext)) {
        try {
          const content = fs.readFileSync(fullPath);
          // Only compress if >= 256 bytes
          if (content.length >= 256) {
            const gzipped = zlib.gzipSync(content, { level: 9 });
            fs.writeFileSync(`${fullPath}.gz`, gzipped);
          }
        } catch (e) {
          console.warn(`[compress-dist] Could not compress ${fullPath}:`, e.message);
        }
      }
    }
  }
}

console.log('[compress-dist] Pre-compressing static assets in dist/ with gzip (level 9)...');
walk(distPath);
console.log('[compress-dist] Pre-compression complete.');

