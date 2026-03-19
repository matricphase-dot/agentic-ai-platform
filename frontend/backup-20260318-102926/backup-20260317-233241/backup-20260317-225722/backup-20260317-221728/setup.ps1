Write-Host "🚀 Setting up Agentic AI Platform..." -ForegroundColor Cyan

# Check Node.js and npm
Write-Host "Checking Node.js and npm..." -ForegroundColor Yellow
node --version
npm --version

# Kill existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2

# Clean up
Write-Host "Cleaning up cache..." -ForegroundColor Yellow
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Check for environment file
if (!(Test-Path .env.local)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
}

# Run type check
Write-Host "Running TypeScript check..." -ForegroundColor Green
npx tsc --noEmit 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript check passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript check found issues" -ForegroundColor Yellow
}

# Format code
Write-Host "Formatting code..." -ForegroundColor Green
npx prettier --write . 2>$null

# Start development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "📊 Access your application at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔑 Login at: http://localhost:3000/auth/login" -ForegroundColor Cyan
Write-Host "👤 Demo credentials: admin@example.com / password123" -ForegroundColor Cyan
npm run dev
