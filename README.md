# Everything Search MCP Server

[![npm version](https://badge.fury.io/js/everything-search-mcp-server.svg)](https://www.npmjs.com/package/everything-search-mcp-server)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)
[![Windows Only](https://img.shields.io/badge/platform-Windows-blue)](https://www.microsoft.com/windows)

A powerful Model Context Protocol (MCP) server that integrates with Everything Search Engine, providing lightning-fast file search capabilities across your entire system. This server enables natural language file searches and advanced filtering options through MCP-compatible applications like Claude Desktop, VS Code, and other MCP clients.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Step 1: Install Everything Search Engine](#step-1-install-everything-search-engine)
  - [Step 2: Install the MCP Server](#step-2-install-the-mcp-server)
  - [Step 3: Configure Your MCP Client](#step-3-configure-your-mcp-client)
  - [Step 4: Restart Your MCP Client](#step-4-restart-your-mcp-client)
- [Usage](#usage)
- [Examples](#examples)
- [Parameters Reference](#parameters-reference)
- [Troubleshooting](#troubleshooting)
- [What's New](#whats-new)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

- 🚀 **Lightning Fast Search**: Leverages Everything Search Engine's instant file indexing
- 🔍 **Natural Language Queries**: Search using natural language descriptions like "large video files" or "recent documents"
- 🎯 **Advanced Search Options**: Case sensitivity, whole word matching, regex support
- 📁 **Path-Based Search**: Search within specific directories or across entire drives
- 📊 **Smart Sorting**: Sort by name, path, size, or modification date
- 🎨 **Rich Formatting**: Human-readable file sizes and formatted dates
- 🌐 **Global Installation**: Install once, use everywhere across all MCP clients
- ⚡ **Real-time Results**: Instant search results as you type
- 🔧 **Highly Configurable**: Customizable ports, scopes, and search parameters

## Quick Start

### Prerequisites

1. **Windows OS** (Everything Search Engine is Windows-only)
2. **Node.js 16+** - [Download here](https://nodejs.org/)
3. **Everything Search Engine** - [Download here](https://www.voidtools.com/)

### Step 1: Install Everything Search Engine

1. Download and install [Everything Search Engine](https://www.voidtools.com/)
2. Open Everything Search
3. Go to **Tools > Options > HTTP Server**
4. ✅ Enable **HTTP Server**
5. Set port to **8011** (default)
6. Click **OK** and restart Everything

### Step 2: Install the MCP Server

#### Option A: Global Installation (Recommended)

```bash
npm install -g everything-search-mcp-server
```

> **Note**: If you haven't published to npm yet, users should use Option B (From Source) until the package is available on npm.

#### Option B: From Source

```bash
git clone https://github.com/ananyaakamat/everything-search-mcp-server.git
cd everything-search-mcp-server
npm install
npm run build
npm install -g .
```

### Step 3: Configure Your MCP Client

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

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

**Config File Locations:**

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### For VS Code

Add to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "everything-search": {
      "command": "everything-search-mcp-server",
      "args": []
    }
  }
}
```

### Step 4: Restart Your MCP Client

Restart Claude Desktop or VS Code to load the new server.

### Step 5: Verify Installation

Test that the server is working:

```bash
# Check if the command is available
everything-search-mcp-server --help

# Or test with a simple search (if Everything is running)
# The server should start and respond to MCP requests
```

In your MCP client, try a simple search like:

- "Search for README files"
- "Find all .txt files"
- "Show me large video files"
- "Find recent Word documents"

## Usage

The server provides two powerful tools:

### 1. `search` - Advanced File Search

```json
{
  "query": "search terms",
  "scope": "C:",
  "caseSensitive": false,
  "wholeWord": false,
  "regex": false,
  "path": false,
  "maxResults": 100,
  "sortBy": "name",
  "ascending": true
}
```

### 2. `natural_search` - Natural Language Search

```json
{
  "naturalQuery": "find all video files larger than 1GB",
  "maxResults": 50
}
```

## Examples

### Basic Searches

```json
// Find all PDF files
{
  "query": "*.pdf",
  "maxResults": 10
}

// Search for "readme" files
{
  "query": "readme",
  "maxResults": 5
}
```

### Advanced Searches

```json
// Case-sensitive search in specific directory
{
  "query": "Config",
  "scope": "C:\\Users\\YourName\\AppData",
  "caseSensitive": true,
  "maxResults": 20
}

// Regex search for JavaScript files
{
  "query": ".*\\.(js|ts)$",
  "regex": true,
  "sortBy": "date_modified",
  "ascending": false
}
```

### Natural Language Searches

```json
// Find large video files
{
  "naturalQuery": "large video files on desktop",
  "maxResults": 10
}

// Find recent documents
{
  "naturalQuery": "documents modified this week",
  "maxResults": 15
}

// Find development projects
{
  "naturalQuery": "programming projects with package.json",
  "maxResults": 5
}
```

## Parameters Reference

### `search` Tool Parameters

| Parameter       | Type    | Default      | Description                                      |
| --------------- | ------- | ------------ | ------------------------------------------------ |
| `query`         | string  | **required** | Search query string                              |
| `scope`         | string  | `"C:"`       | Search scope/directory                           |
| `caseSensitive` | boolean | `false`      | Enable case-sensitive matching                   |
| `wholeWord`     | boolean | `false`      | Match whole words only                           |
| `regex`         | boolean | `false`      | Enable regular expressions                       |
| `path`          | boolean | `false`      | Search in file paths                             |
| `maxResults`    | number  | `100`        | Maximum results (1-1000)                         |
| `sortBy`        | string  | `"name"`     | Sort by: `name`, `path`, `size`, `date_modified` |
| `ascending`     | boolean | `true`       | Sort direction                                   |

### `natural_search` Tool Parameters

| Parameter      | Type   | Default      | Description                         |
| -------------- | ------ | ------------ | ----------------------------------- |
| `naturalQuery` | string | **required** | Natural language search description |
| `maxResults`   | number | `100`        | Maximum results (1-1000)            |

## Troubleshooting

### Common Issues

1. **"Connection refused" error**

   - Ensure Everything Search is running
   - Verify HTTP Server is enabled (Tools > Options > HTTP Server)
   - Check port 8011 is not blocked by firewall

2. **"Command not found" error**

   - Ensure the server is installed globally: `npm install -g everything-search-mcp-server`
   - Verify Node.js is in your PATH

3. **No results returned**

   - Allow Everything to complete initial indexing (can take a few minutes for large drives)
   - Check if Everything can find files through its GUI first
   - Verify your search scope exists and is accessible
   - Ensure you have read permissions for the search directory

4. **Performance issues**
   - Reduce `maxResults` for faster responses
   - Use more specific search scopes to limit search area
   - Consider using exact file extensions instead of wildcards

### Configuration

#### Custom Port Configuration

If you need to use a different port:

1. Change Everything's HTTP port (Tools > Options > HTTP Server)
2. Set environment variable: `EVERYTHING_PORT=8012`
3. Or modify the server source code

#### Debug Mode

Enable debug logging:

```bash
DEBUG=everything-search:* everything-search-mcp-server
```

## What's New

### Version 1.0.0 🎉

- **Initial Release**: Complete MCP server implementation
- **Natural Language Search**: AI-powered search queries
- **Global Installation**: Easy npm-based installation
- **Multi-Client Support**: Works with Claude Desktop, VS Code, and other MCP clients
- **Advanced Search Options**: Regex, case sensitivity, path search
- **Rich Documentation**: Comprehensive setup and usage guide

## Development

### Building from Source

```bash
git clone https://github.com/ananyaakamat/everything-search-mcp-server.git
cd everything-search-mcp-server
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -am 'Add feature'`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## License

ISC License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ananyaakamat/everything-search-mcp-server/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ananyaakamat/everything-search-mcp-server/discussions)
- 📧 **Email**: anant.kamat.in@gmail.com

## Related Projects

- [Everything Search Engine](https://www.voidtools.com/) - The powerful file search engine this server integrates with
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
- [Claude Desktop](https://claude.ai/desktop) - AI assistant with MCP support

---

**Made with ❤️ for the MCP community**