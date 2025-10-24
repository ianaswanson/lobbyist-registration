# Production Database Reseeding Guide

This guide explains how to reseed the production database with fresh demo data.

## When to Reseed Production

- After major seed script updates (new data patterns, better test data)
- Before stakeholder demos (ensure consistent, fresh data)
- After accidental data corruption
- When testing the "clean slate" experience

⚠️ **WARNING:** Reseeding will DELETE ALL EXISTING DATA and replace it with demo data.

---

## Option 1: Local Script (Simplest - Recommended for Quick Reseeds)

Run these commands from your local machine:

### Step 1: Connect to Production Database

```bash
# Start Cloud SQL Proxy on alternate port (5433) to avoid conflict with dev
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5433 &
```

### Step 2: Get Production Database Password

```bash
# Get password from Secret Manager
gcloud secrets versions access latest --secret="lobbyist-db-url"
```

### Step 3: Run Database Reset

```bash
# Replace PASSWORD with the value from step 2
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" \
DATABASE_URL="postgresql://lobbyist_user:PASSWORD@127.0.0.1:5433/lobbyist_prod" \
npm run db:reset
```

**Expected Output:**
```
🗑️  Dropping database...
✅ Database dropped
🆕 Creating fresh database...
✅ Database created
📋 Running migrations...
✅ Migrations complete
🌱 Seeding database...
✅ Seed completed
```

**Pros:**
- Fast (~2 minutes)
- Direct control
- No deployment needed

**Cons:**
- Requires local environment setup
- Manual process

---

## Option 2: Cloud Build Manual Trigger (Flexible - Recommended for Automation)

Use the `FORCE_RESEED` environment variable to trigger automatic reseeding.

### Step 1: Deploy with FORCE_RESEED Flag

```bash
gcloud run deploy lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true
```

This triggers a new Cloud Run deployment. During container startup, the `startup.sh` script will:
1. Detect `FORCE_RESEED=true`
2. Run `npx prisma db push --force-reset --accept-data-loss`
3. Run `npm run db:seed`
4. Start the application

### Step 2: Wait for Deployment to Complete

Monitor the deployment:
```bash
# Watch Cloud Run service logs
gcloud run services logs read lobbyist-registration --region us-west1 --limit 100
```

Look for this in the logs:
```
🔄 FORCE_RESEED=true detected - forcing database reset
⚠️  WARNING: About to DROP all data and reseed with fresh demo data
✅ Force reseed completed
```

### Step 3: Remove FORCE_RESEED Flag

Once reseeding is complete, remove the flag:

```bash
gcloud run deploy lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

**Pros:**
- Works from anywhere (just need gcloud CLI)
- Uses built-in startup script logic
- No need to connect to database directly

**Cons:**
- Takes 5-8 minutes (full deployment cycle)
- Two-step process (set flag, then remove it)

---

## Option 3: GitHub Actions Workflow (Most Convenient - Button Click!)

A GitHub Actions workflow has been created that automates the entire process.

### How to Use

1. **Go to GitHub Actions:**
   - Navigate to: https://github.com/ianaswanson/lobbyist-registration/actions
   - Click on "Reseed Production Database" workflow

2. **Run Workflow:**
   - Click "Run workflow" button
   - Select branch: `main`
   - Type confirmation: `RESEED PRODUCTION`
   - Click "Run workflow"

3. **Wait for Completion:**
   - Workflow takes ~3-5 minutes
   - Monitors deployment and removes flag automatically

### What the Workflow Does

1. ✅ Sets `FORCE_RESEED=true` on Cloud Run service
2. ✅ Deploys to production (triggers reseeding)
3. ✅ Waits 2 minutes for reseeding to complete
4. ✅ Removes `FORCE_RESEED` flag
5. ✅ Reports success

**Pros:**
- One-click solution
- No local setup needed
- Automatic cleanup
- Audit trail in GitHub Actions

**Cons:**
- Requires GitHub Actions secret `GCP_SA_KEY` to be configured
- Slightly longer than local script (~5 min vs ~2 min)

---

## Prerequisites

### For All Options
- Admin access to Google Cloud Project: `lobbyist-475218`
- gcloud CLI authenticated: `gcloud auth login`

### For Option 1 (Local Script)
- Cloud SQL Proxy installed
- Node.js environment with npm
- Prisma CLI installed

### For Option 3 (GitHub Actions)
- GitHub repository secret `GCP_SA_KEY` configured with service account JSON

---

## Verification After Reseeding

1. **Check Application:**
   - Visit: https://lobbyist-registration-zzp44w3snq-uw.a.run.app
   - Sign in as: `admin@multnomah.gov` (password: `admin123`)

2. **Verify Demo Data:**
   - Navigate to User Management
   - Should see 3 pending lobbyists with realistic names:
     - Sarah Martinez (Transportation)
     - Robert Johnson (Education)
     - Emily Wong (Housing)

3. **Check Database Directly:**
   ```bash
   # Connect via Cloud SQL Proxy
   PGPASSWORD='PASSWORD' psql -h 127.0.0.1 -p 5433 -U lobbyist_user -d lobbyist_prod

   # Run verification query
   SELECT COUNT(*) FROM "User";
   -- Should return: 11 (3 lobbyists + 3 pending + 3 employers + 3 board + 1 admin + 1 public)
   ```

---

## Troubleshooting

### "Database connection failed"
- Verify Cloud SQL Proxy is running: `pgrep -f cloud-sql-proxy`
- Check connection: `gcloud sql instances describe lobbyist-registration-db`

### "Permission denied"
- Verify you're authenticated: `gcloud auth list`
- Check your account has roles: `roles/cloudsql.client`, `roles/secretmanager.secretAccessor`

### "Seed script failed"
- Check logs: `gcloud run services logs read lobbyist-registration --region us-west1 --limit 200`
- Look for error messages during seed execution

---

## Safety Notes

✅ **Safe to Run:**
- Production is demo-only (no real user data)
- Automatic backups before reset (Cloud SQL)
- Can roll back using Cloud SQL point-in-time recovery

⚠️ **Use Caution:**
- Always run during non-demo hours
- Notify team before reseeding
- Verify backup exists before major changes

🚫 **Never:**
- Run during stakeholder demos
- Run on production if real users exist
- Run without verifying backup status

---

## Quick Reference

| Method | Time | Complexity | Best For |
|--------|------|------------|----------|
| **Option 1: Local Script** | 2 min | Low | Quick one-time reseeds |
| **Option 2: Cloud Build** | 5-8 min | Medium | Automated reseeds from anywhere |
| **Option 3: GitHub Actions** | 3-5 min | Low | Non-technical users, audit trail |

**Recommendation:** Start with **Option 1** for immediate needs, use **Option 3** for regular maintenance.

---

## Related Documentation

- `RESEEDING-GUIDE.md` - Complete guide for dev environment reseeding
- `RESEEDING-FLOW-DIAGRAM.md` - Visual startup script logic
- `RESEEDING-QUICK-REFERENCE.md` - Quick commands cheat sheet
- `scripts/startup.sh` - Environment-aware startup script (lines 35-64)
