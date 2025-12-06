# Harbor Vision Document

## The Big Picture

Harbor is **Vercel + Supabase + Distributed Computing** in one platform.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HARBOR ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   HARBOR CLOUD (Web Dashboard)                                      │
│   ├── Projects (left panel)                                        │
│   │   ├── Frontend (Vercel-like)                                   │
│   │   │   ├── Deployments                                          │
│   │   │   ├── Build logs                                           │
│   │   │   ├── Domain settings                                      │
│   │   │   └── Environment variables                                │
│   │   │                                                            │
│   │   └── Backend (Supabase-like)                                  │
│   │       ├── Database editor                                      │
│   │       ├── SQL queries                                          │
│   │       ├── Table browser                                        │
│   │       ├── API endpoints                                        │
│   │       └── Authentication                                       │
│   │                                                                │
│   └── Chunks (right panel)                                         │
│       ├── Your devices running HarborFlow                          │
│       └── Shared chunks from other users                           │
│                                                                     │
│   HARBORFLOW (Desktop App)                                          │
│   ├── Login with Google                                            │
│   ├── Create Chunks (compute you provide)                          │
│   ├── Create Pods (self-hosting)                                   │
│   ├── Unique keys for sharing                                      │
│   └── Linked to same Google account as Harbor Cloud                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Project View: Frontend + Backend

When user clicks a project, they see two tabs:

### Frontend Tab (Vercel Clone)
- Deployments list with status
- Build logs
- Preview URLs
- Production domain
- Environment variables
- Git integration (auto-deploy on push)

### Backend Tab (Supabase Clone)
- Table Editor (create/edit tables)
- SQL Editor (run raw SQL)
- Row-level security
- API documentation
- Database logs
- Backups

## HarborFlow App

### Authentication
- Login with Google OAuth
- Same account as Harbor Cloud
- Link multiple devices

### Chunks
- Compute nodes you provide
- Has unique key (like GitHub token)
- Can share key with other Harbor Cloud accounts
- Visible in dashboard under your account

### Pods
- Self-hosting mode
- Clone and run apps locally
- Connected to Google account

## harbor.json Determines Everything

```json
{
  "name": "my-app",
  "frontend": {
    "framework": "nextjs",
    "build": "npm run build",
    "output": ".next"
  },
  "backend": {
    "database": "sqlite",
    "migrations": "./prisma/migrations",
    "api": "./api"
  },
  "chunk": "specific-chunk-id"  // Optional: choose which chunk to deploy to
}
```

## Data Flow

```
1. User creates project in Harbor Cloud
2. Imports from GitHub
3. Harbor reads harbor.json
4. Frontend → Deployed to chunk
5. Backend → Database runs on chunk
6. User gets public URL
7. App is online!
```

## What We're Building (Comparison)

| Feature | Vercel | Supabase | Harbor |
|---------|--------|----------|--------|
| Frontend hosting | ✅ | ❌ | ✅ |
| Build pipeline | ✅ | ❌ | ✅ |
| Database | ❌ | ✅ | ✅ |
| SQL editor | ❌ | ✅ | ✅ |
| Auth | ❌ | ✅ | ✅ |
| Self-host | ❌ | ✅ | ✅ |
| P2P network | ❌ | ❌ | ✅ |
| Your hardware | ❌ | ❌ | ✅ |
