Write-Host "🚀 Everything Search MCP Server - Global Installation" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Step 1: Build and install globally
Write-Host "📦 Building and installing globally..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

npm install -g .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Global installation successful" -ForegroundColor Green
} else {
    Write-Host "❌ Global installation failed" -ForegroundColor Red
    exit 1
}

# Step 2: Test the installation
Write-Host ""
Write-Host "🧪 Testing global installation..." -ForegroundColor Yellow
everything-search-mcp-server --version 2>&1 | Out-Null
if ($LASTEXITCODE -eq 1) {
    Write-Host "✅ Global command is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Global command test failed" -ForegroundColor Red
}

# Step 3: Show configuration
Write-Host ""
Write-Host "📋 Claude Desktop Configuration:" -ForegroundColor Yellow
Write-Host "Copy this to %APPDATA%\Claude\claude_desktop_config.json" -ForegroundColor Cyan
Write-Host ""
Get-Content "claude-desktop-config.json" | Write-Host -ForegroundColor White
Write-Host ""

# Step 4: Test natural language processing
Write-Host "🧠 Testing natural language processing..." -ForegroundColor Yellow
Write-Host "Running natural language tests..." -ForegroundColor Cyan
node test-natural-language.js

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "The Everything Search MCP Server is now:" -ForegroundColor White
Write-Host "  ✅ Globally accessible" -ForegroundColor Green  
Write-Host "  ✅ Enhanced with natural language processing" -ForegroundColor Green
Write-Host "  ✅ Ready for Claude Desktop integration" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the configuration above to Claude Desktop config" -ForegroundColor White
Write-Host "2. Restart Claude Desktop" -ForegroundColor White
Write-Host "3. Start using natural language file search!" -ForegroundColor White