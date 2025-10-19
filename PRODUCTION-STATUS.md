# Production Deployment Status

## Current Status: ✅ DEPLOYED

**Production URL:** https://lobbyist-registration-679888289147.us-west1.run.app

**Deployment Date:** October 17, 2025
**Image:** `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration:latest`
**Image Digest:** `sha256:c3a22f018a028cab89aca8cd4761d12be1e32dce6958c88cc212992735b6bbdf`
**Current Revision:** `lobbyist-registration-00031-9gz`

## What Was Deployed

### Runtime Database Seeding ✅
The production container now includes:
- **Startup Script** (`/app/startup.sh`): Runs before Next.js starts
- **Automatic Migrations**: Runs `npx prisma migrate deploy` on startup
- **Automatic Seeding**: Runs `npm run db:seed` if database is empty
- **SQLite Database**: Still using SQLite (`/app/prisma/dev.db`)

### Container Configuration
```yaml
Image: us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration@sha256:c3a22f018...
Port: 8080
Environment:
  - NODE_ENV: production
  - NEXTAUTH_SECRET: (from Secret Manager)
  - DATABASE_URL: file:/app/prisma/dev.db (default, can be overridden)
Resources:
  - CPU: 1 vCPU
  - Memory: 512Mi
  - Timeout: 300s
Scaling:
  - Min instances: 0 (scales to zero to save costs)
  - Max instances: 3
```

## Testing the Deployment

### 1. Check Service is Running
```bash
curl -I https://lobbyist-registration-679888289147.us-west1.run.app/
```

Should return `200 OK`

### 2. Test Login (Verify Database is Seeded)
Navigate to: https://lobbyist-registration-679888289147.us-west1.run.app/auth/signin

Login credentials (from seed data):
- **Email:** admin@multnomah.gov
- **Password:** admin123

If login works, the database was successfully seeded!

### 3. Check Logs for Seeding Messages
```bash
gcloud run services logs read lobbyist-registration \
  --region us-west1 \
  --project lobbyist-475218 \
  --limit 200 | grep -E "(Seeding|Database|migration)"
```

**Note:** Logs may be buffered or not visible depending on when the container started. The best test is the login.

## How Runtime Seeding Works

### Cold Start Flow:
1. Container starts → `/app/startup.sh` executes
2. Script checks if database exists and has data
3. If empty:
   - Creates `/app/prisma/dev.db`
   - Runs `npx prisma migrate deploy` (creates tables)
   - Runs `npm run db:seed` (populates test data)
4. Starts Next.js server with `node server.js`

### Warm Start Flow:
1. Container already running with seeded database
2. No seeding needed
3. Requests handled immediately

### Key Benefits:
- ✅ No manual database seeding required
- ✅ Fresh instances automatically get seeded database
- ✅ Works in both dev and production
- ✅ Zero-config deployment

## Comparison: Dev vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Service Name** | `lobbyist-registration-dev` | `lobbyist-registration` |
| **URL** | us-west1.run.app | us-west1.run.app |
| **Database** | SQLite | SQLite |
| **Min Instances** | 0 (scale to zero) | 0 (scale to zero) |
| **Max Instances** | 3 | 3 |
| **Seeding** | Runtime ✅ | Runtime ✅ |
| **Terraform Managed** | Yes | Partially* |

\*Production service deployed manually with gcloud, but CAN be migrated to full Terraform management

## Next Steps: Full Terraform Migration

The Terraform configuration for production is ready in `terraform/environments/prod/`. To fully migrate:

### Option 1: Keep SQLite (Current Approach)
1. Import existing service into Terraform state
2. Let Terraform manage updates
3. Keep using SQLite with runtime seeding

### Option 2: Migrate to PostgreSQL (Future)
1. Run Terraform to create Cloud SQL PostgreSQL instance
2. Update DATABASE_URL environment variable
3. Re-deploy with PostgreSQL connection
4. Database will auto-seed on first start

## Known Limitations

### Current Production Setup (SQLite)
- ⚠️ Database resets on each container restart (ephemeral storage)
- ⚠️ Not suitable for multi-instance deployments (no shared state)
- ⚠️ Fine for prototype/demo, NOT for real production use

