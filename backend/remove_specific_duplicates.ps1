# remove_specific_duplicates.ps1
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-specific"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
# List of duplicate line numbers (1-indexed from error messages) to remove
$linesToRemove = @(59,65,71,75,79,83,119,121,123,921,922,959,960) | Sort-Object -Descending

foreach ($lineNum in $linesToRemove) {
    $index = $lineNum - 1  # convert to zero-based
    Write-Host "Removing line $lineNum (original index $index)"
    $lines = $lines[0..($index-1)] + $lines[($index+1)..($lines.Count-1)]
}

$lines | Set-Content $schemaPath
Write-Host "✅ Removed specific duplicate lines."

# Run Prisma commands
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