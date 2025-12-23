# HarborNex - Complete Setup & Testing Guide

## OVERVIEW

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   PC 1 - NEXCLOUD       │   ←→    │   PC 2 - NEXFLOW        │
│   (Dashboard/Cloud)     │         │   (Resources/Runner)    │
│                         │         │                         │
│   - Create projects     │         │   - Share resources     │
│   - Import from GitHub  │         │   - Run deployed apps   │
│   - Deploy to chunks    │         │   - Create tunnels      │
└─────────────────────────┘         └─────────────────────────┘
```

---

# 🚀 COMPLETE IGNITION SEQUENCE

## PHASE 1: Start NexCloud (Dashboard PC)

### Step 1.1: Start the Dashboard
```powershell
cd C:\Users\Student\Desktop\Harbor\web
npm run dev
```
Dashboard will be at: http://localhost:3000

### Step 1.2: Note Your Info
- **Your IP Address:** Run `ipconfig` → Look for IPv4 (e.g., 10.0.177.38)
- **Your API Key:** Login to dashboard → Settings page → Copy API key

---

## PHASE 2: Setup NexFlow (Portable PC)

### Step 2.1: Copy the Folder
Copy entire `harborflow-portable` folder to the other PC

### Step 2.2: Configure Connection
Double-click: **`auto-setup.bat`**

(If IP or API key is different, edit auto-setup.bat first!)

### Step 2.3: Start the Daemon ← START THIS FIRST!
Double-click: **`start-daemon.bat`**

You should see:
```
NexFlow Daemon Starting...
  API: http://10.0.177.38:3000
Daemon started. Polling for deployments...
```

**KEEP THIS WINDOW OPEN!**

---

## PHASE 3: Create & Deploy Project (Dashboard PC)

### Step 3.1: Create Project from GitHub
1. Open dashboard: http://localhost:3000
2. Click **"+ Deploy New App"**
3. Enter GitHub URL (e.g., https://github.com/yashkodamgpt-art/hebbian-simulator)
4. Enter subdomain name
5. Click **Create**

### Step 3.2: Select Chunk & Deploy
1. Open the project you just created
2. In the **Deploy** section, select your connected chunk
3. Click **"Deploy Now"**

---

## PHASE 4: Watch the Magic! (Portable PC)

The daemon console will show:
```
New deployment: Your-Project-Name
  Repo: https://github.com/...
  Branch: main
Cloning repository...
Detected: vite
Building and starting...
App running on port 4173
Tunnel: https://something.trycloudflare.com

✅ Your-Project-Name deployed successfully!
   URL: https://something.trycloudflare.com
```

### Step 4.1: Access Your App!
Open the tunnel URL in any browser - your app is live!

---

# 📋 QUICK REFERENCE - ORDER MATTERS!

| Order | PC | Action | Why |
|-------|-----|--------|-----|
| 1 | Dashboard | `npm run dev` | Start cloud server |
| 2 | Portable | `auto-setup.bat` | Configure connection |
| 3 | Portable | `start-daemon.bat` | **Start BEFORE deploying!** |
| 4 | Dashboard | Create project | Import from GitHub |
| 5 | Dashboard | Deploy to chunk | Sends to daemon |
| 6 | Portable | (Automatic) | Daemon runs the app |
| 7 | Anywhere | Open tunnel URL | Access the live app! |

---

# ❓ FAQ

**Q: Start daemon before or after deploying?**
A: **BEFORE!** The daemon must be running to detect and run deployments.

**Q: Can I deploy multiple projects?**
A: Yes, but currently one project per chunk. Create more chunks for more projects.

**Q: What if the tunnel URL doesn't work?**
A: Check the daemon console for errors. Common issue: Vite blocks the host (fixed in harbor.json).

**Q: How do I re-deploy?**
A: Currently, stop the daemon, delete `data/` folder, restart daemon, and deploy again.

---

# � FILES IN THIS FOLDER

```
harborflow-portable/
├── README.txt          ← You are here
├── auto-setup.bat      ← Run first (configures connection)
├── start-daemon.bat    ← Run second (polls for deployments)
├── start-gui.bat       ← Optional (view status in browser)
├── setup.bat           ← Manual setup if auto doesn't work
├── bin/                ← CLI commands
├── gui/                ← GUI web interface
├── node/               ← Portable Node.js (no install needed)
├── node_modules/       ← Dependencies
└── src/                ← Daemon source code
```

---

# � TROUBLESHOOTING

**"No API key configured"**
→ Run `auto-setup.bat` first

**"Connection failed"**
→ Check that dashboard PC is running `npm run dev`
→ Verify IP address in `auto-setup.bat` is correct
→ Make sure both PCs are on same network

**Daemon says "Loaded X previous deployments" but doesn't run**
→ Delete the `data/` folder and restart daemon

**"Blocked request" error in browser**
→ The Vite app needs `allowedHosts: 'all'` in vite.config.ts

---

Created by HarborNex Team
