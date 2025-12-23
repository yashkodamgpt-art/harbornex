/**
 * NexFlow Deployment Daemon
 * 
 * Runs on each chunk to:
 * 1. Poll NexCloud for pending deployments
 * 2. Clone repos from GitHub
 * 3. Build and run apps
 * 4. Create Cloudflare tunnels
 * 5. Report tunnel URLs back to NexCloud
 */

const chalk = require('chalk');
const { cloneFromGitHub, runProject, DEPLOY_DIR } = require('./runner');
const { detectProjectType } = require('./detect');
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');

// Active deployments: projectId -> { process, tunnelUrl, status }
let activeDeployments = new Map();

// Daemon config
let daemonConfig = {
    chunkId: null,
    apiUrl: null,
    apiKey: null,
    pollInterval: 10000, // 10 seconds
};

/**
 * Start the deployment daemon
 */
async function startDaemon(options = {}) {
    console.log(chalk.cyan('NexFlow Daemon Starting...'));

    // Load config
    const config = loadConfig();
    daemonConfig.apiUrl = options.apiUrl || config.apiUrl;
    daemonConfig.apiKey = options.apiKey || config.apiKey;
    daemonConfig.chunkId = options.chunkId || null;

    if (!daemonConfig.apiUrl || !daemonConfig.apiKey) {
        console.log(chalk.red('API URL and key required. Run: nexflow login <key>'));
        return;
    }

    console.log(chalk.gray('  API: ' + daemonConfig.apiUrl));
    console.log(chalk.gray('  Chunk: ' + (daemonConfig.chunkId || 'auto-detect')));

    // Load existing deployments
    loadDeploymentState();

    // Start polling for deployments
    console.log(chalk.green('Daemon started. Polling for deployments...'));
    pollForDeployments();
    setInterval(pollForDeployments, daemonConfig.pollInterval);

    // Keep alive
    return new Promise(function () { });
}

/**
 * Poll NexCloud for pending deployments on this chunk
 */
async function pollForDeployments() {
    try {
        // Get all projects assigned to our chunk(s)
        const res = await fetch(daemonConfig.apiUrl + '/api/chunks/deployments', {
            headers: { 'x-api-key': daemonConfig.apiKey }
        });

        if (!res.ok) {
            if (res.status === 404) {
                // Endpoint doesn't exist yet, use fallback
                await pollFallback();
            }
            return;
        }

        const data = await res.json();

        for (const deployment of data.deployments || []) {
            if (deployment.status === 'pending' && !activeDeployments.has(deployment.projectId)) {
                console.log(chalk.yellow('\nNew deployment: ' + deployment.projectName));
                await handleDeployment(deployment);
            }
        }
    } catch (e) {
        // Silent fail on poll - network might be down
        console.log(chalk.dim('Poll error: ' + e.message));
    }
}

/**
 * Fallback polling using existing API
 */
async function pollFallback() {
    try {
        const res = await fetch(daemonConfig.apiUrl + '/api/chunks', {
            headers: { 'x-api-key': daemonConfig.apiKey }
        });

        if (!res.ok) return;

        const data = await res.json();

        // Check each chunk for projects that need to be deployed
        for (const chunk of data.chunks || []) {
            if (chunk.deployment &&
                (chunk.deployment.status === 'pending' || chunk.deployment.status === 'stopped') &&
                chunk.deployment.repoUrl) {
                if (!activeDeployments.has(chunk.deployment.projectId)) {
                    console.log(chalk.yellow('\nNew deployment: ' + chunk.deployment.name));
                    await handleDeployment({
                        projectId: chunk.deployment.projectId,
                        projectName: chunk.deployment.name,
                        repoUrl: chunk.deployment.repoUrl,
                        branch: chunk.deployment.branch || 'main',
                        chunkId: chunk.id,
                    });
                }
            }
        }
    } catch (e) {
        // Silent
    }
}

/**
 * Handle a deployment request
 */
