const fs = require('fs');
const path = require('path');

// Simple script to create placeholder PNG icons
// In production, you would use a proper SVG to PNG converter

const createPlaceholderIcon = (size) => {
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size / 5}" fill="#0a0a0a"/>
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" rx="${size / 6}" fill="url(#gradient)"/>

  <!-- Car body -->
  <rect x="${size * 0.34}" y="${size * 0.36}" width="${size * 0.31}" height="${size * 0.43}" rx="${size * 0.04}" fill="#ff1744"/>
  <rect x="${size * 0.37}" y="${size * 0.39}" width="${size * 0.26}" height="${size * 0.14}" rx="${size * 0.03}" fill="#64b5f6"/>

  <!-- Wheels -->
  <circle cx="${size * 0.39}" cy="${size * 0.47}" r="${size * 0.04}" fill="#212121"/>
  <circle cx="${size * 0.60}" cy="${size * 0.47}" r="${size * 0.04}" fill="#212121"/>
  <circle cx="${size * 0.39}" cy="${size * 0.73}" r="${size * 0.04}" fill="#212121"/>
  <circle cx="${size * 0.60}" cy="${size * 0.73}" r="${size * 0.04}" fill="#212121"/>

  <!-- Headlights -->
  <rect x="${size * 0.37}" y="${size * 0.75}" width="${size * 0.08}" height="${size * 0.02}" rx="${size * 0.01}" fill="#ffeb3b"/>
  <rect x="${size * 0.55}" y="${size * 0.75}" width="${size * 0.08}" height="${size * 0.02}" rx="${size * 0.01}" fill="#ffeb3b"/>

  <defs>
    <linearGradient id="gradient" x1="${size / 2}" y1="${size * 0.08}" x2="${size / 2}" y2="${size * 0.92}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2c2c2c"/>
      <stop offset="1" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
</svg>`;

  return svgContent;
};

// Create icon files
const publicDir = path.join(__dirname, '..', 'public');

// Generate SVG icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png.svg'), createPlaceholderIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png.svg'), createPlaceholderIcon(512));

console.log('Icon placeholders generated! For production, convert SVG to PNG using a proper tool.');
console.log('You can use: npx @squoosh/cli --mozjpeg auto icon-*.svg -d public/');
