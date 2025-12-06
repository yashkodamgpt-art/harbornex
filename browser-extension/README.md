# Harbor Pod Browser Extension

Turn your browser into a Harbor Pod - self-host apps on your own device.

## Features

- **Auto-detect** Harbor-hosted sites
- **Local hosting** - Clone apps to your device
- **One-click switch** - Use local version instead of remote
- **Bandwidth saving** - Serve from your own machine

## Installation

### Chrome/Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `browser-extension` folder

### Prerequisites

1. HarborFlow daemon must be running:
   ```bash
   node bin/harbor.js start
   ```

2. The daemon starts a WebSocket server on `ws://localhost:9999`

## How It Works

```
You visit harbor-app.harbor.dev
        │
        ▼
Extension detects Harbor site
        │
        ▼
Checks with HarborFlow daemon
        │
        ├─ Local version exists? → Banner: "Switch to local"
        │
        └─ Not local? → Clone from GitHub automatically
```

## Architecture

```
browser-extension/
├── manifest.json    # Extension config
├── popup.html       # Popup UI
├── popup.js         # Popup logic
├── background.js    # WebSocket connection to HarborFlow
└── content.js       # Detects Harbor sites, shows banner
```

## WebSocket Protocol

The extension communicates with HarborFlow on `ws://localhost:9999`:

| Message | Direction | Purpose |
|---------|-----------|---------|
| `list-apps` | Ext → HF | Get local apps |
| `apps-list` | HF → Ext | List of apps |
| `clone-and-start` | Ext → HF | Clone and run |
| `clone-complete` | HF → Ext | Clone finished |
| `start-app` | Ext → HF | Start stopped app |
| `stop-app` | Ext → HF | Stop running app |
