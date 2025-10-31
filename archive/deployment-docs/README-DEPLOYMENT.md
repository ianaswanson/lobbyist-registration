# Cloud Run Deployment Guide

## Quick Answer

**Should you use Cloud Run's "Connect Repo" feature?**

❌ **No** - Use Cloud Build Triggers instead

**Why?** Connect Repo lacks approval gates, audit trails, and validation - critical for government systems.

---

## Your New Deployment Workflow

### Development (Automatic)
```
Push to 'develop' → Auto-deploys to dev in 5 min
```

### Production (Manual Approval)
```
Push to 'main' → You review & approve → Deploys to prod in 5 min
```

---

## Setup (30 minutes)

```bash
# 1. Connect GitHub to Cloud Build (once)
https://console.cloud.google.com/cloud-build/triggers
# → Click "Connect Repository"
# → Select: ianaswanson/lobbyist-registration

# 2. Run setup script
cd /Users/ianswanson/ai-dev/lobbyist-registration
./setup-cloud-build-triggers.sh

# 3. Test it
git checkout develop
git commit --allow-empty -m "test: Trigger deployment"
git push origin develop

# 4. Watch deployment
https://console.cloud.google.com/cloud-build/builds
```

---

## What You Get

✅ **Automatic testing** - Type checking & security scans before every deployment
✅ **Approval gates** - Manual review required for production
✅ **Audit trail** - Complete logs of who deployed what and when
✅ **Easy rollback** - One command to revert to previous version
✅ **Zero cost** - Within Cloud Build free tier ($0-10/month)
✅ **Government compliant** - Meets audit and accountability requirements

---

## Files Created

| File | Purpose | Size |
|------|---------|------|
| `cloudbuild-dev.yaml` | Dev deployment pipeline | 3.4KB |
| `cloudbuild-prod.yaml` | Prod deployment pipeline (with approval) | 7.8KB |
| `setup-cloud-build-triggers.sh` | Automated setup script | 4.9KB |
| `DEPLOYMENT-RECOMMENDATION.md` | **Start here** - Complete recommendation | 18KB |
| `DEPLOYMENT-WORKFLOW.md` | Daily operations quick reference | 10KB |
| `DEPLOYMENT-STRATEGY.md` | Detailed strategy & rollback procedures | 13KB |
| `DEPLOYMENT-OPTIONS-COMPARISON.md` | Compare all deployment methods | 13KB |

---

## Read This First

Start with **`DEPLOYMENT-RECOMMENDATION.md`** for the complete analysis and recommendation.

Then reference **`DEPLOYMENT-WORKFLOW.md`** for daily operations.

---

## Common Operations

### Deploy New Feature
```bash
# Work on feature
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: Add new feature"

# Deploy to dev (automatic)
git checkout develop
git merge feature/my-feature
git push origin develop
# → Auto-deploys in ~5 min

# Test it
https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app

# Deploy to production (manual approval)
git checkout main
git merge develop
git push origin main
# → Go to Cloud Build console
# → Review changes
# → Click "Approve"
# → Deploys in ~5 min
```

### Rollback Production
```bash
# List recent revisions
gcloud run revisions list \
  --service=lobbyist-registration \
  --region=us-west1

# Rollback to previous revision
gcloud run services update-traffic lobbyist-registration \
  --region=us-west1 \
  --to-revisions=PREVIOUS_REVISION=100
```

---

## Why Cloud Build > Connect Repo

| Feature | Connect Repo | Cloud Build |
|---------|--------------|-------------|
| Setup time | 2 min | 30 min |
| Pre-deployment tests | ❌ No | ✅ Yes |
| Approval gates | ❌ No | ✅ Yes |
| Audit trail | ⚠️ Limited | ✅ Complete |
| Database migrations | ❌ No | ✅ Yes |
| Rollback | ⚠️ Hard | ✅ Easy |
| Government compliance | ❌ No | ✅ Yes |

**Winner:** Cloud Build (best for government/civic tech)

---

## Cost

**Expected:** $0/month (within free tier)
**Maximum:** $10/month (unlikely)

Cloud Build includes 120 build-minutes/day free.
Your usage: ~500 build-minutes/month (well within free tier).

---

## Questions?

See **`DEPLOYMENT-RECOMMENDATION.md`** for detailed Q&A section.

---

**Status:** ✅ Ready to implement
**Time to setup:** 30 minutes
**Time savings:** 2+ hours/month
**Risk:** Very low (can fallback to manual anytime)

**Next step:** Read `DEPLOYMENT-RECOMMENDATION.md` then run `setup-cloud-build-triggers.sh`
