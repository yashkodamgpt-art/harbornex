// Harbor Pod - Content Script
// Runs on Harbor-hosted sites to check if local pod is available

(function () {
    // Extract project info from URL
    const hostname = window.location.hostname;
    let projectId = null;

    // Check if this is a Harbor site
    if (hostname.endsWith('.harbor.dev')) {
        projectId = hostname.replace('.harbor.dev', '');
    } else if (hostname.endsWith('.trycloudflare.com')) {
        // For trycloudflare, we need to look up the project
        // This will be enhanced later
        return;
    }

    if (!projectId) return;

    console.log('[Harbor Pod] Detected Harbor site:', projectId);

    // Check with background if local pod is available
    chrome.runtime.sendMessage(
        {
            action: 'check-local-available',
            projectId: projectId,
        },
        (response) => {
            if (response && response.available) {
                console.log('[Harbor Pod] Local pod available on port', response.port);
                showPodBanner(response.port);
            } else if (response && response.cloning) {
                console.log('[Harbor Pod] Cloning to local pod...');
                showCloningBanner();
            }
        }
    );

    // Listen for redirect command from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'redirect-to-local') {
            console.log('[Harbor Pod] Redirecting to local:', message.port);
            window.location.href = `http://localhost:${message.port}`;
        }
    });

    function showPodBanner(port) {
        const banner = document.createElement('div');
        banner.id = 'harbor-pod-banner';
        banner.innerHTML = `
      <style>
        #harbor-pod-banner {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #1e40af, #7c3aed);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        #harbor-pod-banner:hover {
          transform: scale(1.02);
        }
        #harbor-pod-banner .icon {
          font-size: 20px;
        }
        #harbor-pod-banner .close {
          margin-left: 8px;
          opacity: 0.7;
          cursor: pointer;
        }
        #harbor-pod-banner .close:hover {
          opacity: 1;
        }
      </style>
      <span class="icon">⚓</span>
      <span>Local pod available! <strong>Click to switch</strong></span>
      <span class="close" onclick="event.stopPropagation(); this.parentElement.remove();">✕</span>
    `;

        banner.addEventListener('click', () => {
            window.location.href = `http://localhost:${port}`;
        });

        document.body.appendChild(banner);
    }

    function showCloningBanner() {
        const banner = document.createElement('div');
        banner.id = 'harbor-pod-banner';
        banner.innerHTML = `
      <style>
        #harbor-pod-banner {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #334155, #1e293b);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        #harbor-pod-banner .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
      <span class="spinner">⚓</span>
      <span>Cloning to your local pod...</span>
    `;
        document.body.appendChild(banner);
    }
})();
