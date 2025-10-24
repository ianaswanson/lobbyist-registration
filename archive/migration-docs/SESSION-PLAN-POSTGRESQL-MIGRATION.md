# Session Plan: PostgreSQL Migration
## Cost-Optimized Database Migration for Demo Environment

**Created:** October 22, 2025
**Timeline:** 1 week (5-7 days)
**Budget:** ~$11/month (well under $20 target)
**Execution:** Main Claude Code agent + GCP SRE specialist agent

---

## Overview

**Goal:** Migrate from SQLite to Cloud SQL PostgreSQL to solve data inconsistency issues blocking demos.

**Current blocker:** SQLite multi-instance issues causing data to disappear/be inconsistent

**Solution:** Single Cloud SQL instance with two databases (dev/prod), cost-optimized at ~$11/month

---

## Documents Created

1. **POSTGRESQL-MIGRATION-PLAN.md** - Complete technical plan (cost breakdown, architecture, risks)
2. **This file** - Session execution plan

---

## Beads Tasks Created

All tasks are tracked in Beads with proper dependencies:

| Task ID | Phase | Description | Blocked By |
|---------|-------|-------------|------------|
| **lobbyist-registration-36** | Phase A | TypeScript Error Inventory and Critical Fixes | None ✅ READY |
| **lobbyist-registration-37** | Phase B | Cloud SQL Instance Provisioning (db-f1-micro) | Task 36 |
| **lobbyist-registration-38** | Phase C1 | Local PostgreSQL Testing and Schema Migration | Task 37 |
| **lobbyist-registration-39** | Phase C2 | Deploy PostgreSQL to Dev Environment | Task 38 |
| **lobbyist-registration-40** | Phase C3 | Deploy PostgreSQL to Production Environment | Task 39 |
| **lobbyist-registration-41** | Post-Migration | Documentation Updates and Cost Monitoring | Task 40 |

**Check status:** `bd ready` to see next available task

---

## Execution Plan

### Phase A: Foundation Cleanup (Days 1-2)
**Beads Task:** lobbyist-registration-36
**Agent:** Main Claude Code agent
**Owner:** Development team

**Steps:**
1. Start task: `bd update lobbyist-registration-36 --status in-progress`
2. Run TypeScript error inventory: `npm run build` or `tsc --noEmit`
3. Categorize errors (critical vs. minor)
4. Fix ONLY critical errors that could block schema changes
5. Test build succeeds: `npm run build`
6. Commit fixes
7. Complete task: `bd close lobbyist-registration-36`

**Success criteria:**
- `npm run build` succeeds (or only minor warnings)
- No type errors in Prisma schema or database layer
- Ready to modify schema safely

**Estimated time:** 4-8 hours (2 days max)

---

### Phase B: Cloud SQL Provisioning (Days 3-4)
**Beads Task:** lobbyist-registration-37
**Agent:** GCP SRE specialist agent
**Owner:** Infrastructure team

**Steps:**
1. Start task: `bd update lobbyist-registration-37 --status in-progress`
2. Create Cloud SQL instance:
   - Instance ID: `lobbyist-registration-db`
   - Type: `db-f1-micro` (0.6GB RAM, shared core)
   - Region: `us-west1` (Oregon)
   - Storage: 10 GB SSD
   - Backups: Automated daily, 7-day retention
3. Create databases:
   - `lobbyist_dev` (for development environment)
   - `lobbyist_prod` (for production environment)
4. Create database users with proper permissions
5. Configure Cloud Run access (Cloud SQL Proxy or private IP)
6. Set up billing alerts:
   - Warning at $15/month
   - Critical at $20/month
7. Test connection from local machine
8. Complete task: `bd close lobbyist-registration-37`

**Success criteria:**
- Can connect to both databases from local machine
- Billing alerts configured
- Instance cost confirmed at ~$11/month

**Estimated time:** 4-6 hours

**GCP Commands:**
```bash
# Create instance
gcloud sql instances create lobbyist-registration-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-west1 \
  --backup \
  --backup-start-time=03:00 \
  --retained-backups-count=7

# Create databases
gcloud sql databases create lobbyist_dev --instance=lobbyist-registration-db
gcloud sql databases create lobbyist_prod --instance=lobbyist-registration-db

# Create user
gcloud sql users create lobbyist_user \
  --instance=lobbyist-registration-db \
  --password=<secure-password>

# Enable Cloud SQL Admin API (if needed)
gcloud services enable sqladmin.googleapis.com
```

---

### Phase C1: Local Testing and Schema Migration (Day 5)
**Beads Task:** lobbyist-registration-38
**Agent:** Main Claude Code agent
**Owner:** Development team

**Steps:**
1. Start task: `bd update lobbyist-registration-38 --status in-progress`
2. Install PostgreSQL locally:
   - macOS: `brew install postgresql@15`
   - Start service: `brew services start postgresql@15`
3. Create local test database: `createdb lobbyist_local`
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
5. Update local `.env`:
   ```
   DATABASE_URL="postgresql://localhost:5432/lobbyist_local"
   ```
