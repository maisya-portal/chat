const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcImage = path.resolve('C:\\Users\\Ponpes Imam Syafii\\.gemini\\antigravity-ide\\brain\\bcaec46f-16a5-4f5f-9a7b-81ad6258fcc6\\maisya_pwa_icon_1790427753985.jpg');
const publicDir = path.resolve('public');
const iconsDir = path.resolve('public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy source image to public/icons/maisya-icon.jpg
fs.copyFileSync(srcImage, path.join(iconsDir, 'maisya-icon.jpg'));
fs.copyFileSync(srcImage, path.join(publicDir, 'icon-512.jpg'));

// PowerShell script to convert & resize into crisp PNGs (512x512, 192x192, 180x180, 64x64, 32x32)
const psScript = `
Add-Type -AssemblyName System.Drawing
$src = '${srcImage.replace(/\\/g, '\\\\')}'
$img = [System.Drawing.Image]::FromFile($src)

function Resize-Image($width, $height, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $destPath"
}

Resize-Image 512 512 '${path.join(iconsDir, 'icon-512.png').replace(/\\/g, '\\\\')}'
Resize-Image 512 512 '${path.join(iconsDir, 'icon-512-maskable.png').replace(/\\/g, '\\\\')}'
Resize-Image 192 192 '${path.join(iconsDir, 'icon-192.png').replace(/\\/g, '\\\\')}'
Resize-Image 180 180 '${path.join(iconsDir, 'apple-touch-icon.png').replace(/\\/g, '\\\\')}'
Resize-Image 64 64 '${path.join(iconsDir, 'favicon-64.png').replace(/\\/g, '\\\\')}'
Resize-Image 32 32 '${path.join(iconsDir, 'favicon-32.png').replace(/\\/g, '\\\\')}'
Resize-Image 192 192 '${path.join(publicDir, 'icon-192.png').replace(/\\/g, '\\\\')}'
Resize-Image 512 512 '${path.join(publicDir, 'icon-512.png').replace(/\\/g, '\\\\')}'
Resize-Image 180 180 '${path.join(publicDir, 'apple-touch-icon.png').replace(/\\/g, '\\\\')}'

$img.Dispose()
`;

fs.writeFileSync(path.resolve('scripts', 'temp-resize.ps1'), psScript);
try {
  execSync('powershell -ExecutionPolicy Bypass -File scripts/temp-resize.ps1', { stdio: 'inherit' });
  console.log('✅ Icons resized successfully!');
} catch (err) {
  console.error('Error resizing images:', err);
} finally {
  if (fs.existsSync(path.resolve('scripts', 'temp-resize.ps1'))) {
    fs.unlinkSync(path.resolve('scripts', 'temp-resize.ps1'));
  }
}
