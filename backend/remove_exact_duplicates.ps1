# remove_exact_duplicates.ps1
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-exact-final"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$inModel = $false
$modelLines = @()
$seenLines = @{}

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        # If we were in a model, process its lines now (but we are at start of new model, so previous model ended)
        # Actually, we handle model start: flush any previous model? No, we process as we go.
        $inModel = $true
        $seenLines = @{}
        $output += $line
        Write-Host "`nProcessing model: $matches[1]"
        continue
    }
    
    # Model end
    if ($inModel -and $trimmed -eq '}') {
        $inModel = $false
        $output += $line
        continue
    }
    
    if ($inModel) {
        # Inside model: if line is not empty or comment/attribute, check for duplicates
        if ($trimmed -ne '' -and -not $trimmed.StartsWith('//') -and -not $trimmed.StartsWith('@@')) {
            if ($seenLines.ContainsKey($trimmed)) {
                Write-Host "  Removing duplicate line at index $i : $line"
                # Skip adding this line
                continue
            } else {
                $seenLines[$trimmed] = $true
                $output += $line
            }
        } else {
            # Keep empty lines, comments, attributes
            $output += $line
        }
    } else {
        # Outside model
        $output += $line
    }
}

$output | Set-Content $schemaPath
Write-Host "`n✅ Removed duplicate lines."

# Now run prisma format to fix missing back relations
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