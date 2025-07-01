import { spawn } from 'child_process';

function testNaturalLanguageSearch() {
    console.log('🧪 Testing Natural Language Search MCP Server...');
    
    const server = spawn('node', ['build/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let responseReceived = false;
    
    server.stdout.on('data', (data) => {
        output += data.toString();
        console.log('📋 Server response:', data.toString());
        responseReceived = true;
    });

    server.stderr.on('data', (data) => {
        console.log('⚠️  Server stderr:', data.toString());
    });

    server.on('close', (code) => {
        console.log(`🔚 Server process exited with code ${code}`);
        if (!responseReceived) {
            console.log('❌ No response received from server');
        }
    });

    const naturalLanguageQueries = [
        "find all images on my desktop",
        "search for large PDF files", 
        "find recent documents in downloads folder",
        "look for .txt files"
    ];

    let queryIndex = 0;

    function sendNextQuery() {
        if (queryIndex >= naturalLanguageQueries.length) {
            console.log('✅ All tests completed!');
            server.kill();
            return;
        }

        const query = naturalLanguageQueries[queryIndex];
        console.log(`\n🔍 Testing query ${queryIndex + 1}: "${query}"`);

        const searchRequest = {
            jsonrpc: "2.0",
            id: queryIndex + 1,
            method: "tools/call",
            params: {
                name: "natural_search",
                arguments: {
                    naturalQuery: query,
                    maxResults: 5
                }
            }
        };

        server.stdin.write(JSON.stringify(searchRequest) + '\n');
        queryIndex++;

        // Send next query after 3 seconds
        setTimeout(sendNextQuery, 3000);
    }

    // Start testing after 1 second
    setTimeout(() => {
        console.log('🚀 Starting natural language search tests...\n');
        sendNextQuery();
    }, 1000);

    // Overall timeout
    setTimeout(() => {
        console.log('⏰ Test timeout reached');
        server.kill();
    }, 20000);
}

// First list tools to verify natural_search is available
function listTools() {
    console.log('📋 Listing available tools...');
    
    const server = spawn('node', ['build/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    server.stdout.on('data', (data) => {
        console.log('🔧 Available tools:', data.toString());
    });

    server.stderr.on('data', (data) => {
        console.log('⚠️  Server stderr:', data.toString());
    });

    server.on('close', (code) => {
        console.log(`📋 Tools listing completed with code ${code}`);
        console.log('\n' + '='.repeat(50));
        setTimeout(testNaturalLanguageSearch, 2000);
    });

    const listToolsRequest = {
        jsonrpc: "2.0",
        id: 0,
        method: "tools/list",
        params: {}
    };

    setTimeout(() => {
        server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
        setTimeout(() => server.kill(), 3000);
    }, 1000);
}

console.log('🎯 Everything Search MCP Server - Natural Language Test');
console.log('='.repeat(50));
listTools();