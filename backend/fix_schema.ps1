# fix_schema.ps1 – Rename Agent to agents and reorder
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-final8"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath

# --- Remove duplicate generator/datasource blocks ---
$newLines = @()
$seenGenerator = $false
$seenDatasource = $false
$skip = $false
foreach ($line in $lines) {
    if ($line -match '^\s*generator\s+client\s*{') {
        if ($seenGenerator) { $skip = $true } else { $seenGenerator = $true; $skip = $false }
    }
    elseif ($line -match '^\s*datasource\s+db\s*{') {
        if ($seenDatasource) { $skip = $true } else { $seenDatasource = $true; $skip = $false }
    }
    elseif ($line -match '^\s*}' -and $skip) {
        $skip = $false
        continue
    }
    if (-not $skip) {
        $newLines += $line
    }
}
$lines = $newLines
Write-Host "Removed duplicate generator/datasource blocks."

# --- Find users model ---
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
    Write-Host "❌ users model not found. Aborting."
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "Found users model at lines $usersStart-$usersEnd"

# --- Find Agent model (uppercase A) ---
$agentStart = -1; $agentEnd = -1; $brace = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+Agent\s*\{') {
        $agentStart = $i; $brace = 1
        for ($j=$i+1; $j -lt $lines.Count; $j++) {
            $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($brace -eq 0) { $agentEnd = $j; break }
        }
        break
    }
}
if ($agentStart -eq -1) {
    Write-Host "❌ Agent model not found. Aborting."
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "Found Agent model at lines $agentStart-$agentEnd"

# --- Rename the Agent model to agents (lowercase) in the definition line ---
$lines[$agentStart] = $lines[$agentStart] -replace 'model\s+Agent\s*\{', 'model agents {'
Write-Host "Renamed 'Agent' model to 'agents'."

# --- Extract the (now renamed) agents block ---
$agentsBlock = $lines[$agentStart..$agentEnd]

# --- Extract all other models (excluding users and agents) ---
$otherModels = @()
$i = 0
while ($i -lt $lines.Count) {
    if ($i -ge $usersStart -and $i -le $usersEnd) { $i = $usersEnd + 1; continue }
    if ($i -ge $agentStart -and $i -le $agentEnd) { $i = $agentEnd + 1; continue }
    if ($lines[$i] -match '^\s*model\s+\w+\s*\{') {
        $start = $i
        $brace = 1
        for ($j=$i+1; $j -lt $lines.Count; $j++) {
            $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($brace -eq 0) { $end = $j; break }
        }
        $otherModels += ,@($lines[$start..$end])
        $i = $end + 1
    } else {
        $i++
    }
}

# --- Get header (directives before first model) ---
$header = @()
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+\w+\s*\{') { break }
    $header += $lines[$i]
}

# --- Rebuild file: header, users, agents, other models ---
$newLines = $header
$newLines += ""
$newLines += $lines[$usersStart..$usersEnd]   # users block
$newLines += ""
$newLines += $agentsBlock                     # now named agents
$newLines += ""
foreach ($block in $otherModels) {
    $newLines += $block
    $newLines += ""
}
$newLines | Set-Content $schemaPath
Write-Host "✅ Reordered models: users first, then agents, then all others."

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