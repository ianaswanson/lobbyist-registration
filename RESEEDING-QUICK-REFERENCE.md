# Database Reseeding - Quick Reference Card

## TL;DR

**Dev:** Auto-reseeds every deploy (zero manual steps)
**Prod:** Preserves data (reset only with `FORCE_RESEED=true`)

## Commands

### Check Reseeding Status

```bash
# View dev startup logs
gcloud logging read "resource.type=cloud_run_revision AND \
  resource.labels.service_name=lobbyist-registration-dev" \
  --limit=20 --format=json | grep -A 3 "Environment"

# View prod startup logs
gcloud logging read "resource.type=cloud_run_revision AND \
  resource.labels.service_name=lobbyist-registration" \
  --limit=20 --format=json | grep -A 3 "Environment"
```

### Force Reseed Production (For Demos)

```bash
# 1. Set flag
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true

# 2. Deploy
git push origin main
# (Approve in Cloud Build console)

# 3. Remove flag immediately after
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

### Verify Database State

```bash
# Connect to dev database
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
psql postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev

# Check user count
SELECT COUNT(*) FROM "User";

# Check last seed
SELECT "timestamp", "details" FROM "AuditLog"
WHERE "action" = 'DATABASE_SEEDED'
ORDER BY "timestamp" DESC LIMIT 1;
```

## Expected Behavior

| Environment | Deploy Trigger | Behavior | Data State After |
|-------------|---------------|----------|------------------|
| Dev | `git push origin develop` | Auto-reset & reseed | Fresh demo data |
| Prod | `git push origin main` | Preserve data | Unchanged |
| Prod (forced) | `FORCE_RESEED=true` + deploy | Reset & reseed | Fresh demo data |

## Log Messages

### Dev Auto-Reseed (Expected)
```
🔄 Development environment detected - auto-reseeding enabled
   This ensures fresh demo data on every deploy
🔄 Performing database reset (force mode)...
⚠️  This will DELETE ALL DATA and recreate schema
✅ Database reset complete
🌱 Seeding database with demo data...
```

### Prod Data Preservation (Expected)
```
🔒 Production environment detected - data preservation mode
   Use FORCE_RESEED=true to reset (for demos)
✅ Database has data (User count: 45) - preserving data
🔧 Running database migrations...
✅ Skipping seed - preserving existing data
```

### Prod Force Reseed (Intentional)
```
⚠️  FORCE_RESEED=true detected - forcing database reset and re-seed...
🔄 Performing database reset (force mode)...
⚠️  This will DELETE ALL DATA and recreate schema
```

## Environment Variables

| Variable | Where Set | Values | Effect |
|----------|-----------|--------|--------|
| `ENVIRONMENT` | Cloud Build | `development` / `production` | Auto-behavior |
| `FORCE_RESEED` | Manual (gcloud) | `true` / unset | Override |

## URLs

- **Dev:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
- **Prod:** https://lobbyist-registration-zzp44w3snq-uw.a.run.app
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds
- **Cloud Run:** https://console.cloud.google.com/run
- **Cloud SQL:** https://console.cloud.google.com/sql/instances

## Troubleshooting

**Dev not reseeding?**
```bash
# Check environment variable
gcloud run services describe lobbyist-registration-dev \
  --region us-west1 --format="value(spec.template.spec.containers[0].env)"

# Should show: ENVIRONMENT=development
```

**Prod accidentally reseeded?**
```bash
# Check for FORCE_RESEED flag
gcloud run services describe lobbyist-registration \
  --region us-west1 --format="value(spec.template.spec.containers[0].env)"

# Restore from backup
gcloud sql backups list --instance=lobbyist-registration-db
gcloud sql backups restore BACKUP_ID \
  --backup-instance=lobbyist-registration-db
```

**Seed script errors?**
```bash
# Check startup logs for errors
gcloud logging read "resource.type=cloud_run_revision" \
  --limit=100 | grep -A 10 "Error"

# Test seed locally
npm run db:seed
```

## Full Documentation

- **[RESEEDING-GUIDE.md](RESEEDING-GUIDE.md)** - Complete guide (troubleshooting, monitoring, best practices)
- **[RESEEDING-FLOW-DIAGRAM.md](RESEEDING-FLOW-DIAGRAM.md)** - Visual decision tree and logging examples
- **[RESEEDING-IMPLEMENTATION-SUMMARY.md](RESEEDING-IMPLEMENTATION-SUMMARY.md)** - Implementation details and testing

## Demo Data ("Rule of 3")

Every seed creates:
- 12 Users (3 admin, 3 lobbyist, 3 employer, 3 board)
- 3 Lobbyists (Maria Chen, Liam O'Sullivan, Aisha Patel)
- 3 Employers (TechCorp, GreenFuture, BuildRight)
- 3 Board Members (Sarah Johnson, Michael Torres, Jennifer Kim)
- 9 Registrations, 36 Reports, 27 Receipts
- 3 Violations, 2 Appeals, 15 Contract Exceptions

Test Credentials: See [DEMO-GUIDE.html](DEMO-GUIDE.html)

---

**Need help?** See troubleshooting section in [RESEEDING-GUIDE.md](RESEEDING-GUIDE.md)
