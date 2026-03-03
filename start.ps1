# start.ps1 - Start Agentic AI Platform
Write-Host "🚀 Starting Agentic AI Platform..." -ForegroundColor Cyan

# Check if we're in the right directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Check for required directories
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend folder not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Frontend folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Directory structure looks good!" -ForegroundColor Green

# Show instructions
Write-Host "`n🎯 FOLLOW THESE STEPS:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

Write-Host "`n📦 STEP 1: Install Backend Dependencies" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   pip install -r requirements.txt" -ForegroundColor White

Write-Host "`n📦 STEP 2: Install Frontend Dependencies" -ForegroundColor Yellow
Write-Host "   cd ..\frontend" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White

Write-Host "`n🚀 STEP 3: Open 3 PowerShell Windows:" -ForegroundColor Green

Write-Host "`n📡 WINDOW 1 - Backend (Run this):" -ForegroundColor Cyan
Write-Host "   cd $currentDir\backend" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host "   (Should see: 'Starting Agentic AI Platform...')" -ForegroundColor Gray

Write-Host "`n🌐 WINDOW 2 - Frontend (Run this):" -ForegroundColor Cyan
Write-Host "   cd $currentDir\frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   (Should see: 'ready started server on localhost:3000')" -ForegroundColor Gray

Write-Host "`n🔧 WINDOW 3 - Testing/Commands (Stay here):" -ForegroundColor Cyan
Write-Host "   You're already in this window!" -ForegroundColor White

Write-Host "`n🔗 TEST CONNECTIONS:" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3000" -ForegroundColor White

Write-Host "`n✅ Platform will be ready in 5 minutes!" -ForegroundColor Green
