# Database Reseeding Guide

## Overview

This application uses an **environment-aware database reseeding strategy** to ensure development environments always have fresh demo data while protecting production data from accidental resets.

## How It Works

The startup script (`scripts/startup.sh`) automatically detects the deployment environment and applies the appropriate database strategy:

### Development Environment (`ENVIRONMENT=development`)

**Behavior:** 🔄 **AUTOMATIC RESET AND RESEED ON EVERY DEPLOY**

- Every deployment triggers a complete database reset
- All existing data is deleted
- Schema is recreated from scratch
- Fresh demo data is seeded using "Rule of 3" pattern
- **No manual steps required**

**Purpose:** Ensures demos always show consistent, fresh data without manual database management

**Commands executed:**
```bash
npx prisma db push --force-reset --accept-data-loss
npm run db:seed
```

**Example log output:**
```
🚀 Starting Lobbyist Registration System...
📦 Environment: development

🔄 Development environment detected - auto-reseeding enabled
   This ensures fresh demo data on every deploy

🔄 Performing database reset (force mode)...
⚠️  This will DELETE ALL DATA and recreate schema

✅ Database reset complete

🌱 Seeding database with demo data...
   Using 'Rule of 3' pattern (3 entities, 3 children each)

✅ Database seeding complete!
```

### Production Environment (`ENVIRONMENT=production`)

**Behavior:** 🔒 **DATA PRESERVATION MODE**

- Existing data is **preserved** on every deployment
- Only applies schema migrations (idempotent)
- Database is only seeded if completely empty (initial deployment)
- Requires explicit flag to force reset

**Purpose:** Protects production data from accidental loss

**Commands executed (normal):**
```bash
npx prisma migrate deploy
# No seeding
```

**Example log output:**
```
🚀 Starting Lobbyist Registration System...
📦 Environment: production

🔒 Production environment detected - data preservation mode
   Use FORCE_RESEED=true to reset (for demos)

📊 Checking database for existing data...
✅ Database has data (User count: 45) - preserving data

🔧 Running database migrations...

✅ Skipping seed - preserving existing data
```

## Force Reseeding Production

For stakeholder demos or testing, you can **force reset production** by setting the `FORCE_RESEED` environment variable.

### Option 1: One-Time Force Reseed (Recommended)

Update the environment variable for a single deployment:

```bash
# Using gcloud CLI
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true

# Then trigger a new deployment
git push origin main  # (then approve in Cloud Build)

# After deployment, remove the flag
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

### Option 2: Update via Cloud Console

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on `lobbyist-registration` service
3. Click **"Edit & Deploy New Revision"**
4. Under **"Variables & Secrets"** tab
5. Add environment variable: `FORCE_RESEED` = `true`
6. Click **"Deploy"**
7. After deployment, edit again and **remove** the `FORCE_RESEED` variable

### Option 3: Update Cloud Build Config (Persistent)

⚠️ **Not recommended** - this makes every deployment reset data

Edit `cloudbuild-prod.yaml`:
```yaml
- "--update-env-vars"
- "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT},FORCE_RESEED=true"
```

**Remember to remove it after your demo!**

## Environment Variable Reference

| Variable | Values | Priority | Effect |
|----------|--------|----------|--------|
| `FORCE_RESEED` | `true` / unset | Highest | Forces reset and reseed regardless of environment |
| `ENVIRONMENT` | `development` / `production` | Medium | Determines automatic behavior |

### Priority Order

1. **`FORCE_RESEED=true`** → Always reset and reseed (highest priority)
2. **`ENVIRONMENT=development`** → Automatic reset and reseed
3. **`ENVIRONMENT=production`** → Preserve data (only seed if empty)
4. **Unknown environment** → Check database, seed only if empty

## Demo Data Pattern

The seed script (`prisma/seed.ts`) follows the **"Rule of 3"** pattern:

- **3 users per role** (3 admins, 3 lobbyists, 3 employers, 3 board members)
- **3 entities per type** (3 lobbyists, 3 employers, 3 board members)
- **3 children per parent** (3 registrations per lobbyist, 3 reports per quarter, etc.)
- **Realistic Portland data** (addresses, phone numbers, Oregon entities)

**Total demo entities created:**
- 12 Users (3 per role type)
- 3 Lobbyists (Maria Chen, Liam O'Sullivan, Aisha Patel)
- 3 Employers (TechCorp, GreenFuture, BuildRight)
- 3 Board Members (Sarah Johnson, Michael Torres, Jennifer Kim)
- 9 Registrations (3 per lobbyist)
- 36 Expense Reports (3 per lobbyist per quarter)
- 9 Board Member Calendars (3 per board member per quarter)
- 27 Lobbying Receipts (3 per calendar)
- 3 Violations (1 per type)
- 2 Appeals (1 approved, 1 denied)
- 15 Contract Exceptions
- Audit logs for all actions

## Deployment Configuration

### Development Environment

**Cloud Build Config:** `cloudbuild-dev.yaml`

```yaml
substitutions:
  _ENVIRONMENT: development

