const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function createIcon(size, outputPath) {
    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, size, size);

    // Calculate proportions
    const tWidth = size * 0.5;
    const strokeWidth = size * 0.12;

    // Draw the "T" lettermark in Halabja red
    ctx.fillStyle = '#E63946';

    // Horizontal bar of T
    const barY = size * 0.2;
    const barHeight = strokeWidth;
    ctx.fillRect(size * 0.25, barY, tWidth, barHeight);

    // Vertical stem of T
    const stemX = size * 0.5 - strokeWidth / 2;
    const stemY = barY;
    const stemHeight = size * 0.6;
    ctx.fillRect(stemX, stemY, strokeWidth, stemHeight);

    // Draw "by HTS" text
    const fontSize = size * 0.06;
    ctx.fillStyle = '#2B4C7E';
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('by HTS', size / 2, size * 0.85);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created ${outputPath}`);
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate both icon sizes
createIcon(512, path.join(iconsDir, 'icon-512x512.png'));
createIcon(192, path.join(iconsDir, 'icon-192x192.png'));

console.log('Icon generation complete!');
