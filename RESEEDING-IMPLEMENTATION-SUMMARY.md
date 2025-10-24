# Database Reseeding Implementation Summary

## Changes Made

### 1. Enhanced Startup Script (`scripts/startup.sh`)

**Previous Behavior:**
- Checked if database had data (user count)
- Only seeded if `USER_COUNT = 0` OR `FORCE_RESEED = true`
- Same behavior for all environments

**New Behavior:**
- **Environment-aware reseeding strategy**
- Three modes: development, production, unknown
- Automatic dev reseeding on every deploy
- Production data preservation by default

**Key Changes:**
```bash
# Added environment detection
echo "📦 Environment: ${ENVIRONMENT:-unknown}"

# Three-tiered decision logic:
1. FORCE_RESEED=true (highest priority) → Always reset and reseed
2. ENVIRONMENT=development → Automatic reset and reseed
3. ENVIRONMENT=production → Preserve data (only seed if empty)
4. Unknown environment → Check database, seed only if empty

# Different reset strategies:
- FORCE_RESET=true → npx prisma db push --force-reset --accept-data-loss
- FORCE_RESET=false → npx prisma migrate deploy (idempotent)
```

**Lines Changed:**
- Lines 1-78: Environment detection and reseeding logic
- Lines 80-111: Conditional reset and seeding based on environment
- Added clear logging for visibility

### 2. Cloud Build Configurations (Already Correct)

**`cloudbuild-dev.yaml`:**
- Already sets `ENVIRONMENT=development` (line 8, 81)
- No changes needed ✅

**`cloudbuild-prod.yaml`:**
- Already sets `ENVIRONMENT=production` (line 8, 142)
- No changes needed ✅

### 3. Documentation Created

**New File: `RESEEDING-GUIDE.md`**
- Comprehensive guide to database reseeding strategy
- Environment-specific behaviors explained
- Force reseed procedures for production demos
- Troubleshooting section
- Monitoring and verification procedures
- Best practices and anti-patterns

**Updated File: `README.md`**
- Added "Database Reseeding" section
- Added `db:reset` command to development commands
- Added RESEEDING-GUIDE.md to documentation index

## Behavior Changes

### Development Environment (lobbyist-registration-dev)

**Before:**
```
📊 Checking database for existing data...
✅ Database already has data (User count: 12)
✅ Skipping seed (migrations already applied)
```

**After:**
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

### Production Environment (lobbyist-registration)

**Before:**
```
📊 Checking database for existing data...
✅ Database already has data (User count: 45)
✅ Skipping seed (migrations already applied)
```

**After:**
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

## How to Use

### Automatic Dev Reseeding (Zero Manual Steps)

```bash
# Just push to develop branch - reseeding happens automatically
git push origin develop

# Cloud Build auto-deploys with ENVIRONMENT=development
# Startup script detects development environment
# Database is reset and reseeded automatically
# Fresh demo data every time
```

### Force Reseed Production (For Demos)

**Option 1: One-time via gcloud CLI (Recommended)**
```bash
# Set FORCE_RESEED environment variable
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true

# Push to main and approve deployment
git push origin main
# (Approve in Cloud Build console)

# Remove FORCE_RESEED after deployment
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

**Option 2: Via Cloud Console**
1. Go to Cloud Run Console
2. Click `lobbyist-registration` service
3. Edit & Deploy New Revision
4. Add environment variable: `FORCE_RESEED=true`
5. Deploy
6. After deployment, remove the variable

**Option 3: Persistent in Cloud Build (Not Recommended)**
Edit `cloudbuild-prod.yaml` line 142:
```yaml
- "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT},FORCE_RESEED=true"
```
**Remember to remove it immediately after your demo!**

## Testing the Implementation

### Test Dev Auto-Reseed

```bash
# Make a trivial change to seed script
echo "// Test change" >> prisma/seed.ts

# Commit and push to develop
git add prisma/seed.ts
git commit -m "test: verify auto-reseed"
git push origin develop

# Watch Cloud Build logs
gcloud builds list --limit=1

# Check startup logs for "Development environment detected"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit=50
```

### Test Prod Data Preservation

```bash
# Push to main (will require approval)
git push origin main

