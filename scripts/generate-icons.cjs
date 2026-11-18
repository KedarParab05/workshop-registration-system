/**
 * Kaushalya PWA Icon Generator
 * Generates beautiful PNG icons using pure Node.js (no native deps)
 * Uses SVG → canvas via sharp (bundled with vite-plugin-pwa deps)
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Beautiful SVG logo — dark green gradient + stylised "K" + accent dot
function makeSVG(size, maskable = false) {
  const pad = maskable ? 0 : Math.round(size * 0.08);
  const inner = size - pad * 2;
  const r = maskable ? 0 : Math.round(size * 0.18);
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(size * 0.44);
  const dotR = Math.round(size * 0.042);
  const dotY = Math.round(size * 0.715);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2e14"/>
      <stop offset="100%" stop-color="#165a2d"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="${Math.round(size*0.015)}" stdDeviation="${Math.round(size*0.025)}" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Subtle shine overlay -->
  <rect x="${pad}" y="${pad}" width="${inner}" height="${Math.round(inner*0.5)}" rx="${r}" ry="${r}" fill="url(#shine)"/>

  <!-- Decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(size*0.36)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${Math.round(size*0.012)}"/>

  <!-- Letter K -->
  <text
    x="${cx}"
    y="${Math.round(cy + fontSize * 0.36)}"
    font-family="'Segoe UI', 'Arial Black', Arial, sans-serif"
    font-weight="800"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
    filter="url(#shadow)"
    letter-spacing="-${Math.round(size*0.01)}"
  >K</text>

  <!-- Green accent dot -->
  <circle cx="${cx}" cy="${dotY}" r="${dotR}" fill="#4ade80"/>
  <circle cx="${cx}" cy="${dotY}" r="${Math.round(dotR*0.5)}" fill="rgba(255,255,255,0.4)"/>
</svg>`;
}

// Write SVG files
const sizes = [
  { size: 512, name: 'icon-512.png', maskable: false },
  { size: 192, name: 'icon-192.png', maskable: false },
  { size: 512, name: 'icon-maskable-512.png', maskable: true },
  { size: 192, name: 'icon-maskable-192.png', maskable: true },
  { size: 180, name: '../apple-touch-icon.png', maskable: false },
  { size: 32,  name: '../favicon-32.png', maskable: false },
];

for (const { size, name, maskable } of sizes) {
  const svg = makeSVG(size, maskable);
  const svgPath = path.join(outDir, name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG written: ${svgPath}`);
}

console.log('\nSVG icons generated! Now converting to PNG with sharp...');

// Try sharp for PNG conversion
try {
  const sharp = require('sharp');
  const promises = sizes.map(async ({ size, name, maskable }) => {
    const svgPath = path.join(outDir, name.replace('.png', '.svg'));
    const pngPath = path.join(outDir, name);
    const svg = fs.readFileSync(svgPath);
    await sharp(svg).resize(size, size).png().toFile(pngPath);
    console.log(`✓ PNG: ${pngPath}`);
  });
  Promise.all(promises).then(() => console.log('\n✅ All icons generated!')).catch(console.error);
} catch(e) {
  console.log('sharp not available — SVG icons saved. They will be converted during Vite PWA build.');
}
