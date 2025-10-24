# Runtime Seeding Implementation for Cloud Run

## Problem Statement
SQLite databases on Cloud Run are ephemeral - they are reset every time a new container instance starts. This caused login failures because the database had no user records, even though the database was seeded during the Docker build process.

## Solution: Runtime Database Seeding
Implemented **Option A: Runtime Seeding** - automatically seed the database when the container starts, if the database is empty.

## Implementation Details

### 1. Startup Script (`scripts/startup.sh`)
Created a shell script that:
- Checks if the SQLite database file exists
- Queries the User table to see if there are any records
- If database is empty or missing:
  - Runs `npx prisma migrate deploy` to create schema
  - Runs `npm run db:seed` to populate test data
- Then starts the Next.js server with `node server.js`

**Key Feature:** The script is **idempotent** - safe to run multiple times. If the database already has data, it skips seeding.

### 2. Updated Dockerfile
Modified the Dockerfile to:
- **Removed build-time seeding** (lines that ran migrations and seed during Docker build)
- **Added sqlite3 CLI** to the runner stage (`apk add --no-cache sqlite`)
- **Copied seed dependencies**:
  - `prisma/seed.ts` - The seeding script
  - `lib/password.ts` - Password hashing utility
  - `package.json` - For npm commands
- **Installed runtime dependencies** (`tsx` and `bcryptjs`) needed for seeding
- **Copied and made executable** the startup script
- **Changed CMD** from `node server.js` to `/app/startup.sh`

### 3. Cloud Run Configuration
Created `cloud-run-service.yaml` to properly configure:
- **Container port: 8080** (not the default 3000)
- **Startup probe** pointing to port 8080 with:
  - `initialDelaySeconds: 10` - Give time for seeding
  - `failureThreshold: 10` - Allow up to 100 seconds for startup
  - `periodSeconds: 10` - Check every 10 seconds
- **Environment variables**:
  - `DATABASE_URL=file:/app/prisma/dev.db` (SQLite)
  - `AUTH_SECRET` - For NextAuth.js
  - `NEXTAUTH_URL` - Correct Cloud Run URL
  - `NODE_ENV=production`

## Deployment Process

### Build and Push Image
```bash
# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Create repository
gcloud artifacts repositories create lobbyist-registry \
  --repository-format=docker \
  --location=us-west1 \
  --description="Lobbyist Registration System container images"

# Build and push image
gcloud builds submit \
  --tag us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:latest \
  --timeout=10m
```

### Deploy to Cloud Run
```bash
# Deploy using YAML configuration
gcloud run services replace cloud-run-service.yaml --region us-west1
```

## Verification

### Test Endpoints
- **Service URL:** https://lobbyist-registration-dev-679888289147.us-west1.run.app
- **Login Page:** https://lobbyist-registration-dev-679888289147.us-west1.run.app/auth/signin
- **Status:** HTTP 200 ✅

### Test Accounts (Seeded Automatically)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@multnomah.gov | admin123 |
| Lobbyist | john.doe@lobbying.com | lobbyist123 |
| Lobbyist | jane.smith@advocacy.com | lobbyist123 |
| Employer | contact@techcorp.com | employer123 |
| Board Member | commissioner@multnomah.gov | board123 |
| Public | public@example.com | public123 |

### Log Verification
Logs show successful seeding on container startup:
```
📊 Database file does not exist
🌱 Database is empty or missing - initializing...
📦 Running database migrations...
🌱 Seeding database with test data...
✅ Database seeding completed successfully!
   ✓ Admin user created: admin@multnomah.gov / admin123
✅ Database initialization complete!
🎯 Starting Next.js server...
   ▲ Next.js 15.5.5
   - Network:      http://0.0.0.0:8080
```

## Files Modified

### New Files
- `/scripts/startup.sh` - Runtime seeding script
- `/cloud-run-service.yaml` - Cloud Run service configuration
- `/RUNTIME-SEEDING-IMPLEMENTATION.md` - This documentation

