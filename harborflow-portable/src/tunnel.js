const { bin } = require('cloudflared');
const { spawn } = require('child_process');
const chalk = require('chalk');

// Cloudflare Tunnel Token - allows custom subdomains on harbornex.dev
const TUNNEL_TOKEN = 'eyJhIjoiOThhMDdiNjQ3OGZmZmM5MWNhZDlkYWM0ZGZmNzk3MDkiLCJ0IjoiYmFlZjBmYTYtMjE4NC00YzYwLTg3OTctNjQ1ZDUxZDQyMWQ3IiwicyI6Ik5qTTJZMkZrWlRZdE5UZzJNaTAwTnpSbExXRmpZemt0T1RSaFpURXhNR1pqWldKbSJ9';

// Domain for custom subdomains
const DOMAIN = 'harbornex.dev';

/**
 * Start a tunnel with custom subdomain
 * @param {number} port - Local port to tunnel
 * @param {string} subdomain - Subdomain name (e.g., 'navy9' -> navy9.harbornex.dev)
 * @returns {Promise<string>} - The public URL
 */
function startTunnel(port, subdomain = null) {
    return new Promise((resolve, reject) => {
        if (subdomain) {
            // Named tunnel with custom subdomain
            startNamedTunnel(port, subdomain, resolve, reject);
        } else {
            // Quick tunnel (random URL)
            startQuickTunnel(port, resolve, reject);
        }
    });
}

/**
 * Start a named tunnel with custom subdomain
 */
function startNamedTunnel(port, subdomain, resolve, reject) {
    const hostname = `${subdomain}.${DOMAIN}`;
    console.log(chalk.cyan(`  Creating tunnel: ${hostname}`));

    // Run cloudflared with the tunnel token and ingress rule
    const tunnel = spawn(bin, [
        'tunnel',
        '--no-autoupdate',
        'run',
        '--token', TUNNEL_TOKEN,
        '--url', `http://localhost:${port}`,
        '--protocol', 'http2'
    ], {
        env: {
            ...process.env,
            TUNNEL_ORIGIN_CERT: '', // Use token auth
        }
    });

    let ready = false;

    tunnel.stderr.on('data', (data) => {
        const output = data.toString();
        console.log(chalk.dim(`  [tunnel] ${output.trim()}`));

        // Check for successful connection
        if (output.includes('Registered tunnel connection') && !ready) {
            ready = true;
            // For named tunnels, we know the URL already
            resolve(`https://${hostname}`);
        }

        // Check for errors
        if (output.includes('error') || output.includes('failed')) {
            console.log(chalk.yellow(`  Named tunnel issue, falling back to quick tunnel...`));
            if (!ready) {
                // Fallback to quick tunnel
                tunnel.kill();
                startQuickTunnel(port, resolve, reject);
            }
        }
    });

    tunnel.stdout.on('data', (data) => {
        console.log(chalk.dim(`  [tunnel] ${data.toString().trim()}`));
    });

    tunnel.on('error', (err) => {
        console.log(chalk.yellow(`  Named tunnel error, falling back to quick tunnel...`));
        startQuickTunnel(port, resolve, reject);
    });

    // Timeout - if not connected in 30 seconds, fallback
    setTimeout(() => {
        if (!ready) {
            console.log(chalk.yellow(`  Named tunnel timeout, falling back to quick tunnel...`));
            tunnel.kill();
            startQuickTunnel(port, resolve, reject);
        }
    }, 30000);
}

/**
 * Start a quick tunnel (random URL) - fallback option
 */
function startQuickTunnel(port, resolve, reject) {
    console.log(chalk.cyan(`  Creating quick tunnel on port ${port}...`));

    const tunnel = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`]);

    let urlFound = false;

    tunnel.stderr.on('data', (data) => {
        const output = data.toString();
        // Look for the URL in the output
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);

        if (match && !urlFound) {
            urlFound = true;
            resolve(match[0]);
        }
    });

    tunnel.on('error', (err) => {
        reject(err);
    });
}

/**
 * Stop a tunnel
 */
function stopTunnel(tunnelProcess) {
    if (tunnelProcess) {
        tunnelProcess.kill();
    }
}

module.exports = {
    startTunnel,
    stopTunnel,
    TUNNEL_TOKEN,
    DOMAIN
};
