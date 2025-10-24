# Cloud Run Deployment Strategy

## Executive Summary

**Recommendation:** Use Cloud Build Triggers with manual approval for production deployments.

**Rationale:**
- Provides audit trail required for government systems
- Enables pre-deployment validation (tests, security scans)
- Allows controlled releases with rollback capability
- Aligns with civic technology best practices

---

## Deployment Architecture

### Development Environment
- **Service:** `lobbyist-registration-dev`
- **Trigger:** Automatic on push to `develop` branch
- **Approval:** None (continuous deployment)
- **Purpose:** Rapid iteration and feature testing
- **Database:** SQLite (ephemeral, resets on deploy)

### Production Environment
- **Service:** `lobbyist-registration`
- **Trigger:** Manual approval on push to `main` branch
- **Approval:** Required (you review and approve deployment)
- **Purpose:** Stable, auditable releases
- **Database:** Cloud SQL PostgreSQL (when migrated)

---

## Why NOT "Connect Repo" Direct Integration

The Cloud Run "Connect repo" feature is designed for simple applications, but lacks critical capabilities needed for government systems:

### Missing Capabilities
1. **No pre-deployment validation** - Cannot run tests, type checking, or security scans
2. **No approval gates** - Every push immediately deploys (dangerous for production)
3. **No database migration support** - Cannot run Prisma migrations before deployment
4. **Limited audit trail** - Harder to track who deployed what and when
5. **No rollback mechanism** - Difficult to revert to previous working version
6. **No environment-specific builds** - Same image for all environments

### Why This Matters for Civic Tech
- **Compliance:** Government systems require comprehensive audit trails
- **Accountability:** Need to prove who approved production changes
- **Reliability:** Cannot risk breaking the public transparency dashboard
- **Security:** Must scan dependencies before deploying to production
- **Data integrity:** Database migrations must complete before code deployment

---

## Recommended Approach: Cloud Build Triggers

### Architecture Diagram
```
GitHub Push → Cloud Build Trigger → Validation Steps → Build Image → Deploy
                                    ├─ Type check
                                    ├─ Security scan
                                    ├─ Run tests
                                    └─ [Approval gate for prod]
```

### Setup Steps

#### 1. Create Cloud Build Triggers

**Development Trigger (Auto-deploy):**
```bash
gcloud builds triggers create github \
  --name="deploy-lobbyist-registration-dev" \
  --repo-name="lobbyist-registration" \
  --repo-owner="ianaswanson" \
  --branch-pattern="^develop$" \
  --build-config="cloudbuild-dev.yaml" \
  --substitutions="_ENV=dev,_REGION=us-west1"
```

**Production Trigger (Manual approval):**
```bash
gcloud builds triggers create github \
  --name="deploy-lobbyist-registration-prod" \
  --repo-name="lobbyist-registration" \
  --repo-owner="ianaswanson" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-prod.yaml" \
  --require-approval \
  --substitutions="_ENV=prod,_REGION=us-west1"
```

#### 2. Create Environment-Specific Build Configs

See `cloudbuild-dev.yaml` and `cloudbuild-prod.yaml` for complete configurations.

#### 3. Configure GitHub Integration

1. Go to Cloud Console → Cloud Build → Triggers
2. Click "Connect Repository"
3. Select GitHub and authenticate
4. Choose `ianaswanson/lobbyist-registration`
5. Triggers will automatically appear

---

## Build Pipeline Stages

### Development Pipeline (Auto)
```yaml
1. Type Check (npm run type-check)
2. Security Scan (npm audit)
3. Build Docker Image
4. Push to Container Registry
5. Deploy to lobbyist-registration-dev
6. Tag image with commit SHA
```

### Production Pipeline (Manual Approval)
```yaml
1. Type Check (npm run type-check)
2. Run Tests (npm test) - when implemented
3. Security Scan (npm audit --audit-level=high)
4. Build Docker Image
5. Push to Container Registry
6. → APPROVAL GATE ← (You review and approve)
7. Run Database Migrations (Prisma migrate deploy)
8. Deploy to lobbyist-registration
9. Tag image with production timestamp
10. Verify health endpoints
```

---

## Workflow Examples

### Deploying a New Feature

