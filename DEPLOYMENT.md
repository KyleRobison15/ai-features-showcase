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

## Rate Limiting

The application includes rate limiting on AI endpoints to control costs and prevent abuse:

**Implemented Limits:**
- **AI Chatbot:** 10 requests per 15 minutes per IP address
- **Review Summarizer:** 5 requests per 15 minutes per IP address
- **General API:** 100 requests per 15 minutes per IP address

**Implementation:** Uses `express-rate-limit` middleware with clear, user-friendly error messages.

**Rate Limit Response (HTTP 429):**
```json
{
  "message": "Too many AI requests from this IP, please try again later."
}
```

## Troubleshooting

### Issue: "libssl.so.3: cannot open shared object file"

**Cause:** Prisma can't find the OpenSSL library required by its query engine.

**Solution:**
1. Verify `binaryTargets = ["native", "debian-openssl-3.0.x"]` in `schema.prisma`
2. Verify `nixPkgs = ["bun", "openssl"]` in `nixpacks.toml`
3. Verify `nixLibs = ["openssl"]` in `nixpacks.toml`
4. Redeploy after making changes

### Issue: "Missing parameter name at index 1: *"

**Cause:** Express 5 strict path-to-regexp validation rejects the `*` wildcard.

**Solution:** Use regex pattern for catch-all route:
```typescript
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});
```

### Issue: Database connection fails during build

**Symptom:** `P1001: Can't reach database server at mysql.railway.internal:3306`

**Cause:** Database is not accessible during the build phase.

**Solution:** Ensure migrations run in the **start command**, not build command:
```json
// railway.json
{
  "deploy": {
    "startCommand": "bun run migrate && bun run start"
  }
}
```

### Issue: React app doesn't load (shows "Not found")

**Cause:** `NODE_ENV` is not set to `production`.

**Solution:**
1. Go to Railway service → Variables
2. Add `NODE_ENV` = `production`
3. Redeploy

**Why:** Express only serves React build when `NODE_ENV === 'production'`.

### Issue: Railway creates two services (client + server)

**Cause:** Railway auto-detects monorepo and creates separate services.

**Solution:**
1. Delete the client service in Railway dashboard
2. Keep only the server service
3. Configure server service:
   - Watch Paths: `/` (root)
   - Root Directory: leave empty (uses repo root)
4. The server will handle both API and static file serving

### Issue: Migrations fail with table case-sensitivity errors

**Symptom:** `Table 'railway.Review' doesn't exist` or similar

**Cause:** MySQL on Railway is case-sensitive. Old migrations may have created tables with different casing.

**Solution:**
1. Delete the MySQL service in Railway
2. Create a new MySQL service
3. Update `DATABASE_URL` reference
4. Ensure all table names in schema use lowercase (already configured)
5. Redeploy to run clean migrations

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

## Cost Estimates

### Railway Pricing (as of 2024)

**Hobby Plan (Default):**
- $5/month in credits
- Pay-as-you-go after credits exhausted
- Typical usage for this app: ~$3-4/month

**Breakdown:**
- **Backend Service:** ~$2-3/month (single service serving both API and frontend)
- **MySQL Database:** ~$1/month
- **Total:** ~$3-4/month (fits within $5 free credits)

### External API Costs

**OpenAI (GPT-4o-mini):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Typical chat: ~500 tokens = $0.0003
- 1000 conversations/month ≈ $0.30

**Hugging Face (Llama 3.1):**
- Free tier available for open-source models
- Pay-as-you-go for higher usage
- Typical summary: ~200 tokens = free

**Estimated Total Monthly Cost:** $4-5/month

## Production Best Practices

### 1. Security
- ✅ HTTPS enabled automatically by Railway
- ✅ API keys stored in Railway environment variables (never committed)
- ✅ Rate limiting implemented on all AI endpoints
- ✅ Input validation using Zod schemas
- ✅ SQL injection protection via Prisma ORM

### 2. Monitoring
- ✅ Health check endpoint for uptime monitoring
- ✅ Railway deployment logs available in dashboard
- ✅ Consider adding: Sentry for error tracking, Uptime Robot for monitoring

### 3. Database
- ✅ Automatic backups (Railway Pro feature)
- ✅ Connection pooling via Prisma
- ✅ Migrations versioned and reproducible

### 4. Performance
- ✅ Static assets served with caching headers
- ✅ API responses compressed (Express default)
- ✅ Review summaries cached with expiration (2 minutes)
- ✅ Consider adding: Redis for caching, CDN for static assets

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Prisma Docs:** https://www.prisma.io/docs
- **Bun Docs:** https://bun.sh/docs
- **Express Docs:** https://expressjs.com
- **Project README:** For architecture and tech stack details

## Quick Reference

```bash
# Local development
bun run dev

# Build for production
bun run build

# Run migrations
bun run migrate

# Start production server
bun run start

# Railway CLI commands
railway login
railway link
railway run <command>
railway logs
railway status

# Prisma commands
bunx prisma generate          # Generate client
bunx prisma migrate dev       # Create migration (local)
bunx prisma migrate deploy    # Apply migrations (production)
bunx prisma studio            # Open database GUI
```
