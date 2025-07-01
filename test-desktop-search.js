import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the desktop path
const desktopPath = path.join(os.homedir(), 'Desktop');
console.log('Desktop path:', desktopPath);

// Test the MCP server
function testMCPServer() {
    console.log('Testing Everything Search MCP Server...');
    console.log('Looking for .txt files on desktop...');
    
    const serverPath = path.join(__dirname, 'build', 'index.js');
    const server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let responseReceived = false;
    
    server.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Server response:', data.toString());
        responseReceived = true;
    });

    server.stderr.on('data', (data) => {
        console.log('Server stderr:', data.toString());
    });

    server.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        if (!responseReceived) {
            console.log('No response received from server');
        }
    });

    // Send search request for .txt files on desktop
    const searchRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "search",
            arguments: {
                query: "*.txt",
                scope: desktopPath,
                maxResults: 20,
                sortBy: "name"
            }
        }
    };

    // Send the request after a brief delay
    setTimeout(() => {
        console.log('Sending search request:', JSON.stringify(searchRequest, null, 2));
        server.stdin.write(JSON.stringify(searchRequest) + '\n');
        
        // Close after 10 seconds if no response
        setTimeout(() => {
            if (!responseReceived) {
                console.log('Timeout - no response received, closing server');
            }
            server.kill();
        }, 10000);
    }, 1000);
}

// First, let's list available tools
function listTools() {
    console.log('First, let\'s list available tools...');
    
    const serverPath = path.join(__dirname, 'build', 'index.js');
    const server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    
    server.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Tools response:', data.toString());
    });

    server.stderr.on('data', (data) => {
        console.log('Server stderr:', data.toString());
    });

    server.on('close', (code) => {
        console.log(`Tools listing completed with code ${code}`);
        console.log('Now testing search...');
        setTimeout(testMCPServer, 2000);
    });

    const listToolsRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
    };

    setTimeout(() => {
        console.log('Requesting tools list...');
        server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
        
        setTimeout(() => {
            server.kill();
        }, 5000);
    }, 1000);
}

// Start with listing tools
listTools();