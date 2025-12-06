const chalk = require('chalk');
const { WebSocketServer } = require('ws');
const { cloneFromGitHub, runProject, DEPLOY_DIR } = require('./runner');
const { detectProjectType } = require('./detect');
const fs = require('fs');
const path = require('path');

const WS_PORT = 9999;
let wss = null;
let localApps = new Map(); // projectId -> { name, port, status, process }

async function startDaemon() {
    console.log(chalk.gray('Starting HarborFlow daemon...'));

    // Load existing local apps
    loadLocalApps();

    // Start WebSocket server for browser extension
    wss = new WebSocketServer({ port: WS_PORT });

    wss.on('connection', (ws) => {
        console.log(chalk.green('[WS] Browser extension connected'));

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                await handleMessage(ws, data);
            } catch (e) {
                console.error(chalk.red('[WS] Error:'), e.message);
                ws.send(JSON.stringify({ error: e.message }));
            }
        });

        ws.on('close', () => {
            console.log(chalk.gray('[WS] Browser extension disconnected'));
        });
    });

    console.log(chalk.green(`[WS] Server listening on port ${WS_PORT}`));
    console.log(chalk.gray('Daemon started. Waiting for commands...'));

    // Keep alive
    return new Promise(() => { });
}

async function handleMessage(ws, data) {
    console.log(chalk.cyan('[WS] Received:'), data.action);

    switch (data.action) {
        case 'list-apps':
            // Send list of local apps
            const apps = Array.from(localApps.entries()).map(([id, app]) => ({
                id,
                name: app.name,
                port: app.port,
                status: app.status,
            }));
            ws.send(JSON.stringify({ action: 'apps-list', apps }));
            break;

        case 'clone-and-start':
            // Clone from GitHub and start the app
            const { projectId, repoUrl, branch } = data;
            console.log(chalk.yellow(`[WS] Cloning ${projectId} from ${repoUrl}`));

            try {
                // Clone
                const projectDir = await cloneFromGitHub(repoUrl, branch || 'main', projectId, (msg) => {
                    console.log(chalk.dim(msg));
                });

                // Detect and run
                const projectInfo = detectProjectType(projectDir);
                if (projectInfo.type === 'unknown') {
                    ws.send(JSON.stringify({ action: 'error', message: 'Unknown project type' }));
                    return;
                }

                console.log(chalk.yellow(`[WS] Starting ${projectId} (${projectInfo.type})`));

                const result = await runProject(projectDir, projectInfo, (msg) => {
                    console.log(chalk.dim(msg));
                });

                // Track the app
                localApps.set(projectId, {
                    name: projectId,
                    port: result.port,
                    status: 'running',
                    process: result.process,
                    repoUrl,
                    branch,
                });

                saveLocalApps();

                // Notify extension
                ws.send(JSON.stringify({
                    action: 'clone-complete',
                    projectId,
                    port: result.port,
                    url: result.url,
                }));

                ws.send(JSON.stringify({ action: 'app-started', projectId, name: projectId, port: result.port }));

            } catch (e) {
                console.error(chalk.red('[WS] Clone/start error:'), e.message);
                ws.send(JSON.stringify({ action: 'error', message: e.message }));
            }
            break;

        case 'stop-app':
            const appToStop = localApps.get(data.projectId);
            if (appToStop && appToStop.process) {
                appToStop.process.kill();
                appToStop.status = 'stopped';
                saveLocalApps();
                ws.send(JSON.stringify({ action: 'app-stopped', projectId: data.projectId }));
            }
            break;

        case 'start-app':
            // Restart a stopped app
            const appToStart = localApps.get(data.projectId);
            if (appToStart) {
                const projectDir = path.join(DEPLOY_DIR, data.projectId);
                const projectInfo = detectProjectType(projectDir);
                const result = await runProject(projectDir, projectInfo, console.log);
                appToStart.process = result.process;
                appToStart.port = result.port;
                appToStart.status = 'running';
                saveLocalApps();
                ws.send(JSON.stringify({ action: 'app-started', projectId: data.projectId, port: result.port }));
            }
            break;

        default:
            ws.send(JSON.stringify({ action: 'unknown', received: data.action }));
    }
}

function loadLocalApps() {
    const configPath = path.join(require('os').homedir(), '.harborflow', 'local-apps.json');
    if (fs.existsSync(configPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            data.forEach(app => {
                localApps.set(app.id, { ...app, status: 'stopped', process: null });
            });
            console.log(chalk.gray(`Loaded ${localApps.size} local apps`));
        } catch (e) {
            console.error('Error loading local apps:', e.message);
        }
    }
}

function saveLocalApps() {
    const configPath = path.join(require('os').homedir(), '.harborflow', 'local-apps.json');
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    const data = Array.from(localApps.entries()).map(([id, app]) => ({
        id,
        name: app.name,
        port: app.port,
        repoUrl: app.repoUrl,
        branch: app.branch,
    }));
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function stopDaemon() {
    console.log('Stopping daemon...');
    if (wss) wss.close();
    // Stop all running apps
    localApps.forEach((app, id) => {
        if (app.process) {
            app.process.kill();
        }
    });
    process.exit(0);
}

function getStatus() {
    return {
        status: 'running',
        wsPort: WS_PORT,
        localApps: Array.from(localApps.entries()).map(([id, app]) => ({
            id,
            name: app.name,
            port: app.port,
            status: app.status,
        })),
    };
}

module.exports = { startDaemon, stopDaemon, getStatus };

