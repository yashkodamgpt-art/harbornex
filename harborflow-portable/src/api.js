const https = require('https');
const http = require('http');
const { getApiKey, getApiUrl, getChunkConfig, loadConfig, saveConfig } = require('./config');

// Cached chunk ID (to avoid creating duplicates)
let cachedChunkId = null;

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
            path: url.pathname + (url.search || ''),
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

// Register this device as a chunk (or reuse existing)
async function registerChunk() {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key configured. Run: harbor login <api-key>');
    }

    // Check if we already have a registered chunk ID
    const config = loadConfig();
    if (config.chunkId) {
        cachedChunkId = config.chunkId;
        // Just send heartbeat to mark as online
        await sendHeartbeat();
        return { chunk: { id: config.chunkId, name: config.chunkName } };
    }

    // First, check if chunk with this name already exists
    try {
        const existing = await listChunks();
        const chunk = getChunkConfig();
        const found = (existing.chunks || []).find(c => c.name === chunk.name);
        if (found) {
            // Reuse existing chunk
            cachedChunkId = found.id;
            config.chunkId = found.id;
            saveConfig(config);
            await sendHeartbeat();
            return { chunk: found };
        }
    } catch (e) {
        // Ignore and create new
    }

    // Create new chunk
    const chunk = getChunkConfig();
    const result = await apiRequest('POST', '/api/chunks', {
        apiKey: apiKey,
        name: chunk.name,
        storage: chunk.storage,
        ram: chunk.ram,
        cpu: chunk.cpu,
    });

    // Save chunk ID for future use
    if (result.chunk && result.chunk.id) {
        cachedChunkId = result.chunk.id;
        config.chunkId = result.chunk.id;
        saveConfig(config);
    }

    return result;
}

// Send heartbeat to keep chunk online (PATCH, not POST)
async function sendHeartbeat() {
    const config = loadConfig();
    const chunkId = cachedChunkId || config.chunkId;

    if (!chunkId) {
        // No chunk registered, register first
        return registerChunk();
    }

    // Use PATCH to update existing chunk status
    try {
        return await apiRequest('PATCH', `/api/chunks?id=${chunkId}`, {
            status: 'online',
            lastSeen: new Date().toISOString(),
        });
    } catch (e) {
        // Chunk might be deleted, clear cache and re-register
        cachedChunkId = null;
        config.chunkId = null;
        saveConfig(config);
        throw e;
    }
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
