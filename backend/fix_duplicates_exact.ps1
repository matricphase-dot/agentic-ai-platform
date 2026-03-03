# fix_duplicates_exact.ps1 – Remove exact duplicate lines within each model
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-exact"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$seenLines = @{}
$duplicateCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $seenLines = @{}
        $output += $line
        Write-Host "`nProcessing model: $modelName"
        continue
    }
    
    # Model end
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        Write-Host "Finished model $modelName"
        continue
    }
    
    if ($inModel) {
        # Skip empty lines, comments, and attributes (we don't want to remove duplicate comments unintentionally)
        if ($trimmed -eq '' -or $trimmed -match '^//' -or $trimmed -match '^@@') {
            $output += $line
            continue
        }
        
        # Check if this exact line (trimmed) has been seen in this model
        if ($seenLines.ContainsKey($trimmed)) {
            Write-Host "  >>> Removing duplicate line at line $i : $line"
            $duplicateCount++
            continue
        } else {
            $seenLines[$trimmed] = $true
            $output += $line
        }
    } else {
        $output += $line
    }
}

# Write cleaned schema
$output | Set-Content $schemaPath
Write-Host "`n✅ Removed $duplicateCount duplicate lines."

# --- Fix generator block if missing provider ---
$content = Get-Content $schemaPath -Raw
if ($content -match 'generator\s+client\s*\{\s*\}') {
    $content = $content -replace 'generator\s+client\s*\{\s*\}', "generator client {`n  provider = `"prisma-client-js`"`n}"
    $content | Set-Content $schemaPath
    Write-Host "✅ Added missing provider to generator block."
}

# --- Run Prisma commands ---
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