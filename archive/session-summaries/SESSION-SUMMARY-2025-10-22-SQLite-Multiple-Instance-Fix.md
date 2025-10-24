# Session Summary: SQLite Multiple Instance Data Inconsistency Fix - October 22, 2025

## Overview
Fixed critical data inconsistency issue in development environment where users saw different data depending on which Cloud Run container instance handled their request.

## Problem Discovered

**User Observation:**
- User logged in as `john.doe@lobbying.com` at `/reports/lobbyist`
- Expected to see expense reports (seed data should have created 2 reports)
- Saw "No expense reports yet" message instead
- Data appeared to be missing despite successful seeding logs

**Root Cause: SQLite + Multiple Cloud Run Instances**

```
Cloud Run Configuration (BEFORE):
├── min-instances: 1
└── max-instances: 10  ← PROBLEM!

How it failed:
1. Cloud Run scales to multiple container instances (up to 10)
2. Each container has its own SQLite database file (ephemeral filesystem)
3. Load balancer randomly routes requests to different instances
4. User hits Instance A: Has seeded data ✅
5. Next request hits Instance B: Empty or different database ❌
6. Result: Inconsistent data experience
```

**Why This Happened:**
- SQLite stores database as a file in container's local filesystem
- Each Cloud Run instance = separate container = separate filesystem
- No shared storage between instances
- Each instance seeds its own database independently
- Users get routed to different instances randomly

## The Fix

**Changed Configuration:**
```yaml
# cloudbuild-dev.yaml
- '--max-instances'
- '1'  # Changed from 10 to 1
```

**Why This Works:**
- Forces Cloud Run to use exactly 1 container instance
- Single container = single SQLite database
- All requests go to same instance with same data
- Consistent demo data for all users

**Trade-offs:**
- Cost: Same (~$5/month already paying for min-instances=1)
- Performance: No impact for dev/demo environment
- Scalability: Limited to 1 instance (fine for development)

## Files Modified

### cloudbuild-dev.yaml
**Before:**
```yaml
- '--max-instances'
- '10'
```

**After:**
```yaml
- '--max-instances'
- '1'
```

## Commits Made

1. **Commit b897f64** - "Fix: Set min-instances=1 for dev to maintain seeded data"
   - Initial attempt to fix by ensuring min-instances=1
   - Prevented scale-to-zero data loss
   - But didn't fix multi-instance inconsistency

2. **Commit ee67c56** - "Fix: Set max-instances=1 for dev to ensure consistent SQLite data"
   - Final fix addressing multi-instance problem
   - Comprehensive commit message explaining the issue

## Deployment

**Build ID:** 19efc382-ba48-4caf-8162-c2df30bd052e
- **Status:** SUCCESS ✅
- **Started:** 2025-10-22 05:11:42 UTC
- **Completed:** 2025-10-22 05:18:49 UTC
- **Duration:** ~7 minutes

**Deployed Configuration:**
- Service: `lobbyist-registration-dev`
- Region: `us-west1`
- Image: `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:ee67c56`
- Min instances: 1
- Max instances: 1 (fixed)
- Memory: 512Mi
- CPU: 1

## Expected Seed Data

**For john.doe@lobbying.com (lobbyist1):**
- ✅ 2 expense reports
  - Q1 2025 (APPROVED) - $673.00 total
  - Q3 2025 (APPROVED) - $398.25 total
- ✅ Each with detailed line items
- ✅ Linked to employer TechCorp Industries

**Seed Script Details:**
- Location: `prisma/seed.ts`
- Q1 Report: Lines 254-307
- Q3 Report: Lines 368-381
- Both created for `lobbyist1.id`

## Verification Steps

1. **Navigate to:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
2. **Sign in as:** john.doe@lobbying.com / lobbyist123
3. **Go to:** My Expense Reports page
4. **Expected:** See 2 expense reports (Q1 and Q3 2025, both APPROVED)
5. **Test consistency:** Refresh page multiple times - data should remain consistent

## Database Access Discussion

**User Question:** "Can I access the DB in Google Cloud?"

**Current Situation (SQLite in Container):**
- ❌ Database is inside ephemeral container filesystem
- ❌ Not easily accessible remotely
- ❌ No built-in query interface

**Options:**
1. **Add admin API endpoint** (quick dev solution)
   - Temporary endpoint for database queries
   - Requires authentication
   - Quick but exposes data

2. **Download database file** (manual inspection)
   - Add endpoint to download SQLite file
   - Open locally with DB Browser for SQLite
   - One-time snapshot only

3. **Migrate to Cloud SQL** (proper solution)
   - Planned in Phase 3 of modernization roadmap
   - PostgreSQL on Cloud SQL
   - Full query interface in Google Cloud Console
   - Persistent, scalable, proper backups
   - Cost: ~$10-15/month

**Recommendation:**
- For now: Use application UI to view data
- For future: Migrate to Cloud SQL (Phase 3, weeks 5-6)

## Long-term Solution

**This fix is temporary for development/demo.**

