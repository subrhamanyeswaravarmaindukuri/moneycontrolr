Add-Type -AssemblyName System.Drawing

$files = @(
    "favicon.ico",
    "favicon-48x48.png",
    "favicon-96x96.png",
    "favicon-192x192.png",
    "apple-touch-icon.png",
    "icon-512x512.png"
)

foreach ($f in $files) {
    $path = Join-Path "public" $f
    if (Test-Path $path) {
        $img = [System.Drawing.Image]::FromFile($path)
        Write-Host "$f : $($img.Width)x$($img.Height) ($((Get-Item $path).Length) bytes)"
        $img.Dispose()
    } else {
        Write-Host "MISSING: $f"
    }
}
