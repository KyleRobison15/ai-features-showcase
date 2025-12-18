# Deployment Guide

This application is deployed to **Railway** using a single-service architecture where Express serves the React production build.

## Platform & Architecture

**Platform:** Railway (https://railway.app)

**Deployment Strategy:** Single service deployment
- Express server serves both API endpoints and React static files
- Simplifies deployment and reduces costs
- Production-ready configuration with health checks and auto-restart

**Database:** Railway MySQL service
- Managed MySQL instance with automatic backups
- Connected via environment variable reference (`DATABASE_URL`)
- Prisma handles schema migrations on deployment

## Critical Configuration Files

### 1. `railway.json` - Railway deployment configuration

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bun run migrate && bun run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. `nixpacks.toml` - Nixpacks build configuration

Railway uses Nixpacks as its build system. This configuration is critical for proper deployment:

```toml
[phases.setup]
nixPkgs = ["bun", "openssl"]  # Critical: openssl required for Prisma

[phases.install]
cmds = ["bun install"]

[phases.build]
cmds = ["bunx prisma generate", "bun run build"]
nixLibs = ["openssl"]  # Makes OpenSSL available at runtime

[start]
cmd = "bun run migrate && bun run start"
```

**Key Configuration Notes:**
- `openssl` package required for Prisma's query engine
- `nixLibs = ["openssl"]` makes OpenSSL libraries available at runtime
- `bunx prisma generate` runs during build with `debian-openssl-3.0.x` binary target

### 3. Prisma Binary Targets

In `packages/server/prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client"
  output        = "../generated/prisma"
  binaryTargets = ["native", "debian-openssl-3.0.x"]  # Critical for Railway
}
```

**Why this matters:** Railway's Linux environment requires the `debian-openssl-3.0.x` binary. Without this, Prisma fails with:
```
libssl.so.3: cannot open shared object file: No such file or directory
```

## Environment Variables

**Required on Railway:**

1. **`DATABASE_URL`** (Reference Variable)
   - Type: Reference Variable
   - Reference: MySQL service → `MYSQL_URL`
   - Railway auto-injects this from the MySQL service
   - Format: `mysql://user:password@host:port/database`

2. **`OPENAI_API_KEY`**
   - Your OpenAI API key from https://platform.openai.com
   - Used for the AI chatbot feature
   - Example: `sk-proj-...`

3. **`HF_TOKEN`**
   - Hugging Face API token from https://huggingface.co/settings/tokens
   - Used for the review summarizer feature
   - Example: `hf_...`

4. **`NODE_ENV`** = `production`
   - Triggers production behavior in Express (serves React build)
   - Disables dotenv file loading (Railway provides vars directly)
   - **Must be set for the app to work correctly**

## Build Process

**Build Command:** `bun run build`

This executes a two-phase build:

```bash
# Phase 1: Build React client
cd packages/client && bun install && bun run build
# Output: packages/client/dist/
# Contains: index.html, JavaScript bundles, CSS, assets

# Phase 2: Generate Prisma client
cd packages/server && bun install && bunx prisma generate
# Output: packages/server/generated/prisma/
# Contains: Type-safe Prisma client with debian-openssl-3.0.x binary
```

**Start Command:** `bun run migrate && bun run start`

This executes:

```bash
# 1. Run database migrations
cd packages/server && bunx prisma migrate deploy

# 2. Start Express server with NODE_ENV=production
cd packages/server && NODE_ENV=production bun run index.ts
```

## Express Production Configuration

The server is configured to serve React static files in production:

```typescript
// packages/server/index.ts
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');

  // Serve static files (JS, CSS, images)
  app.use(express.static(clientDistPath));

  // SPA fallback - send index.html for all non-API routes
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}
```

**Critical Fix for Express 5:**

Express 5 changed how route parameters work. The traditional catch-all route `app.get('*', ...)` causes this error:
```
Missing parameter name at index 1: *
```

**Solution:** Use regex with negative lookahead:
- Pattern: `/^\/(?!api).*/`
- Matches: All paths except those starting with `/api`
- Allows: Client-side routing while preserving API endpoints

## Database Migrations

**Migration Strategy:** Automatic on deployment

Railway runs `bunx prisma migrate deploy` before starting the server (defined in `railway.json` start command).

**How it works:**
1. Checks `_prisma_migrations` table for already-applied migrations
2. Applies only new migrations that haven't run yet
3. Marks newly applied migrations as complete
4. **Each migration runs exactly once** - safe to redeploy without data loss

**Important:** Migrations must run during the **start phase**, not the build phase, because:
- Database connection is only available at runtime
- Railway injects `DATABASE_URL` when the container starts
- Attempting to connect during build will fail

## Health Check

Railway monitors service health via:

- **Endpoint:** `/api/health`
- **Expected Response:** `{"status":"ok","timestamp":"2024-12-17T19:40:00.000Z"}`
- **Timeout:** 100ms
- **Restart Policy:** Restart service after 10 consecutive failed health checks

This ensures the service automatically recovers from crashes or unresponsive states.

## Auto-Deploy Setup

**GitHub Integration:**

- **Trigger:** Automatic deployment on push to `main` branch
- **Watch Path:** `/` (entire repository monitored for changes)
- **Build Time:** Typically 2-3 minutes from push to live
- **Rollback:** Available in Railway dashboard if needed

**Deployment Flow:**
1. Push code to GitHub `main` branch
2. Railway detects the push
3. Pulls latest code
4. Runs build commands (client + server)
5. Runs start command (migrations + server)
6. Health checks begin
7. Traffic switches to new deployment when healthy

## Deployment Checklist

Before deploying to Railway:

- [ ] Verify app runs locally with `bun run dev`
- [ ] Build succeeds locally with `bun run build`
- [ ] All environment variables configured in Railway
- [ ] MySQL database service created and linked
- [ ] `DATABASE_URL` set as reference to MySQL service's `MYSQL_URL`
- [ ] `NODE_ENV=production` set in Railway
- [ ] `OPENAI_API_KEY` set in Railway
- [ ] `HF_TOKEN` set in Railway
- [ ] Health check endpoint `/api/health` returns 200 OK locally
- [ ] Auto-deploy enabled on main branch
- [ ] Database seeded with initial data (via migration or manual seed)
