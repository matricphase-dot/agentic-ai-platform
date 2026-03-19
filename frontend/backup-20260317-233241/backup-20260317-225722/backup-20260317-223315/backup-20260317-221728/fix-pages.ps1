Write-Host "Fixing page components..." -ForegroundColor Cyan

$pages = @(
    @{Name="projects"; Title="Projects"},
    @{Name="analytics"; Title="Analytics"},
    @{Name="team"; Title="Team"},
    @{Name="settings"; Title="Settings"}
)

foreach ($page in $pages) {
    $pagePath = "app\$($page.Name)"
    
    # Create directory if it doesn't exist
    if (!(Test-Path $pagePath)) {
        New-Item -ItemType Directory -Path $pagePath -Force
        Write-Host "Created directory: $pagePath" -ForegroundColor Yellow
    }
    
    # Create page content
    $functionName = $page.Title.Replace(' ', '') + "Page"
    $content = "export default function $functionName() {
  return (
    <div className=`"p-8`">
      <h1 className=`"text-3xl font-bold text-gray-900 mb-6`">$($page.Title)</h1>
      <div className=`"bg-white rounded-xl shadow-sm p-8 border border-gray-100`">
        <p className=`"text-gray-600`">
          $($page.Title) page content is coming soon. This is a placeholder.
        </p>
        <div className=`"mt-6 p-4 bg-blue-50 rounded-lg`">
          <p className=`"text-blue-700`">
            This page will contain $($page.Title.ToLower()) management features.
          </p>
        </div>
      </div>
    </div>
  );
}"
    
    $content | Set-Content -Path "$pagePath\page.tsx" -Encoding UTF8
    Write-Host "Created/updated: $pagePath\page.tsx" -ForegroundColor Green
}

Write-Host "`nAll pages have been fixed!" -ForegroundColor Green
