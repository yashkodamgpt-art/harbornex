const { bin } = require('cloudflared');
const { spawn } = require('child_process');
const chalk = require('chalk');

function startTunnel(port) {
    return new Promise((resolve, reject) => {
        // cloudflared tunnel --url http://localhost:3000
        const tunnel = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`]);

        let urlFound = false;

        tunnel.stderr.on('data', (data) => {
            const output = data.toString();
            // Look for the URL in the output
            // Example: https://random-name.trycloudflare.com
            const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);

            if (match && !urlFound) {
                urlFound = true;
                resolve(match[0]);
            }
        });

        tunnel.on('error', (err) => {
            reject(err);
        });

        // Keep the process alive
        // tunnel.on('close', ...);
    });
}

module.exports = { startTunnel };
