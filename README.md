# Harbor

**Turn your computer into a cloud.** Deploy apps on your own hardware with public URLs.

## 🚀 Quick Start

```bash
# 1. Start Harbor Cloud (dashboard)
cd web && .\start-server.bat

# 2. Login with your API key
node bin/harbor.js login YOUR_API_KEY

# 3. Register this device
node bin/harbor.js register

# 4. Deploy from GitHub
node bin/harbor.js deploy-git https://github.com/user/repo
```

## 📁 Project Structure

```
Harbor/
├── bin/                    # CLI executable
│   └── harbor.js           # Main CLI entry point
├── src/                    # CLI modules
│   ├── api.js              # Harbor Cloud API client
│   ├── config.js           # CLI configuration
│   ├── daemon.js           # Background service
│   ├── detect.js           # Project type detection
│   ├── runner.js           # Build & run projects
│   └── tunnel.js           # Cloudflare tunnel
├── web/                    # Harbor Cloud (Next.js)
│   ├── src/app/            # Pages & API routes
│   ├── prisma/             # Database schema
│   └── .env                # Environment config
├── desktop/                # Electron app (paused)
└── vscode-extension/       # VS Code extension
```

## 🔧 Components

| Component | Status | Description |
|-----------|--------|-------------|
| **Harbor Cloud** | ✅ | Web dashboard at localhost:3000 |
| **HarborFlow CLI** | ✅ | Deploy, tunnel, register commands |
| **GitHub Integration** | ✅ | Deploy from GitHub repos |
| **VS Code Extension** | ✅ | One-click deploy |
| **Desktop App** | ⏸️ | Needs admin to build .exe |
| **P2P Pods** | 🔜 | Coming next |

## 💻 CLI Commands

```bash
harbor login <api-key>        # Save API key
harbor register               # Connect this device
harbor deploy                 # Deploy local project
harbor deploy-git <repo>      # Deploy from GitHub
harbor tunnel <port>          # Create public URL
harbor status                 # Show status
harbor config                 # Show config
harbor start                  # Start daemon
```

## 🔑 Environment Variables

Create `web/.env`:
```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

## 📊 Database Schema

Key models in `web/prisma/schema.prisma`:
- **User** - Account with Google/GitHub OAuth
- **Chunk** - Connected device (your computer)
- **Project** - Deployed app linked to GitHub repo
- **Deployment** - Deploy history

## 🛠️ Development

```bash
# Install dependencies
cd web && npm install

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

---

*Built with Next.js, Prisma, NextAuth, and Cloudflare Tunnels*
