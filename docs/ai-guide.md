# How to Use Harbor

A guide for AI assistants (like Antigravity and Cursor) to help users deploy on Harbor.

## When User Says "Deploy on Harbor"

Create a `harbor.json` file in the project root with the correct configuration.

## Basic Template

```json
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "framework": "FRAMEWORK",
  "build": {
    "command": "BUILD_COMMAND",
    "output": "BUILD_OUTPUT"
  },
  "start": {
    "command": "START_COMMAND",
    "port": PORT
  }
}
```

## Framework Examples

### Next.js
```json
{
  "name": "my-nextjs-app",
  "framework": "nextjs",
  "build": { "command": "npm run build" },
  "start": { "command": "npm start", "port": 3000 }
}
```

### Express API
```json
{
  "name": "my-api",
  "framework": "express",
  "start": { "command": "node server.js", "port": 3000 }
}
```

### Static Site
```json
{
  "name": "my-site",
  "framework": "static",
  "start": { "command": "npx serve -s build -l 3000", "port": 3000 }
}
```

### With Database (Prisma)
```json
{
  "name": "my-app",
  "framework": "nextjs",
  "database": {
    "type": "sqlite",
    "commands": ["npx prisma generate", "npx prisma db push"]
  },
  "hooks": {
    "preStart": "npx prisma db push"
  }
}
```

## After Creating harbor.json

Tell the user:
1. Push to GitHub
2. Run `harbor deploy-git REPO_URL`

## Full Spec

See [harbor-json-spec.md](./harbor-json-spec.md) for complete specification.
