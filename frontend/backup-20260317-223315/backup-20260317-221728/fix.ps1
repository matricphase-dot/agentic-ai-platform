# Fix package.json BOM issue
function Fix-PackageJson {
    param([string]$Path = "package.json")
    
    # Read raw bytes
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    
    # Check for UTF-8 BOM (EF BB BF)
    if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "Removing BOM from package.json..." -ForegroundColor Yellow
        
        # Remove first 3 bytes
        $cleanBytes = New-Object byte[] ($bytes.Length - 3)
        [Array]::Copy($bytes, 3, $cleanBytes, 0, $cleanBytes.Length)
        [System.IO.File]::WriteAllBytes($Path, $cleanBytes)
        Write-Host "BOM removed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "No BOM found in package.json" -ForegroundColor Green
    }
}

# Clear processes
Write-Host "Cleaning up processes..." -ForegroundColor Cyan
taskkill /f /im node.exe 2>$null

# Clear directories
Write-Host "Clearing cache..." -ForegroundColor Cyan
Remove-Item -Path .next, node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json, yarn.lock -Force -ErrorAction SilentlyContinue

# Fix package.json
Fix-PackageJson

# Install and start
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
