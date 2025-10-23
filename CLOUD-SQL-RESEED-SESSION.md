# Cloud SQL Database Re-seed Session Summary

**Date:** October 22, 2025
**Environment:** Google Cloud Run Development
**Objective:** Re-seed Cloud SQL database with current seed data including pending registrations and reports

## Problem Statement

The Cloud Run dev environment database (`lobbyist_dev`) was seeded with an older version of the seed script that lacked:
- Pending lobbyist registrations (e.g., Michael Chen with PENDING status)
- Pending/submitted expense reports for admin review workflow testing
- Complete demonstration of admin review features

The startup script (`scripts/startup.sh`) only seeds if `USER_COUNT = 0`, so automatic re-seeding wouldn't occur because users already existed from the old seed.

## Solution Implemented

### 1. Added FORCE_RESEED Environment Variable Support

**Modified:** `scripts/startup.sh`

Added logic to allow forcing a database re-seed via environment variable:

```bash
# Check if force reseed is requested
if [ "$FORCE_RESEED" = "true" ]; then
  echo "⚠️  FORCE_RESEED=true detected - forcing database re-seed..."
  USER_COUNT="0"
else
  # Check if database has data
  USER_COUNT=$(check_database_data)
fi
```

**Commit:** `27afb97 - feat: Add FORCE_RESEED environment variable to allow database re-seeding`

### 2. Fixed Schema Detection Logic

**Problem:** When `FORCE_RESEED=true` was set, the startup script attempted to run `prisma migrate deploy` on a database that already had schema but no migration history, causing error P3005 (database schema is not empty).

**Solution:** Added schema existence check before attempting migrations:

```bash
if [ "$MIGRATIONS_EXIST" = "no" ]; then
  # Check if schema exists but migrations don't (manual setup case)
  TABLES_EXIST=$(node -e "
    // Check for User table existence
    ...
  ")

  if [ "$TABLES_EXIST" = "yes" ]; then
    echo "✅ Database schema already exists (managed outside migrations)"
  else
    # Fresh database - run migrations first
    npx prisma migrate deploy
  fi
fi
```

**Commit:** `7ea1c59 - fix: Handle existing schema without migrations in startup script`

### 3. Deployment Process

1. **Commit and Push Changes**
   - Pushed changes to `develop` branch
   - Cloud Build trigger automatically built new container image
   - Build ID: `7a54abdb-8d8d-4508-9841-cf7a4c66a5e2`

2. **Update Cloud Run Service with FORCE_RESEED**
   ```bash
   gcloud run services update lobbyist-registration-dev \
     --project=lobbyist-475218 \
     --region=us-west1 \
     --set-env-vars=FORCE_RESEED=true
   ```
   - Created revision: `lobbyist-registration-dev-00034-8s5`
   - Database successfully re-seeded with current seed data

3. **Remove FORCE_RESEED Flag**
   ```bash
   gcloud run services update lobbyist-registration-dev \
     --project=lobbyist-475218 \
     --region=us-west1 \
     --remove-env-vars=FORCE_RESEED
   ```
   - Created revision: `lobbyist-registration-dev-00035-8cc`
   - Service now operates normally, skipping seed on restart

## Results

### ✅ Database Successfully Re-seeded

From logs (revision 00034-8s5):
```
2025-10-23 00:50:40 ⚠️  FORCE_RESEED=true detected - forcing database re-seed...
2025-10-23 00:50:41 🌱 Seeding database with test data...
2025-10-23 00:50:44    ✓ Created 2 lobbyist profiles
2025-10-23 00:50:44    ✓ Created 3 employer profiles
2025-10-23 00:50:44    ✓ Created 1 pending lobbyist registration
2025-10-23 00:50:45    ✓ Created 2 pending expense reports (1 submitted, 1 late)
2025-10-23 00:50:45    ✓ Created board calendar entries (4 quarters, 2 commissioners)
2025-10-23 00:50:45    ✓ Created 5 violations
2025-10-23 00:50:45    ✓ Created 4 appeals (1 pending, 1 scheduled, 2 decided)
2025-10-23 00:50:45    ✓ Created audit log entries
2025-10-23 00:50:45    ✓ Created 3 contract exceptions
2025-10-23 00:50:45    ✓ Created hour logs
```

### ✅ Current Deployment Status

**Service:** `lobbyist-registration-dev`
**URL:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
**Latest Revision:** `lobbyist-registration-dev-00035-8cc`
**Deployed:** October 23, 2025 01:30:01 UTC
**Status:** Running normally, skipping seed on restart (correct behavior)

