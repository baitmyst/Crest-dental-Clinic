const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create the ultimate Dr. Dental Crest Favicon SVG
// Combines a medical emerald-to-ocean gradient, a pristine dental tooth silhouette, and a radiant 4-point crest star
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <!-- Brand Gradient: Sky Cyan to Dental Emerald -->
    <linearGradient id="crest-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="55%" stop-color="#029986" />
      <stop offset="100%" stop-color="#08c068" />
    </linearGradient>

    <!-- Tooth Bright Pearl Gradient -->
    <linearGradient id="tooth-pearl" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f0fdf9" />
      <stop offset="100%" stop-color="#e0f4fc" />
    </linearGradient>

    <!-- Radiance Sparkle Gradient -->
    <linearGradient id="sparkle-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#bae6fd" />
    </linearGradient>

    <!-- Drop Shadow for Depth -->
    <filter id="tooth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#022a27" flood-opacity="0.32" />
    </filter>
  </defs>

  <!-- Background App Tile / Shield Badge -->
  <rect width="64" height="64" rx="15" fill="url(#crest-gradient)" />

  <!-- Crisp Inner Rim Glow -->
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.3" />

  <!-- Symmetrical, Elegant Tooth Silhouette -->
  <path
    d="M 21.5 16.5
       C 15.5 16.5, 12 20.5, 12 26
       C 12 30.5, 14 34.5, 16.5 38.8
       C 18.8 42.5, 20.6 47, 21.8 51
       C 22.5 53.2, 25.2 53.2, 25.9 51
       C 27.2 46.5, 28.8 42, 32 42
       C 35.2 42, 36.8 46.5, 38.1 51
       C 38.8 53.2, 41.5 53.2, 42.2 51
       C 43.4 47, 45.2 42.5, 47.5 38.8
       C 50 34.5, 52 30.5, 52 26
       C 52 20.5, 48.5 16.5, 42.5 16.5
       C 38.2 16.5, 35.2 19.5, 32 19.5
       C 28.8 19.5, 25.8 16.5, 21.5 16.5 Z"
    fill="url(#tooth-pearl)"
    filter="url(#tooth-shadow)"
  />

  <!-- Subtle Polish Shimmer Arc -->
  <path
    d="M 18 24.5
       C 16.8 27.5, 17.2 31.5, 19 35"
    fill="none"
    stroke="#ffffff"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-opacity="0.85"
  />

  <!-- Brilliant Dental Crest Sparkle (4-point Diamond Star) -->
  <path
    d="M 46.5 7.5
       C 46.5 11.5, 48 13.5, 52 13.5
       C 48 13.5, 46.5 15.5, 46.5 19.5
       C 46.5 15.5, 45 13.5, 41 13.5
       C 45 13.5, 46.5 11.5, 46.5 7.5 Z"
    fill="url(#sparkle-glow)"
  />
  <circle cx="46.5" cy="13.5" r="1.3" fill="#ffffff" />

  <!-- Gentle secondary highlight starlet -->
  <circle cx="15.5" cy="19.5" r="1" fill="#ffffff" opacity="0.9" />
</svg>`;

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const dirEntries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map(img => img.buffer)]);
}

async function buildAllIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');

  // 1. Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg.trim());
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svg.trim());
  console.log('✓ Written favicon.svg to public/ and src/app/');

  // 2. Generate PNGs at all required standard sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16, dir: publicDir },
    { name: 'favicon-32x32.png', size: 32, dir: publicDir },
    { name: 'favicon-48x48.png', size: 48, dir: publicDir },
    { name: 'apple-touch-icon.png', size: 180, dir: publicDir },
    { name: 'apple-icon.png', size: 180, dir: appDir },
    { name: 'android-chrome-192x192.png', size: 192, dir: publicDir },
    { name: 'android-chrome-512x512.png', size: 512, dir: publicDir },
  ];

  const buffers = {};
  for (const item of sizes) {
    const buf = await sharp(Buffer.from(svg))
      .resize(item.size, item.size)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(item.dir, item.name), buf);
    buffers[item.size] = buf;
    console.log(`✓ Generated ${item.name} (${item.size}x${item.size})`);
  }

  // 3. Generate multi-resolution favicon.ico (16, 32, 48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: buffers[16] },
    { width: 32, height: 32, buffer: buffers[32] },
    { width: 48, height: 48, buffer: buffers[48] },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated multi-resolution favicon.ico for public/ and src/app/');

  // 4. Create site.webmanifest for mobile browsers & PWA support
  const manifest = {
    name: "Dr. Dental Crest Surgery Kampala",
    short_name: "Dental Crest",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#08c068",
    background_color: "#ffffff",
    display: "standalone"
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✓ Generated site.webmanifest');
}

buildAllIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
