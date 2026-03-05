# fix_schema_complete.ps1 – Fix all nesting, malformed models, and duplicates
$ErrorActionPreference = "Stop"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.backup-complete"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created: $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$extracted = @()
$inModel = $false
$modelStart = -1
$braceDepth = 0
$currentModelLines = @()
$modelName = ""

# First pass: collect all top-level lines and extract nested models
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Check if this is a model start (any indentation)
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $name = $matches[1]
        $indent = ($line -match '^(\s*)') ? $matches[1].Length : 0
        
        if ($inModel) {
            # We are inside another model – this is a nested model
            Write-Host "Found nested model: $name at line $i"
            # Find its end
            $brace = 1
            $j = $i + 1
            while ($j -lt $lines.Count) {
                $brace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
                $brace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
                if ($brace -eq 0) { break }
                $j++
            }
            $block = $lines[$i..$j]
            # Dedent: find minimum leading spaces of non‑empty lines
            $minIndent = [int]::MaxValue
            foreach ($l in $block) {
                if ($l.Trim() -ne "" -and $l -match '^(\s+)') {
                    $lIndent = $matches[1].Length
                    if ($lIndent -lt $minIndent) { $minIndent = $lIndent }
                }
            }
            $dedented = $block | ForEach-Object {
                if ($_.Trim() -eq "") { $_ } else { $_ -replace "^\s{$minIndent}", "" }
            }
            $extracted += ,$dedented
            $i = $j   # skip the nested block
            continue
        } else {
            # Start of a top-level model
            $inModel = $true
            $modelStart = $i
            $braceDepth = 1
            $currentModelLines = @($line)
            $modelName = $name
            Write-Host "Processing top-level: $name"
        }
    } elseif ($inModel) {
        $currentModelLines += $line
        $braceDepth += ($line.ToCharArray() | Where-Object {$_ -eq '{'}).Count
        $braceDepth -= ($line.ToCharArray() | Where-Object {$_ -eq '}'}).Count
        if ($braceDepth -eq 0) {
            # End of top-level model
            $output += $currentModelLines
            $inModel = $false
        }
    } else {
        $output += $line
    }
}

# Append extracted nested models
if ($extracted.Count -gt 0) {
    $output += ""
    foreach ($block in $extracted) {
        $output += $block
        $output += ""
    }
    Write-Host "Extracted $($extracted.Count) nested models."
}

# Now handle the malformed citizens block at the bottom (lines without model keyword)
# We'll scan the output for any lines that look like field definitions but are not inside a model
$final = @()
$i = 0
while ($i -lt $output.Count) {
    $line = $output[$i]
    $trimmed = $line.Trim()
    # If we encounter a line that starts with a field name but is not part of a model, we need to wrap it in a model
    if ($trimmed -match '^id\s+String\s+@id' -and -not ($line -match '^\s*model')) {
        # This is likely the start of the orphaned citizens block
        Write-Host "Found orphaned citizens block at line $i"
        $blockStart = $i
        # Collect until the closing brace (which should be on its own line)
        $brace = 0
        $j = $i
        while ($j -lt $output.Count) {
            $brace += ($output[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
            $brace -= ($output[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
            if ($brace -eq 0) { break }
            $j++
        }
        $orphanBlock = $output[$blockStart..$j]
        # Prepend "model citizens {"
        $corrected = @("model citizens {") + $orphanBlock
        $final += $corrected
        $i = $j + 1
    } else {
        $final += $line
        $i++
    }
}

# Write the final schema
$final | Set-Content $schemaPath
Write-Host "Schema rewritten with all models top-level."

# Now run prisma format and then prune duplicates
Write-Host "`nRunning prisma format..."
npx prisma format
if ($LASTEXITCODE -ne 0) {
    Write-Host "prisma format failed – there may be remaining issues."
    exit 1
}

# Final duplicate removal – targeted at known duplicates that might remain
Write-Host "`nPerforming final duplicate field removal..."
$lines = Get-Content $schemaPath
$duplicateLines = @(55,61,67,71,75,79,111,113,115,867,868,905,906) | Sort-Object -Descending
foreach ($i in $duplicateLines) {
    $index = $i - 1
    if ($index -lt $lines.Count -and $index -ge 0) {
        Write-Host "Removing line $i"
        $lines = $lines[0..($index-1)] + $lines[($index+1)..($lines.Count-1)]
    }
}
$lines | Set-Content $schemaPath

# Format again
npx prisma format
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema is now valid."
} else {
    Write-Host "⚠️  prisma format still reports errors. Manual review may be needed."
}

Write-Host "`nNow commit and push:"
Write-Host "  git add backend/prisma/schema.prisma"
Write-Host "  git commit -m 'Complete schema fix: extract nested, fix orphaned, remove duplicates'"
Write-Host "  git push origin main"
Read-Host "Press Enter to exit"