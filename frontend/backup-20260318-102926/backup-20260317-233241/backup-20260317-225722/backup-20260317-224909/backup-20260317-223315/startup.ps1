Write-Host "Starting Agentic AI Frontend..." -ForegroundColor Cyan

# Kill existing processes
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force
$ports = 3000, 3001, 3002
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) { Stop-Process -Id $process -Force }
}

# Check and fix package.json BOM
$packagePath = "package.json"
if (Test-Path $packagePath) {
    $content = Get-Content $packagePath -Raw
    if ($content -match '^\uFEFF') {
        Write-Host "Fixing BOM in package.json..." -ForegroundColor Yellow
        $content = $content -replace '^\uFEFF', ''
        [System.IO.File]::WriteAllText($packagePath, $content, [System.Text.Encoding]::UTF8)
    }
}

# Start dev server
Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev
