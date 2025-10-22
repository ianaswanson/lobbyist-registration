# PostgreSQL Migration Plan
## Cost-Optimized Cloud SQL Setup for Demo Environment

**Created:** October 22, 2025
**Target:** Complete migration in 1 week (5-7 days)
**Budget:** $20/month max (after $300 Google Cloud credit)
**Usage:** 2-3 demo users, not production traffic

---

## Executive Summary

**Current Problem:**
- SQLite causing data inconsistency (multi-instance issues)
- Cannot scale horizontally (locked to max-instances=1)
- No remote database access for debugging
- Blocking demo preparation

**Solution:**
- Migrate to Cloud SQL PostgreSQL (cost-optimized tier)
- Shared database for dev and prod (separate databases, same instance)
- ~$10-15/month cost (well under $20 budget)
- Enables horizontal scaling, remote access, professional demos

**Timeline:** 1 week

---

## Cost-Optimized Architecture

### Cloud SQL Instance Configuration

**Instance Type:** db-f1-micro (Shared-core)
- **vCPUs:** 1 shared core
- **Memory:** 614 MB
- **Storage:** 10 GB SSD (minimum)
- **Backups:** Automated daily backups (7-day retention)
- **Region:** us-west1 (Oregon - closest to your Cloud Run)

**Estimated Cost:**
```
Instance cost (db-f1-micro):      ~$7-9/month
Storage (10 GB SSD):              ~$1-2/month
Backups (7 days):                 ~$0.50-1/month
Network egress (minimal):         ~$0.50-1/month
────────────────────────────────────────────
TOTAL:                            ~$9-13/month
```

**Within budget:** ✅ Well under $20/month threshold

### Single Instance, Multiple Databases

Instead of separate dev/prod instances, we'll use **one instance with two databases:**

```
Cloud SQL Instance: lobbyist-registration-db (db-f1-micro)
├── Database: lobbyist_dev       (for dev environment)
└── Database: lobbyist_prod      (for prod environment)
```

**Cost savings:** ~50% vs. two separate instances
**Trade-off:** Shared resources (fine for 2-3 demo users)

### Performance Expectations

