# Harbor Dirac System

## Overview

Harbor uses **Diracs** as the universal resource unit.

```
FOR HUMANS: 5D (simple)
FOR MACHINES: {dc:50, dm:80, ds:250, db:50} (precise)
```

## Base Units (split diracs)

| Unit | Meaning | Real Value |
|------|---------|------------|
| 1dc | compute | 10 millicores (0.01 CPU) |
| 1dm | memory | 16 MB RAM |
| 1ds | storage | 100 MB disk |
| 1db | bandwidth | 500 Kbps |

## Conversion

```
1D = 10dc + 16dm + 50ds + 10db
   = 0.1 cores + 256MB + 5GB + 5Mbps
```

## App Requirements

| App Type | D | dc | dm | ds | db |
|----------|---|----|----|----|----|
| Static site | 1D | 5 | 4 | 5 | 4 |
| Simple app | 2D | 15 | 16 | 20 | 8 |
| Medium app | 5D | 40 | 64 | 100 | 25 |
| Complex app | 10D | 80 | 128 | 200 | 50 |
| Heavy app | 25D | 200 | 320 | 500 | 100 |

## Chunk Presets (Developers)

| Preset | D | Use Case |
|--------|---|----------|
| NANO | 1D | Static sites |
| MICRO | 2D | Simple tools |
| SMALL | 5D | Light apps |
| MEDIUM | 10D | Standard apps |
| LARGE | 25D | Complex apps |

## Pod Presets (Users)

| Preset | D | Coverage |
|--------|---|----------|
| LITE | 2D | 80% of sites |
| STANDARD | 5D | 95% of sites |
| PLUS | 10D | 99% of sites |
| POWER | 20D | Everything |

## harbor.json Example

```json
{
  "resources": {
    "diracs": 5,
    "display": "5D",
    "split": {
      "dc": 45,
      "dm": 64,
      "ds": 150,
      "db": 25
    }
  }
}
```

## Device Capacity

| Device | Usable D |
|--------|----------|
| Raspberry Pi 4 | 10-15D |
| Old Laptop | 25-35D |
| Modern Laptop | 50-70D |
| Gaming PC | 100-150D |
