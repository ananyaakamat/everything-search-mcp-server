Write-Host "=== Everything Search MCP Server Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check project build
Write-Host "Checking project build..." -ForegroundColor Yellow
if (Test-Path "build\index.js") {
    Write-Host "Project is built successfully" -ForegroundColor Green
} else {
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
}

# Check Everything Search process
Write-Host "Checking Everything Search..." -ForegroundColor Yellow
$everythingProcess = Get-Process -Name "Everything" -ErrorAction SilentlyContinue
if ($everythingProcess) {
    Write-Host "Everything Search is running" -ForegroundColor Green
    
    # Test HTTP server
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:8011/" -TimeoutSec 3 -ErrorAction Stop | Out-Null
        Write-Host "Everything HTTP server is accessible on port 8011" -ForegroundColor Green
    } catch {
        Write-Host "Cannot connect to Everything HTTP server on port 8011" -ForegroundColor Red
        Write-Host "Please enable HTTP server in Everything Options" -ForegroundColor Yellow
    }
} else {
    Write-Host "Everything Search is not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Configuration Complete ===" -ForegroundColor Cyan
Write-Host "To start the server manually: node build\index.js" -ForegroundColor Yellow
Write-Host "To start with the batch file: .\start-server.bat" -ForegroundColor Yellow
Write-Host "To start with PowerShell: .\start-server.ps1" -ForegroundColor Yellow