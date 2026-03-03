# fix_schema_final.ps1 – Final fixes: add provider, replace Agent references
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-final9"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath

# --- Fix 1: Ensure generator client has provider ---
$newLines = @()
$inGenerator = $false
$generatorFixed = $false
foreach ($line in $lines) {
    if ($line -match '^\s*generator\s+client\s*\{') {
        $inGenerator = $true
        $newLines += $line
        # Check next line (if it's just '}' we need to insert provider)
        continue
    }
    if ($inGenerator) {
        if ($line -match '^\s*\}\s*$') {
            # If we haven't added provider yet, add it now
            if (-not $generatorFixed) {
                $newLines += '  provider = "prisma-client-js"'
                $generatorFixed = $true
            }
            $newLines += $line
            $inGenerator = $false
        } elseif ($line -match 'provider\s*=') {
            $generatorFixed = $true
            $newLines += $line
        } else {
            $newLines += $line
        }
    } else {
        $newLines += $line
    }
}
$lines = $newLines
Write-Host "✅ Fixed generator block."

# --- Fix 2: Replace all references to 'Agent' (as a type) with 'agents' ---
$newLines = @()
foreach ($line in $lines) {
    # Replace 'Agent' when it appears as a standalone word, possibly with ? or [] or at end
    # This regex matches 'Agent' preceded by word boundary, not followed by word character
    $modified = $line -replace '\bAgent\b(?!\w)', 'agents'
    $newLines += $modified
}
$lines = $newLines
Write-Host "✅ Replaced all 'Agent' type references with 'agents'."

# Write the final schema
$lines | Set-Content $schemaPath
Write-Host "✅ Schema updated with final fixes."

# --- Run Prisma commands again ---
try {
    Write-Host "`nRunning prisma format..."
    npx prisma format
    if ($LASTEXITCODE -ne 0) { throw "prisma format failed" }

    Write-Host "`nRunning prisma validate..."
    npx prisma validate
    if ($LASTEXITCODE -ne 0) { throw "prisma validate failed" }

    Write-Host "`nGenerating prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

    Write-Host "`nApplying migration to PostgreSQL..."
    npx prisma migrate dev --name init_postgres
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate dev failed" }

    Write-Host "`n✅ All commands succeeded! Your database is now migrated to PostgreSQL."
} catch {
    Write-Host "`n❌ Error: $_"
}

Read-Host "`nPress Enter to exit"