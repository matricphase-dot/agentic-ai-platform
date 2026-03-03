# find_and_move_agent.ps1 – Locate agent model and move to top
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-find-agent"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath

# Try to find a model that contains typical agent fields
$agentStart = -1; $agentEnd = -1; $brace = 0; $agentName = $null
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+(\w+)\s*\{') {
        $name = $matches[1]
        # Quick scan inside this model for fields that suggest it's the agent
        $tempBrace = 1
        $j = $i+1
        $inside = @($lines[$i])
        while ($j -lt $lines.Count) {
            $inside += $lines[$j]
            $tempBrace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $tempBrace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($tempBrace -eq 0) { break }
            $j++
        }
        $fullText = $inside -join "`n"
        if ($fullText -match 'ownerId' -and $fullText -match 'systemPrompt') {
            $agentStart = $i
            $agentEnd = $j
            $agentName = $name
            Write-Host "Found agent model: '$agentName' from line $agentStart to $agentEnd"
            break
        }
    }
}
if ($agentStart -eq -1) {
    Write-Host "❌ Could not locate agent model automatically."
    exit
}

# Rename the model to 'agents' if it's not already
if ($agentName -ne "agents") {
    $lines[$agentStart] = $lines[$agentStart] -replace 'model\s+\w+\s*\{', 'model agents {'
    Write-Host "Renamed '$agentName' to 'agents'."
}

# Now find users model (should exist)
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
if ($usersStart -eq -1) {
    Write-Host "❌ Users model not found."
    exit
}

# Extract blocks (use updated lines)
$usersBlock = $lines[$usersStart..$usersEnd]
# Re-find agents block in case we renamed and line numbers shifted
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
if ($agentsStart -eq -1) {
    Write-Host "❌ Agents model not found after rename."
    exit
}
$agentsBlock = $lines[$agentsStart..$agentsEnd]

# Remove them in reverse order
if ($agentsStart -gt $usersStart) {
    $lines = $lines[0..($agentsStart-1)] + $lines[($agentsEnd+1)..($lines.Count-1)]
    $lines = $lines[0..($usersStart-1)] + $lines[($usersEnd+1)..($lines.Count-1)]
} else {
    $lines = $lines[0..($usersStart-1)] + $lines[($usersEnd+1)..($lines.Count-1)]
    $lines = $lines[0..($agentsStart-1)] + $lines[($agentsEnd+1)..($lines.Count-1)]
}

# Insert after header
$insertPos = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+\w+\s*\{') {
        $insertPos = $i
        break
    }
}
if ($insertPos -eq 0) { $insertPos = $lines.Count }

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