### Why This is OK for Now:
- This is a prototype for stakeholder demos
- Data loss on restart is acceptable
- Single-instance deployment is sufficient
- Quick to deploy and test

### When to Migrate to PostgreSQL:
- Before launching to real users
- When you need persistent data
- When you need multiple instances
- When you need backup/recovery

## Deployment Commands Reference

### View Current Service
```bash
gcloud run services describe lobbyist-registration \
  --region us-west1 \
  --project lobbyist-475218
```

### View Recent Logs
```bash
gcloud run services logs read lobbyist-registration \
  --region us-west1 \
  --project lobbyist-475218 \
  --limit 50
```

### Deploy New Version
```bash
# 1. Build new image
gcloud builds submit --tag us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration:latest

# 2. Deploy to Cloud Run
gcloud run deploy lobbyist-registration \
  --image us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration:latest \
  --region us-west1 \
  --project lobbyist-475218 \
  --allow-unauthenticated
```

### Scale to Zero (Save Costs)
```bash
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --project lobbyist-475218 \
  --min-instances=0
```

### Keep Warm (No Cold Starts)
```bash
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --project lobbyist-475218 \
  --min-instances=1
```

## Troubleshooting

### Login Doesn't Work
1. Check logs for seeding errors:
   ```bash
   gcloud run services logs read lobbyist-registration --region us-west1 --limit 100
   ```

2. Trigger a fresh cold start:
   ```bash
   # Scale to zero
   gcloud run services update lobbyist-registration --region us-west1 --min-instances=0

   # Wait 60 seconds, then visit the site to trigger cold start
   ```

3. Check DATABASE_URL environment variable:
   ```bash
   gcloud run services describe lobbyist-registration --region us-west1 --format="value(spec.template.spec.containers[0].env)"
   ```

### Container Won't Start
1. Check the image is correct:
   ```bash
   gcloud run services describe lobbyist-registration --region us-west1 --format="value(spec.template.spec.containers[0].image)"
   ```

2. Test image locally:
   ```bash
   docker run -p 8080:8080 us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration:latest
   ```

### Startup is Slow
- First request after scaling to zero takes 10-15 seconds (cold start + seeding)
- Subsequent requests are fast (< 500ms)
- Solution: Set `--min-instances=1` to keep one instance warm

## Success Indicators

✅ Production is working correctly if:
1. Service URL responds with 200 OK
2. Login page loads at `/auth/signin`
3. Can login with `admin@multnomah.gov` / `admin123`
4. Dashboard loads after login
5. No error messages in logs

## Cost Estimate

**Current Configuration:**
- Min instances: 0 (scale to zero)
- Max instances: 3
- Expected cost: **$0-5/month** (free tier covers most usage)
- Storage: Included (ephemeral, no Cloud SQL yet)

**With PostgreSQL (Future):**
- Cloud SQL db-g1-small: ~$25/month
- Cloud Run: ~$5/month
- Total: **~$30/month**

## Security Notes

### Current Security Posture:
- ✅ HTTPS enforced (Cloud Run default)
- ✅ NextAuth for authentication
- ✅ NEXTAUTH_SECRET in Secret Manager
- ✅ No exposed secrets in code
- ⚠️ Public access allowed (allow-unauthenticated)
- ⚠️ Default test credentials in use

### Before Real Production:
- [ ] Remove `allow-unauthenticated` flag
- [ ] Implement proper IAM/SSO integration
- [ ] Change default admin password
- [ ] Enable Cloud Armor (WAF)
- [ ] Set up monitoring and alerting
- [ ] Implement audit logging
- [ ] Add backup strategy (when using PostgreSQL)

## Summary

**Status:** Production is deployed with runtime database seeding. SQLite database auto-seeds on container startup. System is fully functional for stakeholder demos. Ready to migrate to PostgreSQL and full Terraform management when needed.

**Test it now:** https://lobbyist-registration-679888289147.us-west1.run.app
**Login as:** admin@multnomah.gov / admin123
