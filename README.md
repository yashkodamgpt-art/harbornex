# HarborNex

**Turn any computer into your cloud.** 🌐

HarborNex is a decentralized cloud platform that lets you share computing resources from any device and deploy applications anywhere.

## 🚀 Products

| Product | Description |
|---------|-------------|
| **NexCloud** | Web dashboard at [app.harbornex.dev](https://app.harbornex.dev) |
| **NexFlow** | Desktop GUI for sharing resources |
| **NexFlow CLI** | Command-line interface |

## ⚡ Quick Start

### Using NexFlow (Desktop)
1. Download [NexFlow](https://harbornex.dev/download)
2. Run `start-harborflow.bat`
3. Login with your API key from NexCloud
4. Create a chunk to share resources!

### Using NexFlow CLI
```bash
# Connect to NexCloud
nexflow connect https://app.harbornex.dev

# Login with API key
nexflow login <your-api-key>

# Register device as chunk
nexflow register

# Deploy a project
nexflow deploy
```

## 📊 The Dirac System

Resources are measured in **Diracs** - a universal compute unit:

| Unit | Meaning | Conversion |
|------|---------|------------|
| **dc** | Compute Diracs | 10dc ≈ 1 CPU core |
| **dm** | Memory Diracs | 16dm ≈ 256MB RAM |
| **ds** | Storage Diracs | 50ds ≈ 5GB disk |
| **db** | Bandwidth Diracs | 10db ≈ 5Mbps |

## 🏗️ Project Structure

```
harbornex/
├── web/          # NexCloud dashboard (Next.js)
├── gui/          # NexFlow desktop GUI
├── src/          # CLI core modules
├── bin/          # CLI entry point
└── docs/         # Documentation
```

## 🔗 Links

- **Website:** [harbornex.dev](https://harbornex.dev)
- **Dashboard:** [app.harbornex.dev](https://app.harbornex.dev)
- **Docs:** [docs.harbornex.dev](https://docs.harbornex.dev)

## 📄 License

MIT License - HarborNex Team
