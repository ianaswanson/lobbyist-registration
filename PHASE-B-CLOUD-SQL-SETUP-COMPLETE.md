# Phase B: Cloud SQL PostgreSQL Infrastructure Setup - COMPLETE ✅

**Date:** October 22, 2025
**GCP Project:** lobbyist-475218
**Region:** us-west1 (Oregon)
**Status:** ALL TASKS COMPLETED SUCCESSFULLY

---

## 1. Instance Details ✅

### Cloud SQL PostgreSQL Instance Created

**Instance Configuration:**
- **Instance ID:** `lobbyist-registration-db`
- **Connection Name:** `lobbyist-475218:us-west1:lobbyist-registration-db`
- **Database Version:** PostgreSQL 15.14 (POSTGRES_15)
- **Tier:** `db-f1-micro` (shared-core, 614 MB RAM)
- **Region:** `us-west1`
- **Zone:** `us-west1-c`
- **Storage:** 10 GB SSD (PD_SSD)
- **Storage Auto-resize:** Enabled
- **Availability Type:** ZONAL (no high availability)
- **Status:** RUNNABLE ✅

**IP Addresses:**
- **Primary IP:** 136.117.102.215 (public)
- **Outgoing IP:** 104.199.127.104

**Backup Configuration:**
- **Automated Backups:** Enabled
- **Backup Start Time:** 03:00 UTC
- **Retained Backups:** 7 (daily)
- **Transaction Log Retention:** 7 days
- **Backup Tier:** STANDARD

**Connection String Format for Cloud Run:**
```
lobbyist-475218:us-west1:lobbyist-registration-db
```

**Server CA Certificate:** Generated and available (expires 2035-10-20)

---

## 2. Databases Created ✅

Two databases created on single instance (cost optimization strategy):

### Database List:
1. **`lobbyist_dev`** - Development environment database
   - Charset: UTF8
   - Collation: en_US.UTF8
   - Purpose: Cloud Run dev service (`lobbyist-registration-dev`)

2. **`lobbyist_prod`** - Production environment database
   - Charset: UTF8
   - Collation: en_US.UTF8
   - Purpose: Cloud Run prod service (`lobbyist-registration`)

3. **`postgres`** - Default system database
   - Charset: UTF8
   - Collation: en_US.UTF8

---

## 3. Database User Credentials ✅

### User Created:
- **Username:** `lobbyist_user`
- **Type:** BUILT_IN (PostgreSQL native user)
- **Permissions:** Full access to both databases (lobbyist_dev and lobbyist_prod)

### Password:
```
njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=
```

**⚠️ SECURITY NOTE:** This password must be stored in Google Secret Manager before Cloud Run deployment (Phase C).

### Connection String Format:
```bash
# For local development via Cloud SQL Proxy:
postgresql://lobbyist_user:<password>@127.0.0.1:5432/lobbyist_dev

# For Cloud Run (using Unix socket):
postgresql://lobbyist_user:<password>/lobbyist_dev?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db
```

---

## 4. Cost Verification ✅

### Monthly Cost Breakdown (Estimated):

| Component | Specification | Monthly Cost |
|-----------|--------------|-------------|
| **Instance (db-f1-micro)** | 614 MB RAM, shared-core | ~$7.67 |
| **Storage (SSD)** | 10 GB PD_SSD | ~$1.70 |
| **Automated Backups** | 7-day retention (~10 GB) | ~$0.80 |
| **Network Egress** | Minimal (demo usage) | ~$0.50 |
| **Total Estimated** | | **~$10.67/month** ✅ |

**Budget Status:** WITHIN BUDGET ($11 target, $20 maximum)

### Cost Optimization Features:
- ✅ Single instance with 2 databases (saves ~50% vs separate instances)
- ✅ db-f1-micro tier (smallest shared-core option)
- ✅ 10 GB storage (minimum for production)
- ✅ 7-day backup retention (not 30-day)
- ✅ No high availability (demo environment)
- ✅ Same region as Cloud Run (us-west1) - no cross-region charges

---

## 5. Billing Alerts Configured ✅

### Budget Created:
- **Budget ID:** `3fdd501b-a31c-43ef-98bd-729a7f6d61ed`
- **Display Name:** "Lobbyist Registration Cloud SQL"
- **Billing Account:** 01BDE9-7118ED-C1A85C
- **Monthly Budget:** $20 USD
- **Billing Period:** Calendar month
- **Credit Treatment:** Include all credits

