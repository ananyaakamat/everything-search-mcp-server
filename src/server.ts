import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import os from "os";
import path from "path";

// Enhanced search schema with natural language support
const SearchSchema = z.object({
  query: z.string().describe("Search query"),
  scope: z.string().default("C:").describe("Search scope (default: C:)"),
  caseSensitive: z.boolean().optional().describe("Match case"),
  wholeWord: z.boolean().optional().describe("Match whole words only"),
  regex: z.boolean().optional().describe("Use regular expressions"),
  path: z.boolean().optional().describe("Search in paths"),
  maxResults: z.number().min(1).max(1000).default(100).describe("Maximum number of results (1-1000, default: 100)"),
  sortBy: z.enum(['name', 'path', 'size', 'date_modified']).optional().describe("Sort results by"),
  ascending: z.boolean().optional().describe("Sort in ascending order"),
});

// Natural language search schema
const NaturalLanguageSearchSchema = z.object({
  naturalQuery: z.string().describe("Natural language search query (e.g., 'find all images in my downloads folder', 'search for large PDF files', 'find recent documents')"),
  maxResults: z.number().min(1).max(1000).default(100).describe("Maximum number of results (1-1000, default: 100)"),
});

type SearchParams = z.infer<typeof SearchSchema>;
type NaturalLanguageSearchParams = z.infer<typeof NaturalLanguageSearchSchema>;

// Natural language processing utilities
const parseNaturalLanguageQuery = (naturalQuery: string): SearchParams => {
  const query = naturalQuery.toLowerCase();
  const result: any = {
    query: "*",
    scope: "C:",
    maxResults: 100
  };

  // File type detection
  const fileTypePatterns = {
    'image': ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.tiff', '*.webp'],
    'document': ['*.doc', '*.docx', '*.pdf', '*.txt', '*.rtf'],
    'video': ['*.mp4', '*.avi', '*.mkv', '*.mov', '*.wmv', '*.flv'],
    'audio': ['*.mp3', '*.wav', '*.flac', '*.aac', '*.ogg'],
    'code': ['*.js', '*.ts', '*.py', '*.java', '*.cpp', '*.c', '*.html', '*.css'],
    'spreadsheet': ['*.xls', '*.xlsx', '*.csv'],
    'presentation': ['*.ppt', '*.pptx'],
    'archive': ['*.zip', '*.rar', '*.7z', '*.tar', '*.gz']
  };

  // Detect file types
  for (const [type, extensions] of Object.entries(fileTypePatterns)) {
    if (query.includes(type) || query.includes(type + 's')) {
      result.query = extensions.join(' ');
      break;
    }
  }

  // Specific file extensions
  const extensionMatch = query.match(/\*?\.(\w+)/g);
  if (extensionMatch) {
    result.query = extensionMatch.join(' ');
  }

  // Location/scope detection
  const userHome = os.homedir();
  const locationMap = {
    'desktop': path.join(userHome, 'Desktop'),
    'downloads': path.join(userHome, 'Downloads'),
    'documents': path.join(userHome, 'Documents'),
    'pictures': path.join(userHome, 'Pictures'),
    'videos': path.join(userHome, 'Videos'),
    'music': path.join(userHome, 'Music'),
    'home': userHome,
  };

  for (const [location, fullPath] of Object.entries(locationMap)) {
    if (query.includes(location)) {
      result.scope = fullPath;
      break;
    }
  }

  // Drive detection
  const driveMatch = query.match(/([a-z]):/gi);
  if (driveMatch) {
    result.scope = driveMatch[0].toUpperCase();
  }

  // Size-based sorting
  if (query.includes('large') || query.includes('big') || query.includes('size')) {
    result.sortBy = 'size';
    result.ascending = false;
  }

  // Date-based sorting
  if (query.includes('recent') || query.includes('latest') || query.includes('new')) {
    result.sortBy = 'date_modified';
    result.ascending = false;
  }

  if (query.includes('old') || query.includes('oldest')) {
    result.sortBy = 'date_modified';
    result.ascending = true;
  }

  // Case sensitivity
  if (query.includes('case sensitive') || query.includes('exact case')) {
    result.caseSensitive = true;
  }

  // Whole word matching
  if (query.includes('whole word') || query.includes('exact word')) {
    result.wholeWord = true;
  }

  // Empty files
  if (query.includes('empty')) {
    result.query = 'size:0';
  }

  // Large files (over 100MB)
  if (query.includes('large file')) {
    result.query = 'size:>100mb';
  }

  // If no specific file type detected but has search terms, use them
  if (result.query === "*") {
    const searchTerms = query
      .replace(/\b(find|search|look for|get|show|list)\b/g, '')
      .replace(/\b(in|on|from|at)\s+(my\s+)?(desktop|downloads|documents|pictures|videos|music|home)\b/g, '')
      .replace(/\b(large|big|small|recent|latest|new|old|oldest|empty)\b/g, '')
      .replace(/\b(files?|documents?|images?|videos?|audio?|music)\b/g, '')
      .trim();
    
    if (searchTerms) {
      result.query = searchTerms;
    }
  }

  return result as SearchParams;
};

