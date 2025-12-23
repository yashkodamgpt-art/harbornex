/**
 * NexFlow Combined Server
 * 
 * Runs both the GUI web server and the deployment daemon together.
 * This is the main entry point for the portable NexFlow package.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const GUI_PORT = 9876;
const GUI_DIR = __dirname;

// Simple deployment state (without full daemon for now)
let deploymentState = {
    chunks: [],
    runningApps: [],
};

// Load state from file
function loadState() {
    const statePath = path.join(require('os').homedir(), '.nexflow', 'state.json');
    if (fs.existsSync(statePath)) {
        try {
            deploymentState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        } catch (e) {
            console.log('Could not load state:', e.message);
        }
    }
}

// Save state to file
function saveState() {
    const statePath = path.join(require('os').homedir(), '.nexflow', 'state.json');
    const stateDir = path.dirname(statePath);
    if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
    }
    fs.writeFileSync(statePath, JSON.stringify(deploymentState, null, 2));
}

// Create HTTP server for GUI
const server = http.createServer((req, res) => {
    // CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle API endpoints for local daemon
    if (req.url.startsWith('/api/')) {
        handleApiRequest(req, res);
        return;
    }

    // Serve static files
    let filePath = path.join(GUI_DIR, req.url === '/' ? 'index.html' : req.url);

    // Security: prevent directory traversal
    if (!filePath.startsWith(GUI_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml'
    };

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

// Handle local API requests
function handleApiRequest(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'running',
            chunks: deploymentState.chunks,
            runningApps: deploymentState.runningApps,
        }));
        return;
    }

    if (req.url === '/api/running-apps') {
        res.writeHead(200);
        res.end(JSON.stringify({ apps: deploymentState.runningApps }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Start server
loadState();

server.listen(GUI_PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       ⚓ NexFlow Desktop Started!                     ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║   🌐 GUI:  http://localhost:${GUI_PORT}                   ║
║                                                       ║
║   • Create chunks to share your resources             ║
║   • Connect to NexCloud with your API key             ║
║   • Run and manage deployed apps                      ║
║                                                       ║
║   Press Ctrl+C to stop                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);

    // Auto-open browser (Windows)
    const { exec } = require('child_process');
    exec(`start http://localhost:${GUI_PORT}`);
});

process.on('SIGINT', () => {
    saveState();
    console.log('\n⚓ NexFlow stopped. Goodbye!');
    process.exit(0);
});
