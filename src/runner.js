const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { startTunnel } = require('./tunnel');

const DEPLOY_DIR = path.join(require('os').homedir(), '.harborflow', 'deployments');

// Ensure deployment directory exists
function ensureDeployDir() {
    if (!fs.existsSync(DEPLOY_DIR)) {
        fs.mkdirSync(DEPLOY_DIR, { recursive: true });
    }
    return DEPLOY_DIR;
}

// Extract deployment to local directory
function extractDeployment(projectId, files) {
    const projectDir = path.join(ensureDeployDir(), projectId);

    // Clean up existing deployment
    if (fs.existsSync(projectDir)) {
        fs.rmSync(projectDir, { recursive: true });
    }
    fs.mkdirSync(projectDir, { recursive: true });

    // Write files
    for (const file of files) {
        const filePath = path.join(projectDir, file.name);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content);
    }

    return projectDir;
}

// Run a project
async function runProject(projectDir, projectInfo, onLog) {
    const log = onLog || console.log;

    // Install dependencies if needed
    if (fs.existsSync(path.join(projectDir, 'package.json'))) {
        log('📦 Installing dependencies...');
        await runCommand('npm', ['install'], projectDir, log);
    }

    // Run build if needed
    if (projectInfo.buildCmd) {
        log(`🔨 Building (${projectInfo.buildCmd})...`);
        const [buildCmd, ...buildArgs] = projectInfo.buildCmd.split(' ');
        await runCommand(buildCmd, buildArgs, projectDir, log);
    }

    // Start the app
    log(`🚀 Starting app (${projectInfo.startCmd})...`);
    const [startCmd, ...startArgs] = projectInfo.startCmd.split(' ');
    const appProcess = spawn(startCmd, startArgs, {
        cwd: projectDir,
        shell: true,
        stdio: 'pipe',
    });

    appProcess.stdout.on('data', (data) => log(`[app] ${data.toString().trim()}`));
    appProcess.stderr.on('data', (data) => log(`[app] ${data.toString().trim()}`));

    // Wait a bit for app to start
    await new Promise(r => setTimeout(r, 3000));

    // Start tunnel
    log(`🌐 Creating public URL on port ${projectInfo.port}...`);
    const tunnelUrl = await startTunnel(projectInfo.port);

    return {
        process: appProcess,
        url: tunnelUrl,
        port: projectInfo.port,
    };
}

// Helper to run a command and wait
function runCommand(cmd, args, cwd, log) {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, { cwd, shell: true, stdio: 'pipe' });

        proc.stdout.on('data', (data) => log && log(`  ${data.toString().trim()}`));
        proc.stderr.on('data', (data) => log && log(`  ${data.toString().trim()}`));

        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });

        proc.on('error', reject);
    });
}

// List running deployments
function listDeployments() {
    const dir = ensureDeployDir();
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f =>
        fs.statSync(path.join(dir, f)).isDirectory()
    );
}

// Clone or pull from GitHub
async function cloneFromGitHub(repoUrl, branch, projectId, onLog) {
    const log = onLog || console.log;
    const projectDir = path.join(ensureDeployDir(), projectId);

    // Check if already cloned
    if (fs.existsSync(path.join(projectDir, '.git'))) {
        log('📥 Pulling latest from GitHub...');
        await runCommand('git', ['fetch', 'origin'], projectDir, log);
        await runCommand('git', ['checkout', branch], projectDir, log);
        await runCommand('git', ['pull', 'origin', branch], projectDir, log);
    } else {
        log('📥 Cloning from GitHub...');
        // Clone the repo
        await runCommand('git', ['clone', '-b', branch, repoUrl, projectDir], path.dirname(projectDir), log);
    }

    return projectDir;
}

module.exports = {
    ensureDeployDir,
    extractDeployment,
    runProject,
    runCommand,
    listDeployments,
    cloneFromGitHub,
    DEPLOY_DIR,
};