6. Generate migration: `npm run prisma:migrate dev --name switch_to_postgresql`
7. Run seed script: `npm run prisma:seed`
8. Verify data: `npm run prisma:studio`
9. Run ALL E2E tests: `npm run test:e2e`
10. Fix any PostgreSQL-specific issues
11. Commit migration files
12. Complete task: `bd close lobbyist-registration-38`

**Success criteria:**
- All migrations run successfully
- Seed data loads correctly
- All E2E tests pass (100%)
- No SQLite-specific code remaining

**Estimated time:** 6-8 hours

---

### Phase C2: Deploy to Dev Environment (Day 6)
**Beads Task:** lobbyist-registration-39
**Agents:** Main Claude Code agent + GCP SRE specialist
**Owner:** Development team

**Steps:**
1. Start task: `bd update lobbyist-registration-39 --status in-progress`
2. Get Cloud SQL connection string (GCP SRE agent)
3. Update Cloud Run dev environment variables:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@/lobbyist_dev?host=/cloudsql/PROJECT_ID:us-west1:lobbyist-registration-db"
   ```
4. Update `cloudbuild-dev.yaml`:
   - Add `--add-cloudsql-instances` flag
   - Update DATABASE_URL env var (or use Secret Manager)
5. Run migrations on Cloud SQL dev database:
   ```bash
   # Option 1: Run from local machine via Cloud SQL Proxy
   cloud_sql_proxy -instances=PROJECT_ID:us-west1:lobbyist-registration-db=tcp:5432 &
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lobbyist_dev" npm run prisma:migrate deploy

   # Option 2: Add migration step to cloudbuild-dev.yaml
   ```
6. Deploy to Cloud Run dev:
   ```bash
   git add .
   git commit -m "Migrate dev environment to PostgreSQL"
   git push origin develop
   ```
7. Monitor Cloud Build deployment
8. Smoke test dev environment:
   - Visit https://lobbyist-registration-dev-*.run.app
   - Sign in as john.doe@lobbying.com
   - Check expense reports (should show 2 reports)
   - Refresh multiple times (data should be consistent)
9. Test horizontal scaling:
   - Update max-instances to 5
   - Deploy again
   - Test data consistency across multiple instances
10. Complete task: `bd close lobbyist-registration-39`

**Success criteria:**
- Dev environment running on PostgreSQL
- Seed data appears correctly
- Data consistent across refreshes (no multi-instance issues)
- Can scale to 5 instances without data problems
- Can query database via Cloud Console

**Estimated time:** 4-6 hours

---

### Phase C3: Deploy to Production (Day 7)
**Beads Task:** lobbyist-registration-40
**Agents:** Main Claude Code agent + GCP SRE specialist
**Owner:** Development team

**Steps:**
1. Start task: `bd update lobbyist-registration-40 --status in-progress`
2. Run migrations on Cloud SQL prod database:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lobbyist_prod" npm run prisma:migrate deploy
   ```
3. Update `cloudbuild-prod.yaml`:
   - Add `--add-cloudsql-instances` flag
   - Update DATABASE_URL for lobbyist_prod
4. Merge develop → main:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
5. Monitor Cloud Build deployment (requires manual approval)
6. Approve production deployment in Cloud Console
7. Smoke test production environment:
   - Visit https://lobbyist-registration-*.run.app
   - Sign in and verify functionality
   - Check data consistency
8. Test horizontal scaling (max-instances=5)
9. Verify backups are running (check Cloud SQL backups)
10. Complete task: `bd close lobbyist-registration-40`

**Success criteria:**
- Production running on PostgreSQL
- All features working correctly
- Horizontal scaling works (max-instances=5)
- Automated backups running daily
- Cost confirmed at ~$11/month

**Estimated time:** 3-4 hours

---

### Post-Migration: Documentation and Monitoring
**Beads Task:** lobbyist-registration-41
**Agent:** Main Claude Code agent
**Owner:** Development team

**Steps:**
1. Start task: `bd update lobbyist-registration-41 --status in-progress`
2. Update **CLAUDE.md**:
   - Change database from SQLite to PostgreSQL
   - Update local development setup instructions
   - Add Cloud SQL connection instructions
3. Update **DEPLOYMENT-*.md files**:
   - Add Cloud SQL prerequisites
   - Update environment variable configuration
   - Add database connection troubleshooting
4. Update **README.md**:
   - Update tech stack (PostgreSQL instead of SQLite)
   - Add Cloud SQL setup instructions
5. Update **MODERNIZATION-ROADMAP.md**:
   - Mark Phase 3 (PostgreSQL) as COMPLETE
   - Update timeline for remaining phases
6. Update **ARCHITECTURE-DECISIONS.md**:
   - Mark Database Layer decision as ✅ Fully Implemented
   - Document PostgreSQL choice and cost rationale
7. Create **SESSION-SUMMARY-POSTGRESQL-MIGRATION.md**:
   - Document what was done
   - Record challenges overcome
   - Note cost savings achieved
8. Verify billing alerts are set:
   - Warning at $15/month
   - Critical at $20/month
9. Set up monthly cost review reminder
10. Complete task: `bd close lobbyist-registration-41`

