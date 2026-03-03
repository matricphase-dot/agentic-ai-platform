# remove_nested_agent_service_bindings.ps1
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-nested-remove"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$inAgents = $false
$agentsStart = -1
$agentsEnd = -1
$braceDepth = 0

# First locate the agents model boundaries
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+agents\s*\{') {
        $agentsStart = $i
        $braceDepth = 1
        for ($j = $i+1; $j -lt $lines.Count; $j++) {
            $braceDepth += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $braceDepth -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($braceDepth -eq 0) {
                $agentsEnd = $j
                break
            }
        }
        break
    }
}

if ($agentsStart -eq -1) {
    Write-Host "Agents model not found. Exiting."
    exit
}
Write-Host "Agents model lines: $agentsStart to $agentsEnd"

# Now locate the nested model block inside agents
$nestedStart = -1
$nestedEnd = -1
for ($i = $agentsStart; $i -le $agentsEnd; $i++) {
    if ($lines[$i] -match '^\s*model\s+agent_service_bindings\s*\{') {
        $nestedStart = $i
        $braceDepth = 1
        for ($j = $i+1; $j -le $agentsEnd; $j++) {
            $braceDepth += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $braceDepth -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($braceDepth -eq 0) {
                $nestedEnd = $j
                break
            }
        }
        break
    }
}

if ($nestedStart -eq -1) {
    Write-Host "No nested agent_service_bindings found inside agents. Exiting."
    exit
}
Write-Host "Found nested model from line $nestedStart to $nestedEnd"

# Remove the nested block from agents
$newLines = $lines[0..($nestedStart-1)] + $lines[($nestedEnd+1)..($lines.Count-1)]

# Write the cleaned schema
$newLines | Set-Content $schemaPath
Write-Host "Removed nested block from agents."

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