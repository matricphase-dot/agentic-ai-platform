# remove_duplicate_fields.ps1
$ErrorActionPreference = "Stop"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-duplicate-removal"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup saved to $backupPath"

$lines = Get-Content $schemaPath

# Function to remove duplicate fields from a given model
function Remove-DuplicateFields {
    param($modelName)
    $start = -1
    $end = -1
    $brace = 0
    for ($i=0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^\s*model\s+$modelName\s*\{") {
            $start = $i
            $brace = 1
            for ($j=$i+1; $j -lt $lines.Count; $j++) {
                $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
                $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
                if ($brace -eq 0) {
                    $end = $j
                    break
                }
            }
            break
        }
    }
    if ($start -eq -1) {
        Write-Host "Model $modelName not found."
        return $lines
    }
    Write-Host "Processing $modelName from line $start to $end"
    $fieldNames = @{}
    $newModelLines = @()
    for ($i=$start; $i -le $end; $i++) {
        $line = $lines[$i]
        $trimmed = $line.Trim()
        if ($trimmed -match '^\s+(\w+)\s+\S') {
            $field = $matches[1]
            if ($fieldNames.ContainsKey($field)) {
                Write-Host "  Removing duplicate field '$field' at line $i"
                # skip adding this line
                continue
            } else {
                $fieldNames[$field] = $true
                $newModelLines += $line
            }
        } else {
            $newModelLines += $line
        }
    }
    # Replace the old model block with new one
    $lines = $lines[0..($start-1)] + $newModelLines + $lines[($end+1)..($lines.Count-1)]
    return $lines
}

# Process the models that have duplicates
$lines = Remove-DuplicateFields -modelName "users"
$lines = Remove-DuplicateFields -modelName "agents"
$lines = Remove-DuplicateFields -modelName "agent_hire_agreements"
$lines = Remove-DuplicateFields -modelName "agent_messages"

$lines | Set-Content $schemaPath
Write-Host "Duplicate removal completed. Running prisma format..."

npx prisma format
if ($LASTEXITCODE -ne 0) {
    Write-Host "prisma format reported errors; please check manually."
} else {
    Write-Host "prisma format succeeded. Your schema is now valid."
}

Write-Host "`nNow commit and push:"
Write-Host "  git add backend/prisma/schema.prisma"
Write-Host "  git commit -m 'Remove duplicate fields from schema'"
Write-Host "  git push origin main"
Read-Host "Press Enter to exit"