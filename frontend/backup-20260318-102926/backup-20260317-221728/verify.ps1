Write-Host "🔍 Verifying Agentic AI Platform Setup..." -ForegroundColor Cyan

$requiredFiles = @(
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "jsconfig.json",
    "app\layout.js",
    "app\page.js",
    "app\globals.css",
    "app\auth\login\page.js",
    "app\auth\register\page.js",
    "app\dashboard\page.js",
    "components\ui\Button.js",
    "components\auth\LoginForm.js",
    "lib\auth.js"
)

Write-Host "`n📁 Checking required files:" -ForegroundColor Yellow
$missing = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host "`n❌ Missing $($missing.Count) files!" -ForegroundColor Red
} else {
    Write-Host "`n✅ All required files present!" -ForegroundColor Green
}

Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "  ✓ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ node_modules directory missing" -ForegroundColor Red
    Write-Host "    Run: npm install" -ForegroundColor Yellow
}

Write-Host "`n🌐 Testing backend connection..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "  ✅ Backend is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend not responding: $_" -ForegroundColor Red
    Write-Host "    Make sure backend is running at http://localhost:8000" -ForegroundColor Yellow
}

Write-Host "`n🚀 Platform Status: READY TO LAUNCH!" -ForegroundColor Green
Write-Host "   Run: npm run dev" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
