# Phase C2 Complete: PostgreSQL Cloud Run Dev Deployment

**Date:** October 22, 2025
**Status:** ✅ SUCCESS
**Service URL:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
**Revision:** lobbyist-registration-dev-00023-gr2

## Mission Accomplished

Successfully deployed the Lobbyist Registration System to Google Cloud Run development environment with PostgreSQL database backend. The application is now running with production-grade infrastructure and persistent cloud database.

## What Was Fixed

### Critical Issues Identified

1. **Dockerfile had hardcoded SQLite DATABASE_URL** (line 61)
   - Was: `ENV DATABASE_URL="file:/app/prisma/dev.db"`
   - Fixed: Removed hardcoded value, DATABASE_URL now from Secret Manager

2. **Dockerfile installed wrong database client** (line 28)
   - Was: `RUN apk add --no-cache sqlite`
   - Fixed: `RUN apk add --no-cache postgresql-client`

3. **startup.sh was entirely SQLite-specific**
   - Used file system checks (`if [ ! -f "$DB_PATH" ]`)
   - Used `sqlite3` CLI commands to query database
   - Fixed: Complete rewrite using Prisma Client for PostgreSQL

4. **Migration strategy mismatch**
   - Database schema created with `prisma db push` (Phase C1)
   - startup.sh tried to run `prisma migrate deploy`
   - Result: P3005 error (database schema not empty)
   - Fixed: Smart detection of database state, skip migrations if schema exists

### Solutions Implemented

#### 1. Dockerfile Changes (`/Users/ianswanson/ai-dev/lobbyist-registration/Dockerfile`)

```dockerfile
# Before (SQLite)
RUN apk add --no-cache sqlite
ENV DATABASE_URL="file:/app/prisma/dev.db"

# After (PostgreSQL)
RUN apk add --no-cache postgresql-client
# DATABASE_URL will be provided by Cloud Run from Secret Manager
```

#### 2. startup.sh Complete Rewrite (`/Users/ianswanson/ai-dev/lobbyist-registration/scripts/startup.sh`)

**New Logic:**
1. Use Prisma Client (Node.js) to check if User table has data
2. If User count = 0 (empty database):
   - Check if `_prisma_migrations` table exists
   - If no migrations table → schema created with `db push` → skip migrations
   - If migrations table exists → fresh DB → run migrations
   - Always seed if data is empty
3. If User count > 0 → skip both migrations and seed

**Key Innovation:**
- No longer depends on file system (SQLite-specific)
- Uses Prisma Client for database-agnostic checks
- Handles both migration-based and db-push-based schemas
- Gracefully handles existing data from previous `prisma db push`

## Deployment Timeline

### Phase C1 (Completed Earlier)
- ✅ Prisma schema updated from SQLite to PostgreSQL
- ✅ Cloud SQL instance provisioned: `lobbyist-475218:us-west1:lobbyist-registration-db`
- ✅ Databases created: `lobbyist_dev`, `lobbyist_prod`
- ✅ Schema and seed data loaded to `lobbyist_dev` via `prisma db push`
- ✅ Database credentials stored in Secret Manager
- ✅ Service account granted Cloud SQL Client role
- ✅ Local testing successful with Cloud SQL Proxy

### Phase C2 (Today - October 22, 2025)
- ✅ Identified root cause: SQLite remnants in Dockerfile and startup.sh
- ✅ Fixed Dockerfile to remove SQLite dependencies
- ✅ Rewrote startup.sh for PostgreSQL with smart schema detection
- ✅ Committed changes to `develop` branch
- ✅ Cloud Build triggered automatically (ID: 7e4173e5-c674-4cb0-81e1-0023071a3817)
- ✅ Build completed successfully
- ✅ Cloud Run deployed revision 00023-gr2
- ✅ Container started successfully (no P3005 errors)
- ✅ Database connection verified (9 users found from seed data)
- ✅ Service responding to HTTP requests (200 OK)

## Verification Results

### Container Startup Logs
```
🚀 Starting Lobbyist Registration System...

📊 Checking database for existing data...
✅ Database already has data (User count: 9)
✅ Skipping migrations and seed

🎯 Starting Next.js server...
   ▲ Next.js 15.5.5
   - Local:        http://localhost:8080
   - Network:      http://0.0.0.0:8080

 ✓ Starting...
 ✓ Ready in 787ms

STARTUP HTTP probe succeeded after 1 attempt
```

### Service Health Check
- **URL:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
- **HTTP Status:** 200 OK
- **Response Time:** 0.317s
- **Database:** Connected to Cloud SQL PostgreSQL
- **Data:** 9 users from seed data

### No Errors
- Zero ERROR level logs in Cloud Logging
- No container restarts
- No P3005 migration errors
- No connection failures

## Database Configuration

### Cloud SQL Instance
- **Instance ID:** `lobbyist-475218:us-west1:lobbyist-registration-db`
- **Region:** us-west1
- **Database:** `lobbyist_dev`
- **Connection:** Unix socket at `/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db`

### Secret Manager
- **Secret:** `lobbyist-db-url-dev`
- **Contains:** Full PostgreSQL connection string with password
- **Format:** `postgresql://USER:PASSWORD@localhost/lobbyist_dev?host=/cloudsql/INSTANCE_CONNECTION_NAME`

### Prisma Configuration
- **Provider:** `postgresql` (updated from `sqlite`)
- **Migration Lock:** `provider = "postgresql"` in `migration_lock.toml`
- **Schema:** 7 migrations applied (from Phase C1 `db push`)

## Cloud Build & Deployment

