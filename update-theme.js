// update-theme.js - Run this after replacing logo1.png to update the theme color
// Usage: node update-theme.js
// This reads logo1.png, extracts the dominant color, and updates index.html

const fs = require('fs');
const path = require('path');

// Simple PNG decoder for pixel data extraction
function readPNG(filePath) {
    const { createCanvas, loadImage } = (() => {
        try {
            return require('canvas');
        } catch {
            return { createCanvas: null, loadImage: null };
        }
    })();

    if (createCanvas && loadImage) {
        return loadImage(filePath).then(img => {
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            return ctx.getImageData(0, 0, img.width, img.height);
        });
    }

    // Fallback: use raw PNG parsing for basic images
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(filePath);
        // Use a simple approach: shell out to PowerShell to extract colors
        const { execSync } = require('child_process');
        
        try {
            const ps = `
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('${filePath.replace(/'/g, "''")}')
$colors = @{}
$step = [Math]::Max(1, [Math]::Floor($bmp.Width * $bmp.Height / 10000))
for ($y = 0; $y -lt $bmp.Height; $y += $step) {
    for ($x = 0; $x -lt $bmp.Width; $x += $step) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -lt 128) { continue }
        if ($c.R -lt 30 -and $c.G -lt 30 -and $c.B -lt 30) { continue }
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) { continue }
        $qr = [Math]::Round($c.R / 8) * 8
        $qg = [Math]::Round($c.G / 8) * 8
        $qb = [Math]::Round($c.B / 8) * 8
        $key = "$qr,$qg,$qb"
        if ($colors.ContainsKey($key)) { $colors[$key]++ } else { $colors[$key] = 1 }
    }
}
$bmp.Dispose()
$max = 0; $dominant = ''
foreach ($k in $colors.Keys) { if ($colors[$k] -gt $max) { $max = $colors[$k]; $dominant = $k } }
Write-Output $dominant
`;
            const result = execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
                encoding: 'utf-8',
                timeout: 30000
            }).trim();
            
            resolve(result);
        } catch (e) {
            reject(new Error('Failed to extract color. Install "canvas" package or ensure PowerShell is available.\n' + e.message));
        }
    });
}

async function main() {
    const dir = __dirname;
    const logoPath = path.join(dir, 'logo1.png');
    const htmlPath = path.join(dir, 'index.html');

    if (!fs.existsSync(logoPath)) {
        console.error('❌ logo1.png not found in', dir);
        process.exit(1);
    }
    if (!fs.existsSync(htmlPath)) {
        console.error('❌ index.html not found in', dir);
        process.exit(1);
    }

    console.log('🔍 Extracting dominant color from logo1.png...');
    
    let color;
    try {
        color = await readPNG(logoPath);
    } catch (e) {
        console.error('❌', e.message);
        process.exit(1);
    }

    if (!color) {
        console.error('❌ Could not extract a dominant color');
        process.exit(1);
    }

    const [r, g, b] = color.split(',').map(s => parseInt(s.trim()));
    const darkR = Math.max(0, Math.floor(r * 0.8));
    const darkG = Math.max(0, Math.floor(g * 0.8));
    const darkB = Math.max(0, Math.floor(b * 0.8));

    console.log(`🎨 Dominant color: rgb(${r}, ${g}, ${b})`);
    console.log(`🎨 Dark variant:   rgb(${darkR}, ${darkG}, ${darkB})`);

    // Update index.html
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    const accentRegex = /--accent:\s*[\d\s,]+;/;
    const accentDarkRegex = /--accent-dark:\s*[\d\s,]+;/;

    if (accentRegex.test(html) && accentDarkRegex.test(html)) {
        html = html.replace(accentRegex, `--accent: ${r}, ${g}, ${b};`);
        html = html.replace(accentDarkRegex, `--accent-dark: ${darkR}, ${darkG}, ${darkB};`);
        fs.writeFileSync(htmlPath, html, 'utf-8');
        console.log('✅ Updated index.html with new theme colors!');
        console.log('   You can now open index.html directly (file://) and the colors will be correct.');
    } else {
        console.error('❌ Could not find --accent or --accent-dark in index.html');
        console.log('   Add this to your <style> block:');
        console.log(`   --accent: ${r}, ${g}, ${b};`);
        console.log(`   --accent-dark: ${darkR}, ${darkG}, ${darkB};`);
    }
}

main();