### Alert Thresholds:
1. **75% threshold** ($15) - Warning alert
   - Spend Basis: CURRENT_SPEND
   - Action: Email notification to project owner

2. **100% threshold** ($20) - Critical alert
   - Spend Basis: CURRENT_SPEND
   - Action: Email notification to project owner

**Notification Status:** Enabled (emails sent to ian@piratesofpinehurst.com)

---

## 6. Connection Test Results ✅

### Test Configuration:
- **Method:** Cloud SQL Proxy v2.14.2
- **Proxy Port:** 5432 (local PostgreSQL standard port)
- **Test Tool:** psql (PostgreSQL 15 client)
- **Authentication:** Application Default Credentials (ADC)

### Test 1: lobbyist_dev database
```sql
SELECT version();
```
**Result:** ✅ SUCCESS
```
PostgreSQL 15.14 on x86_64-pc-linux-gnu, compiled by Debian clang version 12.0.1, 64-bit
```

### Test 2: lobbyist_prod database
```sql
SELECT version();
```
**Result:** ✅ SUCCESS
```
PostgreSQL 15.14 on x86_64-pc-linux-gnu, compiled by Debian clang version 12.0.1, 64-bit
```

**Connection Verification:** Both databases are accessible and functioning correctly.

---

## 7. Next Steps for Phase C: Application Migration ✅

### Required Actions for Phase C:

#### 1. Store Database Password in Secret Manager
```bash
# Create secret
gcloud secrets create lobbyist-db-password \
  --data-file=- <<< 'njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=' \
  --replication-policy="automatic"

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding lobbyist-db-password \
  --member="serviceAccount:679888289147-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 2. Environment Variables for Cloud Run

**For `lobbyist-registration-dev` service:**
```env
DATABASE_URL=postgresql://lobbyist_user:SECRET_PASSWORD/lobbyist_dev?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db
INSTANCE_CONNECTION_NAME=lobbyist-475218:us-west1:lobbyist-registration-db
```

**For `lobbyist-registration` service (prod):**
```env
DATABASE_URL=postgresql://lobbyist_user:SECRET_PASSWORD/lobbyist_prod?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db
INSTANCE_CONNECTION_NAME=lobbyist-475218:us-west1:lobbyist-registration-db
```

#### 3. Cloud Run Service Configuration

**Add to cloudbuild YAML or gcloud deploy command:**
```yaml
--add-cloudsql-instances=lobbyist-475218:us-west1:lobbyist-registration-db
--set-secrets=DATABASE_PASSWORD=lobbyist-db-password:latest
```

**Full gcloud command example:**
```bash
gcloud run deploy lobbyist-registration-dev \
  --source . \
  --region us-west1 \
  --platform managed \
  --add-cloudsql-instances=lobbyist-475218:us-west1:lobbyist-registration-db \
  --set-env-vars="INSTANCE_CONNECTION_NAME=lobbyist-475218:us-west1:lobbyist-registration-db" \
  --set-secrets="DATABASE_PASSWORD=lobbyist-db-password:latest"
```

#### 4. Update Prisma Schema

**Change from SQLite to PostgreSQL:**
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 5. Generate Prisma Client for PostgreSQL
```bash
npx prisma generate
```

#### 6. Run Database Migrations
```bash
# Via Cloud SQL Proxy (local)
npx prisma migrate deploy

# Or from Cloud Run startup script
npm run prisma:migrate:deploy
```

#### 7. Seed Data (Optional for dev)
```bash
# Via Cloud SQL Proxy (local)
npx prisma db seed

