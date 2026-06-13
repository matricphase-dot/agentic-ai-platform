$ErrorActionPreference = "Stop"

$ngrokZip = "ngrok-v3-stable-windows-amd64.zip"
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"

if (-Not (Test-Path "ngrok.exe")) {
    Write-Host "Downloading Ngrok for permanent static URLs..."
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $ngrokZip
    Write-Host "Extracting Ngrok..."
    Expand-Archive -Path $ngrokZip -DestinationPath "." -Force
    Remove-Item $ngrokZip
    Write-Host "Ngrok installed successfully!"
} else {
    Write-Host "Ngrok is already installed."
}

Write-Host "================================================================"
Write-Host "NEXT STEPS:"
Write-Host "1. Go to https://dashboard.ngrok.com and sign up for free."
Write-Host "2. Get your Authtoken and run: .\ngrok.exe config add-authtoken <YOUR_TOKEN>"
Write-Host "3. Go to Cloud Edge -> Domains on the dashboard and claim your 1 free static domain."
Write-Host "4. Edit 'start-ngrok-hidden.vbs' and paste your new static domain."
Write-Host "5. Double click 'start-ngrok-hidden.vbs' to start it invisibly!"
Write-Host "================================================================"
