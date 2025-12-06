# harbor.json Specification

A configuration file that tells Harbor how to deploy your project. AIs like Antigravity and Cursor can generate this automatically.

## Basic Example

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "framework": "nextjs",
  "build": {
    "command": "npm run build",
    "output": ".next"
  },
  "start": {
    "command": "npm start",
    "port": 3000
  }
}
```

## Full Specification

```json
{
  "$schema": "https://harbor.dev/schema/harbor.json",
  "name": "my-app",
  "version": "1.0.0",
  
  // Framework detection (optional - auto-detected if missing)
  "framework": "nextjs | express | static | python | custom",
  
  // Environment
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "${secrets.DATABASE_URL}"
  },
  
  // Build phase
  "build": {
    "command": "npm run build",
    "output": ".next",
    "env": {}
  },
  
  // Start phase
  "start": {
    "command": "npm start",
    "port": 3000
  },
  
  // Database setup
  "database": {
    "type": "sqlite | postgres | mysql",
    "migrations": "prisma/migrations",
    "seed": "prisma/seed.ts",
    "commands": [
      "npx prisma migrate deploy",
      "npx prisma db seed"
    ]
  },
  
  // Files to ignore when deploying
  "ignore": [
    "node_modules",
    ".git",
    ".env.local",
    "*.log"
  ],
  
  // Files to include (if specified, ONLY these are deployed)
  "include": [],
  
  // Health check
  "healthCheck": {
    "path": "/api/health",
    "interval": 30
  },
  
  // Resources
  "resources": {
    "memory": "512mb",
    "cpu": 1
  },
  
  // Hooks
  "hooks": {
    "preBuild": "echo 'Starting build...'",
    "postBuild": "echo 'Build complete!'",
    "preStart": "npx prisma migrate deploy",
    "postDeploy": "curl -X POST https://api.slack.com/notify"
  }
}
```

## Framework Presets

Harbor auto-detects these frameworks and applies sensible defaults:

### Next.js
```json
{
  "framework": "nextjs",
  "build": { "command": "npm run build", "output": ".next" },
  "start": { "command": "npm start", "port": 3000 }
}
```

### Express
```json
{
  "framework": "express",
  "start": { "command": "node index.js", "port": 3000 }
}
```

### Static Site
```json
{
  "framework": "static",
  "start": { "command": "npx serve -s build", "port": 3000 }
}
```

### Python/Flask
```json
{
  "framework": "python",
  "build": { "command": "pip install -r requirements.txt" },
  "start": { "command": "python app.py", "port": 5000 }
}
```

## AI Prompt

When an AI assistant helps create a Harbor project, it should:

1. Create `harbor.json` in the project root
2. Set appropriate framework, build, and start commands
3. Include database migrations if applicable
4. Set correct port

**Example prompt for AI:**
> "I want to deploy this on Harbor"

**AI should respond by creating:**
- `harbor.json` with correct configuration
- Ensure `package.json` has build/start scripts
- Add database migration commands if using Prisma/SQL
