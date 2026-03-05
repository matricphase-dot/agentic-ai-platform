$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.backup-connectors"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath

# Find businesses model boundaries
$businessesStart = -1
$businessesEnd = -1
$braceCount = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*model\s+businesses\s*\{') {
        $businessesStart = $i
        $braceCount = 1
        for ($j=$i+1; $j -lt $lines.Count; $j++) {
            $braceCount += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $braceCount -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($braceCount -eq 0) {
                $businessesEnd = $j
                break
            }
        }
        break
    }
}

if ($businessesStart -eq -1) { throw "Businesses model not found" }

# Find nested connectors inside businesses
$connectorsStart = -1
$connectorsEnd = -1
for ($i=$businessesStart; $i -le $businessesEnd; $i++) {
    if ($lines[$i] -match '^\s+model\s+connectors\s*\{') {
        $connectorsStart = $i
        $braceCount = 1
        for ($j=$i+1; $j -le $businessesEnd; $j++) {
            $braceCount += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $braceCount -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($braceCount -eq 0) {
                $connectorsEnd = $j
                break
            }
        }
        break
    }
}

if ($connectorsStart -eq -1) { throw "Connectors not nested in businesses" }

# Extract connectors block
$connectorsBlock = $lines[$connectorsStart..$connectorsEnd]

# Remove connectors from businesses
$newBusinesses = $lines[$businessesStart..($connectorsStart-1)] + $lines[($connectorsEnd+1)..$businessesEnd]

# Dedent connectors block
$minIndent = [int]::MaxValue
foreach ($l in $connectorsBlock) {
    if ($l.Trim() -ne "" -and $l -match '^(\s+)') {
        $lIndent = $matches[1].Length
        if ($lIndent -lt $minIndent) { $minIndent = $lIndent }
    }
}
$dedented = @()
foreach ($l in $connectorsBlock) {
    if ($l.Trim() -eq "") {
        $dedented += $l
    } else {
        $dedented += $l -replace "^\s{$minIndent}", ""
    }
}

# Reconstruct file
$newLines = $lines[0..($businessesStart-1)] + $newBusinesses + $lines[($businessesEnd+1)..($lines.Count-1)] + "" + $dedented

$newLines | Set-Content $schemaPath
Write-Host "Connectors extracted and appended. Running prisma format..."

npx prisma format
Write-Host "Done. Please commit and push the changes."
