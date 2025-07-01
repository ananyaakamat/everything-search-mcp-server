# Everything Search MCP Server - Configuration Guide

## Prerequisites Setup

### 1. Everything Search Engine Setup

Before using this MCP server, you need to set up Everything Search with HTTP server enabled:

1. **Download and Install Everything Search:**

   - Go to https://www.voidtools.com/
   - Download and install Everything Search

2. **Enable HTTP Server:**

   - Open Everything Search
   - Go to `Tools > Options` (or press `Ctrl+P`)
   - In the Options dialog, select `HTTP Server` from the left panel
   - Check `Enable HTTP Server`
   - Set `Port` to `8011` (default used by this MCP server)
   - Click `OK` to save changes

3. **Verify Everything is Running:**
   - Everything Search should be running in the system tray
   - Test the HTTP server by opening `http://127.0.0.1:8011/` in your browser
   - You should see the Everything Search web interface

### 2. Node.js Setup

- Ensure Node.js 16 or higher is installed
- The project dependencies are already installed and built

## MCP Server Configuration

### For Claude Desktop App

1. **Locate Claude Desktop Configuration:**

   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add Server Configuration:**
   Add this to your `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "everything-search": {
         "command": "everything-search-mcp-server",
         "args": []
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### For Other MCP Clients

Use the configuration from `mcp-config.json` in this project directory.

## Testing the Server

### Manual Test

You can test the server manually by running:

```bash
npm run build
node build/index.js
```

Or use the provided PowerShell script:

```bash
./start-server.ps1
```

### Using in Claude Desktop

Once configured, you can use the server in Claude Desktop with queries like:

1. **Basic file search:**

   ```
   Search for all .txt files
   ```

2. **Advanced search:**

   ```
   Search for files containing "test" in C:\Users, case sensitive, whole words only, sorted by date modified
   ```

3. **Regex search:**
   ```
   Find all JavaScript files using regex pattern .*\.js$ in file paths
   ```

## Available Search Parameters

- `query`: Search string (required)
- `scope`: Search scope (default: "C:")
- `caseSensitive`: Match case (optional)
- `wholeWord`: Match whole words only (optional)
- `regex`: Use regular expressions (optional)
- `path`: Search in file paths (optional)
- `maxResults`: Maximum results (1-1000, default: 100)
- `sortBy`: Sort by name/path/size/date_modified (optional)
- `ascending`: Sort direction (optional)

## Troubleshooting

### Common Issues:

1. **"Could not connect to Everything Search"**

   - Ensure Everything Search is running
   - Check HTTP Server is enabled in Everything options
   - Verify port 8011 is not blocked by firewall

2. **"Everything Search API request timed out"**

   - Everything might be indexing files
   - Try reducing the search scope or maxResults

3. **MCP Server not appearing in Claude**
   - Check the path in claude_desktop_config.json is correct
   - Ensure Node.js is in system PATH
   - Restart Claude Desktop after configuration changes

## File Structure

```
everything-search-mcp-server/
├── build/                 # Compiled JavaScript files
├── src/                   # TypeScript source files
├── mcp-config.json       # MCP server configuration
├── start-server.ps1      # Windows startup script
├── package.json          # Node.js dependencies
└── CONFIGURATION.md      # This file
```

## Performance Tips

- Use specific search scopes to limit search area
- Limit maxResults for faster responses
- Use case-sensitive and whole word options to narrow results
- Everything Search indexes files continuously, so it's very fast

## Support

If you encounter issues:

1. Check Everything Search is properly configured and running
2. Verify the HTTP server is accessible at http://127.0.0.1:8011/
3. Check Claude Desktop logs for MCP server errors
4. Test the server manually using the PowerShell script