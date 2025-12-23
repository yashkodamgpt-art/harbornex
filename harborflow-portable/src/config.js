const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * HarborNex / NexFlow Configuration
 * 
 * Brand names:
 * - HarborNex: The platform
 * - NexCloud: The dashboard (app.harbornex.dev)
 * - NexFlow: The desktop client (this)
 */
const BRAND = {
    name: 'HarborNex',
    cli: 'nexflow',
    cloud: 'NexCloud',
    flow: 'NexFlow',
};

// Production URL - change this when deploying
const PRODUCTION_URL = 'https://app.harbornex.dev';
const DEV_URL = 'http://localhost:3000';

// Config file location - PORTABLE: use Harbor/data/ folder
const HARBORNEX_ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = process.env.NEXFLOW_DATA || path.join(HARBORNEX_ROOT, 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
    apiKey: null,
    apiUrl: DEV_URL, // Will be PRODUCTION_URL when deployed
    chunkName: os.hostname(),
    storage: 10, // GB
    ram: 2,      // GB  
    cpu: 25,     // %
};

function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

function loadConfig() {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    }
    return DEFAULT_CONFIG;
}

function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function setApiKey(apiKey) {
    const config = loadConfig();
    config.apiKey = apiKey;
    saveConfig(config);
}

function getApiKey() {
    return loadConfig().apiKey;
}

function getApiUrl() {
    return loadConfig().apiUrl;
}

function setApiUrl(url) {
    const config = loadConfig();
    config.apiUrl = url;
    saveConfig(config);
}

function getChunkConfig() {
    const config = loadConfig();
    return {
        name: config.chunkName,
        storage: config.storage,
        ram: config.ram,
        cpu: config.cpu,
    };
}

module.exports = {
    loadConfig,
    saveConfig,
    setApiKey,
    getApiKey,
    getApiUrl,
    setApiUrl,
    getChunkConfig,
    CONFIG_DIR,
    CONFIG_FILE,
};
