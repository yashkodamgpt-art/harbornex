const fs = require('fs');
const path = require('path');
const os = require('os');

// Config file location
const CONFIG_DIR = path.join(os.homedir(), '.harborflow');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
    apiKey: null,
    apiUrl: 'http://localhost:3000',
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