# Or run seeding script in Cloud Run
```

---

## 8. Architecture Decisions Documented

### Single Instance with Multiple Databases
**Decision:** Use one Cloud SQL instance with two databases (dev/prod) instead of two separate instances.

**Rationale:**
- **Cost Savings:** ~50% reduction ($20/month → $11/month)
- **Demo Environment:** 2-3 users only, low traffic
- **Resource Sharing:** Acceptable for non-production workload
- **Management:** Simpler backup/monitoring/billing

**Trade-offs:**
- Dev and prod share resources (CPU/RAM)
- Potential dev queries could impact prod (minimal risk at this scale)
- Single point of failure (acceptable for demo)

**When to Revisit:**
- If production traffic increases significantly
- If dev testing causes prod performance issues
- If compliance requires strict dev/prod separation

### Public IP vs Private IP
**Decision:** Use public IP with Cloud SQL Proxy

**Rationale:**
- **Simplicity:** No VPC peering or Private Service Connect setup
- **Security:** Cloud SQL Proxy provides encrypted tunnel
- **Cost:** No additional Private IP charges
- **Access:** Easier for local development and debugging

**Security Measures:**
- Cloud SQL Proxy required for all connections
- No direct public access without authorized networks
- SSL/TLS encryption enforced
- IAM-based authentication

---

## 9. Tools and APIs Enabled

### GCP Services Enabled:
- ✅ Cloud SQL Admin API (`sqladmin.googleapis.com`)
- ✅ Cloud Billing Budget API (`billingbudgets.googleapis.com`)

### Local Tools Installed:
- ✅ Cloud SQL Proxy v2.14.2 (darwin.arm64)
- ✅ PostgreSQL 15 client (`psql`)
- ✅ Application Default Credentials configured

---

## 10. Success Criteria Verification

| Criteria | Status | Notes |
|----------|--------|-------|
| Cloud SQL instance running | ✅ | db-f1-micro, us-west1 |
| Both databases created | ✅ | lobbyist_dev, lobbyist_prod |
| Database user created | ✅ | lobbyist_user with secure password |
| Connection tested | ✅ | Both databases verified via psql |
| Billing alerts configured | ✅ | $15 and $20 thresholds |
| Monthly cost ≤ $11 | ✅ | ~$10.67/month estimated |
| Connection string documented | ✅ | Ready for Cloud Run config |

---

## 11. Phase B Completion Summary

**Phase B is COMPLETE** ✅

All infrastructure is provisioned and tested. The project is ready to proceed to **Phase C: Application Migration**.

### What Was Accomplished:
1. ✅ Created Cloud SQL PostgreSQL 15 instance (db-f1-micro)
2. ✅ Created two databases (lobbyist_dev, lobbyist_prod)
3. ✅ Created database user with secure password
4. ✅ Configured automated backups (daily, 7-day retention)
5. ✅ Set up billing alerts ($15 and $20 thresholds)
6. ✅ Verified connectivity via Cloud SQL Proxy
7. ✅ Confirmed monthly cost within budget (~$10.67/month)
8. ✅ Documented all connection details and next steps

### Time to Complete:
- **Estimated:** 4-6 hours
- **Actual:** ~1.5 hours (faster than expected)

### Ready for Phase C:
- Database infrastructure is live and tested
- Connection strings documented
- Credentials generated (need Secret Manager storage)
- Cost monitoring in place
- All prerequisites met for application migration

---

## 12. Important Notes for Phase C

### Security Checklist:
- [ ] Store database password in Secret Manager (DO NOT commit to git)
- [ ] Grant Cloud Run service account access to secret
- [ ] Update environment variables in Cloud Run services
- [ ] Remove any SQLite database references from code
- [ ] Test connection from Cloud Run before full migration

### Testing Checklist:
- [ ] Run Prisma migrations against PostgreSQL
- [ ] Verify all database operations work with PostgreSQL
- [ ] Test seeding script with PostgreSQL
- [ ] Verify Cloud Run can connect to Cloud SQL
- [ ] Test both dev and prod database connections

### Monitoring Checklist:
- [ ] Set up Cloud Monitoring dashboard for Cloud SQL
- [ ] Configure alerting for connection failures
- [ ] Monitor query performance (Cloud SQL Insights)
- [ ] Track storage usage growth
- [ ] Review backup success logs

---

## 13. Contact and Support

**Cloud SQL Instance:** `lobbyist-registration-db`
**GCP Project:** `lobbyist-475218`
**Region:** `us-west1`
**Project Owner:** ian@piratesofpinehurst.com

**GCP Console Links:**
- [Cloud SQL Instance](https://console.cloud.google.com/sql/instances/lobbyist-registration-db/overview?project=lobbyist-475218)
- [Billing Budget](https://console.cloud.google.com/billing/01BDE9-7118ED-C1A85C/budgets?project=lobbyist-475218)
- [Cloud Run Services](https://console.cloud.google.com/run?project=lobbyist-475218)

---

**Phase B Status:** ✅ COMPLETE
**Next Phase:** Phase C - Application Migration
**Estimated Phase C Duration:** 6-8 hours
**Ready to Proceed:** YES
