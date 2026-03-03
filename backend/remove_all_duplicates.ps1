# remove_all_duplicates.ps1
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-remove-all"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$fieldFirstLine = @{}
$duplicateCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $fieldFirstLine = @{}
        $output += $line
        Write-Host "`nProcessing model: $modelName"
        continue
    }
    
    # Model end
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        continue
    }
    
    if ($inModel) {
        # Skip empty lines and comments/attributes
        if ($trimmed -eq '' -or $trimmed -match '^//' -or $trimmed -match '^@@') {
            $output += $line
            continue
        }
        
        # Check if this line is a field definition: starts with whitespace, then a word, then whitespace, then something
        if ($line -match '^\s+(\w+)\s+\S') {
            $field = $matches[1]
            if ($fieldFirstLine.ContainsKey($field)) {
                Write-Host "  >>> Removing duplicate field '$field' at line $i"
                $duplicateCount++
                continue
            } else {
                $fieldFirstLine[$field] = $i
                $output += $line
            }
        } else {
            # Not a field definition, keep it
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
    $content = $content -replace 'generator\+client\s*\{\s*\}', "generator client {`n  provider = `"prisma-client-js`"`n}"
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