# Infrastructure as Code - Terraform Guide

This document explains the Infrastructure as Code (IaC) setup for the Lobbyist Registration System using Terraform.

## 📋 Table of Contents

- [Overview](#overview)
- [Why Infrastructure as Code?](#why-infrastructure-as-code)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Deploying Dev Environment](#deploying-dev-environment)
- [Deploying Production Environment](#deploying-production-environment)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)

## Overview

We use **Terraform** to manage all GCP infrastructure:
- ✅ Cloud Run services
- ✅ Cloud SQL PostgreSQL databases
- ✅ Secret Manager secrets
- ✅ IAM service accounts and permissions
- ✅ API enablement

**Benefits:**
- Version-controlled infrastructure changes
- Reproducible deployments
- Environment parity (dev/prod)
- Audit trail via git history
- Disaster recovery capability

## Why Infrastructure as Code?

### Before IaC (Manual Deployment)
```bash
# Manual, error-prone, not reproducible
gcloud run deploy lobbyist-registration \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

**Problems:**
- ❌ Configuration not version controlled
- ❌ No way to review infrastructure changes
- ❌ Hard to replicate environments
- ❌ Manual process prone to errors
- ❌ No audit trail

### With IaC (Terraform)
```bash
# Declarative, version-controlled, reproducible
cd terraform/environments/dev
terraform plan    # Review changes
terraform apply   # Apply changes
```

**Benefits:**
- ✅ Infrastructure defined in code (version controlled)
- ✅ Review changes before applying (terraform plan)
- ✅ Consistent environments (dev matches prod)
- ✅ Automated deployments
- ✅ Complete audit trail in git

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Google Cloud Platform                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐                 ┌──────────────┐      │
│  │  Cloud Run   │────Cloud SQL────│ PostgreSQL   │      │
│  │  (App)       │    Connection   │  Database    │      │
│  └──────────────┘                 └──────────────┘      │
│         │                                  │             │
│         │ reads secrets                    │             │
│         ▼                                  │             │
│  ┌──────────────────────────────────────┐ │             │
│  │      Secret Manager                  │ │             │
│  │  - DATABASE_URL                      │◀┘             │
│  │  - NEXTAUTH_SECRET                   │               │
│  │  - Database password                 │               │
│  └──────────────────────────────────────┘               │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Terraform State (GCS Bucket)                      │ │
│  │  - Versioned                                       │ │
│  │  - Encrypted                                       │ │
│  │  - Locked                                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

1. **Install Terraform**
   ```bash
   brew install terraform
   ```

2. **Authenticate with GCP**
   ```bash
   gcloud auth application-default login
   gcloud config set project lobbyist-475218
   ```

3. **Verify access**
   ```bash
   gcloud projects describe lobbyist-475218
   ```

### Initialize Terraform

Run the initialization script to create the GCS state bucket:

```bash
cd terraform/scripts
./init-terraform.sh
```

This script:
- Creates GCS bucket for Terraform state
- Enables versioning (for rollback)
- Sets lifecycle policy (keeps 10 versions)
- Creates example tfvars files

## Deploying Dev Environment

### Step 1: Navigate to dev environment

```bash
cd terraform/environments/dev
```

### Step 2: Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` if needed (defaults should work):
```hcl
project_id      = "lobbyist-475218"
project_number  = "679888289147"
region          = "us-west1"
container_image = "us-docker.pkg.dev/cloudrun/container/hello"  # Placeholder
```

### Step 3: Initialize Terraform

```bash
terraform init
```

This downloads providers and configures the GCS backend.

### Step 4: Review the plan

```bash
terraform plan
```

Review what will be created:
- Cloud SQL PostgreSQL instance (db-f1-micro)
- Cloud Run service (placeholder image)
- Secret Manager secrets
- IAM service accounts and permissions

### Step 5: Apply the configuration

```bash
terraform apply
```

Type `yes` when prompted.

**This will:**
- Create Cloud SQL instance (~5-10 minutes)
- Create Cloud Run service
- Generate and store secrets
- Configure IAM permissions

### Step 6: Build and deploy your application

```bash
# Build container image
cd ../../..  # Back to project root
gcloud builds submit --tag gcr.io/lobbyist-475218/lobbyist-registration-dev

# Update Terraform with new image
cd terraform/environments/dev
terraform apply -var="container_image=gcr.io/lobbyist-475218/lobbyist-registration-dev:latest"
```

### Step 7: Run database migrations

```bash
# Get DATABASE_URL from Secret Manager
export DATABASE_URL=$(gcloud secrets versions access latest --secret="lobbyist-db-dev-url")

# Run Prisma migrations
cd ../../..  # Back to project root
npx prisma migrate deploy
```

### Step 8: Seed the database

```bash
# Get the service URL
DEV_URL=$(cd terraform/environments/dev && terraform output -raw service_url)

# Seed the database
curl -X POST $DEV_URL/api/admin/seed
```

### Step 9: Test your dev environment

```bash
# Get the URL
terraform output service_url

# Visit in browser or curl
curl $(terraform output -raw service_url)
```

## Deploying Production Environment

### Key Differences

Production environment has:
- Larger database tier (db-g1-small)
- Deletion protection enabled
- Point-in-time recovery enabled
- More retained backups
- Separate service name and secrets

### Steps

1. **Create production configuration**
   ```bash
   cd terraform/environments/prod
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Update variables for production**
   ```hcl
   service_name            = "lobbyist-registration"  # Production name
   database_instance_name  = "lobbyist-db"
   database_tier           = "db-g1-small"  # Larger tier
   container_image         = "gcr.io/lobbyist-475218/lobbyist-registration:latest"
   ```

3. **Import existing production Cloud Run service** (if it exists)
   ```bash
   terraform import module.app.google_cloud_run_service.app \
     projects/lobbyist-475218/locations/us-west1/services/lobbyist-registration
   ```

4. **Review and apply**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

5. **Migrate data** from SQLite to PostgreSQL (see migration script)

6. **Update application** to use new DATABASE_URL

## Common Operations

### View current infrastructure

```bash
cd terraform/environments/dev  # or prod
terraform show
```

### View outputs

```bash
terraform output
terraform output service_url
terraform output database_connection_name
```

### Update infrastructure

```bash
# Make changes to .tf files
terraform plan     # Review changes
terraform apply    # Apply changes
```

### Update container image

```bash
# Build new image
gcloud builds submit --tag gcr.io/lobbyist-475218/lobbyist-registration-dev:v2

# Update Terraform
terraform apply -var="container_image=gcr.io/lobbyist-475218/lobbyist-registration-dev:v2"
```

### Rollback changes

```bash
# View state history
gsutil ls -l gs://lobbyist-terraform-state/env/dev/

# Download previous state
gsutil cp gs://lobbyist-terraform-state/env/dev/default.tfstate#<generation> terraform.tfstate

# Apply previous state
terraform refresh
terraform apply
```

### Destroy environment

```bash
# ⚠️  CAREFUL! This deletes everything
terraform destroy
```

## Troubleshooting

### "Error acquiring state lock"

**Problem:** Another terraform process is running or crashed.

**Solution:**
```bash
terraform force-unlock <LOCK_ID>
```

### "Error: resource already exists"

**Problem:** Resource exists but not in Terraform state.

**Solution:** Import the existing resource:
```bash
terraform import <resource_type>.<name> <resource_id>
```

Example:
```bash
terraform import google_cloud_run_service.app \
  projects/lobbyist-475218/locations/us-west1/services/lobbyist-registration-dev
```

### "Error: Insufficient IAM permissions"

**Problem:** Your account lacks required permissions.

**Solution:**
```bash
# Grant yourself editor role (or specific roles)
gcloud projects add-iam-policy-binding lobbyist-475218 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/editor"
```

### "Cloud SQL instance creation timeout"

**Problem:** Cloud SQL instances take 5-10 minutes to create.

**Solution:** Wait and retry. If it fails, check GCP console for errors.

### Database connection issues

**Problem:** Cloud Run can't connect to Cloud SQL.

**Solution:** Verify:
1. Cloud SQL connection name is correct
2. Service account has `roles/cloudsql.client`
3. DATABASE_URL format is correct:
   ```
   postgresql://user:pass@/dbname?host=/cloudsql/project:region:instance
   ```

## Best Practices

### 1. Always run `terraform plan` before `apply`

Review changes before applying them.

### 2. Use workspaces or separate directories for environments

We use separate directories (`dev/` and `prod/`) for environment isolation.

### 3. Never commit sensitive files

`.gitignore` excludes:
- `*.tfvars` (contains secrets)
- `*.tfstate` (contains sensitive data)
- `.terraform/` (provider binaries)

### 4. Use remote state backend

We use GCS with versioning for state management.

### 5. Enable deletion protection for production

Production databases have `deletion_protection = true`.

### 6. Tag all resources

All resources have labels:
```hcl
labels = {
  environment = "dev"
  application = "lobbyist-registration"
  managed_by  = "terraform"
}
```

### 7. Document infrastructure changes

Use descriptive commit messages:
```bash
git commit -m "terraform: Add Cloud Storage bucket for file uploads"
```

## Cost Management

### Development Environment
- Cloud Run: $0-5/month (free tier)
- Cloud SQL db-f1-micro: ~$10/month
- Total: **~$10-15/month**

### Production Environment
- Cloud Run: ~$20-30/month (2 instances)
- Cloud SQL db-g1-small: ~$25/month
- Total: **~$50-70/month**

### Cost Optimization Tips

1. **Scale to zero in dev** - `min_instances = "0"`
2. **Right-size database** - Start with db-f1-micro, upgrade if needed
3. **Enable deletion protection** - Prevent accidental expensive mistakes
4. **Set budget alerts** - Get notified at $20, $50, $100
5. **Review unused resources** - Run `terraform plan` regularly

## Next Steps

- [x] Create Terraform configuration
- [x] Create modules for Cloud Run and Cloud SQL
- [x] Create dev environment configuration
- [ ] Initialize Terraform and create state bucket
- [ ] Deploy dev environment
- [ ] Test dev environment
- [ ] Create production environment configuration
- [ ] Import existing production resources
- [ ] Migrate to Terraform-managed production

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Terraform Examples](https://cloud.google.com/run/docs/quickstarts/terraform)
- [Cloud SQL Terraform Examples](https://cloud.google.com/sql/docs/postgres/terraform)