// Utility function to format file size
const formatFileSize = (size: string): string => {
  if (!size) return "N/A";
  
  const bytes = parseInt(size);
  if (isNaN(bytes)) return "N/A";
  
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

// Utility function to format date from Windows FILETIME
const formatFileTime = (fileTime: string): string => {
  if (!fileTime || fileTime === "" || fileTime === "0") return "No date";
  
  try {
    const bigIntTime = BigInt(fileTime);
    if (bigIntTime === 0n) return "No date";
    
    const windowsMs = bigIntTime / 10000n;
    const epochDiffMs = 11644473600000n;
    const unixMs = Number(windowsMs - epochDiffMs);
    const dateObj = new Date(unixMs);
    
    // Check if date is valid (not 1980-02-01 which indicates invalid/placeholder date)
    if (dateObj.getFullYear() === 1980 && dateObj.getMonth() === 1 && dateObj.getDate() === 1) {
      return "No date";
    }
    
    return dateObj.toLocaleString();
  } catch (error) {
    console.error('Date conversion error:', error);
    console.error('Value:', fileTime);
    return "Invalid date";
  }
};

interface SearchResult {
  name: string;
  path: string;
  size?: string;
  date_modified?: string;
  type?: string;
}

interface SearchResponse {
  totalResults: number;
  results: SearchResult[];
}

export const createServer = async () => {
  const server = new Server(
    {
      name: "everything-search",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {
          search: {
            description: "Advanced search for files using Everything Search with specific parameters",
            inputSchema: zodToJsonSchema(SearchSchema)
          },
          natural_search: {
            description: "Search for files using natural language queries (e.g., 'find all images in my downloads folder', 'search for large PDF files', 'find recent documents')",
            inputSchema: zodToJsonSchema(NaturalLanguageSearchSchema)
          }
        },
      },
    }
  );

  const searchFiles = async (params: SearchParams) => {
    try {
      // Add rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Handle search scope without direct concatenation
      const searchQuery = params.scope && params.scope !== "C:" ? 
        `${params.scope}\\${params.query}` :
        params.query;

      const response = await axios.get("http://127.0.0.1:8011/", {
        params: {
          search: searchQuery,
          json: 1,
          path_column: 1,
          size_column: 1,
          date_modified_column: 1,
          case: params.caseSensitive ? 1 : 0,
          wholeword: params.wholeWord ? 1 : 0,
          regex: params.regex ? 1 : 0,
          path: params.path ? 1 : 0,
          count: params.maxResults,
          sort: params.sortBy || "name",
          ascending: params.ascending === false ? 0 : 1,
        },
        timeout: 5000, // 5 second timeout
      });

      // Validate response structure
      if (!response.data || typeof response.data.totalResults === 'undefined') {
        throw new Error('Invalid response from Everything Search API');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          code: error.code,
          message: error.message,
          response: error.response?.data,
          config: {
            url: error.config?.url,
            params: error.config?.params
          }
        });
        if (error.code === 'ECONNREFUSED') {
          throw new Error(
            "Could not connect to Everything Search. Make sure the HTTP server is enabled in Everything's settings (Tools > Options > HTTP Server)."
          );
        }
        if (error.code === 'ETIMEDOUT') {
          throw new Error("Everything Search API request timed out. The server might be busy or unresponsive.");
        }
        throw new Error(`Everything Search API error: ${error.message}`);
      }
      console.error('Non-Axios error:', error);
      throw error;
    }
  };

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      {
        name: "natural_search",
        description: "Search for files using natural language queries (e.g., 'find all images in my downloads folder', 'search for large PDF files', 'find recent documents')",
        inputSchema: {
          type: "object",
          properties: {
            naturalQuery: { 
              type: "string", 
              description: "Natural language search query (e.g., 'find all images in my downloads folder', 'search for large PDF files', 'find recent documents')" 
            },
            maxResults: { 
              type: "number", 
              description: "Maximum number of results (1-1000, default: 100)" 
            }
          },
          required: ["naturalQuery"]
        },
      },
      {
        name: "search",
        description: "Advanced search for files using Everything Search with specific parameters",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            scope: { type: "string", description: "Search scope (default: C:)" },
            caseSensitive: { type: "boolean", description: "Match case" },
            wholeWord: { type: "boolean", description: "Match whole words only" },
            regex: { type: "boolean", description: "Use regular expressions" },
            path: { type: "boolean", description: "Search in paths" },
            maxResults: { type: "number", description: "Maximum number of results (1-1000, default: 100)" },
            sortBy: { 
              type: "string", 
              enum: ["name", "path", "size", "date_modified"],
              description: "Sort results by"
            },
            ascending: { type: "boolean", description: "Sort in ascending order" }
          },
          required: ["query"]
        },
      },
    ];

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "natural_search") {
      const validatedArgs = NaturalLanguageSearchSchema.parse(args);
      
      // Parse natural language query into search parameters
      const searchParams = parseNaturalLanguageQuery(validatedArgs.naturalQuery);
      searchParams.maxResults = validatedArgs.maxResults;
      
      const results = await searchFiles(searchParams);

      // Format the results into a readable text response
      const formattedResults = results.results && results.results.length > 0 
        ? results.results.map((result: any) => {
            const size = result.type === "folder" ? "(folder)" : formatFileSize(result.size);
            const date = formatFileTime(result.date_modified);
            
            return `📄 **${result.name}**\n   📍 Path: ${result.path}\n   📊 Size: ${size}\n   📅 Modified: ${date}\n`;
          }).join("\n") 
        : "No results found for your search.";

      const summary = `🔍 **Natural Language Search Results**\nQuery: "${validatedArgs.naturalQuery}"\nFound ${results.totalResults || 0} results:\n\n`;

      return {
        content: [
          {
            type: "text",
            text: summary + formattedResults,
          },
        ],
      };
    }

    if (name === "search") {
      const validatedArgs = SearchSchema.parse(args);
      const results = await searchFiles(validatedArgs);

      // Format the results into a readable text response
      const formattedResults = results.results && results.results.length > 0 
        ? results.results.map((result: any) => {
            const size = result.type === "folder" ? "(folder)" : formatFileSize(result.size);
            const date = formatFileTime(result.date_modified);
            
            return `Name: ${result.name}\nPath: ${result.path}\nSize: ${size}\nModified: ${date}\n`;
          }).join("\n") 
        : "No results found";

      const summary = `Found ${results.totalResults || 0} results:\n\n`;

      return {
        content: [
          {
            type: "text",
            text: summary + formattedResults,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Everything Search MCP server running on stdio');
  return server;
};