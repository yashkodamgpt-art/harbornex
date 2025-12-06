# Changelog

All notable changes to Harbor are documented here.

## [0.2.0] - 2025-12-07

### Added
- **harbor.json Configuration**
  - AI-friendly config file for deployments
  - Spec docs and AI guide
  - CLI reads harbor.json for build/start

- **Dirac Resource System**
  - Universal resource unit (D for humans, d for machines)
  - Device capacity calculations
  - Chunk/Pod presets

- **Dashboard Enhancements**
  - Project detail page with Frontend/Backend tabs
  - Deploy Now button with simulated builds
  - Build logs viewer (expandable)
  - Environment variables (add/delete)
  - New APIs: /deployments, /env

- **Database**
  - EnvVariable model for env vars
  - Enhanced Deployment with buildLogs, branch, duration

- **Documentation**
  - VISION.md - Harbor concept
  - DIRAC-SYSTEM.md - Resource specs
  - FEATURE-REFERENCE.md - Vercel/Supabase comparison

## [0.1.0] - 2024-12-06

### Added
- **Harbor Cloud** (Next.js 16)
  - Google OAuth login
  - GitHub OAuth login with repo access
  - Dashboard with projects and devices
  - Repository selector for GitHub repos
  - API endpoints for chunks, projects, webhooks

- **HarborFlow CLI**
  - `login` - Save API key
  - `register` - Connect device to Harbor Cloud
  - `deploy` - Deploy from local directory
  - `deploy-git` - Deploy from GitHub repository
  - `tunnel` - Create Cloudflare public URL
  - `status` - Show connection status
  - `start` - Run daemon with heartbeat

- **Integrations**
  - VS Code extension for one-click deploy
  - GitHub webhooks for auto-deploy
  - Cloudflare Tunnels for public URLs

- **Database**
  - User model with OAuth accounts
  - Chunk model for connected devices
  - Project model with GitHub repo fields
  - Deployment model for history

### Paused
- Desktop Electron app (requires admin to build)

### Planned
- P2P Pods for decentralized hosting
- Browser extension for local serving

