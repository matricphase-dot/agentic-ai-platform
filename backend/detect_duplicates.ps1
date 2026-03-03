# detect_duplicates.ps1 – Detect duplicate field names in each model
$lines = Get-Content prisma/schema.prisma
$inModel = $false
$modelName = ""
$fieldCount = @{}
$lineNumber = 0

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    
    # Model start
    if ($trimmed -match '^model\s+(\w+)\s*\{') {
        $modelName = $matches[1]
        Write-Host "`nModel: $modelName"
        $fieldCount = @{}
        $lineNumber++
        continue
    }
    
    # Model end
    if ($modelName -ne "" -and $trimmed -eq '}') {
        $modelName = ""
        $lineNumber++
        continue
    }
    
    if ($modelName -ne "") {
        # Check if line starts with whitespace and a word (potential field)
        if ($line -match '^\s+(\w+)') {
            $field = $matches[1]
            if ($fieldCount.ContainsKey($field)) {
                Write-Host "  >>> Duplicate field '$field' at line $lineNumber (first at line $($fieldCount[$field]))"
            } else {
                $fieldCount[$field] = $lineNumber
            }
        }
    }
    $lineNumber++
}

Read-Host "`nPress Enter to exit"