async function handleDeployment(deployment) {
    const projectId = deployment.projectId;
    const projectName = deployment.projectName;
    const repoUrl = deployment.repoUrl;
    const branch = deployment.branch;
    const chunkId = deployment.chunkId;

    console.log(chalk.cyan('  Repo: ' + repoUrl));
    console.log(chalk.cyan('  Branch: ' + branch));

    try {
        // Update status to 'deploying'
        await updateDeploymentStatus(projectId, 'deploying');

        // Clone the repo
        console.log(chalk.yellow('Cloning repository...'));
        const projectDir = await cloneFromGitHub(repoUrl, branch, projectId, function (msg) {
            console.log(chalk.dim('  ' + msg));
        });

        // Detect project type
        const projectInfo = detectProjectType(projectDir);
        if (projectInfo.type === 'unknown') {
            throw new Error('Unknown project type - no package.json or recognizable framework');
        }
        console.log(chalk.green('Detected: ' + projectInfo.type));

        // Run the project
        console.log(chalk.yellow('Building and starting...'));
        const result = await runProject(projectDir, projectInfo, function (msg) {
            console.log(chalk.dim('  ' + msg));
        });

        console.log(chalk.green('App running on port ' + result.port));
        console.log(chalk.green('Tunnel: ' + result.url));

        // Track deployment
        activeDeployments.set(projectId, {
            name: projectName,
            process: result.process,
            port: result.port,
            tunnelUrl: result.url,
            chunkId: chunkId,
            status: 'running',
        });

        saveDeploymentState();

        // Report back to NexCloud
        await reportTunnelUrl(projectId, result.url);
        await updateDeploymentStatus(projectId, 'running');

        console.log(chalk.green('\n' + projectName + ' deployed successfully!'));
        console.log(chalk.blue('   URL: ' + result.url + '\n'));

    } catch (e) {
        console.log(chalk.red('Deployment failed: ' + e.message));
        await updateDeploymentStatus(projectId, 'failed', e.message);
    }
}

/**
 * Update deployment status in NexCloud
 */
async function updateDeploymentStatus(projectId, status, errorMessage) {
    try {
        await fetch(daemonConfig.apiUrl + '/api/projects/' + projectId + '/status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': daemonConfig.apiKey,
            },
            body: JSON.stringify({ status: status, errorMessage: errorMessage }),
        });
    } catch (e) {
        console.log(chalk.dim('Status update failed: ' + e.message));
    }
}

/**
 * Report tunnel URL back to NexCloud
 */
async function reportTunnelUrl(projectId, tunnelUrl) {
    try {
        await fetch(daemonConfig.apiUrl + '/api/projects/' + projectId + '/tunnel', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': daemonConfig.apiKey,
            },
            body: JSON.stringify({ tunnelUrl: tunnelUrl }),
        });
    } catch (e) {
        console.log(chalk.dim('Tunnel URL report failed: ' + e.message));
    }
}

/**
 * Stop a running deployment
 */
async function stopDeployment(projectId) {
    const deployment = activeDeployments.get(projectId);
    if (deployment && deployment.process) {
        deployment.process.kill();
        deployment.status = 'stopped';
        saveDeploymentState();
        await updateDeploymentStatus(projectId, 'stopped');
        console.log(chalk.yellow('Stopped: ' + deployment.name));
    }
}

/**
 * Get status of all deployments
 */
function getStatus() {
    return {
        status: 'running',
        deployments: Array.from(activeDeployments.entries()).map(function (entry) {
            return {
                projectId: entry[0],
                name: entry[1].name,
                port: entry[1].port,
                tunnelUrl: entry[1].tunnelUrl,
                status: entry[1].status,
            };
        }),
    };
}

/**
 * Save deployment state to disk
 */
function saveDeploymentState() {
    const statePath = path.join(DEPLOY_DIR, 'daemon-state.json');
    const stateDir = path.dirname(statePath);
    if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
    }
    const state = Array.from(activeDeployments.entries()).map(function (entry) {
        return {
            projectId: entry[0],
            name: entry[1].name,
            port: entry[1].port,
            tunnelUrl: entry[1].tunnelUrl,
            chunkId: entry[1].chunkId,
            status: entry[1].status,
        };
    });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

/**
 * Load deployment state from disk
 */
function loadDeploymentState() {
    const statePath = path.join(DEPLOY_DIR, 'daemon-state.json');
    if (fs.existsSync(statePath)) {
        try {
            const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
            for (const d of state) {
                activeDeployments.set(d.projectId, {
                    name: d.name,
                    port: d.port,
                    tunnelUrl: d.tunnelUrl,
                    chunkId: d.chunkId,
                    process: null,
                    status: 'stopped',
                });
            }
            console.log(chalk.gray('Loaded ' + activeDeployments.size + ' previous deployments'));
        } catch (e) {
            console.log(chalk.dim('Could not load state: ' + e.message));
        }
    }
}

/**
 * Stop daemon and cleanup
 */
function stopDaemon() {
    console.log(chalk.yellow('Stopping daemon...'));
    for (const entry of activeDeployments) {
        if (entry[1].process) {
            entry[1].process.kill();
        }
    }
    saveDeploymentState();
    process.exit(0);
}

module.exports = { startDaemon, stopDaemon, stopDeployment, getStatus };
