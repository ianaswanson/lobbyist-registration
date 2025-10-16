# Cloud Run Deployment Troubleshooting Guide

This guide documents common deployment issues and their solutions for the Lobbyist Registration System on Google Cloud Run.

---

## Table of Contents
1. [Repository Format Errors](#repository-format-errors)
2. [Database Not Persisting](#database-not-persisting)
3. [Authentication Failures](#authentication-failures)
4. [Memory and Resource Issues](#memory-and-resource-issues)
5. [Build Failures](#build-failures)
6. [Runtime Errors](#runtime-errors)

---

## Repository Format Errors

### Symptom
```
ERROR: Invalid repository name: gcr.io/lobbyist-registration-679888289147/lobbyist-registration
ERROR: retry budget exhausted (10 attempts)
```

### Root Cause
Using legacy Container Registry (gcr.io) format with project NUMBER instead of project ID, or mixing GCR with Artifact Registry.

### Solution
Always use Artifact Registry format with your project ID:

**Correct Format:**
```bash
us-west1-docker.pkg.dev/PROJECT_ID/REPOSITORY_NAME/IMAGE_NAME
```

**Example:**
```bash
us-west1-docker.pkg.dev/lobbyist-475218/cloud-run-source-deploy/lobbyist-registration
```

**Update deploy.sh:**
```bash
# OLD (wrong)
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# NEW (correct)
gcloud builds submit --tag us-west1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$SERVICE_NAME
```

### Verification
```bash
# List your Artifact Registry repositories
gcloud artifacts repositories list --project=PROJECT_ID --location=us-west1

# List images in repository
gcloud artifacts docker images list us-west1-docker.pkg.dev/PROJECT_ID/REPOSITORY_NAME
```

---

## Database Not Persisting

### Symptom
- Authentication fails with "Invalid credentials"
- No users exist in production
- Database appears empty even after seeding
- Local development works fine

### Root Cause #1: Relative Path Creates Nested Directories
**Issue:** Using `DATABASE_URL="file:./prisma/dev.db"` creates `/app/prisma/prisma/dev.db` (nested!)

**Solution:** Use absolute paths
```dockerfile
ENV DATABASE_URL="file:/app/prisma/dev.db"
```

### Root Cause #2: .dockerignore Blocking Database File
**Issue:** `.dockerignore` contains `prisma/dev.db`, preventing seeded database from being copied to production image

**Solution:** Comment out the ignore rule in `.dockerignore`:
```
# DO NOT ignore dev.db - we need it baked into container for demo
# prisma/dev.db
```

### Root Cause #3: Missing DATABASE_URL During Build
**Issue:** Prisma migrations fail during `docker build` without DATABASE_URL environment variable

**Solution:** Set DATABASE_URL in builder stage before running migrations:
```dockerfile
# In builder stage (before migrations)
ENV DATABASE_URL="file:/app/prisma/dev.db"
RUN npx prisma migrate deploy
RUN npm run db:seed
```

### Root Cause #4: Database Not Copied Correctly
**Issue:** Using `COPY --from=builder /app/prisma ./prisma` copies directory structure but not the generated database

**Solution:** Explicitly copy the database file AFTER copying schema and migrations:
```dockerfile
# Copy schema and migrations first
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/prisma/migrations ./prisma/migrations

# THEN explicitly copy the seeded database
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db
```

### Verification Steps
1. **During Build:** Add verification step in Dockerfile:
   ```dockerfile
   RUN ls -lh /app/prisma/dev.db
   ```

2. **Find Database Location:**
   ```dockerfile
   RUN find /app -name "dev.db" -type f -exec ls -lh {} \;
   ```

3. **Check in Running Container:**
   ```bash
   # Get revision name
   gcloud run revisions list --service=lobbyist-registration --region=us-west1

   # Check logs for database path
   gcloud run services logs read lobbyist-registration --region=us-west1 | grep -i database
   ```

---

## Authentication Failures

### Symptom
- "Invalid credentials" error even with correct password
- "No user found" errors
- NextAuth session errors

### Troubleshooting Steps

#### 1. Check NEXTAUTH_URL is Set Correctly
```bash
gcloud run services describe lobbyist-registration --region=us-west1 --format="value(spec.template.spec.containers[0].env)"
```

Should show:
```
NEXTAUTH_URL=https://lobbyist-registration-679888289147.us-west1.run.app
```

**Fix if wrong:**
```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --set-env-vars NEXTAUTH_URL="https://YOUR-ACTUAL-URL.run.app"
```

#### 2. Verify Database Contains Users
Check build logs to confirm seeding completed:
```bash
gcloud builds log BUILD_ID | grep "TEST ACCOUNTS CREATED"
```

Should show 6 users created (admin, 2 lobbyists, employer, board member, public).

#### 3. Check DATABASE_URL Points to Correct File
```bash
gcloud run services describe lobbyist-registration --region=us-west1 --format="value(spec.template.spec.containers[0].env)" | grep DATABASE_URL
```

Should be:
```
DATABASE_URL=file:/app/prisma/dev.db
```

NOT:
- `file:./prisma/dev.db` (relative path - wrong)
- `file:./prisma/prod.db` (wrong filename)

---

## Memory and Resource Issues

### Symptom
- Service crashes with OOM (Out of Memory)
- Cold starts timeout
- "Service Unavailable" errors

### Solutions

#### Increase Memory Allocation
```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --memory=1Gi
```

#### Adjust Startup Probe Timeout
```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --startup-cpu-boost
```

#### Check Current Resource Limits
```bash
gcloud run services describe lobbyist-registration \
  --region=us-west1 \
  --format="value(spec.template.spec.containers[0].resources.limits)"
```

---

## Build Failures

### Missing Dependencies
**Symptom:** `npm ci` fails or modules not found

**Solution:** Ensure `package-lock.json` is committed:
```bash
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Prisma Schema Validation Errors
**Symptom:** `Environment variable not found: DATABASE_URL`

**Solution:** Set DATABASE_URL in builder stage (see Database section above)

### Build Timeout
**Symptom:** Build fails after 10-15 minutes

**Solution:** Increase Cloud Build timeout:
```bash
gcloud builds submit --timeout=20m \
  --tag us-west1-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE
```

---

## Runtime Errors

### Container Won't Start
**Check logs:**
```bash
gcloud run services logs read lobbyist-registration --region=us-west1 --limit=50
```

**Common issues:**
- Missing `CMD` in Dockerfile
- Wrong port (must be 8080)
- Missing required environment variables

### NextAuth Configuration Errors
**Symptom:** "UntrustedHost" error

**Fix:** Ensure NEXTAUTH_URL matches your Cloud Run URL exactly (including https://)

### Database Permission Errors
**Symptom:** "EACCES: permission denied" or "EROFS: read-only file system"

**Issue:** Cloud Run filesystem is read-only except /tmp

**Solution:** For demo apps with baked database (like ours), this should work. For production, migrate to Cloud SQL.

---

## Deployment Checklist

Before deploying, verify:

- [ ] `.dockerignore` allows `prisma/dev.db` to be copied
- [ ] Dockerfile uses absolute path: `DATABASE_URL="file:/app/prisma/dev.db"`
- [ ] Dockerfile sets DATABASE_URL in builder stage before migrations
- [ ] Dockerfile explicitly copies dev.db in runner stage
- [ ] deploy.sh uses Artifact Registry format (not gcr.io)
- [ ] deploy.sh sets memory to 1Gi
- [ ] NEXTAUTH_URL environment variable set to correct Cloud Run URL
- [ ] AUTH_SECRET configured in Secret Manager

---

## Quick Diagnostic Commands

```bash
# View recent deployments
gcloud run revisions list --service=lobbyist-registration --region=us-west1

# Check current environment variables
gcloud run services describe lobbyist-registration --region=us-west1 \
  --format="value(spec.template.spec.containers[0].env)"

# Tail live logs
gcloud run services logs tail lobbyist-registration --region=us-west1

# View build history
gcloud builds list --project=PROJECT_ID --region=us-west1 --limit=5

# Get service URL
gcloud run services describe lobbyist-registration --region=us-west1 \
  --format='value(status.url)'

# Test service health
curl -I https://YOUR-SERVICE-URL.run.app
```

---

## Successful Deployment Indicators

When deployment succeeds, you should see:

1. **Build Output:**
   ```
   Successfully built [IMAGE_ID]
   Successfully tagged us-west1-docker.pkg.dev/...
   PUSH
   DONE
   ```

2. **Deployment Output:**
   ```
   Deploying container to Cloud Run service...
   ✓ Deploying... Done.
   Service URL: https://lobbyist-registration-679888289147.us-west1.run.app
   ```

3. **Health Check:**
   ```bash
   curl -I https://YOUR-URL.run.app
   # Should return: HTTP/2 200
   ```

4. **Authentication Test:**
   - Visit: `https://YOUR-URL.run.app/auth/signin`
   - Login with: `admin@multnomah.gov` / `admin123`
   - Should redirect to dashboard

---

## When to Contact Support

Escalate to GCP Support if:
- Quota errors persist after increasing limits
- Billing anomalies or unexpected charges
- Regional outages affecting service
- Persistent build failures across multiple projects
- Security incidents or potential breaches

**Support Request Template:**
```
Subject: Cloud Run Deployment Issue - Lobbyist Registration System

Project ID: lobbyist-475218
Service Name: lobbyist-registration
Region: us-west1
Build ID: [from gcloud builds list]
Revision: [from gcloud run revisions list]

Issue Description:
[Describe the problem]

Steps Taken:
1. [What you tried]
2. [What you tried]

Logs:
[Paste relevant logs]

Expected Behavior:
[What should happen]
```

---

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Project DEPLOYMENT-PLAN.md](./DEPLOYMENT-PLAN.md)
- [Project QUICKSTART-DEPLOY.md](./QUICKSTART-DEPLOY.md)

---

## Document Version
- **Last Updated:** 2025-10-16
- **Deployment:** Google Cloud Run
- **Database Strategy:** Baked SQLite (demo/prototype)
- **Next Update:** After migration to Cloud SQL (Phase 2)
