# fix_duplicates_final.ps1 – Remove all duplicate field definitions from models
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-final10"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelName = ""
$fieldsSeen = @{}

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Detect start of model
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $inModel = $true
        $modelName = $matches[1]
        $fieldsSeen = @{}
        $output += $line
        continue
    }
    
    # Detect end of model (closing brace)
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        continue
    }
    
    if ($inModel) {
        # Check if line is a field definition: starts with whitespace, then identifier, then whitespace, then type
        # Skip lines that are attributes (@@) or comments (//)
        if ($line -match '^\s+(\w+)\s+(\w+|\[\]|\?|\[[^\]]*\])' -and $trimmed -notmatch '^@@' -and $trimmed -notmatch '^//') {
            $fieldName = $matches[1]
            if ($fieldsSeen.ContainsKey($fieldName)) {
                # Duplicate – skip this line
                Write-Host "Skipping duplicate field '$fieldName' in model '$modelName' at line $i"
                continue
            } else {
                $fieldsSeen[$fieldName] = $true
                $output += $line
            }
        } else {
            # Not a field definition (attribute, comment, empty) – keep it
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