// Harbor Pod - Popup Script
const HARBORFLOW_WS_URL = 'ws://localhost:9999';

let ws = null;

document.addEventListener('DOMContentLoaded', () => {
    checkConnection();
    loadLocalApps();

    document.getElementById('check-connection').addEventListener('click', checkConnection);
    document.getElementById('open-settings').addEventListener('click', openSettings);
});

async function checkConnection() {
    const statusEl = document.getElementById('harborflow-status');
    statusEl.textContent = 'Connecting...';
    statusEl.className = 'value connecting';

    try {
        // Try to connect to HarborFlow WebSocket server
        ws = new WebSocket(HARBORFLOW_WS_URL);

        ws.onopen = () => {
            statusEl.textContent = 'Online';
            statusEl.className = 'value online';
            // Request list of local apps
            ws.send(JSON.stringify({ action: 'list-apps' }));
        };

        ws.onerror = () => {
            statusEl.textContent = 'Offline';
            statusEl.className = 'value offline';
        };

        ws.onclose = () => {
            statusEl.textContent = 'Offline';
            statusEl.className = 'value offline';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'apps-list') {
                updateAppsList(data.apps);
            }
        };

        // Timeout after 3 seconds
        setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                statusEl.textContent = 'Offline';
                statusEl.className = 'value offline';
                ws.close();
            }
        }, 3000);
    } catch (e) {
        statusEl.textContent = 'Offline';
        statusEl.className = 'value offline';
    }
}

async function loadLocalApps() {
    // Load from chrome storage
    chrome.storage.local.get(['localApps'], (result) => {
        const apps = result.localApps || [];
        updateAppsList(apps);
    });
}

function updateAppsList(apps) {
    const countEl = document.getElementById('local-apps-count');
    const emptyEl = document.getElementById('empty-state');
    const listEl = document.getElementById('pods-list');

    countEl.textContent = apps.length;

    if (apps.length === 0) {
        emptyEl.style.display = 'block';
        listEl.style.display = 'none';
    } else {
        emptyEl.style.display = 'none';
        listEl.style.display = 'block';
        listEl.innerHTML = apps.map(app => `
      <div class="pod-item">
        <div>
          <div class="pod-name">${app.name}</div>
          <div class="pod-status">${app.status || 'stopped'}</div>
        </div>
        <span>${app.status === 'running' ? '🟢' : '⚫'}</span>
      </div>
    `).join('');
    }

    // Save to storage
    chrome.storage.local.set({ localApps: apps });
}

function openSettings() {
    chrome.runtime.openOptionsPage?.() || alert('Settings coming soon!');
}
