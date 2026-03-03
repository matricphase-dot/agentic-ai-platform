# move_agents_to_top.ps1 – Place users and agents models first
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-move-agents"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath

# Find users model block
$usersStart = -1; $usersEnd = -1; $brace = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+users\s*\{') {
        $usersStart = $i; $brace = 1
        for ($j=$i+1; $j -lt $lines.Count; $j++) {
            $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($brace -eq 0) { $usersEnd = $j; break }
        }
        break
    }
}
if ($usersStart -eq -1) { Write-Host "Users model not found"; exit }

# Find agents model block
$agentsStart = -1; $agentsEnd = -1; $brace = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+agents\s*\{') {
        $agentsStart = $i; $brace = 1
        for ($j=$i+1; $j -lt $lines.Count; $j++) {
            $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($brace -eq 0) { $agentsEnd = $j; break }
        }
        break
    }
}
if ($agentsStart -eq -1) { Write-Host "Agents model not found"; exit }

Write-Host "Users: $usersStart-$usersEnd, Agents: $agentsStart-$agentsEnd"

# Extract the two blocks
$usersBlock = $lines[$usersStart..$usersEnd]
$agentsBlock = $lines[$agentsStart..$agentsEnd]

# Remove them from lines (in reverse order to avoid index shifting)
if ($agentsStart -gt $usersStart) {
    $lines = $lines[0..($agentsStart-1)] + $lines[($agentsEnd+1)..($lines.Count-1)]
    $lines = $lines[0..($usersStart-1)] + $lines[($usersEnd+1)..($lines.Count-1)]
} else {
    $lines = $lines[0..($usersStart-1)] + $lines[($usersEnd+1)..($lines.Count-1)]
    $lines = $lines[0..($agentsStart-1)] + $lines[($agentsEnd+1)..($lines.Count-1)]
}

# Find where to insert: after the header (up to first model)
$insertPos = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+\w+\s*\{') {
        $insertPos = $i
        break
    }
}
if ($insertPos -eq 0) { $insertPos = $lines.Count } # no models? put at end

# Insert users and agents at that position
$newLines = $lines[0..($insertPos-1)] + $usersBlock + "" + $agentsBlock + $lines[$insertPos..($lines.Count-1)]
$newLines | Set-Content $schemaPath
Write-Host "✅ Users and agents moved to the top."

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