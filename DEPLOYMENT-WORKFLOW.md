# Deployment Workflow Quick Reference

## TL;DR
```bash
# Development deployment (automatic)
git push origin develop
→ Auto-deploys to lobbyist-registration-dev in ~5 minutes

# Production deployment (manual approval)
git push origin main
→ Waits for your approval in Cloud Build console
→ You review and click "Approve"
→ Deploys to lobbyist-registration in ~5 minutes
```

---

## First-Time Setup

### 1. Connect GitHub Repository to Cloud Build
```bash
# Open Cloud Build console
https://console.cloud.google.com/cloud-build/triggers

# Click "Connect Repository" → "GitHub (Cloud Build GitHub App)"
# Authenticate and select: ianaswanson/lobbyist-registration
```

### 2. Run Setup Script
```bash
cd /Users/ianswanson/ai-dev/lobbyist-registration
./setup-cloud-build-triggers.sh
```

This creates two triggers:
- `deploy-lobbyist-dev` - Auto-deploy on push to `develop`
- `deploy-lobbyist-prod` - Manual approval on push to `main`

---

## Development Deployment Workflow

### Typical Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-expense-field
git push origin feature/new-expense-field

# 2. Work on feature and commit
git add .
git commit -m "Add new expense category field"
git push origin feature/new-expense-field

# 3. Merge to develop (triggers auto-deploy)
git checkout develop
git merge feature/new-expense-field
git push origin develop

# 4. Watch deployment in Cloud Build
https://console.cloud.google.com/cloud-build/builds

# 5. Verify on dev environment
https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
```

### What Happens Automatically
1. Cloud Build detects push to `develop` branch
2. Runs type checking (`npm run build`)
3. Runs security scan (`npm audit`)
4. Builds Docker image
5. Pushes to Container Registry
6. Deploys to `lobbyist-registration-dev`
7. Sends notification when complete

**Total time:** ~5 minutes

---

## Production Deployment Workflow

### Promoting to Production
```bash
# 1. Ensure develop is working correctly
https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app

# 2. Merge develop to main
git checkout main
git merge develop
git push origin main

# 3. Cloud Build starts production pipeline
# → Notification sent: "Build waiting for approval"

# 4. Review build in Cloud Build console
https://console.cloud.google.com/cloud-build/builds

# Click on latest build to see:
# - Git commit being deployed
# - Build logs (type check, security scan)
# - Changed files

# 5. Approve deployment
# Click "Approve" button in Cloud Build UI

# 6. Deployment proceeds automatically:
# - Builds production Docker image
# - Deploys to lobbyist-registration (no traffic)
# - Runs health check on new revision
# - Routes 100% traffic to new revision
# - Sends success notification

# 7. Verify production
https://lobbyist-registration-zzp44w3snq-uw.a.run.app
```

### What Happens in Production Pipeline
1. **Validation** (before approval):
   - Type checking (strict)
   - Security audit (high severity fails build)
   - Prisma schema validation
   - Docker image build

2. **MANUAL APPROVAL** (you review and approve)

3. **Deployment** (after approval):
   - Push image to Container Registry
   - Tag with production timestamp
   - Deploy new revision (no traffic)
   - Health check new revision
   - Route 100% traffic to new revision
   - Verify deployment

**Total time:** ~10 minutes (including approval wait)

---

## Emergency Rollback

### If Production Deployment Breaks

**Option 1: Rollback via Cloud Console**
```bash
# 1. Go to Cloud Run service
https://console.cloud.google.com/run/detail/us-west1/lobbyist-registration

# 2. Click "Revisions" tab
# 3. Find previous working revision
# 4. Click "Manage Traffic"
# 5. Route 100% traffic to previous revision
```

**Option 2: Rollback via Command Line**
```bash
# List recent revisions
gcloud run revisions list \
  --service=lobbyist-registration \
  --region=us-west1 \
  --limit=5

# Rollback to specific revision
gcloud run services update-traffic lobbyist-registration \
  --region=us-west1 \
  --to-revisions=lobbyist-registration-00123-abc=100
```

**Option 3: Git Revert + Redeploy**
```bash
# Revert the bad commit
git revert HEAD
git push origin main

# Approve the rollback deployment in Cloud Build
# (Usually faster than manual traffic routing)
```

---

## Monitoring Deployments

### Watch Build Progress
```bash
# List recent builds
gcloud builds list --limit=10

# View specific build
gcloud builds describe BUILD_ID

# Stream build logs
gcloud builds log BUILD_ID --stream
```

### Check Deployment Status
```bash
# Check Cloud Run service status
gcloud run services describe lobbyist-registration \
  --region=us-west1 \
  --format=yaml

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" \
  --limit=50 \
  --format=json
```

### View Deployment History
```bash
# List all revisions
gcloud run revisions list \
  --service=lobbyist-registration \
  --region=us-west1

# View revision details
gcloud run revisions describe REVISION_NAME \
  --region=us-west1
