# fix_duplicates_last.ps1 – Ultimate duplicate removal with verbose logging
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-last"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$fieldNames = @{}
$duplicateCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $fieldNames = @{}
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
        # Skip empty lines, comments, and attributes
        if ($trimmed -eq '' -or $trimmed -match '^//' -or $trimmed -match '^@@') {
            $output += $line
            continue
        }
        
        # Extract field name: line starts with whitespace, then a word (field name)
        if ($line -match '^\s+(\w+)') {
            $fieldName = $matches[1]
            # Check if this is likely a field line (has something after the name)
            if ($line -match '^\s+\w+\s+\S') {
                if ($fieldNames.ContainsKey($fieldName)) {
                    Write-Host "  >>> Removing duplicate field '$fieldName' at line $i: $line"
                    $duplicateCount++
                    continue  # skip this line
                } else {
                    $fieldNames[$fieldName] = $line
                    $output += $line
                }
            } else {
                # Not a field line (maybe a mis-indented line, keep it)
                $output += $line
            }
        } else {
            $output += $line
        }
    } else {
        $output += $line
    }
}

# Write cleaned schema
$output | Set-Content $schemaPath
Write-Host "`n✅ Removed $duplicateCount duplicate field lines."

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