**Development Flow:**
```bash
# 1. Work on feature branch
git checkout -b feature/new-reporting-field

# 2. Commit changes
git add .
git commit -m "Add new reporting field to expense form"

# 3. Merge to develop
git checkout develop
git merge feature/new-reporting-field
git push origin develop

# 4. Cloud Build automatically:
#    - Runs type checks
#    - Scans for security issues
#    - Builds container
#    - Deploys to lobbyist-registration-dev
#    - You receive notification when complete

# 5. Test on dev environment
open https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app

# 6. If good, merge to main for production
git checkout main
git merge develop
git push origin main

# 7. Cloud Build triggers production pipeline:
#    - Runs all validation steps
#    - Builds container
#    - PAUSES for your approval

# 8. Review build in Cloud Console:
#    - Check build logs
#    - Verify tests passed
#    - Review changed files
#    - Click "Approve Deployment"

# 9. Production deployment proceeds:
#    - Runs database migrations
#    - Deploys new version
#    - Tags with production timestamp
#    - Sends success notification
```

---

## Rollback Procedures

### Emergency Rollback (Production Broken)

**Option 1: Redeploy Previous Version**
```bash
# List recent production images
gcloud container images list-tags gcr.io/PROJECT_ID/lobbyist-registration

# Redeploy specific version
gcloud run deploy lobbyist-registration \
  --image gcr.io/PROJECT_ID/lobbyist-registration:production-20250115-143022 \
  --region us-west1
```

**Option 2: Git Revert + Redeploy**
```bash
# Revert the problematic commit
git revert HEAD
git push origin main

# Approve the rollback deployment in Cloud Build
```

### Database Migration Rollback
```bash
# SSH into Cloud SQL or use Cloud SQL Proxy
# Run Prisma migration rollback
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

---

## Audit Trail

Cloud Build provides comprehensive audit trails required for government systems:

### What Gets Logged
- **Who:** GitHub user who pushed the commit
- **What:** Exact code changes (commit SHA)
- **When:** Build start/end timestamps
- **Why:** Commit message and PR description
- **How:** Complete build logs showing every step
- **Result:** Success/failure with error details

### Accessing Audit Logs
```bash
# View build history
gcloud builds list --limit=50

# View specific build details
gcloud builds describe BUILD_ID

# Export audit logs for compliance
gcloud logging read "resource.type=build" \
  --format=json \
  --freshness=30d > audit-trail-$(date +%Y%m).json
