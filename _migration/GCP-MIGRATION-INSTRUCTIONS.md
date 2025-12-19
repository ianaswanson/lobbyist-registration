# GCP Account Migration Instructions

This document provides instructions for migrating the Lobbyist Registration system from project `lobbyist-475218` to a new GCP project.

---

## Current Infrastructure Summary

| Resource | Current Value |
|----------|---------------|
| **GCP Project ID** | `lobbyist-475218` |
| **Region** | `us-west1` |
| **Cloud SQL Instance** | `lobbyist-registration-db` |
| **Databases** | `lobbyist_dev`, `lobbyist_prod` |
| **DB User** | `lobbyist_user` |
| **Cloud Run Services** | `lobbyist-registration-dev`, `lobbyist-registration` |
| **Artifact Registry** | `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry` |
| **Secrets** | `lobbyist-db-url-dev`, `lobbyist-db-url` |
| **Monitoring** | GCP Cloud Error Reporting (native) |

**Note:** Sentry has been removed from this project. Error tracking uses GCP-native services.

---

## SECTION 1: Manual Steps (Human in GCP Console)

These steps require human interaction with GCP Console or involve sensitive operations.

### 1.1 Create New GCP Project

1. Go to [GCP Console](https://console.cloud.google.com)
2. Click **Select Project** > **New Project**
3. Enter project details:
   - **Project Name:** `lobbyist-registration` (or your preferred name)
   - **Organization:** Select your government organization
   - **Billing Account:** Link to government billing account
4. Note the **Project ID** (e.g., `lobbyist-registration-abc123`)

### 1.2 Enable Required APIs

In the new project, go to **APIs & Services > Library** and enable:

- Cloud Run API
- Cloud SQL Admin API
- Cloud Build API
- Artifact Registry API
- Secret Manager API
- Compute Engine API (required for Cloud SQL)
- Cloud Logging API
- Cloud Monitoring API
- **Cloud Error Reporting API** (for error tracking)

Or run via gcloud:
```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  clouderrorreporting.googleapis.com
```

### 1.3 Create Cloud SQL Instance

1. Go to **SQL** in GCP Console
2. Click **Create Instance** > **PostgreSQL**
3. Configure:
   - **Instance ID:** `lobbyist-registration-db`
   - **Password:** Generate and save securely
   - **Region:** `us-west1` (or preferred)
   - **Zone:** Any
   - **Database version:** PostgreSQL 15
   - **Edition:** Enterprise
   - **Preset:** Development (can upgrade later)
   - **Machine type:** Shared core, 1 vCPU, 1.7 GB
   - **Storage:** 10 GB SSD, enable auto-increase
4. Under **Connections:**
   - Enable **Private IP** if using VPC
   - Enable **Public IP** for Cloud Run access
   - Add authorized networks if needed
5. Click **Create Instance**
6. Once created, go to **Databases** tab and create:
   - `lobbyist_dev`
   - `lobbyist_prod`
7. Go to **Users** tab and create:
   - User: `lobbyist_user`
   - Password: Generate and save securely

### 1.4 Create Artifact Registry Repository

1. Go to **Artifact Registry**
2. Click **Create Repository**
3. Configure:
   - **Name:** `lobbyist-registry`
   - **Format:** Docker
   - **Mode:** Standard
   - **Location type:** Region
   - **Region:** `us-west1`
4. Click **Create**

### 1.5 Create Secrets in Secret Manager

1. Go to **Secret Manager**
2. Click **Create Secret** for each of the following:

| Secret Name | Value |
|-------------|-------|
| `lobbyist-db-url-dev` | `postgresql://lobbyist_user:PASSWORD@/lobbyist_dev?host=/cloudsql/PROJECT_ID:us-west1:lobbyist-registration-db` |
| `lobbyist-db-url` | `postgresql://lobbyist_user:PASSWORD@/lobbyist_prod?host=/cloudsql/PROJECT_ID:us-west1:lobbyist-registration-db` |

Replace `PASSWORD` with actual password and `PROJECT_ID` with new project ID.

**Note:** Sentry secrets are NOT needed - error tracking uses GCP-native Cloud Error Reporting.

### 1.6 Set Up Cloud Build Triggers

1. Go to **Cloud Build > Triggers**
2. Click **Connect Repository**
3. Select **GitHub** and authorize
4. Select your repository
5. Create two triggers:

**Trigger 1: Development (Auto-deploy)**
- **Name:** `deploy-dev`
- **Event:** Push to branch
- **Branch:** `^develop$`
- **Configuration:** Cloud Build configuration file
- **Location:** `/cloudbuild-dev.yaml`

**Trigger 2: Production (Manual approval)**
- **Name:** `deploy-prod`
- **Event:** Push to branch
- **Branch:** `^main$`
- **Configuration:** Cloud Build configuration file
- **Location:** `/cloudbuild-prod.yaml`
- **Approval:** Require approval before build executes

### 1.7 Configure IAM Permissions

1. Go to **IAM & Admin > IAM**
2. Find the Cloud Build service account: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`
3. Add these roles:
   - Cloud Run Admin
   - Service Account User
   - Secret Manager Secret Accessor
   - Cloud SQL Client
   - Artifact Registry Writer
   - Logs Writer

### 1.8 Set Up Cloud Monitoring Alerts (Replaces Sentry)

1. Go to **Monitoring > Alerting**
2. Click **Create Policy**
3. Create alerts for:

**Alert 1: Error Rate**
- **Condition:** Cloud Run - Request count (5xx errors) > 10 in 5 minutes
- **Notification:** Email to team

**Alert 2: High Latency**
- **Condition:** Cloud Run - Request latency p95 > 5 seconds
- **Notification:** Email to team

**Alert 3: Instance Health**
- **Condition:** Cloud Run - Instance count = 0 for 5 minutes (production)
- **Notification:** Email to team

### 1.9 Configure Error Reporting

1. Go to **Error Reporting**
2. Errors are automatically collected from Cloud Run
3. Configure notifications:
   - Click **Settings** (gear icon)
   - Enable email notifications for new errors
   - Add team email addresses

### 1.10 GitHub Repository Setup

In your **government GitHub organization**:

1. Fork or transfer the repository
2. Update repository secrets:
   - `GCP_PROJECT_ID`: Your new project ID
   - `GCP_SA_KEY`: Service account key JSON (or use Workload Identity Federation)
3. Remove `CODECOV_TOKEN` if not using Codecov

---

## SECTION 2: Gemini CLI / Automated Steps

These steps can be executed by Gemini CLI or an automated script.

### 2.1 Update Project Configuration Files

The following files contain hardcoded references to the old project ID (`lobbyist-475218`) and need to be updated:

#### File: `cloudbuild-dev.yaml`
```yaml
# Line 77-78 - Update Cloud SQL instance connection
# OLD: lobbyist-475218:us-west1:lobbyist-registration-db
# NEW: NEW_PROJECT_ID:us-west1:lobbyist-registration-db
```

#### File: `cloudbuild-prod.yaml`
```yaml
# Line 138-139 - Update Cloud SQL instance connection
# OLD: lobbyist-475218:us-west1:lobbyist-registration-db
# NEW: NEW_PROJECT_ID:us-west1:lobbyist-registration-db

# Line 141 - Update NEXTAUTH_URL if using custom domain
# Otherwise update with new Cloud Run generated URL after first deploy
```

### 2.2 Commands to Execute

Run these gcloud commands after the human completes Section 1:

```bash
# Set the new project
export NEW_PROJECT_ID="your-new-project-id"
export REGION="us-west1"

# Verify project access
gcloud config set project $NEW_PROJECT_ID
gcloud auth list

# Verify APIs are enabled
gcloud services list --enabled --filter="name:(run|sqladmin|cloudbuild|artifactregistry|secretmanager|clouderrorreporting)"

# Verify Cloud SQL instance exists
gcloud sql instances describe lobbyist-registration-db --format="value(name,state)"

# Verify Artifact Registry exists
gcloud artifacts repositories describe lobbyist-registry --location=$REGION

# Verify secrets exist
gcloud secrets list --filter="name:(lobbyist-db-url)"

# Grant Cloud Build service account permissions (if not done in console)
PROJECT_NUMBER=$(gcloud projects describe $NEW_PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $NEW_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $NEW_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $NEW_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $NEW_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.writer"

# Allow Cloud Build to act as compute service account
gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

### 2.3 Update Source Code Files

Search and replace the old project ID in these files:

```bash
# Find all references to old project ID
grep -r "lobbyist-475218" --include="*.yaml" --include="*.yml" --include="*.json" --include="*.md" .

# Files that need updating:
# - cloudbuild-dev.yaml (line 77-78)
# - cloudbuild-prod.yaml (lines 138-139, 141)
# - CLAUDE.md (documentation only)
# - Any deployment documentation
```

### 2.4 Specific File Edits Required

**cloudbuild-dev.yaml** - Lines to modify:
- Line 77-78: Change `lobbyist-475218:us-west1:lobbyist-registration-db` to `NEW_PROJECT_ID:us-west1:lobbyist-registration-db`

**cloudbuild-prod.yaml** - Lines to modify:
- Line 138-139: Change `lobbyist-475218:us-west1:lobbyist-registration-db` to `NEW_PROJECT_ID:us-west1:lobbyist-registration-db`
- Line 141: Update `NEXTAUTH_URL` after first deploy with new Cloud Run URL

### 2.5 Database Migration Script

Run after infrastructure is set up:

```bash
# Connect to new Cloud SQL via proxy
cloud-sql-proxy NEW_PROJECT_ID:us-west1:lobbyist-registration-db --port=5432

# In another terminal, run migrations
export DATABASE_URL="postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev"
npx prisma migrate deploy

# Seed database (dev only)
npm run db:seed
```

### 2.6 Deploy Application

```bash
# Trigger first deploy to dev
git checkout develop
git push origin develop

# After dev is verified, deploy to production
git checkout main
git merge develop
git push origin main
# Approve build in Cloud Build console
```

### 2.7 Verify Deployment

```bash
# Get service URLs
gcloud run services describe lobbyist-registration-dev --region=$REGION --format="value(status.url)"
gcloud run services describe lobbyist-registration --region=$REGION --format="value(status.url)"

# Test endpoints
curl -s "$(gcloud run services describe lobbyist-registration-dev --region=$REGION --format='value(status.url)')" | head -20

# Check Error Reporting for any deployment errors
gcloud beta error-reporting events list --limit=10
```

### 2.8 Verify Monitoring

```bash
# Check Cloud Run metrics
gcloud monitoring metrics list --filter="metric.type:run.googleapis.com"

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit=20

# Check Error Reporting
gcloud beta error-reporting groups list
```

---

## Post-Migration Checklist

### Immediate Verification
- [ ] Cloud SQL instance is running and accessible
- [ ] Secrets are created and accessible (only DATABASE_URL secrets needed)
- [ ] Artifact Registry repository exists
- [ ] Cloud Build triggers are configured
- [ ] Dev deployment succeeds
- [ ] Dev application is accessible and functional
- [ ] Production deployment succeeds
- [ ] Production application is accessible and functional
- [ ] Cloud Error Reporting is capturing errors
- [ ] Cloud Monitoring alerts are configured

### Configuration Updates
- [ ] `cloudbuild-dev.yaml` updated with new project ID
- [ ] `cloudbuild-prod.yaml` updated with new project ID
- [ ] `NEXTAUTH_URL` updated in cloudbuild-prod.yaml after first deploy
- [ ] `CLAUDE.md` documentation updated
- [ ] GitHub repository secrets updated

### Data Migration (if applicable)
- [ ] Database exported from old project
- [ ] Database imported to new project
- [ ] Data integrity verified

### Cleanup (after verification)
- [ ] Old Cloud Run services deleted
- [ ] Old Cloud SQL instance deleted (after backup)
- [ ] Old secrets deleted
- [ ] Old Artifact Registry cleaned up
- [ ] Old project billing disabled/deleted

---

## Rollback Plan

If migration fails:
1. Keep old project running until new is verified
2. Point DNS/traffic back to old Cloud Run URLs
3. Investigate and fix issues in new project
4. Re-attempt migration

---

## Environment Variables Reference

| Variable | Dev Value | Prod Value |
|----------|-----------|------------|
| `DATABASE_URL` | Secret: `lobbyist-db-url-dev` | Secret: `lobbyist-db-url` |
| `NODE_ENV` | `production` | `production` |
| `ENVIRONMENT` | `development` | `production` |
| `NEXTAUTH_URL` | (Cloud Run URL) | (Cloud Run URL or custom domain) |

**Note:** No Sentry environment variables are needed. Error tracking uses GCP Cloud Error Reporting which requires no additional configuration.

---

## Monitoring Setup (Replaces Sentry)

### Error Tracking
- **Service:** Cloud Error Reporting
- **Access:** GCP Console > Error Reporting
- **Features:**
  - Automatic error grouping
  - Stack traces
  - Error frequency trends
  - Email notifications for new errors

### Application Logs
- **Service:** Cloud Logging
- **Access:** GCP Console > Logging > Logs Explorer
- **Query:** `resource.type="cloud_run_revision"`

### Performance Metrics
- **Service:** Cloud Monitoring
- **Access:** GCP Console > Monitoring > Metrics Explorer
- **Key Metrics:**
  - `run.googleapis.com/request_count`
  - `run.googleapis.com/request_latencies`
  - `run.googleapis.com/container/instance_count`

### Recommended Dashboards
Create a Cloud Monitoring dashboard with:
1. Request count (by response code)
2. Request latency (p50, p95, p99)
3. Instance count
4. Error count from Error Reporting

---

## Support Contacts

- **GCP Support:** If using government cloud, contact your GCP account team
- **GitHub:** Repository settings for Actions/Secrets configuration
