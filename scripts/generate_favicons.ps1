Add-Type -AssemblyName System.Drawing

function Resize-PngImage($srcPath, $destPath, $width, $height) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $width, $height)
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Generated: $destPath ($((Get-Item $destPath).Length) bytes)"
}

Resize-PngImage "public/icon.png" "public/favicon-48x48.png" 48 48
Resize-PngImage "public/icon.png" "public/favicon-96x96.png" 96 96
Resize-PngImage "public/icon.png" "public/favicon-192x192.png" 192 192
Resize-PngImage "public/icon.png" "public/apple-touch-icon.png" 180 180
Copy-Item -Path "public/icon.png" -Destination "public/icon-512x512.png" -Force
Write-Host "Favicons generated successfully."
