# Everything Search MCP Server Startup Script
Write-Host "Starting Everything Search MCP Server..." -ForegroundColor Green

# Check if Everything Search HTTP server is accessible
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:8011/" -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "Everything Search HTTP server is accessible" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Cannot connect to Everything Search HTTP server" -ForegroundColor Yellow
    Write-Host "Please make sure:" -ForegroundColor Yellow
    Write-Host "1. Everything Search is running" -ForegroundColor Yellow
    Write-Host "2. HTTP Server is enabled in Everything Options" -ForegroundColor Yellow
    Write-Host "3. Port 8011 is configured" -ForegroundColor Yellow
    Write-Host ""
}

# Start the MCP server
Write-Host "Starting MCP Server..." -ForegroundColor Cyan
node build\index.js

Read-Host "Press Enter to exit"