```

---

## Cost Considerations

### Cloud Build Pricing
- **Free tier:** 120 build-minutes/day
- **Typical build time:** 3-5 minutes per deployment
- **Expected usage:** 2-3 dev deploys/day + 1-2 prod deploys/week
- **Estimated cost:** $0-10/month (well within free tier)

### Comparison
| Method | Monthly Cost | Setup Time | Audit Trail | Approval Gates |
|--------|--------------|------------|-------------|----------------|
| Manual deploy | $0 | 0 min | Partial | Yes |
| Connect Repo | $0 | 2 min | No | No |
| Cloud Build | $0-10 | 30 min | Yes | Yes |
| GitHub Actions | $0 | 45 min | Partial | Yes |

**Verdict:** Cloud Build provides the best value for government projects.

---

## Security Considerations

### Credentials Management
- **Service Accounts:** Cloud Build uses service accounts (no keys in GitHub)
- **Secret Manager:** Database credentials stored in Secret Manager
- **Least Privilege:** Build service account has minimal required permissions

### Required Permissions
```bash
# Cloud Build service account needs:
roles/run.admin          # Deploy to Cloud Run
roles/iam.serviceAccountUser  # Act as Cloud Run service account
roles/storage.admin      # Push to Container Registry
roles/secretmanager.secretAccessor  # Access database credentials
```

### Security Scanning
```yaml
# Included in build pipeline:
- npm audit --audit-level=high  # Dependency vulnerabilities
- Docker image scanning (automatic in GCR)
- [Future] OWASP ZAP security testing
- [Future] Accessibility scanning (Pa11y)
```

---

## Migration Plan from Manual Deployment

### Phase 1: Set Up Development Auto-Deploy (Week 1)
1. Create `cloudbuild-dev.yaml` configuration
2. Set up Cloud Build trigger for `develop` branch
3. Test with a non-critical change
4. Validate auto-deployment works correctly
5. Document process for team

### Phase 2: Set Up Production Manual Deploy (Week 2)
1. Create `cloudbuild-prod.yaml` with approval gate
2. Set up Cloud Build trigger for `main` branch with approval required
3. Test with a low-risk production deployment
4. Validate approval workflow
5. Create rollback runbook

### Phase 3: Add Database Migrations (Week 3)
1. Add Prisma migration step to production pipeline
2. Test migration + deployment workflow
3. Practice rollback scenarios
4. Document migration process

### Phase 4: Enhanced Validation (Future)
1. Add comprehensive test suite
2. Add accessibility scanning (Pa11y)
3. Add performance testing (Lighthouse CI)
4. Add security scanning (OWASP ZAP)

---

## Alternative Approaches Considered

### GitHub Actions
**Pros:**
- Familiar GitHub ecosystem
- Easy to version control workflows
- Good for multi-cloud deployments

**Cons:**
- Requires storing GCP credentials in GitHub Secrets
- Less audit trail visibility in GCP Console
- External dependency (GitHub Actions outage = no deployments)
- Harder to enforce organizational policies

**Verdict:** Acceptable for smaller projects, but Cloud Build is better for government systems.

### Cloud Run "Connect Repo"
**Pros:**
- Extremely simple setup (2 clicks)
- No configuration needed

**Cons:**
- No pre-deployment validation
- No approval gates
- No migration support
- Limited audit trail

**Verdict:** Not suitable for production government systems.

### Manual Deployment (Current)
**Pros:**
- Complete control
- No automation complexity
- Works for early prototyping

**Cons:**
- Slow and error-prone
- No automated testing
- Hard to maintain as team grows
- Doesn't scale

**Verdict:** Good for MVP phase, but needs automation for production.

---

## Success Metrics

### How to Know It's Working

**Development Environment:**
- Push to `develop` → Deployed in <10 minutes
- Build failures caught before deployment
- Zero manual intervention needed

**Production Environment:**
- Push to `main` → Approval notification received
- Reviewer can see complete change diff
- Deployment completes in <5 minutes after approval
- Zero production incidents from bad deployments

**Audit Trail:**
- Can answer "who deployed what and when" in <2 minutes
- Complete build logs available for 90 days
- Compliance reports generated automatically

---

## Next Steps

### Immediate (This Week)
1. Review and approve `cloudbuild-dev.yaml` and `cloudbuild-prod.yaml`
2. Set up Cloud Build triggers in GCP Console
3. Test development auto-deployment
4. Document rollback procedure

### Short-term (Next 2 Weeks)
1. Add comprehensive test suite
2. Test production manual approval workflow
3. Practice rollback scenarios
4. Add database migration steps

### Long-term (Before June 2026 Launch)
1. Add security scanning (OWASP ZAP)
2. Add accessibility testing (Pa11y)
3. Set up monitoring alerts for failed builds
4. Create deployment runbooks for county IT staff
5. Implement blue-green deployments for zero-downtime releases

---

## Questions?

**Q: What if Cloud Build is down?**
A: You can still deploy manually using `gcloud run deploy` commands. Cloud Build outages are rare (<0.1% downtime).

**Q: Can I still do manual deployments?**
A: Yes! Cloud Build triggers are additive. You can always deploy manually if needed.

**Q: What about database migrations?**
A: Production pipeline includes Prisma migration step before deployment. Migrations run automatically after approval.

**Q: How do I test the build pipeline without deploying?**
A: Use `gcloud builds submit --config=cloudbuild-dev.yaml` to test builds locally without triggering deployment.

**Q: What if I need to deploy a hotfix quickly?**
A: Create a hotfix branch, merge to main, approve the build. Total time: <10 minutes.

---

## Resources

- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Continuous Deployment](https://cloud.google.com/run/docs/continuous-deployment)
- [Prisma Migrations in Production](https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate)
- [Government Cloud Security Best Practices](https://cloud.google.com/security/compliance)

---

**Author:** Ian Swanson
**Project:** Multnomah County Lobbyist Registration System
**Last Updated:** 2025-10-21
**Status:** Recommended Strategy - Pending Implementation