# Approve in Cloud Build console
# Check startup logs for "Production environment detected - data preservation mode"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" --limit=50

# Verify data was NOT reset (user count should be same as before)
```

### Test Prod Force Reseed

```bash
# Set FORCE_RESEED
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true

# Trigger new deployment (just redeploy current revision)
gcloud run services update lobbyist-registration \
  --region us-west1

# Check logs for "FORCE_RESEED=true detected"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" --limit=50

# Clean up
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

## Environment Variables Reference

| Variable | Set By | Values | Effect |
|----------|--------|--------|--------|
| `ENVIRONMENT` | Cloud Build | `development`, `production` | Determines automatic reseeding behavior |
| `FORCE_RESEED` | Manual override | `true`, unset | Forces reset regardless of environment |

**Priority Order:**
1. `FORCE_RESEED=true` → Always reset (highest)
2. `ENVIRONMENT=development` → Automatic reset
3. `ENVIRONMENT=production` → Preserve data
4. Unknown → Check database state

## Verification Checklist

✅ **Implementation Complete**
- [x] Startup script updated with environment detection
- [x] Dev auto-reseed logic implemented
- [x] Prod data preservation logic implemented
- [x] Force reseed override supported
- [x] Clear logging added
- [x] Error handling included

✅ **Documentation Complete**
- [x] RESEEDING-GUIDE.md created (comprehensive guide)
- [x] README.md updated (quick reference)
- [x] RESEEDING-IMPLEMENTATION-SUMMARY.md created (this file)

✅ **Cloud Build Configs**
- [x] Dev config sets ENVIRONMENT=development
- [x] Prod config sets ENVIRONMENT=production
- [x] No changes needed (already correct)

✅ **Ready for Testing**
- [ ] Test dev auto-reseed (push to develop)
- [ ] Test prod data preservation (push to main)
- [ ] Test prod force reseed (set FORCE_RESEED=true)
- [ ] Verify startup logs show correct behavior
- [ ] Document test results

## Next Steps

### Immediate (Before Next Deploy)

1. **Test dev auto-reseed:**
   ```bash
   git push origin develop
   # Watch for "Development environment detected - auto-reseeding enabled"
   ```

2. **Verify prod preservation:**
   ```bash
   git push origin main
   # Watch for "Production environment detected - data preservation mode"
   ```

3. **Document test results:**
   - Screenshot startup logs
   - Verify data state matches expectations
   - Confirm no errors in Sentry

### Future Considerations

1. **Add audit logging:**
   - Log database reseeds to AuditLog table
   - Track who triggered force reseeds
   - Include environment and timestamp

2. **Add Slack notifications:**
   - Notify team when prod is force reseeded
   - Alert on dev reseed failures
   - Weekly summary of dev deploys

3. **Add pre-reseed backup:**
   - Automatic backup before force reseed
   - Keep last 3 production backups
   - Quick restore procedure

4. **Add reseed metrics:**
   - Track reseed duration
   - Alert on slow reseeds (>2 minutes)
   - Monitor seed script errors

## Rollback Plan

If issues occur, revert startup script:

```bash
git revert HEAD
git push origin develop  # or main
```

**Previous working behavior:**
- Checked user count
- Seeded only if empty OR FORCE_RESEED=true
- No environment detection

## Support

Questions or issues:
1. Check RESEEDING-GUIDE.md troubleshooting section
2. Review startup logs in Cloud Run console
3. Verify ENVIRONMENT variable is set
4. Check Prisma migration status

## Files Changed

1. `/scripts/startup.sh` - Enhanced with environment detection
2. `/RESEEDING-GUIDE.md` - NEW: Comprehensive guide
3. `/README.md` - Updated with reseeding section
4. `/RESEEDING-IMPLEMENTATION-SUMMARY.md` - NEW: This file

## Files Verified (No Changes Needed)

1. `/cloudbuild-dev.yaml` - Already sets ENVIRONMENT=development ✅
2. `/cloudbuild-prod.yaml` - Already sets ENVIRONMENT=production ✅
3. `/prisma/seed.ts` - Already has clearDatabase() function ✅

---

**Implementation Date:** October 24, 2025
**Status:** Ready for Testing
**Risk Level:** Low (preserves existing behavior, adds safety for prod)
