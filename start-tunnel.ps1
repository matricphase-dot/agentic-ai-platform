$ErrorActionPreference = "Stop"

$cloudflaredUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$cloudflaredExe = ".\cloudflared.exe"

if (-Not (Test-Path $cloudflaredExe)) {
    Write-Host "Downloading cloudflared.exe (Cloudflare Tunnels) for free public access..."
    Invoke-WebRequest -Uri $cloudflaredUrl -OutFile $cloudflaredExe
    Write-Host "Download complete!"
}

Write-Host "Starting Cloudflare Quick Tunnel to Ollama (localhost:11434)..."
Write-Host "================================================================"
Write-Host "Look for the URL that looks like:  https://your-random-words.trycloudflare.com"
Write-Host "Copy that URL and add it to your Render Environment Variables as OLLAMA_URL"
Write-Host "================================================================"
Write-Host ""

& $cloudflaredExe tunnel --url http://localhost:11434
