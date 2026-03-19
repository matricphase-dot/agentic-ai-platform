# ============================================
# PRISMA CLIENT AUTO-FIX SCRIPT
# ============================================
Write-Host "ðŸš€ Starting Prisma Client repair..." -ForegroundColor Cyan

# Ensure we're in the backend directory
Set-Location D:\AGENTIC_AI\backend -ErrorAction Stop
Write-Host "ðŸ“ Working directory: $(Get-Location)" -ForegroundColor Green

# ----------------------------------------------------------------------
# 1. Find and restore a clean backup (March 7 backup)
# ----------------------------------------------------------------------
$backupList = @(
    "prisma\schema.prisma.backup-20260307042558",
    "prisma\schema.prisma.backup-20260307043312",
    "prisma\schema.prisma.backup-20260306191545"
)

$selectedBackup = $null
foreach ($b in $backupList) {
    if (Test-Path $b) {
        $selectedBackup = $b
        break
    }
}

if (-not $selectedBackup) {
    Write-Host "âŒ No clean backup found. Exiting." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "âœ… Using backup: $selectedBackup" -ForegroundColor Green

# Backup current schema
Copy-Item -Path prisma\schema.prisma -Destination "prisma\schema.prisma.before-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force

# Restore the selected backup
Copy-Item -Path $selectedBackup -Destination prisma\schema.prisma -Force
Write-Host "âœ… Restored clean schema." -ForegroundColor Green

# ----------------------------------------------------------------------
# 2. Add missing UserSettings model and relation
# ----------------------------------------------------------------------
Write-Host "`nðŸ”§ Adding missing UserSettings model and relation..." -ForegroundColor Cyan

$schemaPath = "prisma\schema.prisma"
$schema = Get-Content $schemaPath -Raw

# Add UserSettings model if missing
if ($schema -notmatch 'model UserSettings\s*{') {
    $userSettingsModel = @"

model UserSettings {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         users    @relation(fields: [userId], references: [id])
  primaryColor String?  // e.g., "#6366f1"
  logoUrl      String?  // custom logo URL
  theme        String?  @default("light") // light, dark, or custom
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("user_settings")
}
"@
    $schema += $userSettingsModel
    Write-Host "   âœ… Added UserSettings model." -ForegroundColor Green
}

# Add settings field to users model if missing
if ($schema -match 'model users\s*{([^}]+)}') {
    $usersModel = $matches[1]
    if ($usersModel -notmatch 'settings\s+UserSettings\??') {
        $usersModelFixed = $usersModel -replace '(?=\n\s*})', "`n  settings UserSettings?`n"
        $schema = $schema -replace 'model users\s*{[^}]+}', "model users {$usersModelFixed}"
        Write-Host "   âœ… Added settings field to users model." -ForegroundColor Green
    } else {
        Write-Host "   â­ï¸ settings field already exists." -ForegroundColor Gray
    }
}

# Add revenueShare to agents model if missing
if ($schema -match 'model agents\s*{([^}]+)}') {
    $agentsModel = $matches[1]
    if ($agentsModel -notmatch 'revenueShare\s+Float\??') {
        $agentsModelFixed = $agentsModel -replace '(totalEarnings\s+Float\s+@default\(0\))', "`$1`n  revenueShare                         Float?           @default(0)"
        $schema = $schema -replace 'model agents\s*{[^}]+}', "model agents {$agentsModelFixed}"
        Write-Host "   âœ… Added revenueShare to agents model." -ForegroundColor Green
    } else {
        Write-Host "   â­ï¸ revenueShare already exists." -ForegroundColor Gray
    }
}

# Save the modified schema
$schema | Set-Content $schemaPath -NoNewline
Write-Host "âœ… Schema updated." -ForegroundColor Green

# ----------------------------------------------------------------------
# 3. Remove any duplicate model definitions
# ----------------------------------------------------------------------
Write-Host "`nðŸ§¹ Removing duplicate models..." -ForegroundColor Cyan

$lines = Get-Content $schemaPath
$uniqueModels = @{}
$newLines = @()
$inModel = $false
$currentModelName = ""

foreach ($line in $lines) {
    if ($line -match '^model\s+(\w+)\s*{') {
        $currentModelName = $matches[1]
        if ($uniqueModels.ContainsKey($currentModelName)) {
            # Skip this duplicate model
            $inModel = $true
            continue
        } else {
            $uniqueModels[$currentModelName] = $true
            $inModel = $true
            $newLines += $line
        }
    } elseif ($line -match '^}' -and $inModel) {
        $inModel = $false
        $newLines += $line
    } elseif ($inModel) {
        $newLines += $line
    } else {
        $newLines += $line
    }
}

$newLines | Set-Content $schemaPath -NoNewline
Write-Host "âœ… Duplicates removed." -ForegroundColor Green

# ----------------------------------------------------------------------
# 4. Reinstall and regenerate Prisma client
# ----------------------------------------------------------------------
Write-Host "`nðŸ“¦ Reinstalling @prisma/client..." -ForegroundColor Cyan
npm uninstall @prisma/client --no-save
npm install @prisma/client

Write-Host "`nðŸ”„ Running prisma format..." -ForegroundColor Cyan
npx prisma format
if ($LASTEXITCODE -ne 0) {
    Write-Host "âŒ prisma format failed. Check schema manually." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nðŸ”„ Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "âŒ prisma generate failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "âœ… Prisma client regenerated." -ForegroundColor Green

# ----------------------------------------------------------------------
# 5. Kill process on port 5000 and restart backend
# ----------------------------------------------------------------------
Write-Host "`nðŸ”„ Restarting backend server..." -ForegroundColor Cyan
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) { Stop-Process -Id $process -Force }

# Start backend in a new window (optional)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\AGENTIC_AI\backend'; npm run dev"

Write-Host "`nâœ…âœ…âœ… ALL FIXES COMPLETED! âœ…âœ…âœ…" -ForegroundColor Green
Write-Host "Backend is starting in a new window." -ForegroundColor Cyan
Write-Host "You can close this window after confirming backend runs." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