**Success criteria:**
- All documentation updated
- Billing alerts configured
- Session summary created
- Team knows how to work with PostgreSQL

**Estimated time:** 2-3 hours

---

## Agent Responsibilities

### Main Claude Code Agent (This Agent)
**Handles:**
- Phase A: TypeScript fixes
- Phase C1: Schema migration and local testing
- Phase C2 & C3: Cloud Run deployment configuration
- Post-Migration: Documentation updates

**Tools:**
- Edit, Write, Read for code changes
- Bash for npm/prisma commands
- Prisma CLI for migrations
- Git for version control

---

### GCP SRE Specialist Agent
**Handles:**
- Phase B: Cloud SQL instance creation
- Phase B: Database and user creation
- Phase B: Billing alert setup
- Phase C2 & C3: Cloud SQL configuration in Cloud Run

**Tools:**
- gcloud CLI for infrastructure
- Cloud Console for monitoring
- Cloud SQL Proxy for connections
- IAM for permissions

**How to invoke:**
```
I need to use the gcp-sre-specialist agent to set up our Cloud SQL infrastructure.
```

---

## Cost Monitoring

### Estimated Monthly Costs

| Service | Cost |
|---------|------|
| Cloud SQL (db-f1-micro) | $7.67 |
| Storage (10 GB SSD) | $1.70 |
| Backups (7 days, ~10 GB) | $0.80 |
| Network egress (minimal) | $0.50 |
| **TOTAL** | **~$10.67/month** |

**Google Cloud Credits:**
- $300 credit lasts ~28 months at this rate
- After credit: ~$11/month (well under $20 budget)

### Billing Alerts

Set up two alerts:
1. **Warning at $15/month** - Email notification
2. **Critical at $20/month** - Email notification + Slack (if configured)

**How to set up:**
```bash
# Via GCP Console:
# Billing → Budgets & Alerts → Create Budget
# Set to $20/month total, alert at 75% ($15) and 100% ($20)
```

---

## Risk Management

### Rollback Plan

If migration fails or causes issues:

**Immediate Rollback (< 5 minutes):**
1. Revert `DATABASE_URL` to SQLite in Cloud Run env vars
2. Redeploy previous Cloud Run revision
3. System back online with SQLite

**Complete Rollback (< 30 minutes):**
1. Delete Cloud SQL instance (stop charges)
2. Revert `prisma/schema.prisma` to SQLite
3. Revert Cloud Run configuration files
4. Remove PostgreSQL migration files (keep in git history)

**No data loss risk:**
- No production data exists yet (demo environment)
- Can recreate seed data anytime
- SQLite data preserved in git history

---

## Success Criteria

### Must-Have (MVP)
- ✅ Dev and prod running on PostgreSQL
- ✅ Data consistent across requests (multi-instance works)
- ✅ Can scale horizontally (max-instances > 1)
- ✅ Monthly cost < $15
- ✅ All E2E tests pass

### Nice-to-Have
- ✅ Can query database via Cloud Console
- ✅ Automated backups running
- ✅ Billing alerts configured
- ✅ Documentation updated

---

## Next Steps

**Ready to start?**

1. **Start Phase A now:**
   ```bash
   bd update lobbyist-registration-36 --status in-progress
   ```

2. **Main Claude Code agent runs Phase A** (TypeScript fixes)

3. **After Phase A completes, invoke GCP SRE agent:**
   ```
   I need to use the gcp-sre-specialist agent to create our Cloud SQL instance.
   ```

4. **Continue through phases sequentially**

5. **Track progress:**
   ```bash
   bd ready      # See next available task
   bd blocked    # See what's waiting
   bd list       # See all tasks
   ```

---

## Notes on Context7 MCP

**Status:** Not currently configured (API key issue)

**For now:** We'll use official documentation via WebFetch when needed:
- Prisma docs: https://www.prisma.io/docs
- Cloud SQL docs: https://cloud.google.com/sql/docs
- Next.js docs: https://nextjs.org/docs

**To configure Context7 later:**
- Get API key from https://context7.com
- Configure MCP server settings
- Helpful for up-to-date library documentation

---

## Timeline

| Day | Phase | Tasks | Agent |
|-----|-------|-------|-------|
| 1-2 | Phase A | TypeScript fixes | Main Claude Code |
| 3-4 | Phase B | Cloud SQL setup | GCP SRE specialist |
| 5 | Phase C1 | Local migration testing | Main Claude Code |
| 6 | Phase C2 | Dev deployment | Both agents |
| 7 | Phase C3 | Prod deployment | Both agents |
| 7 | Post | Documentation | Main Claude Code |

**Target completion:** October 29, 2025 (1 week from now)

---

## Questions to Confirm

Before starting, confirm:

1. ✅ **Budget:** $11/month acceptable? (vs. $20 budget)
2. ✅ **Timeline:** 1 week acceptable?
3. ✅ **Approach:** Shared dev/prod instance OK?
4. ⚠️ **Context7:** OK to proceed without it for now?

Once confirmed, we can start Phase A immediately!

---

**Document Owner:** Development Team
**Created:** October 22, 2025
**Status:** Ready for execution
**First Task:** lobbyist-registration-36 (READY)
