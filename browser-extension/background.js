// Harbor Pod - Background Service Worker
const HARBORFLOW_WS_URL = 'ws://localhost:9999';

// Track which projects are available locally
let localProjects = new Map(); // projectId -> { port, status }
let ws = null;

// Connect to HarborFlow
function connectToHarborFlow() {
    try {
        ws = new WebSocket(HARBORFLOW_WS_URL);

        ws.onopen = () => {
            console.log('[Harbor Pod] Connected to HarborFlow');
            // Request current local apps
            ws.send(JSON.stringify({ action: 'list-apps' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleMessage(data);
        };

        ws.onclose = () => {
            console.log('[Harbor Pod] Disconnected from HarborFlow');
            // Retry after 5 seconds
            setTimeout(connectToHarborFlow, 5000);
        };

        ws.onerror = (error) => {
            console.error('[Harbor Pod] WebSocket error:', error);
        };
    } catch (e) {
        console.error('[Harbor Pod] Connection error:', e);
        setTimeout(connectToHarborFlow, 5000);
    }
}

function handleMessage(data) {
    switch (data.action) {
        case 'apps-list':
            // Update local projects map
            localProjects.clear();
            data.apps.forEach(app => {
                localProjects.set(app.id, {
                    name: app.name,
                    port: app.port,
                    status: app.status,
                });
            });
            // Save to storage for popup
            chrome.storage.local.set({ localApps: data.apps });
            break;

        case 'app-started':
            localProjects.set(data.projectId, {
                name: data.name,
                port: data.port,
                status: 'running',
            });
            break;

        case 'app-stopped':
            const app = localProjects.get(data.projectId);
            if (app) {
                app.status = 'stopped';
            }
            break;

        case 'clone-complete':
            console.log('[Harbor Pod] Clone complete:', data.projectId);
            // Notify the content script to redirect
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'redirect-to-local',
                        port: data.port,
                    });
                }
            });
            break;
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'check-local-available') {
        const projectId = message.projectId;
        const local = localProjects.get(projectId);

        if (local && local.status === 'running') {
            sendResponse({ available: true, port: local.port });
        } else {
            // Request HarborFlow to clone and start
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    action: 'clone-and-start',
                    projectId: projectId,
                    repoUrl: message.repoUrl,
                    branch: message.branch,
                }));
            }
            sendResponse({ available: false, cloning: true });
        }
        return true;
    }

    if (message.action === 'harborflow-status') {
        sendResponse({
            connected: ws && ws.readyState === WebSocket.OPEN,
            localApps: Array.from(localProjects.values()),
        });
        return true;
    }
});

// Initial connection
connectToHarborFlow();

// Check connection every 30 seconds
setInterval(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        connectToHarborFlow();
    }
}, 30000);
