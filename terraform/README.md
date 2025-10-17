# Terraform Infrastructure as Code

This directory contains the Infrastructure as Code (IaC) configuration for the Lobbyist Registration System using Terraform.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Cloud Platform                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   Cloud Run      │────────▶│  Cloud SQL       │          │
│  │  (Next.js App)   │         │  (PostgreSQL)    │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                             │                    │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Secret Manager   │         │  Cloud Storage   │          │
│  │ (DB Credentials) │         │  (File Uploads)  │          │
│  └──────────────────┘         └──────────────────┘          │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │      Terraform State (GCS Backend)           │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
terraform/
├── README.md                    # This file
├── environments/
│   ├── dev/                     # Development environment
│   │   ├── main.tf              # Main infrastructure config
│   │   ├── variables.tf         # Input variables
│   │   ├── outputs.tf           # Output values
│   │   ├── backend.tf           # State backend config
│   │   └── terraform.tfvars     # Variable values (gitignored)
│   └── prod/                    # Production environment
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── backend.tf
│       └── terraform.tfvars
├── modules/
│   ├── cloud-run/               # Cloud Run service module
│   ├── cloud-sql/               # Cloud SQL PostgreSQL module
│   └── networking/              # VPC and networking module
└── scripts/
    ├── init-terraform.sh        # Initialize Terraform & state bucket
    ├── migrate-sqlite-to-postgres.sh  # Data migration script
    └── deploy-dev.sh            # Deploy dev environment
```

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform** (v1.0+)
   ```bash
   brew install terraform
   ```

2. **Authenticate with GCP**
   ```bash
   gcloud auth application-default login
   ```

3. **Set your GCP project**
   ```bash
   gcloud config set project lobbyist-475218
   ```

### Initial Setup

1. **Initialize Terraform state backend**
   ```bash
   cd terraform
   ./scripts/init-terraform.sh
   ```

2. **Create dev environment variables**
   ```bash
   cd environments/dev
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Plan the deployment**
   ```bash
   terraform plan
   ```

5. **Apply the configuration**
   ```bash
   terraform apply
   ```

## 🌍 Environments

### Development Environment
- **Purpose:** Testing, experimentation, stakeholder demos
- **Resources:**
  - Cloud Run: `lobbyist-registration-dev`
  - Cloud SQL: `lobbyist-db-dev` (db-f1-micro)
  - Cost: ~$10-15/month
- **Access:** Public (for demos)

### Production Environment
- **Purpose:** Live system for Multnomah County (post July 1, 2026)
- **Resources:**
  - Cloud Run: `lobbyist-registration`
  - Cloud SQL: `lobbyist-db` (db-g1-small or higher)
  - Cost: ~$25-50/month
- **Access:** Public (government transparency)

## 📋 Common Commands

### Development Workflow

```bash
cd terraform/environments/dev

# See what will change
terraform plan

# Apply changes
terraform apply

# View outputs (URLs, connection strings)
terraform output

# Destroy everything (careful!)
terraform destroy
```

### Production Deployment

```bash
cd terraform/environments/prod

# Review changes carefully
terraform plan -out=tfplan

# Apply approved plan
terraform apply tfplan

# View production URLs
terraform output
```

## 🔐 Security & State Management

### Terraform State Backend

State is stored in a **GCS bucket** with:
- ✅ Versioning enabled (rollback capability)
- ✅ Encryption at rest
- ✅ State locking (prevents concurrent modifications)
- ✅ Access logging

**State bucket:** `lobbyist-terraform-state`

### Secrets Management

**Never commit secrets to git!**

- Database passwords stored in **Secret Manager**
- Generated automatically by Terraform
- Accessed by Cloud Run via IAM service accounts
- Rotated periodically

### Sensitive Files (gitignored)

```
terraform.tfvars          # Variable values
*.tfstate                 # State files (should be in GCS)
*.tfstate.backup          # State backups
.terraform/               # Terraform plugins
```

## 🔄 Migration from Current Setup

### Phase 1: Create Dev Environment (This Week)
1. ✅ Create Terraform configuration
2. ✅ Deploy dev Cloud Run + Cloud SQL
3. ✅ Migrate SQLite data to PostgreSQL
4. ✅ Test application functionality
5. ✅ Verify security headers and rate limiting

