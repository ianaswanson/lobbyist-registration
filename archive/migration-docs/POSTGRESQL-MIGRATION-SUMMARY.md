# PostgreSQL Migration - Ready to Execute
## Quick Reference Guide

**Created:** October 22, 2025

---

## TL;DR

**Problem:** SQLite causing data inconsistency in demos (multi-instance issues)

**Solution:** Migrate to Cloud SQL PostgreSQL (db-f1-micro)

**Cost:** ~$11/month (well under your $20 budget)

**Timeline:** 1 week (7 days)

**Status:** ✅ Plan complete, ready to start

---

## What We've Prepared

### 1. Complete Technical Plan
**File:** `POSTGRESQL-MIGRATION-PLAN.md` (19 pages)
- Cost-optimized architecture (db-f1-micro)
- Single instance with 2 databases (dev + prod)
- Detailed migration steps
- Risk management and rollback plans

### 2. Session Execution Plan
**File:** `SESSION-PLAN-POSTGRESQL-MIGRATION.md`
- Day-by-day execution plan
- Agent responsibilities (Main Claude Code vs. GCP SRE)
- Success criteria for each phase
- Commands and code snippets ready to use

### 3. Beads Tasks (6 tasks)
All tasks created with proper dependencies:

```
✅ READY → Task 36: Phase A - TypeScript fixes (start here)
   ⬇️
   Task 37: Phase B - Cloud SQL setup (GCP SRE agent)
   ⬇️
   Task 38: Phase C1 - Local testing
   ⬇️
   Task 39: Phase C2 - Deploy dev
   ⬇️
   Task 40: Phase C3 - Deploy prod
   ⬇️
   Task 41: Documentation updates
```

**Check status:** `bd ready` or `bd blocked`

---

## Cost Breakdown (Under Budget!)

| Item | Monthly Cost |
|------|--------------|
| Cloud SQL instance (db-f1-micro) | $7.67 |
| Storage (10 GB SSD) | $1.70 |
| Backups (7 days) | $0.80 |
| Network egress | $0.50 |
| **TOTAL** | **$10.67/month** ✅ |

**Your $300 credit lasts ~28 months at this rate!**

---

## The Plan (3 Phases)

### Phase A: Foundation Cleanup (Days 1-2)
**Agent:** Main Claude Code
**Task:** Fix critical TypeScript errors only
**Time:** 4-8 hours

### Phase B: Cloud SQL Setup (Days 3-4)
**Agent:** GCP SRE specialist
**Task:** Create db-f1-micro instance, 2 databases, billing alerts
**Time:** 4-6 hours

### Phase C: Migration & Deployment (Days 5-7)
**Agents:** Both (Main Claude Code + GCP SRE)
**Tasks:**
- C1: Local testing (Day 5)
- C2: Dev deployment (Day 6)
- C3: Prod deployment (Day 7)
**Time:** 12-16 hours

**Total estimated time:** ~20-30 hours over 7 days

---

## What This Fixes

### Current Problems (SQLite)
- ❌ Data inconsistency across instances
- ❌ Cannot scale horizontally (locked to max-instances=1)
- ❌ No remote database access
- ❌ Ephemeral storage in containers
- ❌ Not production-ready
- ❌ Blocking demo preparation

### After Migration (PostgreSQL)
- ✅ Consistent data across all instances
- ✅ Can scale to 5-10 instances during demos
- ✅ Query database via Cloud Console
- ✅ Persistent, reliable storage
- ✅ Production-grade setup
- ✅ Ready for impressive demos!

---

## How to Start

### Step 1: Confirm You're Ready
- [ ] Budget OK? (~$11/month)
- [ ] Timeline OK? (1 week)
- [ ] Shared dev/prod instance OK? (for cost savings)

### Step 2: Start Phase A
```bash
# Mark Phase A as in progress
bd update lobbyist-registration-36 --status in-progress

# Run TypeScript error check
npm run build

# (Main Claude Code agent will guide you through fixes)
```

### Step 3: Invoke GCP SRE Agent for Phase B
After Phase A completes, invoke the specialist:
```
I need to use the gcp-sre-specialist agent to create our Cloud SQL instance for the PostgreSQL migration.
```

### Step 4: Continue Through Phases
- Phase C1: Main Claude Code agent (local testing)
- Phase C2: Both agents (dev deployment)
- Phase C3: Both agents (prod deployment)
- Documentation: Main Claude Code agent

---

## Cost Monitoring

### Billing Alerts (Set up in Phase B)
- ⚠️ Warning at $15/month
- 🚨 Critical at $20/month

### Monthly Review
Check costs monthly in Google Cloud Console:
- Billing → Reports → Filter by "Cloud SQL"
- Should see ~$11/month consistently

---

## Rollback Plan (If Needed)

**If something goes wrong:**

```bash
# Quick rollback (5 minutes)
# Revert DATABASE_URL to SQLite in Cloud Run
# Redeploy previous revision

# Complete rollback (30 minutes)
# Delete Cloud SQL instance
# Revert schema.prisma
# Remove migration files
```

**No risk of data loss** - this is a demo environment with seed data.

---

## Architecture Change

### Before (Current)
```
Cloud Run Dev (max-instances=1, SQLite in container)
Cloud Run Prod (SQLite in container)
  ❌ Each container has own database
  ❌ Data inconsistency across instances
  ❌ Cannot scale
```

### After (Target)
```
Cloud Run Dev (max-instances=5) ──┐
                                   ├──> Cloud SQL (db-f1-micro)
Cloud Run Prod (max-instances=5) ──┘      ├── lobbyist_dev
                                           └── lobbyist_prod
  ✅ All containers share same database
  ✅ Consistent data
  ✅ Can scale horizontally
```

---

## Success Metrics

After migration, you should be able to:

1. **Demo Confidently**
   - Data appears consistently
   - Can refresh page 20 times, same data every time
   - Impressive to stakeholders

2. **Scale for Demos**
   - Set max-instances=5 or 10
   - Handle traffic spikes during presentations

3. **Debug Easily**
   - Query database from Cloud Console
   - Run SQL queries for troubleshooting
   - Export data for reports

4. **Stay Under Budget**
   - Monthly cost ~$11
   - $300 credit lasts ~28 months
   - No surprises

---

## Notes

### Context7 MCP
**Status:** Not currently working (API key issue)

**Impact:** None for this migration - we can use official docs via WebFetch

**To fix later:** Get API key from https://context7.com

### Documentation
Three comprehensive documents created:
1. **POSTGRESQL-MIGRATION-PLAN.md** - Full technical details
2. **SESSION-PLAN-POSTGRESQL-MIGRATION.md** - Execution guide
3. **This file** - Quick reference

---

## Ready to Start?

**First command:**
```bash
bd update lobbyist-registration-36 --status in-progress
```

Then tell me:
> "Start Phase A: TypeScript error inventory and fixes"

I'll guide you through each phase step by step!

---

## Questions?

Ask about:
- Cost concerns (can we go cheaper?)
- Timeline concerns (can we go faster?)
- Technical approach (why this architecture?)
- Risk management (what if it fails?)
- Agent coordination (how do agents work together?)

**I'm ready when you are!** 🚀

---

**Document Status:** ✅ Complete and ready
**Next Action:** Confirm budget/timeline, then start Phase A
**Estimated Completion:** October 29, 2025
