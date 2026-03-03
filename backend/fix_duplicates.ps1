# fix_duplicates.ps1 – Remove duplicate field definitions from models
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-duplicates"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$fieldsSeen = @{}

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    
    # Detect start of model
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $fieldsSeen = @{}   # reset for new model
        $output += $line
        continue
    }
    
    # Detect end of model (closing brace at same indent level)
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        continue
    }
    
    if ($inModel) {
        # Inside a model: check if this line is a field definition
        # Field definition lines typically start with whitespace, then an identifier, then a type
        # We'll check if line starts with whitespace, then a word, then more whitespace, then a word that could be type
        # Also skip lines that start with @@ (attributes) or // (comments)
        if ($line -match '^\s+(\w+)\s+(\w+|\[\]|\?|\[.*\])' -and $trimmed -notmatch '^@@' -and $trimmed -notmatch '^//') {
            $fieldName = $matches[1]
            if ($fieldsSeen.ContainsKey($fieldName)) {
                # Duplicate – skip this line
                Write-Host "Skipping duplicate field '$fieldName' in model '$modelName'"
                continue
            } else {
                $fieldsSeen[$fieldName] = $true
                $output += $line
            }
        } else {
            # Not a field definition (could be attribute, comment, or empty line) – keep it
            $output += $line
        }
    } else {
        # Outside model – keep all lines
        $output += $line
    }
}

# Write cleaned schema
$output | Set-Content $schemaPath
Write-Host "✅ Removed duplicate fields from models."

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