### Phase 2: Import Production Resources (Next Week)
1. Import existing Cloud Run service into Terraform
2. Create production Cloud SQL instance
3. Migrate production data
4. Cutover with zero downtime
5. Decommission SQLite

### Phase 3: Expand Infrastructure (As Needed)
1. Add Cloud Storage for file uploads
2. Configure Cloud CDN
3. Set up monitoring and alerting
4. Implement backup automation

## 💰 Cost Estimation

### Development Environment
| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| Cloud Run | 2GB RAM, always allocated | $0-5 (free tier) |
| Cloud SQL | db-f1-micro (0.6GB RAM) | ~$10 |
| Cloud SQL Storage | 10GB SSD | ~$1.70 |
| Secret Manager | 6 secrets | ~$0.06 |
| GCS (state) | <1GB | ~$0.02 |
| Networking | Minimal egress | ~$1 |
| **Total** | | **~$13-18/month** |

### Production Environment (Estimated)
| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| Cloud Run | 4GB RAM, 2 instances | ~$20-30 |
| Cloud SQL | db-g1-small (1.7GB RAM) | ~$25 |
| Cloud SQL Storage | 50GB SSD | ~$8.50 |
| Cloud Storage | File uploads (10GB) | ~$0.26 |
| Secret Manager | 10 secrets | ~$0.10 |
| Monitoring | Basic metrics | ~$5 |
| **Total** | | **~$60-70/month** |

**Note:** Your $300 GCP credit covers 15-20 months of dev + 4-6 months of production! ✅

## 📖 Additional Documentation

- [Cloud SQL Migration Guide](./docs/CLOUD-SQL-MIGRATION.md)
- [Production Deployment Checklist](./docs/PRODUCTION-CHECKLIST.md)
- [Disaster Recovery Plan](./docs/DISASTER-RECOVERY.md)
- [Cost Optimization Tips](./docs/COST-OPTIMIZATION.md)

## 🆘 Troubleshooting

### Common Issues

**"Error acquiring state lock"**
- Another terraform process is running
- Solution: Wait or use `terraform force-unlock <LOCK_ID>`

**"Error creating CloudSQL instance: already exists"**
- Instance name already in use
- Solution: Import existing resource or change name

**"Insufficient permissions"**
- IAM role missing
- Solution: Grant `roles/editor` or specific roles to your account

### Getting Help

1. Check Terraform logs: `terraform apply -debug`
2. Verify GCP permissions: `gcloud projects get-iam-policy lobbyist-475218`
3. Review state: `terraform show`
4. Check GCP console for resource status

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# View state history
gsutil ls -l gs://lobbyist-terraform-state/env/dev/

# Restore previous state version
gsutil cp gs://lobbyist-terraform-state/env/dev/default.tfstate#<generation> terraform.tfstate

# Re-sync
terraform refresh
terraform plan
```

## 👥 Team Workflow

### Making Infrastructure Changes

1. Create feature branch: `git checkout -b infra/add-cloud-storage`
2. Make Terraform changes
3. Test in dev: `cd environments/dev && terraform plan`
4. Commit changes: `git commit -am "Add Cloud Storage for uploads"`
5. Create PR for review
6. After approval, apply to dev
7. Test application
8. Apply to prod (with approval)

### Terraform Formatting

Always format before committing:
```bash
terraform fmt -recursive
```

## 📊 Monitoring & Observability

After deployment, monitor your infrastructure:

```bash
# View Cloud Run metrics
gcloud run services describe lobbyist-registration-dev \
  --region us-west1 \
  --format="value(status.url)"

# View Cloud SQL status
gcloud sql instances describe lobbyist-db-dev

# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

## 🎯 Next Steps

- [ ] Initialize Terraform state backend
- [ ] Deploy dev environment
- [ ] Migrate SQLite data to PostgreSQL
- [ ] Update application to use Cloud SQL
- [ ] Test dev environment thoroughly
- [ ] Create production environment config
- [ ] Import existing production Cloud Run
- [ ] Deploy production Cloud SQL
- [ ] Cutover production to PostgreSQL

---

**Questions?** Review the GCP SRE agent's analysis in the project documentation or reach out for help.
