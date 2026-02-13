# PowerShell script to fix all hardcoded URLs

$files = @(
    "src/pages/employees/LeaveManagement.jsx",
    "src/pages/employees/AttendanceManagement.jsx",
    "src/pages/employees/EmployeeLocationHistory.jsx",
    "src/pages/employees/EmployeeList.jsx",
    "src/pages/farmers/FarmerList.jsx",
    "src/pages/farmers/FarmerDetail.jsx",
    "src/pages/lab-reports/LabReports.jsx",
    "src/pages/dashboard/LabDashboard.jsx",
    "src/pages/dashboard/EmployeeDashboard.jsx",
    "src/pages/Attendence/Attendence.jsx",
    "src/pages/EmployeeModule/FarmerRegistration/FarmerRegistration.jsx",
    "src/pages/EmployeeModule/PreviousHistoryFarmers/PreviousHistory.jsx",
    "src/pages/EmployeeModule/HistoryOverview/HistoryOverview.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..."
        
        # Read content
        $content = Get-Content $file -Raw
        
        # Replace const declarations
        $content = $content -replace 'const (API_)?BASE_URL = "http://localhost:8080";', ''
        $content = $content -replace '// const (API_)?BASE_URL = "https://jiojibackendv1-production\.up\.railway\.app";', ''
        
        # Replace usage in template literals
        $content = $content -replace '\$\{API_BASE_URL\}', '${BASE_URL}'
        
        # Add import if not present
        if ($content -notmatch 'import.*BASE_URL.*from.*config/api') {
            # Find the last import statement
            $lastImportIndex = [regex]::Matches($content, "import .* from .*;").Index | Select-Object -Last 1
            if ($lastImportIndex) {
                $insertPosition = $content.IndexOf(';', $lastImportIndex) + 1
                $beforeImport = $content.Substring(0, $insertPosition)
                $afterImport = $content.Substring($insertPosition)
                
                # Determine correct path depth
                $depth = ($file -split '/').Count - 2
                $pathPrefix = '../' * $depth
                
                $content = $beforeImport + "`nimport { BASE_URL } from '${pathPrefix}config/api';" + $afterImport
            }
        }
        
        # Write back
        $content | Set-Content $file -NoNewline
        Write-Host "Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`nAll files fixed!" -ForegroundColor Cyan