**For 2-3 demo users:**
- ✅ db-f1-micro is MORE than sufficient
- ✅ Can handle 10-20 concurrent connections
- ✅ Fast enough for demos (< 100ms query times)
- ⚠️ Not suitable for 100+ concurrent users (but you don't need that)

**If you need more performance later:**
- Upgrade to db-g1-small (~$25/month, 1.7 GB RAM)
- Only takes 2-3 minutes with zero data loss

---

## Migration Plan: 3 Phases

### Phase A: Foundation Cleanup (Days 1-2)
**Goal:** Fix critical TypeScript errors to prevent migration issues

**Tasks:**
1. Run TypeScript error inventory
2. Fix critical type errors (block schema migration)
3. Test build locally
4. Commit fixes

**Success criteria:** `npm run build` succeeds (or only minor warnings)

---

### Phase B: Cloud SQL Setup (Days 3-4)
**Goal:** Provision PostgreSQL instance and configure access

**Tasks:**
1. Create Cloud SQL instance (db-f1-micro, us-west1)
2. Configure automated backups (daily, 7-day retention)
3. Create two databases: `lobbyist_dev`, `lobbyist_prod`
4. Create database users with proper permissions
5. Configure Cloud Run access (private IP or Cloud SQL Proxy)
6. Test connection from local machine

**Success criteria:** Can connect to both databases from local machine

---

### Phase C: Schema Migration & Deployment (Days 5-7)
**Goal:** Migrate Prisma schema and deploy to dev/prod

**Day 5: Local Testing**
1. Install PostgreSQL locally (for testing)
2. Update `prisma/schema.prisma` (provider = "postgresql")
3. Generate new migration files
4. Test migration on local PostgreSQL
5. Run seed script, verify data
6. Run all E2E tests with PostgreSQL

**Day 6: Dev Environment**
1. Update Cloud Run dev env vars (DATABASE_URL for Cloud SQL)
2. Run migrations on `lobbyist_dev` database
3. Deploy to Cloud Run dev
4. Smoke test dev environment
5. Verify seed data appears correctly
6. Test with multiple page refreshes (consistency check)

**Day 7: Production Environment**
1. Run migrations on `lobbyist_prod` database
2. Update Cloud Run prod env vars
3. Deploy to Cloud Run prod
4. Smoke test production
5. Document new architecture

**Success criteria:**
- Both environments running on PostgreSQL
- Data consistent across requests
- Can scale horizontally (test max-instances=5)
- Can query database via Cloud Console

---

## Detailed Cost Breakdown

### Monthly Recurring Costs

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **Cloud SQL Instance** | db-f1-micro, 1 shared core, 614 MB RAM | $7.665 |
| **Storage** | 10 GB SSD | $1.70 |
| **Backups** | 7-day automated backups (~10 GB) | $0.80 |
| **Network Egress** | Minimal (within same region) | $0.50 |
| **Total** | | **~$10.67/month** |

**Google Cloud Free Tier:**
- First $300 credit lasts ~28 months at this burn rate
- After credit expires: Still only ~$11/month

### One-Time Setup Costs

| Task | Cost |
|------|------|
| Instance creation | $0 (no setup fee) |
| Data migration | $0 (within free tier) |
| Testing/development time | $0 (covered by credits) |

### Cost Comparison

| Approach | Monthly Cost | Notes |
|----------|--------------|-------|
| **Current (SQLite)** | $0 | But broken for demos |
| **Separate dev/prod instances** | ~$20-25/month | 2x db-f1-micro |
| **Single instance (recommended)** | ~$11/month | 1x db-f1-micro, 2 databases ✅ |
| **Overkill (db-g1-small)** | ~$35/month | Not needed for demos |

---

## Technical Implementation Details

### Prisma Schema Changes

**Current (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**New (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Migration considerations:**
- ✅ Most schema stays the same
- ⚠️ DateTime handling slightly different (Prisma handles this)
- ⚠️ Auto-increment IDs: SQLite uses INTEGER, PostgreSQL uses SERIAL/BIGSERIAL
- ✅ Prisma migrations handle conversion automatically

### Connection Strings

**Development Database:**
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@/lobbyist_dev?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
```

**Production Database:**
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@/lobbyist_prod?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
```

**For local development:**
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/lobbyist_local"
```

### Cloud Run Configuration Updates

**Dev Environment (cloudbuild-dev.yaml):**
```yaml
- '--add-cloudsql-instances'
- 'PROJECT_ID:us-west1:lobbyist-registration-db'
- '--set-env-vars'
- 'DATABASE_URL=postgresql://...' # Or use Secret Manager
```

**Production (cloudbuild-prod.yaml):**
```yaml
- '--add-cloudsql-instances'
- 'PROJECT_ID:us-west1:lobbyist-registration-db'
- '--set-env-vars'
- 'DATABASE_URL=postgresql://...' # Or use Secret Manager
```

---

## Risk Management

### High Risks

**Risk 1: Data Loss During Migration**
- **Likelihood:** Low (no production data exists yet)
- **Mitigation:** Test on local PostgreSQL first, automated backups enabled
- **Rollback:** Can revert to SQLite if needed (keep old config for 1 week)

**Risk 2: Connection Issues (Cloud Run ↔ Cloud SQL)**
- **Likelihood:** Medium (first time setup)
- **Mitigation:** Test connection from local machine first, use Cloud SQL Proxy
- **Rollback:** SQLite still available in code

**Risk 3: Cost Overrun**
- **Likelihood:** Very Low (db-f1-micro is predictable)
- **Mitigation:** Set up billing alerts at $15/month, $20/month
- **Rollback:** Can delete Cloud SQL instance instantly

### Medium Risks

**Risk 4: TypeScript Errors Block Migration**
- **Likelihood:** Medium
- **Mitigation:** Fix errors in Phase A before touching database
- **Impact:** 1-2 day delay

**Risk 5: Performance Issues with db-f1-micro**
- **Likelihood:** Very Low (for 2-3 users)
- **Mitigation:** Can upgrade instance in 3 minutes if needed
- **Cost:** Upgrade to db-g1-small = $25/month (still reasonable)

---

## Success Metrics

### After Migration

**Functional:**
- ✅ Both dev and prod environments running on PostgreSQL
- ✅ All E2E tests passing
- ✅ Seed data loads correctly
- ✅ Data consistent across multiple requests (no multi-instance issues)

**Scalability:**
- ✅ Can set max-instances > 1 (test with 5 instances)
- ✅ All instances share same database
- ✅ No data inconsistency issues

**Accessibility:**
- ✅ Can query database via Cloud Console
- ✅ Can run SQL queries for debugging
- ✅ Can export data for demos

**Cost:**
- ✅ Monthly cost < $15
- ✅ Billing alerts configured
- ✅ No unexpected charges

---

## Post-Migration Benefits

### Immediate Benefits

1. **Horizontal Scaling**
   - Remove max-instances=1 limitation
   - Cloud Run can scale to 5-10 instances during demos
   - Better performance under load

2. **Remote Database Access**
   - Query database from Cloud Console
   - Run SQL for debugging
   - Export data for reports

3. **Data Consistency**
   - All instances share same database
   - No more "data disappeared" issues
   - Reliable demos

4. **Professional Setup**
   - Production-grade database
   - Automated backups
   - Point-in-time recovery available

### Future Benefits (When Needed)

5. **Easy Scaling**
   - Upgrade instance size in 3 minutes
   - No code changes required
   - Scales to thousands of users

6. **Advanced Features**
   - Full-text search (PostgreSQL specific)
   - JSON columns (better than SQLite)
   - Advanced indexing options
   - Read replicas (if needed)

---

## Alternatives Considered

### Alternative 1: Supabase (Managed PostgreSQL)
- **Pros:** Easy setup, generous free tier
- **Cons:** Another vendor, less Google Cloud integration
- **Cost:** Free tier available, then $25/month
- **Decision:** Stick with Cloud SQL for Google Cloud consistency

### Alternative 2: Cloud SQL db-g1-small
- **Pros:** More memory (1.7 GB), better performance
- **Cons:** Higher cost (~$25/month)
- **Decision:** Start with db-f1-micro, upgrade if needed

### Alternative 3: Keep SQLite, Use Persistent Disk
- **Pros:** No migration needed
- **Cons:** Still limited to single instance, no remote access
- **Decision:** Not worth it - PostgreSQL solves more problems

### Alternative 4: Serverless PostgreSQL (e.g., Neon, PlanetScale)
- **Pros:** Pay-per-use, auto-scaling
- **Cons:** Another vendor, potential cold starts
- **Decision:** Cloud SQL more predictable for budgeting

---

## Documentation Updates Needed

After migration, update these files:

1. **CLAUDE.md**
   - Update "Current Project Status" section
   - Change database from SQLite to PostgreSQL
   - Update deployment instructions

2. **DEPLOYMENT-*.md files**
   - Add Cloud SQL setup instructions
   - Update environment variable configuration
   - Add database connection troubleshooting

3. **README.md**
   - Update tech stack (PostgreSQL instead of SQLite)
   - Add Cloud SQL prerequisites
   - Update local development setup

4. **MODERNIZATION-ROADMAP.md**
   - Mark Phase 3 (PostgreSQL) as COMPLETE
   - Update remaining phases

5. **ARCHITECTURE-DECISIONS.md**
   - Update Database Layer decision status
   - Document PostgreSQL choice rationale

---

## Rollback Plan

If migration fails or causes issues:

### Immediate Rollback (< 5 minutes)
1. Revert `DATABASE_URL` to SQLite in Cloud Run
2. Redeploy previous revision
3. System back online with SQLite

### Complete Rollback (< 30 minutes)
1. Delete Cloud SQL instance
2. Revert `prisma/schema.prisma` to SQLite
3. Revert Cloud Run configuration
4. Remove migration files (keep in git history)

### Data Recovery
- SQLite data still in git history (seed scripts)
- No production data to lose (demo environment)
- Can recreate seed data in minutes

---

## Next Steps

**Before starting:**
1. Review this plan with stakeholders
2. Confirm $11/month budget is acceptable
3. Set up billing alerts in Google Cloud

**Ready to start?**
1. Create Beads tasks for all phases
2. Main Claude Code agent handles Phase A (TypeScript fixes)
3. GCP SRE agent handles Phase B (Cloud SQL setup)
4. Both agents collaborate on Phase C (migration and deployment)

**Timeline:**
- Start: October 22, 2025
- Target completion: October 29, 2025 (1 week)

---

## Questions Before We Start

1. **Budget confirmation:** Is $11/month acceptable? (vs. $20 budget)
2. **Timeline:** Is 1 week acceptable, or do you need it faster?
3. **Risk tolerance:** Comfortable with shared dev/prod instance?
4. **Backup strategy:** 7-day retention sufficient, or need longer?

Once confirmed, I'll create detailed Beads tasks and we can begin!

---

**Document Owner:** Development Team
**Last Updated:** October 22, 2025
**Status:** Ready for approval and execution
