# Phase C Quick Reference Card

**Phase B Status:** ✅ COMPLETE
**Phase C:** Application Migration (SQLite → PostgreSQL)

---

## 🔑 Critical Connection Information

### Cloud SQL Instance
```
Instance ID: lobbyist-registration-db
Connection Name: lobbyist-475218:us-west1:lobbyist-registration-db
Region: us-west1
Database Version: PostgreSQL 15.14
```

### Databases
- **Dev:** `lobbyist_dev`
- **Prod:** `lobbyist_prod`

### Credentials
- **Username:** `lobbyist_user`
- **Password:** `njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=`
- **⚠️ Store in Secret Manager before use**

---

## 🚀 Phase C Execution Steps

### Step 1: Store Password in Secret Manager (5 min)
```bash
# Create secret
echo -n 'njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=' | \
gcloud secrets create lobbyist-db-password \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to Cloud Run default service account
gcloud secrets add-iam-policy-binding lobbyist-db-password \
  --member="serviceAccount:679888289147-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Update Prisma Schema (2 min)
```prisma
// File: prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3: Generate New Prisma Client (2 min)
```bash
cd /Users/ianswanson/ai-dev/lobbyist-registration
npx prisma generate
```

### Step 4: Run Migrations on Cloud SQL (10 min)
```bash
# Start Cloud SQL Proxy
/tmp/cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db &

# Set DATABASE_URL for dev
export DATABASE_URL="postgresql://lobbyist_user:njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=@127.0.0.1:5432/lobbyist_dev"

# Run migrations
npx prisma migrate deploy

# (Optional) Seed data
npx prisma db seed

# Stop proxy
pkill cloud-sql-proxy
```

### Step 5: Update Cloud Run Environment Variables (5 min)

**For `lobbyist-registration-dev` service:**
```bash
gcloud run services update lobbyist-registration-dev \
  --region=us-west1 \
  --add-cloudsql-instances=lobbyist-475218:us-west1:lobbyist-registration-db \
  --update-env-vars="DATABASE_URL=postgresql://lobbyist_user@/lobbyist_dev?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db" \
  --update-secrets="DATABASE_PASSWORD=lobbyist-db-password:latest"
```

**For `lobbyist-registration` service (prod):**
```bash
gcloud run services update lobbyist-registration \
  --region=us-west1 \
  --add-cloudsql-instances=lobbyist-475218:us-west1:lobbyist-registration-db \
  --update-env-vars="DATABASE_URL=postgresql://lobbyist_user@/lobbyist_prod?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db" \
  --update-secrets="DATABASE_PASSWORD=lobbyist-db-password:latest"
```

### Step 6: Deploy Updated Application (15 min)
```bash
# Deploy dev
gcloud run deploy lobbyist-registration-dev \
  --source . \
  --region us-west1

# Deploy prod
gcloud run deploy lobbyist-registration \
  --source . \
  --region us-west1
```

### Step 7: Verify (10 min)
```bash
# Test dev
curl https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app/health

# Test prod
curl https://lobbyist-registration-zzp44w3snq-uw.a.run.app/health

# Check logs
gcloud run logs read lobbyist-registration-dev --region=us-west1 --limit=50
```

---

## 🔧 Connection String Formats

### Local Development (via Cloud SQL Proxy)
```
postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev
```

### Cloud Run (via Unix Socket)
```
postgresql://lobbyist_user:PASSWORD@/lobbyist_dev?host=/cloudsql/lobbyist-475218:us-west1:lobbyist-registration-db
```

### Cloud Run (using Secret Manager)
```
postgresql://lobbyist_user:${DATABASE_PASSWORD}@/lobbyist_dev?host=/cloudsql/INSTANCE_CONNECTION_NAME
```

---

## 📊 Cost Monitoring

**Budget Alerts Configured:**
- 75% threshold: $15/month
- 100% threshold: $20/month
- Estimated monthly: ~$10.67

**Monitor at:** https://console.cloud.google.com/billing/01BDE9-7118ED-C1A85C/budgets?project=lobbyist-475218

---

## 🐛 Troubleshooting

### Can't connect to Cloud SQL
```bash
# Check instance status
gcloud sql instances describe lobbyist-registration-db --format="value(state)"

# Check proxy logs
/tmp/cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432

# Test connection
psql -h 127.0.0.1 -p 5432 -U lobbyist_user -d lobbyist_dev
```

### Prisma migration fails
```bash
# Check Prisma schema syntax
npx prisma validate

# Generate Prisma Client
npx prisma generate

# View migration status
npx prisma migrate status
```

### Cloud Run can't connect
```bash
# Verify Cloud SQL instance is added
gcloud run services describe lobbyist-registration-dev \
  --region=us-west1 \
  --format="value(spec.template.spec.containers[0].env)"

# Check service account permissions
gcloud projects get-iam-policy lobbyist-475218 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:679888289147-compute@developer.gserviceaccount.com"
```

---

## 📚 Reference Documents

- **Phase B Complete:** `/Users/ianswanson/ai-dev/lobbyist-registration/PHASE-B-CLOUD-SQL-SETUP-COMPLETE.md`
- **Migration Plan:** `/Users/ianswanson/ai-dev/lobbyist-registration/POSTGRESQL-MIGRATION-PLAN.md`
- **Session Plan:** `/Users/ianswanson/ai-dev/lobbyist-registration/SESSION-PLAN-POSTGRESQL-MIGRATION.md`

---

## ✅ Phase C Checklist

- [ ] Password stored in Secret Manager
- [ ] Prisma schema updated to PostgreSQL
- [ ] Prisma client regenerated
- [ ] Migrations run on lobbyist_dev
- [ ] Migrations run on lobbyist_prod
- [ ] Dev environment variables updated
- [ ] Prod environment variables updated
- [ ] Dev service deployed and tested
- [ ] Prod service deployed and tested
- [ ] Health checks passing
- [ ] Data persistence verified (restart test)
- [ ] Cost monitoring confirmed
- [ ] Documentation updated

---

**Estimated Phase C Duration:** 6-8 hours
**Recommended:** Test dev thoroughly before touching prod
**Rollback Plan:** Revert to SQLite env vars if needed (data not lost)
