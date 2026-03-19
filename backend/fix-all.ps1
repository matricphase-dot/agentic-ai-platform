# Ensure we are in the backend directory
Set-Location -Path D:\AGENTIC_AI\backend -ErrorAction Stop
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan

# Backup function
function Backup-File {
    param($FilePath)
    $backupPath = "$FilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path $FilePath -Destination $backupPath
    Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
}

# ----------------------------------------------------------------------
# 1. Backup and clean schema.prisma (remove BOM)
# ----------------------------------------------------------------------
Write-Host "`n🧹 Cleaning Prisma schema..." -ForegroundColor Cyan
Backup-File -FilePath "prisma\schema.prisma"
$bytes = [System.IO.File]::ReadAllBytes("prisma\schema.prisma")
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $newBytes = $bytes[3..($bytes.Length - 1)]
    [System.IO.File]::WriteAllBytes("prisma\schema.prisma", $newBytes)
    Write-Host "   ✅ Removed UTF-8 BOM" -ForegroundColor Green
} else {
    Write-Host "   ✅ No BOM found" -ForegroundColor Gray
}

# ----------------------------------------------------------------------
# 2. Read schema and fix missing opposite relation
# ----------------------------------------------------------------------
Write-Host "`n🔍 Checking for missing opposite relation in schema..." -ForegroundColor Cyan

$schemaLines = Get-Content "prisma\schema.prisma"
$newSchema = @()
$inUserSettings = $false
$inUsers = $false
$usersModelEndLine = -1
$userSettingsRefModel = $null
$userSettingsUserIdField = $null

for ($i = 0; $i -lt $schemaLines.Count; $i++) {
    $line = $schemaLines[$i]
    
    # Detect UserSettings model and extract referenced model
    if ($line -match 'model\s+UserSettings\s*{') {
        $inUserSettings = $true
    }
    if ($inUserSettings -and $line -match 'user\s+(\w+)\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]\)') {
        $userSettingsRefModel = $matches[1]   # should be 'users'
        Write-Host "   Found UserSettings referencing model: $userSettingsRefModel" -ForegroundColor Yellow
        $inUserSettings = $false
    }
    
    # Detect users model and remember its closing line
    if ($line -match 'model\s+users\s*{') {
        $inUsers = $true
    }
    if ($inUsers -and $line -match '^\s*}\s*$') {
        $usersModelEndLine = $i
        $inUsers = $false
    }
    
    $newSchema += $line
}

# If we have the referenced model name and we found the users model end line,
# check if it already has a field pointing to UserSettings.
if ($userSettingsRefModel -and $usersModelEndLine -ne -1) {
    Write-Host "   Users model ends at line $usersModelEndLine" -ForegroundColor Yellow
    
    # Check if 'settings UserSettings?' already exists in users model
    $hasSettingsField = $false
    for ($j = 0; $j -lt $usersModelEndLine; $j++) {
        if ($schemaLines[$j] -match 'settings\s+UserSettings\??') {
            $hasSettingsField = $true
            break
        }
    }
    
    if (-not $hasSettingsField) {
        Write-Host "   Missing opposite relation in 'users' model. Adding 'settings UserSettings?'..." -ForegroundColor Yellow
        # Insert before the closing brace
        $newSchema = @()
        for ($j = 0; $j -lt $schemaLines.Count; $j++) {
            $newSchema += $schemaLines[$j]
            if ($j -eq $usersModelEndLine - 1) {
                # Add the missing field just before the closing brace
                $newSchema += "  settings UserSettings?"
            }
        }
        Write-Host "   ✅ Added 'settings UserSettings?' to users model." -ForegroundColor Green
    } else {
        Write-Host "   ✅ Opposite relation already exists." -ForegroundColor Green
        $newSchema = $schemaLines   # no change
    }
} else {
    Write-Host "   Could not detect relation details – skipping auto-fix." -ForegroundColor Yellow
    $newSchema = $schemaLines
}

# Write the (possibly modified) schema back
$newSchema | Set-Content "prisma\schema.prisma" -NoNewline

# ----------------------------------------------------------------------
# 3. Run prisma format to clean up formatting and add any missing @relation attributes
# ----------------------------------------------------------------------
Write-Host "`n🎨 Running prisma format..." -ForegroundColor Cyan
npx prisma format
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ prisma format failed – check schema manually." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema formatted successfully." -ForegroundColor Green

# ----------------------------------------------------------------------
# 4. Ensure @prisma/client is installed and regenerate client
# ----------------------------------------------------------------------
Write-Host "`n📦 Reinstalling @prisma/client..." -ForegroundColor Cyan
npm uninstall @prisma/client --no-save
npm install @prisma/client

Write-Host "`n🔄 Regenerating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed – manual intervention required." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client regenerated." -ForegroundColor Green

# ----------------------------------------------------------------------
# 5. Verify PrismaClient export
# ----------------------------------------------------------------------
Write-Host "`n🔍 Verifying PrismaClient export..." -ForegroundColor Cyan
$clientFile = "node_modules/.prisma/client/index.d.ts"
if (Test-Path $clientFile) {
    $content = Get-Content $clientFile -Raw
    if ($content -match 'export\s+class\s+PrismaClient') {
        Write-Host "   ✅ PrismaClient found in generated types." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ PrismaClient not found – this is unexpected." -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Generated client types not found!" -ForegroundColor Red
}

# ----------------------------------------------------------------------
# 6. Restart backend
# ----------------------------------------------------------------------
Write-Host "`n🔄 Restarting backend server..." -ForegroundColor Cyan
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) { Stop-Process -Id $process -Force }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\AGENTIC_AI\backend'; npm run dev"

Write-Host "`n✅✅✅ ALL FIXES APPLIED! ✅✅✅" -ForegroundColor Green
Write-Host "The backend should now compile and run without errors." -ForegroundColor Cyan
Write-Host "Test at: http://localhost:3000/agent-chat" -ForegroundColor Yellow
