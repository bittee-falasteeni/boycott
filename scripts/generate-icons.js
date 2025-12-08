#!/usr/bin/env node

/**
 * Script to generate PNG icons from SVG for iOS and Android home screen icons
 * 
 * This script converts bittee-logo.svg to various PNG sizes needed for:
 * - iOS: 180x180, 152x152, 120x120, 76x76, 60x60
 * - Android: 192x192, 512x512
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Requires: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const svgPath = path.join(publicDir, 'bittee-logo1.svg');

// Sizes needed for iOS and Android
const iconSizes = [
  { size: 60, name: 'bittee-logo1-60.png' },   // iOS iPhone
  { size: 76, name: 'bittee-logo1-76.png' },   // iOS iPad
  { size: 120, name: 'bittee-logo1-120.png' }, // iOS iPhone
  { size: 152, name: 'bittee-logo1-152.png' }, // iOS iPad
  { size: 180, name: 'bittee-logo1-180.png' }, // iOS iPhone (required)
  { size: 192, name: 'bittee-logo1-192.png' }, // Android
  { size: 512, name: 'bittee-logo1-512.png' }, // Android (required)
];

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (error) {
      console.error('Error: sharp is not installed.');
      console.error('Please install it by running: npm install --save-dev sharp');
      console.error('\nAlternatively, you can manually convert the SVG to PNG using:');
      console.error('1. Online tools like https://convertio.co/svg-png/');
      console.error('2. Image editing software like GIMP, Photoshop, or Inkscape');
      console.error('3. Command line tools like ImageMagick: convert -background none -size 180x180 bittee-logo.svg bittee-logo-180.png');
      process.exit(1);
    }

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error(`Error: SVG file not found at ${svgPath}`);
      process.exit(1);
    }

    console.log('Generating PNG icons from SVG...\n');

    // Read SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate each size
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(publicDir, name);
      
      try {
        await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✓ Generated ${name} (${size}x${size})`);
      } catch (error) {
        console.error(`✗ Failed to generate ${name}:`, error.message);
      }
    }

    console.log('\n✓ All icons generated successfully!');
    console.log(`Icons saved to: ${publicDir}`);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
