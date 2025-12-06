const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');

// Config file location (shared with CLI)
const CONFIG_FILE = path.join(os.homedir(), '.harborflow', 'config.json');

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (e) {
            return {};
        }
    }
    return {};
}

function saveConfig(config) {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Status bar item
let statusBarItem;

function activate(context) {
    console.log('HarborFlow extension activated');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'harborflow.status';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('harborflow.deploy', deployCommand),
        vscode.commands.registerCommand('harborflow.login', loginCommand),
        vscode.commands.registerCommand('harborflow.status', statusCommand)
    );

    // Update status periodically
    setInterval(updateStatusBar, 30000);
}

async function updateStatusBar() {
    const config = loadConfig();
    if (config.apiKey) {
        statusBarItem.text = '$(cloud) Harbor';
        statusBarItem.tooltip = 'HarborFlow: Connected';
    } else {
        statusBarItem.text = '$(cloud) Harbor (not connected)';
        statusBarItem.tooltip = 'Click to configure HarborFlow';
    }
}

async function loginCommand() {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Harbor API key',
        placeHolder: 'cm...',
        password: true
    });

    if (apiKey) {
        const config = loadConfig();
        config.apiKey = apiKey;
        saveConfig(config);
        updateStatusBar();
        vscode.window.showInformationMessage('HarborFlow: API key saved!');
    }
}

async function statusCommand() {
    const config = loadConfig();

    if (!config.apiKey) {
        const action = await vscode.window.showWarningMessage(
            'HarborFlow is not configured',
            'Set API Key'
        );
        if (action === 'Set API Key') {
            loginCommand();
        }
        return;
    }

    vscode.window.showInformationMessage(
        `HarborFlow: Connected as ${config.chunkName || os.hostname()}`
    );
}

async function deployCommand(uri) {
    const config = loadConfig();

    if (!config.apiKey) {
        const action = await vscode.window.showWarningMessage(
            'Please set your API key first',
            'Set API Key'
        );
        if (action === 'Set API Key') {
            await loginCommand();
        }
        return;
    }

    // Get folder to deploy
    let folderPath;
    if (uri && uri.fsPath) {
        folderPath = uri.fsPath;
    } else if (vscode.workspace.workspaceFolders?.[0]) {
        folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
        vscode.window.showErrorMessage('No folder to deploy');
        return;
    }

    // Show progress
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Deploying to Harbor...',
        cancellable: true
    }, async (progress, token) => {
        progress.report({ message: 'Starting deployment...' });

        try {
            // Find harbor CLI
            const harborRoot = findHarborRoot();
            if (!harborRoot) {
                throw new Error('Harbor CLI not found. Make sure Harbor is installed.');
            }

            const nodePath = path.join(harborRoot, 'node', 'node.exe');
            const cliPath = path.join(harborRoot, 'bin', 'harbor.js');

            // Run deploy command
            const result = await runCommand(nodePath, [cliPath, 'deploy', '--path', folderPath]);

            // Extract URL from output
            const urlMatch = result.match(/https?:\/\/[^\s]+\.trycloudflare\.com/);

            if (urlMatch) {
                const action = await vscode.window.showInformationMessage(
                    `Deployed! ${urlMatch[0]}`,
                    'Open URL',
                    'Copy URL'
                );

                if (action === 'Open URL') {
                    vscode.env.openExternal(vscode.Uri.parse(urlMatch[0]));
                } else if (action === 'Copy URL') {
                    vscode.env.clipboard.writeText(urlMatch[0]);
                    vscode.window.showInformationMessage('URL copied!');
                }
            } else {
                vscode.window.showInformationMessage('Deployment started!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Deploy failed: ${error.message}`);
        }
    });
}

function findHarborRoot() {
    // Try common locations
    const locations = [
        path.join(os.homedir(), 'Desktop', 'Harbor'),
        'C:\\Users\\Student\\Desktop\\Harbor',
        path.join(__dirname, '..', '..'),
    ];

    for (const loc of locations) {
        if (fs.existsSync(path.join(loc, 'bin', 'harbor.js'))) {
            return loc;
        }
    }
    return null;
}

function runCommand(cmd, args) {
    return new Promise((resolve, reject) => {
        let output = '';
        const proc = spawn(cmd, args, { shell: true });

        proc.stdout.on('data', (data) => output += data.toString());
        proc.stderr.on('data', (data) => output += data.toString());

        proc.on('close', (code) => {
            if (code === 0 || output.includes('trycloudflare.com')) {
                resolve(output);
            } else {
                reject(new Error(output || `Exit code ${code}`));
            }
        });

        proc.on('error', reject);

        // Timeout after 5 minutes
        setTimeout(() => {
            proc.kill();
            resolve(output);
        }, 300000);
    });
}

function deactivate() { }

module.exports = { activate, deactivate };