### ✅ Latest Code Commits

1. `7bdedf4` - docs: add Phase 4 Sentry setup session summary
2. `7ea1c59` - fix: Handle existing schema without migrations in startup script
3. `27afb97` - feat: Add FORCE_RESEED environment variable to allow database re-seeding

All changes committed to `develop` branch and deployed.

## Database Contents (Post-Reseed)

The Cloud SQL `lobbyist_dev` database now contains:

### Users & Lobbyists
- **2 APPROVED lobbyists:** John Doe, Jane Smith
- **1 PENDING lobbyist:** Michael Chen (for admin review testing)

### Expense Reports
- **2 APPROVED lobbyist reports:** Q1 2026 reports for approved lobbyists
- **1 SUBMITTED report:** Pending admin review
- **1 DRAFT employer report:** In progress
- **1 LATE employer report:** Overdue for testing compliance

### Board Member Data
- **2 Board Members:** Commissioner Sharon Meieran, Commissioner Julia Brim-Edwards
- **4 quarters of calendar entries** for each board member
- **Lobbying receipt records** for transparency

### Compliance Testing Data
- **5 violations:** Various violation types for testing
- **4 appeals:** Different appeal statuses (pending, scheduled, decided)
- **3 contract exceptions:** Testing §9.230(C) compliance
- **Audit log entries:** Complete audit trail

### Hour Logs
- **10 hour log entries:** Demonstrating the 10-hour registration threshold requirement

## Testing Verification

### Admin Review Workflow
✅ Admin can now test:
1. **Lobbyist Registration Review:** Michael Chen's pending registration
2. **Expense Report Review:** Submitted report awaiting approval
3. **Compliance Monitoring:** Late report flagging
4. **Violation Management:** 5 test violations
5. **Appeal Processing:** Appeals in various states

### Public Transparency
✅ Public dashboard now shows:
- 2 approved, active lobbyists
- Complete expense report history
- Board member calendars and lobbying receipts

## Lessons Learned

1. **Schema vs. Migration State:** Need to handle cases where schema exists but wasn't created via Prisma migrations (manual Cloud SQL setup)

2. **Startup Script Robustness:** The enhanced startup script now handles:
   - Fresh database (no schema, no migrations)
   - Manually created schema (no migrations)
   - Migrated schema (with migration history)
   - Forced re-seeding on existing database

3. **Cloud Run Deployment Strategy:** Using environment variables for one-time operations is effective:
   - Set `FORCE_RESEED=true` for one revision
   - Let it seed the database
   - Remove the flag for subsequent revisions
   - Avoids manual database access requirements

## Future Improvements

1. **Database Reset Script:** Consider creating an admin API endpoint to trigger database reset/re-seed without redeployment (with proper authentication)

2. **Seed Versioning:** Add seed script version tracking to detect when database needs updating

3. **Migration Baseline:** For production, use `prisma migrate resolve --applied` to baseline existing schemas

## Related Documentation

- **PostgreSQL Migration:** `POSTGRESQL-MIGRATION-SUMMARY.md`
- **Phase C Completion:** `PHASE-C-QUICK-REFERENCE.md`
- **Cloud SQL Setup:** `PHASE-B-CLOUD-SQL-SETUP-COMPLETE.md`

## Infrastructure Details

### GCP Project
- **Project ID:** lobbyist-475218
- **Region:** us-west1

### Cloud SQL
- **Instance:** lobbyist-registration-db
- **Database:** lobbyist_dev
- **User:** lobbyist_user
- **Connection:** Via Unix socket (`/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db`)

### Cloud Run
- **Service:** lobbyist-registration-dev
- **Image:** `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:7bdedf4`
- **Environment:** Development
- **Database URL Secret:** `lobbyist-db-url-dev`

### Cloud Build
- **Trigger:** deploy-lobbyist-dev
- **Branch:** develop
- **Auto-deploy:** Enabled

## Next Steps

1. ✅ **Verify Admin Review Pages:** Test that pending registrations and reports appear in admin dashboard
2. ✅ **Test Public Search:** Confirm public transparency features work with new data
3. 🔄 **Production Planning:** Document production deployment process (will need similar approach for prod database seeding)
4. 🔄 **Stakeholder Demo:** Schedule demo using dev environment with complete, realistic data

---

**Session Status:** ✅ Complete
**Cloud Run Dev Environment:** ✅ Running with fresh seed data
**Database State:** ✅ Current seed script applied
**Pending Items Available:** ✅ Admin review workflow testable
