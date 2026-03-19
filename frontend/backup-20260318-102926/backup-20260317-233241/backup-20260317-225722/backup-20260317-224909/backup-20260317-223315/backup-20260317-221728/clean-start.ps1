Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next, node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

Write-Host "Killing processes on ports 3000-3002..." -ForegroundColor Yellow
3000, 3001, 3002 | ForEach-Object {
    $process = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) { Stop-Process -Id $process -Force }
}

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
