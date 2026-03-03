# final_fix_extract_nested.ps1 – Extract nested models to top level
$ErrorActionPreference = "Continue"
$schemaPath = "prisma/schema.prisma"
$backupPath = "prisma/schema.prisma.bak-final-nested2"
Copy-Item $schemaPath $backupPath -Force
Write-Host "Backup created at $backupPath"

$lines = Get-Content $schemaPath
$output = @()
$extracted = @()
$inModel = $false
$braceDepth = 0
$currentModel = @()
$nestedModel = $false
$modelStart = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    # Get indent length
    if ($line -match '^(\s*)') {
        $indent = $matches[1].Length
    } else {
        $indent = 0
    }

    # Detect start of a model (top-level if indent is 0)
    if ($trimmed -match '^model\s+(\w+)\s*\{' -and $indent -eq 0) {
        if ($inModel) {
            # Should not happen, but if we are inside a model and hit a top-level model, close previous
            $output += $currentModel
            $inModel = $false
        }
        $inModel = $true
        $braceDepth = 1
        $currentModel = @($line)
        $modelStart = $i
        Write-Host "Processing top-level model: $($matches[1])"
    }
    elseif ($inModel) {
        $currentModel += $line
        $braceDepth += ($line.ToCharArray() | Where-Object {$_ -eq '{'}).Count
        $braceDepth -= ($line.ToCharArray() | Where-Object {$_ -eq '}'}).Count

        # Detect if this line is the start of a nested model (indented more than the model start)
        if ($trimmed -match '^model\s+(\w+)\s*\{' -and $indent -gt 0) {
            # This is a nested model definition. We need to extract its entire block.
            Write-Host "  Found nested model: $($matches[1]) at line $i"
            $nestedLines = @($line)
            $nestedBrace = 1
            $j = $i + 1
            while ($j -lt $lines.Count) {
                $nestedLines += $lines[$j]
                $nestedBrace += ($lines[$j].ToCharArray() | Where-Object {$_ -eq '{'}).Count
                $nestedBrace -= ($lines[$j].ToCharArray() | Where-Object {$_ -eq '}'}).Count
                if ($nestedBrace -eq 0) { break }
                $j++
            }
            # Remove the nested block from current model lines
            $currentModel = $currentModel[0..($currentModel.Count-($j-$i+1)-1)]
            # Dedent the nested block by removing minimum indent
            $minIndent = [int]::MaxValue
            foreach ($l in $nestedLines) {
                if ($l.Trim() -ne "") {
                    if ($l -match '^(\s+)') {
                        $lIndent = $matches[1].Length
                        if ($lIndent -lt $minIndent) { $minIndent = $lIndent }
                    } else {
                        $lIndent = 0
                    }
                }
            }
            $dedented = @()
            foreach ($l in $nestedLines) {
                if ($l.Trim() -eq "") {
                    $dedented += $l
                } else {
                    $dedented += $l -replace "^\s{$minIndent}", ""
                }
            }
            $extracted += ,$dedented
            $i = $j   # skip processed lines
            continue
        }

        if ($braceDepth -eq 0) {
            # End of top-level model
            $output += $currentModel
            $inModel = $false
        }
    }
    else {
        $output += $line
    }
}

# Append extracted nested models at the end
if ($extracted.Count -gt 0) {
    $output += ""
    foreach ($block in $extracted) {
        $output += $block
        $output += ""
    }
    Write-Host "Extracted $($extracted.Count) nested models and appended to end."
}

$output | Set-Content $schemaPath
Write-Host "Schema rewritten with nested models moved to end."

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