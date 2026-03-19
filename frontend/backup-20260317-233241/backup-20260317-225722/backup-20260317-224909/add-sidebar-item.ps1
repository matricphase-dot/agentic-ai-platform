# add-sidebar-item.ps1
param(
    [string]$Name,
    [string]$Href,
    [string]$Icon,
    [bool]$RequiresAuth = $true
)

$sidebarFile = "components/Sidebar.tsx"
$content = Get-Content $sidebarFile -Raw

# Check if item already exists (by href)
if ($content -match "href: '$Href'") {
    Write-Host "⚠️ Item with href '$Href' already exists. Skipping."
    exit
}

# Check if icon is already imported; if not, add to the import line
$importPattern = '(import \{([^}]+)\} from [''"]@heroicons/react/24/outline[''"];)'
if ($content -match $importPattern) {
    $importLine = $matches[0]
    if ($importLine -notmatch "\b$Icon\b") {
        # Insert icon into existing import
        $newImport = $importLine -replace '\}', ", $Icon }"
        $content = $content -replace [regex]::Escape($importLine), $newImport
    }
} else {
    # No import found – add a new one at the top
    $newImport = "import { $Icon } from '@heroicons/react/24/outline';`r`n"
    $content = $newImport + $content
}

# Insert new navigation item before Settings
$settingsPattern = '(  \{\s+name: ''Settings'',[^\n]+\},)'
if ($content -match $settingsPattern) {
    $newItem = "  { name: '$Name', href: '$Href', icon: $Icon, requiresAuth: `$$RequiresAuth },"
    $content = $content -replace $settingsPattern, "$newItem`n  `$1"
} else {
    # If Settings not found, append to end of navigation array
    $navigationEndPattern = '(\];)'
    $newItem = "  { name: '$Name', href: '$Href', icon: $Icon, requiresAuth: `$$RequiresAuth },"
    $content = $content -replace $navigationEndPattern, "$newItem`n$1"
}

Set-Content $sidebarFile -Value $content -Encoding utf8
Write-Host "✅ Added '$Name' to sidebar."
