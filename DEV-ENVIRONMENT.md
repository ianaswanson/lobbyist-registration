# Development Environment - Quick Reference

## Service Information
- **Service Name:** lobbyist-registration-dev
- **Region:** us-west1
- **Project:** lobbyist-475218
- **Project Number:** 679888289147

## URLs
- **Application URL:** https://lobbyist-registration-dev-679888289147.us-west1.run.app
- **Login Page:** https://lobbyist-registration-dev-679888289147.us-west1.run.app/auth/signin
- **Demo Guide:** https://lobbyist-registration-dev-679888289147.us-west1.run.app/DEMO-GUIDE.html
- **Compliance Matrix:** https://lobbyist-registration-dev-679888289147.us-west1.run.app/ORDINANCE-COMPLIANCE.html

## Test Accounts
Database is automatically seeded on container startup with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@multnomah.gov | admin123 |
| Lobbyist | john.doe@lobbying.com | lobbyist123 |
| Lobbyist | jane.smith@advocacy.com | lobbyist123 |
| Employer | contact@techcorp.com | employer123 |
| Board Member | commissioner@multnomah.gov | board123 |
| Public | public@example.com | public123 |

## Container Registry
- **Repository:** lobbyist-registry
- **Location:** us-west1
- **Latest Image:** `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:latest`

## Deployment Commands

### Build and Push New Image
```bash
gcloud builds submit \
  --tag us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:latest \
  --timeout=10m
```

### Deploy to Cloud Run
```bash
gcloud run services replace cloud-run-service.yaml --region us-west1
```

### View Logs
```bash
# All logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit 50

# Just startup and seeding logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit 100 | grep -E "(Database|seeding|Starting)"
```

### Check Service Status
```bash
gcloud run services describe lobbyist-registration-dev --region us-west1
```

### List Revisions
```bash
gcloud run revisions list --service=lobbyist-registration-dev --region=us-west1
```

## Configuration
- **Database:** SQLite (ephemeral, reseeded on startup)
- **Min Instances:** 0 (scales to zero)
- **Max Instances:** 3
- **Memory:** 512Mi
- **CPU:** 1
- **Timeout:** 300s
- **Port:** 8080

## Environment Variables
- `NODE_ENV=production`
- `DATABASE_URL=file:/app/prisma/dev.db`
- `AUTH_SECRET=pY+pkA/1XsAVlmMfTeNSt1DRmcGDdIiEr/8HPEc1J04=`
- `NEXTAUTH_URL=https://lobbyist-registration-dev-679888289147.us-west1.run.app`

## Quick Test
```bash
# Test homepage
curl -sI https://lobbyist-registration-dev-679888289147.us-west1.run.app/ | head -1

# Expected: HTTP/2 200
```

## Troubleshooting

### Container Won't Start
Check logs for errors:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit 20
```

### Database Not Seeded
Look for seeding messages in logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" | grep -i "seed"
```

### Login Not Working
1. Check AUTH_SECRET is set correctly
2. Verify database seeding completed (check logs)
3. Try test account: admin@multnomah.gov / admin123

## Next Steps
- **Gather stakeholder feedback** on current MVP
- **Plan Phase 2 enhancements** based on feedback
- **Migrate to Cloud SQL PostgreSQL** for production (Terraform already configured)
- **Set up CI/CD pipeline** with GitHub Actions or Cloud Build triggers
- **Implement production monitoring** with Cloud Monitoring dashboards

## Related Documentation
- [RUNTIME-SEEDING-IMPLEMENTATION.md](./RUNTIME-SEEDING-IMPLEMENTATION.md) - How runtime seeding works
- [DEPLOYMENT-PLAN.md](./DEPLOYMENT-PLAN.md) - Complete deployment guide
- [QUICKSTART-DEPLOY.md](./QUICKSTART-DEPLOY.md) - Fast-track deployment
- [CLAUDE.md](./CLAUDE.md) - Project overview and development guide