**Permanent Solution (Phase 3 - Modernization Roadmap):**
- Migrate SQLite → Cloud SQL PostgreSQL
- Benefits:
  - ✅ Shared database across all container instances
  - ✅ Unlimited scalability (max-instances can be 10+)
  - ✅ Direct database access via Cloud Console
  - ✅ Proper backups and point-in-time recovery
  - ✅ Better performance
  - ✅ Production-ready

**Timeline:** Weeks 5-6 of modernization plan
**Documentation:** MODERNIZATION-ROADMAP.md

## Architectural Lessons Learned

### 1. SQLite Limitations in Serverless

**SQLite is NOT designed for:**
- ❌ Multiple concurrent processes accessing same file
- ❌ Network-attached storage
- ❌ Container orchestration platforms
- ❌ Auto-scaling environments

**SQLite IS good for:**
- ✅ Single-process applications
- ✅ Local development
- ✅ Embedded databases
- ✅ Low-traffic, single-instance deployments

### 2. Cloud Run Scaling Behavior

**Key Understanding:**
- Cloud Run can create multiple container instances
- Each instance is completely isolated
- No shared filesystem between instances
- Load balancing is random/round-robin
- Instances can start and stop independently

**Implications for Database Choice:**
- File-based databases (SQLite) = per-instance data
- Network databases (PostgreSQL, MySQL) = shared data
- For multi-instance: Must use network database

### 3. Development vs Production Trade-offs

**This Solution (max-instances=1):**
- ✅ Good: Simple, works for demos
- ✅ Good: No infrastructure changes needed
- ✅ Good: Same cost as before
- ❌ Bad: Cannot scale horizontally
- ❌ Bad: Single point of failure
- ❌ Bad: Not production-ready

**Proper Solution (Cloud SQL):**
- ✅ Good: Scales horizontally
- ✅ Good: Production-ready
- ✅ Good: Professional database management
- ❌ Bad: Requires infrastructure setup
- ❌ Bad: Additional cost (~$15/month)
- ❌ Bad: Migration effort required

## Session Timeline

1. **Issue Discovery** - User reports missing expense reports
2. **Initial Investigation** - Checked seed script, found reports should exist
3. **Root Cause Analysis** - Identified multi-instance SQLite problem
4. **First Fix Attempt** - Set min-instances=1 (prevented scale-to-zero)
5. **User Feedback** - Still seeing no data
6. **Deeper Analysis** - Realized max-instances=10 was the issue
7. **Final Fix** - Set max-instances=1
8. **Deployment** - Build completed successfully
9. **Documentation** - Created this session summary

## Current Status

✅ **Fix Deployed Successfully**
- Build 19efc382 completed with SUCCESS
- New revision deployed with max-instances=1
- Single container instance running
- Consistent SQLite database

⏳ **Pending Verification**
- User needs to refresh browser and test
- Should see 2 expense reports for John Doe
- Data should be consistent across page loads

📋 **Follow-up Items**
- Verify expense reports appear correctly
- Test data consistency with multiple page loads
- Consider Cloud SQL migration timing
- Update MODERNIZATION-ROADMAP.md if priorities change

## Commands Reference

```bash
# Check current service configuration
gcloud run services describe lobbyist-registration-dev \
  --region us-west1 \
  --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/maxScale'])"

# View recent builds
gcloud builds list --limit=5

# Check build status
gcloud builds describe 19efc382-ba48-4caf-8162-c2df30bd052e

# View logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" \
  --limit=100 --freshness=15m

# List container instances
gcloud run revisions list \
  --service=lobbyist-registration-dev \
  --region=us-west1
```

## Key Takeaways

1. **SQLite + Serverless = Careful consideration needed**
   - Great for single-instance deployments
   - Problematic for auto-scaling environments

2. **Cloud Run Scaling Has Implications**
   - Multiple instances = isolated filesystems
   - Shared state requires network-attached storage

3. **Development Workarounds Are Temporary**
   - max-instances=1 works for dev/demo
   - Production needs proper database infrastructure

4. **Database Choice Matters**
   - File-based: Simple but limited scalability
   - Network-based: Complex but production-ready

5. **Always Test Multi-Instance Scenarios**
   - Even if min-instances=1, max-instances matters
   - Load balancing can expose data inconsistencies

## Next Session Recommendations

1. **Verify the fix:** Test expense reports page as john.doe@lobbying.com
2. **Test consistency:** Multiple page refreshes should show same data
3. **Consider migration:** Evaluate Cloud SQL migration timeline
4. **Update roadmap:** Adjust Phase 3 priorities if needed
5. **Document patterns:** Add to ARCHITECTURE-DECISIONS.md

## References

- Issue: Data inconsistency in development environment
- Fix: Set max-instances=1 in cloudbuild-dev.yaml
- Builds: b897f64, ee67c56, 19efc382
- Documentation: RUNTIME-SEEDING-IMPLEMENTATION.md, MODERNIZATION-ROADMAP.md
- Related: ARCHITECTURE-DECISIONS.md (database layer decisions)

---

**Session Duration:** ~45 minutes
**Outcome:** Issue identified, fixed, and deployed successfully
**User Impact:** Consistent demo data across all requests
**Technical Debt:** Temporary workaround; Cloud SQL migration recommended