```

---

## Common Scenarios

### Scenario: Hotfix for Production Bug

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/fix-critical-bug

# 2. Fix the bug
# ... edit files ...
git add .
git commit -m "Fix: Critical bug in expense reporting"

# 3. Merge to main
git checkout main
git merge hotfix/fix-critical-bug
git push origin main

# 4. Approve deployment immediately in Cloud Build
# (Total time to production: ~10 minutes)

# 5. Also merge to develop to keep branches in sync
git checkout develop
git merge hotfix/fix-critical-bug
git push origin develop
```

### Scenario: Database Migration + Code Deployment

```bash
# 1. Create migration locally
npm run prisma:migrate dev --name add_new_field

# 2. Commit migration files
git add prisma/migrations/
git commit -m "Migration: Add new field to expense table"

# 3. Deploy to development
git push origin develop
# → Auto-deploys with new migration

# 4. Test migration in dev
# Verify schema changes worked correctly

# 5. Deploy to production
git push origin main
# → Review migration in Cloud Build console before approving
# → Approve deployment
# → Migration runs automatically before deployment

# Note: Production pipeline will include Prisma migration step
# when we migrate from SQLite to Cloud SQL
```

### Scenario: Testing Before Merging to Main

```bash
# 1. Push to develop first
git push origin develop
# → Auto-deploys to dev environment

# 2. Test thoroughly on dev
https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app

# 3. If good, promote to production
git checkout main
git merge develop
git push origin main

# 4. Approve deployment
```

### Scenario: Canceling a Deployment

```bash
# If you pushed to main by mistake:

# 1. Cancel build in Cloud Build console
https://console.cloud.google.com/cloud-build/builds
# Click on running build → "Cancel"

# OR via command line:
gcloud builds cancel BUILD_ID

# 2. Revert the commit if needed
git revert HEAD
git push origin main
```

---

## Notifications

### Email Notifications
Cloud Build sends notifications for:
- Build started
- Build waiting for approval (production only)
- Build succeeded
- Build failed

### Slack Notifications (Future Enhancement)
```bash
# Can be configured in Cloud Build settings:
# https://console.cloud.google.com/cloud-build/settings/notifications
```

---

## Troubleshooting

### Build Fails on Type Check
```bash
# Error: TypeScript compilation errors

# Fix locally:
npm run build
# Fix any TypeScript errors
git add .
git commit -m "Fix: TypeScript errors"
git push origin develop
```

### Build Fails on Security Audit
```bash
# Error: High severity vulnerabilities found

# Check vulnerabilities:
npm audit

# Fix vulnerabilities:
npm audit fix

# If can't auto-fix, update manually:
npm update package-name

# Commit fixes:
git add package*.json
git commit -m "Fix: Update dependencies to resolve security vulnerabilities"
git push origin develop
```

### Deployment Succeeds But Service Doesn't Start
```bash
# Check Cloud Run logs:
gcloud logging read "resource.type=cloud_run_revision" \
  --limit=100 \
  --format=json

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port configuration wrong (Cloud Run uses PORT env var)
```

### Approval Timeout (Production)
```bash
# Production builds wait for approval for up to 1 hour
# If you don't approve within 1 hour, build times out

# To redeploy:
# 1. Push an empty commit to main
git commit --allow-empty -m "Redeploy: Re-trigger production build"
git push origin main

# 2. Approve immediately this time
```

---

## Best Practices

### Commit Messages
Use conventional commit format for clarity in approval reviews:
```
feat: Add new expense category field
fix: Correct calculation in quarterly report
docs: Update deployment documentation
chore: Update dependencies
refactor: Simplify expense report validation
```

### Branch Strategy
```
main (production)
  ← develop (development environment)
      ← feature/* (individual features)
      ← hotfix/* (urgent fixes)
```

### Before Approving Production Deployment
Review checklist:
- [ ] All validation steps passed (type check, security scan)
- [ ] Reviewed git diff to understand changes
- [ ] Verified on development environment first
- [ ] Database migrations are safe (if any)
- [ ] No sensitive data in code or logs
- [ ] Commit message clearly describes changes

### After Production Deployment
Verification checklist:
- [ ] Service responds at production URL
- [ ] Check Cloud Run logs for errors
- [ ] Test critical user workflows (registration, reporting)
- [ ] Verify database integrity (no data loss)
- [ ] Monitor for 15 minutes for unexpected errors

---

## Additional Resources

- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Deployment Strategy (full details)](./DEPLOYMENT-STRATEGY.md)
- [Production Status](./PRODUCTION-STATUS.md)

---

**Quick Links:**
- [Cloud Build Console](https://console.cloud.google.com/cloud-build/builds)
- [Cloud Run Services](https://console.cloud.google.com/run)
- [Container Registry](https://console.cloud.google.com/gcr/images)
- [Production Service](https://lobbyist-registration-zzp44w3snq-uw.a.run.app)
- [Development Service](https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app)

---

**Last Updated:** 2025-10-21
**Author:** Ian Swanson
