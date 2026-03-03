# fix_duplicates_force.ps1 – Force-remove duplicate fields by exact line matching
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-force"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$fieldNames = @{}

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Detect model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $fieldNames = @{}
        $output += $line
        continue
    }
    
    # Detect model end
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        continue
    }
    
    if ($inModel) {
        # Skip empty lines, comments, and attributes
        if ($trimmed -eq '' -or $trimmed -match '^//' -or $trimmed -match '^@@') {
            $output += $line
            continue
        }
        
        # Try to extract field name: line starts with whitespace, then a word
        if ($line -match '^\s+(\w+)') {
            $fieldName = $matches[1]
            if ($fieldNames.ContainsKey($fieldName)) {
                Write-Host "Removing duplicate field '$fieldName' in model '$modelName' at line $i"
                # Skip adding this line
                continue
            } else {
                $fieldNames[$fieldName] = $true
                $output += $line
            }
        } else {
            # Not a field line (maybe a closing brace misplaced, but keep it)
            $output += $line
        }
    } else {
        $output += $line
    }
}

# Write cleaned schema
$output | Set-Content $schemaPath
Write-Host "✅ Removed duplicate fields."

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