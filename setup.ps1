# Everything Search MCP Server Setup and Configuration Script
param(
    [switch]$CheckOnly,
    [switch]$ConfigureClaudeDesktop
)

Write-Host "=== Everything Search MCP Server Setup ===" -ForegroundColor Cyan
Write-Host ""

# Function to check if Everything Search is running
function Test-EverythingSearch {
    Write-Host "Checking Everything Search..." -ForegroundColor Yellow
    
    # Check if Everything process is running
    $everythingProcess = Get-Process -Name "Everything" -ErrorAction SilentlyContinue
    if (-not $everythingProcess) {
        Write-Host "❌ Everything Search process is not running" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Everything Search process is running" -ForegroundColor Green
    
    # Check HTTP server
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:8011/" -TimeoutSec 5 -ErrorAction Stop | Out-Null
        Write-Host "✅ Everything HTTP server is accessible on port 8011" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Cannot connect to Everything HTTP server on port 8011" -ForegroundColor Red
        Write-Host "   Please enable HTTP server in Everything Options" -ForegroundColor Yellow
        return $false
    }
}

# Function to check Node.js
function Test-NodeJS {
    Write-Host "Checking Node.js..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
        
        # Check if version is 16 or higher
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -ge 16) {
            Write-Host "✅ Node.js version is compatible (16+)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Node.js version is too old. Need version 16 or higher" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
        return $false
    }
}

# Function to check project build
function Test-ProjectBuild {
    Write-Host "Checking project build..." -ForegroundColor Yellow
    
    if (Test-Path "build\index.js") {
        Write-Host "✅ Project is built successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Project build files not found" -ForegroundColor Red
        Write-Host "   Running npm run build..." -ForegroundColor Yellow
        
        try {
            npm run build
            if (Test-Path "build\index.js") {
                Write-Host "✅ Project built successfully" -ForegroundColor Green
                return $true
            } else {
                Write-Host "❌ Build failed" -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "❌ Build failed with error: $_" -ForegroundColor Red
            return $false
        }
    }
}

# Function to configure Claude Desktop
function Set-ClaudeDesktopConfig {
    Write-Host "Configuring Claude Desktop..." -ForegroundColor Yellow
    
    $claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
    
    # Create config object
    $config = @{
        mcpServers = @{
            "everything-search" = @{
                command = "everything-search-mcp-server"
                args = @()
                env = @{}
            }
        }
    }
    
    # Check if config directory exists
    $configDir = Split-Path $claudeConfigPath
    if (-not (Test-Path $configDir)) {
        Write-Host "❌ Claude Desktop config directory not found: $configDir" -ForegroundColor Red
        Write-Host "   Please install Claude Desktop first" -ForegroundColor Yellow
        return $false
    }
    
    # Backup existing config if it exists
    if (Test-Path $claudeConfigPath) {
        $backupPath = "$claudeConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $claudeConfigPath $backupPath
        Write-Host "📋 Backed up existing config to: $backupPath" -ForegroundColor Cyan
        
        # Try to merge with existing config
        try {
            $existingConfig = Get-Content $claudeConfigPath | ConvertFrom-Json
            if ($existingConfig.mcpServers) {
                $existingConfig.mcpServers | Add-Member -NotePropertyName "everything-search" -NotePropertyValue $config.mcpServers."everything-search" -Force
                $config = $existingConfig
            }
        } catch {
            Write-Host "⚠️  Could not parse existing config, creating new one" -ForegroundColor Yellow
        }
    }
    
    # Write new config
    try {
        $config | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigPath -Encoding UTF8
        Write-Host "✅ Claude Desktop configuration updated" -ForegroundColor Green
        Write-Host "   Config file: $claudeConfigPath" -ForegroundColor Cyan
        Write-Host "   Please restart Claude Desktop to apply changes" -ForegroundColor Yellow
        return $true
    } catch {
        Write-Host "❌ Failed to write Claude Desktop config: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Project Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Run checks
$nodeOK = Test-NodeJS
$buildOK = Test-ProjectBuild
$everythingOK = Test-EverythingSearch

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan

if ($nodeOK -and $buildOK -and $everythingOK) {
    Write-Host "✅ All checks passed! MCP server is ready to use." -ForegroundColor Green
    
    if (-not $CheckOnly) {
        if ($ConfigureClaudeDesktop) {
            Write-Host ""
            $claudeOK = Set-ClaudeDesktopConfig
            if ($claudeOK) {
                Write-Host "🎉 Setup complete! Restart Claude Desktop to use the Everything Search server." -ForegroundColor Green
            }
        } else {
            Write-Host ""
            Write-Host "To configure Claude Desktop, run:" -ForegroundColor Yellow
            Write-Host "  .\setup.ps1 -ConfigureClaudeDesktop" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Some checks failed. Please resolve the issues above." -ForegroundColor Red
    
    if (-not $everythingOK) {
        Write-Host ""
        Write-Host "To set up Everything Search:" -ForegroundColor Yellow
        Write-Host "1. Download from https://www.voidtools.com/" -ForegroundColor Cyan
        Write-Host "2. Install and run Everything Search" -ForegroundColor Cyan
        Write-Host "3. Go to Tools menu, then Options, then HTTP Server" -ForegroundColor Cyan
        Write-Host "4. Enable HTTP Server on port 8011" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  .\setup.ps1                        - Run all checks and show status" -ForegroundColor Cyan
Write-Host "  .\setup.ps1 -CheckOnly             - Only run checks, do not configure" -ForegroundColor Cyan
Write-Host "  .\setup.ps1 -ConfigureClaudeDesktop - Configure Claude Desktop" -ForegroundColor Cyan
Write-Host "  .\start-server.ps1                 - Start the MCP server" -ForegroundColor Cyan
Write-Host "  npm test                           - Test the server" -ForegroundColor Cyan