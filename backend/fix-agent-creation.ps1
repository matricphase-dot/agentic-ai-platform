# Agent Creation Auto-Fix Script
# (Clean version â€“ lineâ€‘byâ€‘line schema parsing)

Write-Host "ðŸš€ Starting Agent Creation Auto-Fix..." -ForegroundColor Cyan

function Backup-File {
    param($FilePath)
    $backupPath = "$FilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path $FilePath -Destination $backupPath
    Write-Host "âœ… Backup created: $backupPath" -ForegroundColor Green
}

Write-Host "ðŸ“ Current Directory: $(Get-Location)" -ForegroundColor Yellow

if (-not (Test-Path "src\routes\agents.ts")) {
    Write-Host "âŒ Not in backend directory! Run from D:\AGENTIC_AI\backend" -ForegroundColor Red
    exit 1
}
Write-Host "âœ… Located in correct backend directory" -ForegroundColor Green

# ----------------------------------------------------------------------
# 0. Backup and clean schema.prisma (remove BOM)
# ----------------------------------------------------------------------
Write-Host "`nðŸ§¹ Cleaning Prisma schema..." -ForegroundColor Cyan
if (Test-Path "prisma\schema.prisma") {
    Backup-File -FilePath "prisma\schema.prisma"
    $bytes = [System.IO.File]::ReadAllBytes("prisma\schema.prisma")
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $newBytes = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes("prisma\schema.prisma", $newBytes)
        Write-Host "   âœ… Removed UTF-8 BOM" -ForegroundColor Green
    } else {
        Write-Host "   âœ… No BOM found" -ForegroundColor Gray
    }
} else {
    Write-Host "âŒ Schema file not found!" -ForegroundColor Red
    exit 1
}

# ----------------------------------------------------------------------
# 1. Parse Agent model line by line (avoids regex bracket issues)
# ----------------------------------------------------------------------
Write-Host "`nðŸ“– Analyzing Prisma schema..." -ForegroundColor Cyan

$lines = Get-Content "prisma\schema.prisma"
$inAgentModel = $false
$agentModelLines = @()

foreach ($line in $lines) {
    if ($line -match 'model\s+Agent\s*{') {
        $inAgentModel = $true
        $agentModelLines = @()
    }
    if ($inAgentModel) {
        $agentModelLines += $line
        if ($line -match '^\s*}\s*$') {
            $inAgentModel = $false
        }
    }
}

if ($agentModelLines.Count -eq 0) {
    Write-Host "âŒ Could not find Agent model in schema!" -ForegroundColor Red
    exit 1
}

$agentModelText = $agentModelLines -join "`n"

# Determine field names
if ($agentModelText -match 'agentType') {
    $agentTypeField = 'agentType'
} elseif ($agentModelText -match 'agent_type') {
    $agentTypeField = 'agent_type'
} else {
    $agentTypeField = 'agent_type'   # default guess
}

if ($agentModelText -match 'user\s+User') {
    $relationField = 'user'
} elseif ($agentModelText -match 'users\s+User') {
    $relationField = 'users'
} else {
    $relationField = 'user'   # default
}

$hasUpdatedAt = $agentModelText -match 'updatedAt'

Write-Host "   Detected agent type field: $agentTypeField" -ForegroundColor Yellow
Write-Host "   Detected relation field: $relationField" -ForegroundColor Yellow
Write-Host "   Has updatedAt field: $hasUpdatedAt" -ForegroundColor Yellow

# ----------------------------------------------------------------------
# 2. Backup and fix agents.ts
# ----------------------------------------------------------------------
Write-Host "`nðŸ’¾ Backing up agents.ts..." -ForegroundColor Cyan
Backup-File -FilePath "src\routes\agents.ts"

Write-Host "ðŸ”§ Fixing agent creation code..." -ForegroundColor Cyan
$agentsContent = Get-Content "src\routes\agents.ts" -Raw

# The new code block (uses the detected field names)
$newCodeBlock = @"
    // Create agent with proper relations
    const agentData: any = {
      name,
      description,
      capabilities,
      system_prompt: systemPrompt,
      model_provider: modelProvider,
      model_name: modelName,
      status,
      ${agentTypeField}: agentType || 'GENERAL',
      reputation_score: 1000,
      hourly_rate: 50,
      success_rate: 0.85,
      total_value_created: 0,
      tasks_completed: 0,
      specialties: specialties || [],
      configuration: configuration || {},
      revenue_share: 0,
      total_earnings: 0,
      // Connect to the authenticated user
      ${relationField}: {
        connect: { id: req.user.id }
      }
    };

    // Only add createdAt if needed
    if (!agentData.createdAt) {
      agentData.createdAt = new Date();
    }

    // Remove undefined fields
    Object.keys(agentData).forEach(key => agentData[key] === undefined && delete agentData[key]);

    const agent = await prisma.agents.create({
      data: agentData
    });
"@

# Replace old code (search for the create call)
if ($agentsContent -match '(const\s+agent\s*=\s*await\s+prisma\.agents\.create\s*\(\s*{[^}]+data\s*:\s*{[^}]+}\s*}\s*\)[;\s]*)') {
    $oldCode = $matches[1]
    $agentsContent = $agentsContent.Replace($oldCode, $newCodeBlock)
    Write-Host "âœ… Replaced agent creation code" -ForegroundColor Green
} else {
    Write-Host "âš ï¸ Could not find exact pattern â€“ manual check may be needed" -ForegroundColor Yellow
}

# Save the file
$agentsContent | Set-Content "src\routes\agents.ts" -NoNewline
Write-Host "âœ… Saved changes to agents.ts" -ForegroundColor Green

# ----------------------------------------------------------------------
# 3. Fix other files using owner_id
# ----------------------------------------------------------------------
Write-Host "`nðŸ” Checking for other owner_id occurrences..." -ForegroundColor Cyan
$otherFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Where-Object { $_.Name -ne "agents.ts" }

foreach ($file in $otherFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'owner_id') {
        Write-Host "   Found owner_id in: $($file.FullName)" -ForegroundColor Yellow
        Backup-File -FilePath $file.FullName
        $content = $content -replace 'owner_id(?=\s*:)', $relationField
        $content = $content -replace '{\s*connect:\s*{[^}]+}\s*}', "{ connect: { id: req.user.id } }"
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "   âœ… Fixed $($file.Name)" -ForegroundColor Green
    }
}

# ----------------------------------------------------------------------
# 4. Regenerate Prisma client
# ----------------------------------------------------------------------
Write-Host "`nðŸ”„ Regenerating Prisma client..." -ForegroundColor Cyan
Remove-Item -Path "node_modules/.prisma" -Recurse -Force -ErrorAction SilentlyContinue
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "âœ… Prisma client regenerated" -ForegroundColor Green
} else {
    Write-Host "âš ï¸ Prisma generate failed â€“ check schema manually" -ForegroundColor Yellow
}

# ----------------------------------------------------------------------
# 5. Restart backend
# ----------------------------------------------------------------------
Write-Host "`nðŸ”„ Restarting backend server..." -ForegroundColor Cyan
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) { Stop-Process -Id $process -Force }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; npm run dev"

Write-Host "`nâœ…âœ…âœ… AUTO-FIX COMPLETED! âœ…âœ…âœ…" -ForegroundColor Green
Write-Host "Test at: http://localhost:3000/agent-chat" -ForegroundColor Yellow
