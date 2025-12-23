# HarborNex - Investor Technical Specification
## Distributed Application Deployment Platform
### Version 1.1 | December 2024

---

# Executive Summary

**HarborNex** is "Vercel for your own hardware" — a distributed application deployment platform that enables developers to deploy web applications on their own devices (PCs, office computers, home servers) instead of paying for cloud hosting.

**In 7 days, we built a working MVP that:**
- ✅ Deploys apps from GitHub to personal computers
- ✅ Creates public URLs via Cloudflare tunnels
- ✅ Runs without installation (portable executable)
- ✅ Works across multiple machines simultaneously
- ✅ Tested end-to-end successfully

**Target Market:** The 15+ million developers using AI coding tools (Cursor, Replit, V0) who need zero-friction deployment.

**Core Value Proposition:**
- **Zero hosting costs** — use hardware you already own
- **AI-native** — deploy directly from Cursor/Antigravity
- **Full data ownership** — everything runs on YOUR devices
- **No vendor lock-in** — open architecture

---

# Table of Contents

1. [The Problem](#1-the-problem)
2. [Our Solution](#2-our-solution)
3. [Technical Architecture](#3-technical-architecture)
4. [Current Progress](#4-current-progress)
5. [Security & IP Protection](#5-security--ip-protection)
6. [Business Model](#6-business-model)
7. [Market Analysis](#7-market-analysis)
8. [Timeline & Roadmap](#8-timeline--roadmap)
9. [Team & Execution](#9-team--execution)
10. [Investment Ask](#10-investment-ask)

---

# 1. The Problem

## 1.1 The "Last Mile" Problem in AI-Assisted Development

AI coding tools have revolutionized how developers build software:
- **Cursor:** 500K+ active users
- **Replit:** 25M+ users
- **GitHub Copilot:** 1.3M+ paying subscribers

**But there's a gap:** These tools help you BUILD apps, but getting them LIVE still requires:
- Setting up Vercel/Netlify accounts
- Configuring domains
- Adding payment methods
- Understanding deployment concepts

**For "vibecoders" (non-technical builders using AI), this is a wall.**

## 1.2 The Cost Problem

| Platform | Free Tier Limits | Paid Cost |
|----------|------------------|-----------|
| Vercel | 100GB bandwidth | $20/month |
| Netlify | 100GB bandwidth | $19/month |
| Railway | $5 free credits | Usage-based |
| Heroku | None (removed) | $7+/month |

For hobbyists building multiple projects, costs add up quickly.

## 1.3 The Underutilized Hardware Problem

**Average PC utilization: <10%**

- Gaming PCs sit idle 90% of the time
- Office computers unused after hours
- Students have laptops running 24/7 but doing nothing
- This is **billions of dollars** in wasted computing capacity

---

# 2. Our Solution

## 2.1 HarborNex = Three Components

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXCLOUD (Dashboard)                     │
│         Web app hosted on Vercel (app.harbornex.dev)        │
│                                                             │
│   • User authentication (GitHub/Google OAuth)               │
│   • Project management (import from GitHub)                 │
│   • Deployment orchestration                                │
│   • Monitoring & logs                                       │
│   • Admin dashboard for deployed apps                       │
└─────────────────────────────────────────────────────────────┘
                              ↕ API
┌─────────────────────────────────────────────────────────────┐
│                    NEXFLOW (Desktop Client)                 │
│              Portable app running on user PCs               │
│                                                             │
│   • Zero installation (just unzip and run)                  │
│   • Registers device as a "chunk"                           │
│   • Polls for deployment commands                           │
│   • Clones, builds, runs applications                       │
│   • Creates public URLs via Cloudflare Tunnels              │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    HARBOR.JSON (Config)                     │
│            Configuration file in user's project             │
│                                                             │
│   • Build commands (auto-detected if not provided)          │
│   • Database requirements                                   │
│   • Environment variables                                   │
│   • Health checks                                           │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 User Journey (30 Seconds to Deploy)

```
1. User signs up at harbornex.dev (GitHub OAuth) ─── 5 seconds
2. Downloads NexFlow portable folder ─────────────── 10 seconds
3. Runs auto-setup.bat (pastes API key) ──────────── 5 seconds
4. Creates project from GitHub URL ───────────────── 5 seconds
5. Clicks "Deploy" ───────────────────────────────── 1 second
6. Gets public URL ───────────────────────────────── ~2 minutes (build)
```

**Total: Under 3 minutes from signup to live app.**

## 2.3 The "Dirac" Resource Unit

We abstract computing resources into a unified metric:

**1 Dirac (1D) ≈ 0.1 vCPU + 50MB RAM + 5GB storage + 1GB bandwidth**

| Resource Contribution | Diracs Earned |
|----------------------|---------------|
| Idle laptop (partial) | 5-10D |
| Dedicated PC | 20-50D |
| Gaming PC (high-end) | 50-100D |
| Office workstation | 30-60D |

This creates a **gamified resource economy** for future marketplace features.

---

# 3. Technical Architecture

## 3.1 System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                   │
└───────────────────────────────┬────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  NEXCLOUD        │   │  CLOUDFLARE      │   │  GITHUB          │
│  (Vercel)        │   │  (Tunnels)       │   │  (Source)        │
│                  │   │                  │   │                  │
│  • Dashboard     │   │  • Public URLs   │   │  • Repo hosting  │
│  • API           │   │  • SSL/TLS       │   │  • Webhooks      │
│  • Auth          │   │  • DDoS protect  │   │  • OAuth         │
│  • Database      │   │                  │   │                  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │ HTTPS
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                     USER'S NETWORK                                 │
│                                                                    │
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│   │   CHUNK 1        │   │   CHUNK 2        │   │   CHUNK 3    │  │
│   │   (Home PC)      │   │   (Office PC)    │   │   (Laptop)   │  │
│   │                  │   │                  │   │              │  │
│   │   NexFlow Daemon │   │   NexFlow Daemon │   │   NexFlow    │  │
│   │   App A running  │   │   App B running  │   │   App C      │  │
│   │   Tunnel active  │   │   Tunnel active  │   │   Tunnel     │  │
│   └──────────────────┘   └──────────────────┘   └──────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## 3.2 Technology Stack

### NexCloud (Dashboard)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 15 | Industry standard, Vercel-native |
| Language | TypeScript | Type safety, better DX |
| Auth | NextAuth.js | Easy OAuth, secure |
| Database | PostgreSQL (Supabase) | Reliable, scalable |
| ORM | Prisma | Type-safe queries |
| Hosting | Vercel | Zero-ops, global CDN |

### NexFlow (Desktop Client)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20+ (bundled) | No installation required |
| CLI | Commander.js | Standard CLI framework |
| Tunneling | cloudflared | Cloudflare's official tool |
| Process Mgmt | PM2 (planned) | Auto-restart, persistence |

### Communication
| Type | Technology | Rationale |
|------|------------|-----------|
| API | REST + JSON | Simple, universal |
| Real-time | SSE/WebSocket (planned) | Faster than polling |
| Auth | API keys + JWT | Secure, stateless |

## 3.3 Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  apiKey    String    @unique @default(cuid())
  chunks    Chunk[]
  projects  Project[]
}

model Chunk {
  id        String    @id @default(cuid())
  name      String
  status    String    @default("offline") // online, offline
  diracs    Int       @default(5)
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  projects  Project[]
  lastSeen  DateTime  @default(now())
}

model Project {
  id            String   @id @default(cuid())
  name          String
  subdomain     String   @unique
  githubRepoUrl String
  githubBranch  String   @default("main")
  status        String   @default("pending")
  tunnelUrl     String?
  chunkId       String?
  chunk         Chunk?   @relation(fields: [chunkId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

## 3.4 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/*` | * | Authentication (NextAuth) |
| `/api/chunks` | GET | List user's chunks |
| `/api/chunks` | POST | Register new chunk |
| `/api/chunks` | PATCH | Heartbeat/status update |
| `/api/chunks` | DELETE | Remove chunk |
| `/api/projects` | GET/POST | Project CRUD |
| `/api/projects/[id]/status` | PATCH | Update deployment status |
| `/api/projects/[id]/tunnel` | PATCH | Report tunnel URL |

---

# 4. Current Progress

## 4.1 Development Timeline (7 Days)

| Day | Milestone | Status |
|-----|-----------|--------|
| 1 | Project setup, Next.js dashboard | ✅ Complete |
| 2 | GitHub OAuth, Prisma schema | ✅ Complete |
| 3 | NexFlow daemon, GitHub cloning | ✅ Complete |
| 4 | Framework detection, build system | ✅ Complete |
| 5 | Cloudflare tunnel integration | ✅ Complete |
| 6 | GUI, portable packaging | ✅ Complete |
| 7 | End-to-end testing, bug fixes | ✅ Complete |

## 4.2 What's Built (Percentage Complete)

### Core Platform: 85% Complete

| Component | Progress | Notes |
|-----------|----------|-------|
| Dashboard UI | 90% | Functional, needs polish |
| User Auth | 100% | GitHub OAuth working |
| Project Management | 85% | CRUD complete |
| Chunk Registration | 90% | Working, fixed duplicate bug |
| NexFlow Daemon | 85% | Polls, deploys, tunnels |
| Framework Detection | 80% | Vite, Next.js, static |
| Cloudflare Tunnels | 100% | Working |
| Portable Packaging | 95% | Windows ready |

### Security Features: 40% Complete (Planned for Beta)

| Feature | Progress | Priority |
|---------|----------|----------|
| API Key Auth | 100% | ✅ Done |
| HTTPS Everywhere | 100% | ✅ Done |
| Docker Sandboxing | 0% | Phase 3 |
| Secrets Encryption | 0% | Phase 3 |
| Code Signing | 0% | Phase 4 |

### Production Readiness: 60% Complete

| Feature | Progress | Timeline |
|---------|----------|----------|
| Vercel Deployment | 0% | This week |
| Domain Setup | 0% | This week |
| Error Handling | 70% | This week |
| Log Streaming | 20% | Week 2 |
| Process Persistence | 0% | Week 2 |

## 4.3 Working Demo

**Tested Successfully:**
1. Created account via GitHub OAuth
2. Downloaded NexFlow portable folder
3. Configured API connection
4. Started daemon on second PC
5. Deployed Vite app from GitHub
6. Received public Cloudflare tunnel URL
7. Accessed app from external device

**Known Issues (Being Fixed):**
- Vite apps block dynamic tunnel hosts (config fix needed in user's repo)
- Duplicate chunks created on restart (fixed, needs re-deploy)
- Logs not yet streaming to dashboard

---

# 5. Security & IP Protection

## 5.1 Security Roadmap

### Current (MVP - Internal Testing)
```
✅ All API communication over HTTPS
✅ API key authentication
✅ OAuth (no password storage)
✅ User can only access their own resources
```

### Before Public Beta (Week 3-4)
```
🔲 Docker container isolation for all deployed apps
🔲 Resource limits (CPU, memory, disk)
🔲 Network isolation between apps
🔲 Secrets encryption at rest
🔲 Rate limiting on all endpoints
🔲 Abuse detection and auto-ban
```

### Before Production (Month 2)
```
🔲 Full sandbox (gVisor or Firecracker)
🔲 Signed NexFlow releases
🔲 Mutual TLS for daemon communication
🔲 Security audit by third party
🔲 Bug bounty program
```

## 5.2 Trust Model

| Phase | Who Runs Code | Trust Level |
|-------|---------------|-------------|
| MVP (Now) | Only your own repos | Self-trusted |
| Beta | Verified users | Sandboxed |
| Production | Anyone | Full isolation |

**We do NOT allow running untrusted code until Docker isolation is complete.**

## 5.3 IP Protection Strategy

### Code Protection
- NexFlow client is **not open source**
- Critical logic is **obfuscated/minified** in production builds
- License key validation for commercial features

### Branding Protection
- "HarborNex", "NexCloud", "NexFlow" are **trademarkable**
- Distinctive UI/UX (dark mode, Dirac economy, gradient branding)
- Documented first-mover advantage

### GUI Protection
- Web dashboard requires authentication
- NexFlow GUI is bundled, not exposed as standalone
- Commercial license for enterprise redistribution

### Moat Building
- **Network effects:** More chunks = more value for everyone
- **Data advantage:** Deployment patterns, framework insights
- **AI integration:** First-mover with Antigravity/Cursor MCP
- **Brand recognition:** "HarborNex" becomes synonym for distributed deployment

---

# 6. Business Model

## 6.1 Revenue Streams

### Stream 1: Freemium SaaS (Primary)
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3 projects, 2 chunks, community support |
| Pro | $15/month | Unlimited projects, 10 chunks, priority support |
| Team | $49/month | Team features, 50 chunks, analytics |
| Enterprise | Custom | SLA, on-premise, dedicated support |

### Stream 2: Managed Chunks (Secondary)
For users who don't want to run their own hardware:
- We operate cloud VMs as "HarborNex Chunks"
- Pay-per-use pricing ($0.01/Dirac-hour)
- Guaranteed uptime (99.9% SLA)

### Stream 3: Marketplace Commission (Future)
For the chunk-sharing economy:
- Users can rent out idle resources
- HarborNex takes 15% commission
- Reputation and reliability ratings

## 6.2 Unit Economics (Projections)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Users | 10,000 | 100,000 | 500,000 |
| Paid Users (5%) | 500 | 5,000 | 25,000 |
| ARPU | $12/month | $15/month | $20/month |
| MRR | $6,000 | $75,000 | $500,000 |
| ARR | $72,000 | $900,000 | $6,000,000 |

---

# 7. Market Analysis

## 7.1 Total Addressable Market (TAM)

| Segment | Size | Rationale |
|---------|------|-----------|
| Developers worldwide | 27M | Stack Overflow 2023 |
| Using AI coding tools | 15M+ | Growing 100%+ YoY |
| Need deployment solution | 10M+ | Everyone building apps |
| Would consider self-hosting | 3M+ | Cost-conscious, privacy-focused |

**TAM: $3B+** (assuming $100/year average spend on hosting)

## 7.2 Serviceable Addressable Market (SAM)

| Segment | Size | Why They'll Use HarborNex |
|---------|------|---------------------------|
| Vibecoders (AI users) | 5M | Zero-friction, free |
| Students | 3M | No credit card needed |
| Indie hackers | 2M | Cost savings |
| Small teams | 500K | Internal tool deployment |

**SAM: $500M** (10% of TAM, focused on cost-conscious segment)

## 7.3 Serviceable Obtainable Market (SOM)

**Year 1 Target:** 10,000 users (0.2% of SAM)
**Year 3 Target:** 500,000 users (10% of SAM)

## 7.4 Competitive Landscape

| Competitor | Similarity | HarborNex Advantage |
|------------|------------|---------------------|
| **Vercel** | Deployment UX | Free, self-hosted, AI-native |
| **Netlify** | Static sites | Supports full-stack, distributed |
| **Coolify** | Self-hosted | Easier setup, no server required |
| **Railway** | Developer-focused | Free, use own hardware |
| **Fly.io** | Edge deployment | Truly distributed, user-owned |
| **Base44** | AI-native | Self-hosted option, privacy |

**Our Unique Position:**
```
Self-Hosted + AI-Native + Distributed + Zero-Cost = HarborNex
```

---

# 8. Timeline & Roadmap

## 8.1 Phase Overview

```
Phase 1: MVP ────────────────────────── ✅ COMPLETE (Week 1)
Phase 2: Production Launch ───────────── 🔄 IN PROGRESS (Week 2)
Phase 3: AI Integration ──────────────── 📅 Planned (Week 3-4)
Phase 4: Security Hardening ──────────── 📅 Planned (Week 5-6)
Phase 5: Public Beta ─────────────────── 📅 Planned (Month 2)
Phase 6: Growth & Marketplace ────────── 📅 Planned (Month 3+)
```

## 8.2 Detailed Roadmap

### Phase 2: Production Launch (Current - Week 2)
- [ ] Deploy NexCloud to Vercel
- [ ] Configure harbornex.dev domain
- [ ] Subdomain routing (*.harbornex.dev)
- [ ] Fix remaining bugs
- [ ] Documentation & onboarding flow
- [ ] Process persistence (PM2)
- [ ] Dynamic port assignment

### Phase 3: AI Integration (Week 3-4)
- [ ] MCP server for Antigravity/Cursor
- [ ] One-command deploy from IDE
- [ ] Auto-generate harbor.json
- [ ] GitHub Actions webhook support

### Phase 4: Security Hardening (Week 5-6)
- [ ] Docker container isolation
- [ ] Resource limits enforcement
- [ ] Secrets management
- [ ] Log encryption
- [ ] Signed releases

### Phase 5: Public Beta (Month 2)
- [ ] Open registration
- [ ] Onboarding tutorials
- [ ] Community Discord
- [ ] Feedback collection
- [ ] Performance optimization

### Phase 6: Growth (Month 3+)
- [ ] Pro tier launch
- [ ] Team features
- [ ] Analytics dashboard
- [ ] Marketplace beta (optional)

---

# 9. Team & Execution

## 9.1 Current Team

**Founder/Developer**
- Full-stack development
- AI tool integration expertise
- 7-day MVP creation demonstrates execution speed

## 9.2 Execution Evidence

| Claim | Evidence |
|-------|----------|
| "We can build fast" | MVP in 7 days |
| "It actually works" | Tested end-to-end successfully |
| "We understand the market" | Built for vibecoders, by a vibecoder |
| "We think about security" | Phased security roadmap |
| "We have a business model" | Clear freemium tiers |

## 9.3 What We Need

| Role | Why | When |
|------|-----|------|
| Marketing/Growth | User acquisition | Month 2+ |
| DevOps/Security | Docker, sandboxing | Month 2 |
| Designer | UI polish | Month 2 |

---

# 10. Investment Ask

## 10.1 Funding Round

**Type:** Pre-Seed / Angel
**Ask:** $100,000 - $250,000
**Equity:** 10-15%
**Valuation:** $1M - $2M (pre-money)

## 10.2 Use of Funds

| Category | Allocation | Purpose |
|----------|------------|---------|
| Development | 50% | Security features, scale |
| Infrastructure | 20% | Managed chunks, CDN |
| Marketing | 20% | User acquisition, content |
| Legal/Ops | 10% | Trademarks, incorporation |

## 10.3 Milestones for Investment

| Milestone | Timeline | Goal |
|-----------|----------|------|
| Public Beta | Month 2 | 1,000 users |
| Paid Tier Launch | Month 3 | 100 paying customers |
| AI Integration | Month 4 | Cursor/Antigravity plugin |
| Series A Ready | Month 12 | 50,000 users, $50K MRR |

## 10.4 Why Invest Now?

1. **Timing is Perfect:** AI coding tools are exploding; deployment is the bottleneck
2. **MVP is Done:** We've proven we can execute, fast
3. **Market is Ready:** Self-hosting is trending (Coolify, Umbrel, etc.)
4. **Low Risk:** Small check, clear milestones, proven execution
5. **High Upside:** If this becomes "the deployment platform for AI coders," it's a billion-dollar opportunity

---

# Appendix

## A. Glossary

| Term | Definition |
|------|------------|
| Chunk | A portion of computing resources from a user's device |
| Dirac (D) | Composite unit measuring compute resources |
| Daemon | Background process that polls for and runs deployments |
| Tunnel | Secure public URL created via Cloudflare |
| Vibecoder | Non-technical builder using AI to create apps |

## B. Contact

**Project:** HarborNex
**Website:** harbornex.dev (coming soon)
**Email:** [founder email]
**GitHub:** github.com/[repo]

---

*Prepared for investor review*
*Last updated: December 22, 2024*
*Version: 1.1 (Investor Edition)*
