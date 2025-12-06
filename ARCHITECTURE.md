# Harbor Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HARBOR ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌──────────────┐                      ┌──────────────┐          │
│    │   DEVELOPER  │                      │     USER     │          │
│    │              │                      │              │          │
│    │  IDE/Editor  │                      │   Browser    │          │
│    └──────┬───────┘                      └──────┬───────┘          │
│           │                                     │                   │
│           ▼                                     ▼                   │
│    ┌──────────────┐                      ┌──────────────┐          │
│    │    GITHUB    │◄────── push ─────────│   VS Code    │          │
│    │              │                      │  Extension   │          │
│    └──────┬───────┘                      └──────────────┘          │
│           │                                                         │
│           │ webhook / git clone                                     │
│           ▼                                                         │
│    ┌──────────────────────────────────────────────────────┐        │
│    │                    HARBOR CLOUD                       │        │
│    │                  (localhost:3000)                     │        │
│    │                                                       │        │
│    │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │        │
│    │  │   NextAuth  │ │   Prisma    │ │  API Routes │    │        │
│    │  │ Google/GitHub│ │  SQLite DB  │ │  /api/*     │    │        │
│    │  └─────────────┘ └─────────────┘ └─────────────┘    │        │
│    └──────────────────────────┬───────────────────────────┘        │
│                               │                                     │
│                               │ coordinates                         │
│                               ▼                                     │
│    ┌──────────────────────────────────────────────────────┐        │
│    │                   HARBORFLOW CLI                      │        │
│    │               (on developer's device)                 │        │
│    │                                                       │        │
│    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │        │
│    │  │  Git    │ │ Runner  │ │ Tunnel  │ │ Daemon  │    │        │
│    │  │ Clone   │ │ Build   │ │ Public  │ │Heartbeat│    │        │
│    │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │        │
│    └──────────────────────────┬───────────────────────────┘        │
│                               │                                     │
│                               ▼                                     │
│                    ┌──────────────────┐                            │
│                    │ Cloudflare Tunnel │                            │
│                    │  xxx.trycloudflare.com                        │
│                    └──────────────────┘                            │
│                               │                                     │
│                               ▼                                     │
│                         PUBLIC WEB                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Deploy from GitHub
```
Developer pushes to GitHub
         │
         ▼
GitHub webhook → Harbor Cloud API
         │
         ▼
Harbor Cloud notifies HarborFlow CLI
         │
         ▼
HarborFlow: git clone → npm install → npm start
         │
         ▼
Cloudflare Tunnel creates public URL
         │
         ▼
App is live at xxx.trycloudflare.com
```

### 2. Authentication Flow
```
User clicks "Login with GitHub"
         │
         ▼
Redirect to github.com/login/oauth
         │
         ▼
User authorizes Harbor app
         │
         ▼
GitHub redirects to /api/auth/callback/github
         │
         ▼
NextAuth creates session + stores token
         │
         ▼
User logged in, can access /dashboard
```

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     USER     │     │    CHUNK     │     │   PROJECT    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │────<│ userId       │     │ userId       │>────┐
│ email        │     │ name         │────<│ chunkId      │     │
│ apiKey       │     │ status       │     │ name         │     │
│ accounts[]   │     │ storage      │     │ subdomain    │     │
└──────────────┘     │ ram          │     │ githubRepoUrl│     │
                     │ cpu          │     │ githubBranch │     │
                     │ lastSeen     │     │ tunnelUrl    │     │
                     └──────────────┘     │ status       │     │
                                          └──────────────┘     │
                                                   │           │
                                          ┌────────▼───────┐   │
                                          │  DEPLOYMENT    │   │
                                          ├────────────────┤   │
                                          │ projectId      │>──┘
                                          │ version        │
                                          │ status         │
                                          └────────────────┘
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/* | NextAuth handlers |
| GET | /api/github/repos | List user's GitHub repos |
| POST | /api/github/webhook | Receive GitHub push events |
| GET/POST | /api/projects | List/create projects |
| GET/POST | /api/projects/[id] | Get/update single project |
| POST | /api/chunks | Register a device |
| POST | /api/chunks/heartbeat | Device health check |

## File Structure Details

```
Harbor/
├── bin/
│   └── harbor.js           # CLI entry (Commander.js)
│
├── src/
│   ├── api.js              # HTTP client for Harbor Cloud
│   ├── config.js           # ~/.harborflow/config.json
│   ├── daemon.js           # Background process
│   ├── detect.js           # Detect: nextjs, express, static
│   ├── runner.js           # npm install, build, start
│   └── tunnel.js           # cloudflared integration
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        # API routes
│   │   │   │   ├── auth/   # NextAuth
│   │   │   │   ├── github/ # GitHub integration
│   │   │   │   ├── projects/
│   │   │   │   └── chunks/
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   ├── login/      # OAuth login page
│   │   │   └── projects/   # Project pages
│   │   └── lib/
│   │       ├── auth.ts     # NextAuth config
│   │       └── prisma.ts   # Prisma client
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── .env                # Environment variables
│
├── desktop/                # Electron (paused)
│   ├── main.js
│   └── index.html
│
└── vscode-extension/       # VS Code ext
    ├── package.json
    └── extension.js
```

## Configuration Files

### CLI Config: ~/.harborflow/config.json
```json
{
  "apiKey": "cm...",
  "apiUrl": "http://localhost:3000",
  "chunkName": "AB10-105-31"
}
```

### Web Config: web/.env
```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

## Future: P2P Pod Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    P2P POD ARCHITECTURE (PLANNED)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DEVELOPER POD                     USER WITH POD                  │
│   ┌───────────┐                     ┌───────────┐                  │
│   │   App     │──── initial ───────>│  Clone    │                  │
│   │  Source   │     sync            │   App     │                  │
│   └───────────┘                     └─────┬─────┘                  │
│                                           │                         │
│                                           ▼                         │
│                                     ┌───────────┐                  │
│                                     │ localhost │                  │
│                                     │   :3001   │                  │
│                                     └───────────┘                  │
│                                           │                         │
│                                           ▼                         │
│                                     User uses app                   │
│                                     from OWN machine                │
│                                                                     │
│   USER WITHOUT POD                                                 │
│   ┌───────────┐                                                    │
│   │  Browser  │────> Developer's server handles                   │
│   └───────────┘                                                    │
│                                                                     │
│   RESULT: Developer only serves users WITHOUT pods                 │
│           20% pod adoption = 20% bandwidth saved                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