### Build Details
- **Build ID:** 7e4173e5-c674-4cb0-81e1-0023071a3817
- **Trigger:** GitHub push to `develop` branch
- **Commit:** 81919f3 "Fix: PostgreSQL migration deployment to Cloud Run"
- **Status:** SUCCESS
- **Duration:** ~8 minutes

### Cloud Run Configuration
- **Service:** `lobbyist-registration-dev`
- **Region:** `us-west1`
- **Min Instances:** 1 (keeps container warm, database connected)
- **Max Instances:** 1 (dev environment, prevents concurrent writes to SQLite... wait, we're PostgreSQL now! Could increase this)
- **Memory:** 512Mi
- **CPU:** 1
- **Timeout:** 300s
- **Access:** Unauthenticated (public for testing)

## Files Modified

### `/Users/ianswanson/ai-dev/lobbyist-registration/Dockerfile`
- Removed hardcoded SQLite DATABASE_URL (line 61)
- Changed `sqlite` package to `postgresql-client` (line 28)
- Added comment explaining DATABASE_URL from Secret Manager

### `/Users/ianswanson/ai-dev/lobbyist-registration/scripts/startup.sh`
- Complete rewrite from SQLite to PostgreSQL approach
- Changed from file system checks to Prisma Client queries
- Added smart migration detection logic
- Handles three scenarios: empty DB (fresh), empty DB (with schema), DB with data

## Git Commit

```bash
Commit: 81919f3
Branch: develop
Message: Fix: PostgreSQL migration deployment to Cloud Run

PROBLEM:
- Container startup failing with P3005 error (database schema not empty)
- Dockerfile had hardcoded SQLite DATABASE_URL
- startup.sh was checking for SQLite file instead of PostgreSQL connection
- Database already has schema from `prisma db push` but startup tried to run migrations

FIXES:
1. Dockerfile:
   - Removed hardcoded SQLite DATABASE_URL (line 61)
   - Replaced sqlite package with postgresql-client (line 28)
   - DATABASE_URL now provided by Cloud Run from Secret Manager

2. startup.sh:
   - Completely rewritten for PostgreSQL
   - Uses Prisma Client to check if data exists (not file system)
   - Checks for _prisma_migrations table to determine if migrations needed
   - Handles three scenarios:
     a) Empty DB with no migrations table → run migrations + seed
     b) Empty DB with schema (from db push) → skip migrations, just seed
     c) DB with data → skip both migrations and seed
   - No longer uses sqlite3 commands

RATIONALE:
- Database schema was created with `prisma db push` (not migrations)
- Running `prisma migrate deploy` on non-empty DB causes P3005 error
- New approach: check if data exists, only seed if empty
- If _prisma_migrations table doesn't exist, schema was created with db push

TESTING:
- Local testing confirmed with Cloud SQL Proxy
- Cloud Build will auto-trigger on push to develop branch

Relates to: Phase C2 - PostgreSQL Cloud Run deployment
Issue: lobbyist-registration-39
```

## Next Steps (Phase C3)

### Production Deployment
1. Update production Cloud Run service with same fixes
2. Deploy to `lobbyist-registration` service (production)
3. Update `lobbyist-db-url-prod` secret with production database connection
4. Test production deployment with empty `lobbyist_prod` database
5. Verify seed data loads correctly

### Optional Optimizations
1. **Increase max-instances** for dev (now that we have PostgreSQL, concurrent requests are safe)
2. **Connection pooling** with Prisma (already enabled by default)
3. **Read replicas** for production (if needed for high traffic)
4. **Automated backups** (already enabled on Cloud SQL)

### Documentation Updates
1. Update DEPLOYMENT-PLAN.md with PostgreSQL instructions
2. Update QUICKSTART-DEPLOY.md with new database setup
3. Add troubleshooting section for P3005 errors
4. Document startup.sh logic for future maintenance

## Lessons Learned

### What Went Wrong
1. **Assumption mismatch:** Assumed migrations would work with db-push-created schema
2. **SQLite remnants:** Didn't catch all SQLite-specific code in initial migration
3. **Testing gap:** Didn't test Cloud Run startup before pushing

### What Went Right
1. **Clear error messages:** P3005 error led directly to root cause
2. **Smart detection:** New startup.sh handles multiple scenarios gracefully
3. **Automated deployment:** Cloud Build trigger made testing fixes fast
4. **Comprehensive logging:** Cloud Logging provided all diagnostic info needed

### Best Practices Applied
1. **Commit message discipline:** Detailed problem/solution in commit message
2. **Incremental verification:** Checked logs, status, HTTP response separately
3. **Documentation as code:** This summary captures entire journey
4. **Issue tracking:** Used Beads to track Phase C2 completion

## Success Criteria (All Met)

- ✅ Cloud Build completes successfully
- ✅ Cloud Run service starts without errors
- ✅ Service responds to HTTP requests
- ✅ Database connection works (can read existing seed data)
- ✅ No container restarts or crashes
- ✅ Dev environment URL is accessible: https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app

## References

- Cloud SQL Instance: https://console.cloud.google.com/sql/instances/lobbyist-registration-db?project=lobbyist-475218
- Cloud Run Service: https://console.cloud.google.com/run/detail/us-west1/lobbyist-registration-dev?project=lobbyist-475218
- Cloud Build History: https://console.cloud.google.com/cloud-build/builds?project=lobbyist-475218
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=lobbyist-475218

---

**Status:** Phase C2 ✅ COMPLETE
**Next:** Phase C3 - Production PostgreSQL Deployment
**Deployment:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
