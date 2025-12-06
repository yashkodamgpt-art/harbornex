const https = require('https');
const http = require('http');
const { getApiKey, getApiUrl, getChunkConfig } = require('./config');

// Make HTTP request to Harbor Cloud API
function apiRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const apiUrl = getApiUrl();
        const url = new URL(endpoint, apiUrl);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': getApiKey() || '',
            },
        };

        const req = lib.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject(new Error(json.error || `HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error(`Invalid response: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Register this device as a chunk
async function registerChunk() {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key configured. Run: harbor login <api-key>');
    }

    const chunk = getChunkConfig();
    const result = await apiRequest('POST', '/api/chunks', {
        apiKey: apiKey,
        name: chunk.name,
        storage: chunk.storage,
        ram: chunk.ram,
        cpu: chunk.cpu,
    });

    return result;
}

// Send heartbeat to keep chunk online
async function sendHeartbeat() {
    const chunk = getChunkConfig();
    return apiRequest('POST', '/api/chunks', {
        apiKey: getApiKey(),
        name: chunk.name,
        storage: chunk.storage,
        ram: chunk.ram,
        cpu: chunk.cpu,
    });
}

// Get list of user's chunks
async function listChunks() {
    return apiRequest('GET', '/api/chunks');
}

// Get list of user's projects
async function listProjects() {
    return apiRequest('GET', '/api/deploy');
}

module.exports = {
    registerChunk,
    sendHeartbeat,
    listChunks,
    listProjects,
    apiRequest,
};
