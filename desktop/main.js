const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Config handling
const CONFIG_DIR = path.join(os.homedir(), '.harborflow');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return { apiKey: null, apiUrl: 'http://localhost:3000', chunkName: os.hostname() };
}

function saveConfig(config) {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'icon.png'),
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open HarborFlow', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Status: Online', enabled: false },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
    ]);

    tray.setToolTip('HarborFlow - Running');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    // Don't quit, keep in tray
});

// IPC handlers
ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_, config) => saveConfig(config));

ipcMain.handle('register-chunk', async (_, apiKey) => {
    const config = loadConfig();
    const http = require('http');

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            apiKey: apiKey,
            name: config.chunkName || os.hostname(),
            storage: 10,
            ram: 2,
            cpu: 25,
        });

        const url = new URL('/api/chunks', config.apiUrl);
        const req = http.request({
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error(body));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});
