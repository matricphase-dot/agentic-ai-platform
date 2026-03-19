# Prisma Client Repair Script
# Run this if you see "Module '@prisma/client' has no exported member 'PrismaClient'"

Write-Host "🔧 Starting Prisma Client repair..." -ForegroundColor Cyan

# Step 1: Check if we're in the backend directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Not in backend directory! Please run from D:\AGENTIC_AI\backend" -ForegroundColor Red
    exit 1
}

# Step 2: Validate schema (optional but helpful)
Write-Host "`n📐 Validating Prisma schema..." -ForegroundColor Yellow
npx prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Schema validation failed. Attempting to fix common issues..." -ForegroundColor Red
    # Try to remove BOM again just in case
    $bytes = [System.IO.File]::ReadAllBytes("prisma\schema.prisma")
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $newBytes = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes("prisma\schema.prisma", $newBytes)
        Write-Host "   ✅ Removed BOM, retrying validation..." -ForegroundColor Green
        npx prisma validate
    }
}

# Step 3: Ensure @prisma/client is installed
Write-Host "`n📦 Checking @prisma/client installation..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\@prisma\client")) {
    Write-Host "   @prisma/client not found. Installing..." -ForegroundColor Yellow
    npm install @prisma/client
} else {
    Write-Host "   ✅ @prisma/client is installed" -ForegroundColor Green
}

# Step 4: Force reinstall @prisma/client to ensure binaries match
Write-Host "`n🔄 Reinstalling @prisma/client to ensure correct binaries..." -ForegroundColor Yellow
npm uninstall @prisma/client --no-save
npm install @prisma/client

# Step 5: Regenerate Prisma client with full output
Write-Host "`n🔄 Regenerating Prisma client (verbose)..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed. Attempting to fix with additional steps..." -ForegroundColor Red
    
    # Try cleaning node_modules/.prisma completely
    Remove-Item -Path "node_modules/.prisma" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Try generating with debug
    $env:DEBUG="prisma*"
    npx prisma generate
    Remove-Item Env:\DEBUG
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Still failing. Manual intervention required." -ForegroundColor Red
        Write-Host "Please check your schema.prisma for errors." -ForegroundColor Yellow
        exit 1
    }
}

# Step 6: Verify that PrismaClient is exported
Write-Host "`n🔍 Verifying PrismaClient export..." -ForegroundColor Yellow
$clientFile = "node_modules/.prisma/client/index.d.ts"
if (Test-Path $clientFile) {
    $content = Get-Content $clientFile -Raw
    if ($content -match 'export\s+class\s+PrismaClient') {
        Write-Host "   ✅ PrismaClient found in generated types" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ PrismaClient not found in generated types. This is unusual." -ForegroundColor Red
        Write-Host "   Attempting one more regeneration with force..." -ForegroundColor Yellow
        npx prisma generate --force
    }
} else {
    Write-Host "   ❌ Generated client types not found!" -ForegroundColor Red
}

# Step 7: Restart backend
Write-Host "`n🔄 Restarting backend server..." -ForegroundColor Cyan
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) { Stop-Process -Id $process -Force }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; npm run dev"

Write-Host "`n✅✅✅ PRISMA CLIENT REPAIR COMPLETED! ✅✅✅" -ForegroundColor Green
Write-Host "The TypeScript error should now be resolved." -ForegroundColor Cyan
Write-Host "Check the backend console for any remaining issues." -ForegroundColor Yellow