steps:
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    args:
      - "--update-env-vars"
      - "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT}"
```

**Auto-deploys from:** `develop` branch
**No approval required:** Changes deploy immediately
**Min instances:** 1 (always-on for demos)

### Production Environment

**Cloud Build Config:** `cloudbuild-prod.yaml`

```yaml
substitutions:
  _ENVIRONMENT: production

steps:
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    args:
      - "--set-env-vars"
      - "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT}"
```

**Deploys from:** `main` branch
**Requires approval:** Manual approval in Cloud Build console
**Min instances:** 0 (scales to zero when idle)

## Monitoring Reseeding

### Check Startup Logs

View Cloud Run logs to see reseeding behavior:

```bash
# Development logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit=50 --format=json

# Production logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" --limit=50 --format=json
```

### Check Database State

Connect to database via Cloud SQL Proxy:

```bash
# Development database
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
psql postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev

# Production database
psql postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_prod

# Check user count
SELECT COUNT(*) FROM "User";

# Check last seed timestamp (from audit logs)
SELECT "timestamp", "action", "details" FROM "AuditLog" WHERE "action" = 'DATABASE_SEEDED' ORDER BY "timestamp" DESC LIMIT 1;
```

## Troubleshooting

### Dev Environment Not Reseeding

**Symptom:** Development environment shows old data after deploy

**Check:**
1. Verify `ENVIRONMENT=development` in Cloud Run environment variables
2. Check startup logs for "Development environment detected" message
3. Look for errors during `prisma db push --force-reset`

**Solution:**
```bash
# Manually force reseed
gcloud run services update lobbyist-registration-dev \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true

# Then redeploy
git push origin develop
```

### Production Accidentally Reseeded

**Symptom:** Production data was deleted unexpectedly

**Check:**
1. Review Cloud Build logs for `FORCE_RESEED=true` in environment
2. Check if `ENVIRONMENT` variable is set correctly to `production`

**Recovery:**
- Cloud SQL automatic backups run daily
- Point-in-time recovery available for last 7 days
- Contact GCP support to restore from backup

**Prevention:**
- Always verify `FORCE_RESEED` is removed after demos
- Use Cloud Build approval process for production
- Review environment variables before approving deployments

### Seed Script Fails

**Symptom:** Startup logs show seed errors

**Common causes:**
1. Database connection timeout (Cloud SQL not ready)
2. Schema migration issues (run migrations first)
3. Prisma client out of sync (regenerate client)

**Solution:**
```bash
# Check Cloud SQL instance is running
gcloud sql instances describe lobbyist-registration-db --project=lobbyist-475218

# Verify DATABASE_URL secret
gcloud secrets versions access latest --secret="lobbyist-db-url-dev"

# Test seed script locally
npm run db:seed
```

## Local Development

For local development with Cloud SQL Proxy:

```bash
# Start Cloud SQL Proxy
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432

# Set environment variable
export ENVIRONMENT=development
export DATABASE_URL="postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev"

# Run startup script (or just seed directly)
./scripts/startup.sh

# Or seed directly
npm run db:seed
```

## Best Practices

### Development Environment

✅ **DO:**
- Let automatic reseeding happen on every deploy
- Update seed script when demo scenarios change
- Test with fresh data regularly

❌ **DON'T:**
- Manually manage dev database state
- Preserve dev data between deployments
- Use dev database for anything important

### Production Environment

✅ **DO:**
- Use `FORCE_RESEED=true` only for planned demos
- Remove `FORCE_RESEED` immediately after use
- Document when and why you force reseeded
- Test force reseed in dev environment first

❌ **DON'T:**
- Force reseed without warning stakeholders
- Leave `FORCE_RESEED=true` permanently set
- Skip Cloud Build approval process
- Assume data is backed up without verification

## Related Documentation

- `scripts/startup.sh` - Startup script with reseeding logic
- `prisma/seed.ts` - Demo data generation (Rule of 3 pattern)
- `cloudbuild-dev.yaml` - Development deployment config
- `cloudbuild-prod.yaml` - Production deployment config
- `DEPLOYMENT-PLAN.md` - Complete deployment guide
- `DEMO-GUIDE.html` - Demo walkthrough with test credentials

## Support

For issues with reseeding:
1. Check startup logs in Cloud Run console
2. Verify environment variables are set correctly
3. Review this guide's troubleshooting section
4. Check Prisma migration status: `npx prisma migrate status`
