import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Matte Black & Silver embossed "P" SVG with MRG style
const svgStandard = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e222b"/>
      <stop offset="45%" stop-color="#12151b"/>
      <stop offset="100%" stop-color="#080a0d"/>
    </linearGradient>
    <linearGradient id="innerPlate" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#151820"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.06)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
    </linearGradient>
    <linearGradient id="pGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#e5e7eb"/>
      <stop offset="60%" stop-color="#9ca3af"/>
      <stop offset="85%" stop-color="#4b5563"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <filter id="embossFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-6" dy="-8" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.4"/>
      <feDropShadow dx="14" dy="18" stdDeviation="10" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Outer Rounded Plate -->
  <rect x="24" y="24" width="464" height="464" rx="110" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="6"/>

  <!-- Inner Recessed Plate -->
  <rect x="54" y="54" width="404" height="404" rx="85" fill="url(#innerPlate)" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>

  <!-- Embossed Italic P -->
  <g transform="skewX(-11) translate(50, 0)">
    <text
      x="240"
      y="355"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="310"
      font-weight="900"
      font-style="italic"
      text-anchor="middle"
      fill="url(#pGrad)"
      filter="url(#embossFilter)"
      letter-spacing="-6"
    >P</text>
  </g>
</svg>`;

// Maskable version with safe zone margin (padding)
const svgMaskable = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1d24"/>
      <stop offset="50%" stop-color="#111318"/>
      <stop offset="100%" stop-color="#08090c"/>
    </linearGradient>
    <linearGradient id="pGradM" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#e5e7eb"/>
      <stop offset="60%" stop-color="#9ca3af"/>
      <stop offset="85%" stop-color="#4b5563"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <filter id="embossFilterM" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-4" dy="-6" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.45"/>
      <feDropShadow dx="10" dy="14" stdDeviation="8" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Full Bleed Background for Android Cropping -->
  <rect width="512" height="512" fill="url(#bgGradM)"/>

  <!-- Centered Scaled Emblem within 80% Safe Zone -->
  <g transform="translate(64, 64) scale(0.75)">
    <rect x="24" y="24" width="464" height="464" rx="100" fill="#14171e" stroke="rgba(255,255,255,0.12)" stroke-width="8"/>
    <g transform="skewX(-11) translate(50, 0)">
      <text
        x="240"
        y="355"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="310"
        font-weight="900"
        font-style="italic"
        text-anchor="middle"
        fill="url(#pGradM)"
        filter="url(#embossFilterM)"
        letter-spacing="-6"
      >P</text>
    </g>
  </g>
</svg>`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);
  console.log('Created icon.svg');

  await sharp(Buffer.from(svgStandard))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  await sharp(Buffer.from(svgStandard))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  await sharp(Buffer.from(svgStandard))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
}

run().catch(console.error);