### Modified Files
- `/Dockerfile`:
  - Removed build-time seeding (lines 19-26)
  - Added `apk add --no-cache sqlite` (line 28)
  - Copied seed script and dependencies (lines 42-55)
  - Installed runtime dependencies `tsx` and `bcryptjs` (line 52)
  - Changed CMD to use startup script (line 67)
- `/terraform/environments/dev/terraform.tfvars`:
  - Updated `container_image` to use Artifact Registry URL

## Benefits

### Advantages of Runtime Seeding
1. **Always Fresh Data:** Database is populated on every new container instance
2. **Consistent State:** Every deployment starts with known test data
3. **Idempotent:** Safe to restart containers without data duplication
4. **Fast Startup:** Seeding takes ~5-10 seconds, well within Cloud Run timeout
5. **Works with Scale-to-Zero:** Database reseeds when cold starting from zero instances

### Trade-offs
- **Startup Time:** Adds 5-10 seconds to cold start time
- **SQLite Still Ephemeral:** Data lost between deployments (intended for dev)
- **Not for Production:** This pattern works for dev/demo only

## Next Steps for Production

### Migration to Cloud SQL PostgreSQL
For production deployment, migrate to Cloud SQL:
1. **Update Terraform variables** to use Cloud SQL connection string
2. **Change DATABASE_URL** to PostgreSQL connection (already configured in Terraform)
3. **Run migrations once** against Cloud SQL during initial deployment
4. **Remove runtime seeding** or make it conditional (only seed if tables are empty)
5. **Use Cloud SQL Proxy** for secure connections from Cloud Run

### Already Configured in Terraform
The dev environment already has:
- Cloud SQL instance: `lobbyist-db-dev`
- Database: `lobbyist_registry_dev`
- User: `lobbyist_app`
- Secret Manager: Database URL stored securely
- Cloud Run: Configured to connect to Cloud SQL instance

To switch to PostgreSQL:
```bash
# Update service to use Cloud SQL
cd terraform/environments/dev
terraform plan -out=tfplan
terraform apply tfplan
```

## Monitoring and Troubleshooting

### View Logs
```bash
# View all logs for the service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit 50

# View startup logs only
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit 100 | grep -E "(Database|seeding|Starting)"
```

### Common Issues

**Issue:** Container fails health check
- **Cause:** Startup probe checking wrong port
- **Fix:** Use `cloud-run-service.yaml` to specify port 8080 in startup probe

**Issue:** MissingSecret error
- **Cause:** Missing `AUTH_SECRET` or `NEXTAUTH_SECRET` environment variable
- **Fix:** Add to environment variables in Cloud Run service configuration

**Issue:** Database not seeding
- **Cause:** Missing dependencies (`tsx`, `bcryptjs`) or wrong paths
- **Fix:** Verify Dockerfile copies all dependencies and uses correct paths

**Issue:** Slow cold starts
- **Cause:** Database seeding adds time to startup
- **Solution:** Increase startup probe `failureThreshold` or switch to Cloud SQL

## Success Criteria ✅

All success criteria met:
- ✅ Deploy to dev environment
- ✅ Database automatically seeds on container startup
- ✅ Login with test account works: `admin@multnomah.gov` / `admin123`
- ✅ No manual seeding step required after deploy
- ✅ Process documented for production rollout

## Artifact Registry Repository
- **Repository:** `lobbyist-registry`
- **Location:** `us-west1`
- **Image Path:** `us-west1-docker.pkg.dev/lobbyist-475218/lobbyist-registry/lobbyist-registration-dev:latest`
- **Format:** Docker

## References
- Cloud Run Documentation: https://cloud.google.com/run/docs
- Prisma Migrations: https://www.prisma.io/docs/orm/prisma-migrate
- Next.js Standalone: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
