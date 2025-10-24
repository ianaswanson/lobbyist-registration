# Database Reseeding Decision Flow

## Visual Decision Tree

```
┌─────────────────────────────────────────┐
│   Container starts up                   │
│   (Cloud Run deployment)                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Read ENVIRONMENT variable             │
│   - development                         │
│   - production                          │
│   - unknown                             │
└─────────────┬───────────────────────────┘
              │
              ▼
         ╔═══════════╗
         ║FORCE_RESEED║
         ║= true?    ║
         ╚═══╤═══╤═══╝
             │   │
        YES  │   │ NO
             │   │
             ▼   ▼
    ┌────────┐   ┌────────────────────────┐
    │        │   │ Check ENVIRONMENT       │
    │ FORCE  │   │ variable                │
    │ RESET  │   └──┬──────────┬─────────┬┘
    │        │      │          │         │
    └───┬────┘      │          │         │
        │      development  production  unknown
        │           │          │         │
        │           ▼          ▼         ▼
        │      ┌────────┐ ┌────────┐ ┌────────┐
        │      │ AUTO   │ │ CHECK  │ │ CHECK  │
        │      │ RESEED │ │ USER   │ │ USER   │
        │      │        │ │ COUNT  │ │ COUNT  │
        │      └───┬────┘ └───┬────┘ └───┬────┘
        │          │          │          │
        │          │          ▼          │
        │          │     ╔═══════════╗   │
        │          │     ║ COUNT = 0?║   │
        │          │     ╚═══╤═══╤═══╝   │
        │          │         │   │       │
        │          │    YES  │   │ NO    │
        │          │         │   │       │
        └──────────┴─────────┴───┘       │
                   │         │           │
              RESET & SEED   │      ┌────┘
                   │    PRESERVE    │
                   ▼       DATA     ▼
           ┌──────────────┐   │  ┌──────────────┐
           │              │   │  │              │
           │ FORCE RESET  │   │  │   PRESERVE   │
           │              │   │  │     DATA     │
           │ DROP TABLES  │   │  │              │
           │ RECREATE     │   │  │ Run          │
           │ MIGRATE      │   │  │ migrations   │
           │ SEED         │   │  │ only         │
           │              │   │  │              │
           └──────┬───────┘   │  └──────┬───────┘
                  │           │         │
                  │           │         │
                  └───────────┴─────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │                       │
                  │  Start Next.js Server │
                  │                       │
                  └───────────────────────┘
```

## Decision Logic Table

| Priority | Condition | Action | Database State After |
|----------|-----------|--------|---------------------|
| 1 (Highest) | `FORCE_RESEED=true` | Reset & Reseed | Fresh demo data |
| 2 | `ENVIRONMENT=development` | Reset & Reseed | Fresh demo data |
| 3 | `ENVIRONMENT=production` AND `User.count() = 0` | Migrate & Seed | Initial demo data |
| 4 | `ENVIRONMENT=production` AND `User.count() > 0` | Migrate only | **Preserved data** |
| 5 | Unknown environment AND `User.count() = 0` | Migrate & Seed | Initial demo data |
| 6 | Unknown environment AND `User.count() > 0` | Migrate only | Preserved data |

## Command Execution by Path

### Path A: Force Reset (Priority 1-2)

```bash
# Check if reset needed
if [ "$FORCE_RESET" = "true" ]; then

  # Drop all tables, recreate schema
  npx prisma db push --force-reset --accept-data-loss

  # Always seed after reset
  npm run db:seed
fi
```

**Used when:**
- `FORCE_RESEED=true` (manual override)
- `ENVIRONMENT=development` (automatic)

**Risk:** ⚠️ **DELETES ALL DATA** - Only safe for dev or intentional prod demos

### Path B: Migrate Only (Priority 4, 6)

```bash
# Normal migration path
else
  # Apply pending migrations (idempotent)
  npx prisma migrate deploy

  # Skip seeding
  echo "✅ Skipping seed - preserving existing data"
fi
```

**Used when:**
- `ENVIRONMENT=production` with existing data
- Unknown environment with existing data

**Safety:** ✅ **PRESERVES ALL DATA** - Default for production

### Path C: Initial Seed (Priority 3, 5)

```bash
# Production/unknown with empty database
npx prisma migrate deploy

if [ "$SHOULD_RESEED" = "true" ]; then
  npm run db:seed
fi
```

**Used when:**
- First deployment to production (empty database)
- Unknown environment with empty database

**Safety:** ✅ Safe - only seeds empty databases

## Environment Variable Impact

### `ENVIRONMENT=development`

**Cloud Build Config:** `cloudbuild-dev.yaml`
```yaml
substitutions:
  _ENVIRONMENT: development

steps:
  - "--update-env-vars"
  - "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT}"
```

**Effect:**
- `FORCE_RESET=true` (automatic)
- `SHOULD_RESEED=true` (automatic)
- Executes Path A (Force Reset)

**Log Output:**
```
🔄 Development environment detected - auto-reseeding enabled
   This ensures fresh demo data on every deploy
```

### `ENVIRONMENT=production`

**Cloud Build Config:** `cloudbuild-prod.yaml`
```yaml
substitutions:
  _ENVIRONMENT: production

steps:
  - "--set-env-vars"
  - "NODE_ENV=production,ENVIRONMENT=${_ENVIRONMENT}"
```

**Effect (with data):**
- `FORCE_RESET=false`
- `SHOULD_RESEED=false`
- Executes Path B (Migrate Only)

**Effect (empty):**
- `FORCE_RESET=false`
- `SHOULD_RESEED=true`
- Executes Path C (Initial Seed)

**Log Output (with data):**
```
🔒 Production environment detected - data preservation mode
   Use FORCE_RESEED=true to reset (for demos)
```

### `FORCE_RESEED=true` (Manual Override)

**How to Set:**
```bash
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --update-env-vars FORCE_RESEED=true
```

**Effect:**
- Overrides all other logic
- `FORCE_RESET=true` (forced)
- `SHOULD_RESEED=true` (forced)
- Executes Path A (Force Reset)

**Log Output:**
```
⚠️  FORCE_RESEED=true detected - forcing database reset and re-seed...
```

**⚠️ Important:** Remove after deployment!
```bash
gcloud run services update lobbyist-registration \
  --region us-west1 \
  --remove-env-vars FORCE_RESEED
```

## User Count Detection

```bash
# Node.js one-liner to check database
USER_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  prisma.\$connect()
    .then(() => prisma.user.count())
    .then(count => {
      console.log(count);
      process.exit(0);
    })
    .catch(err => {
      // If table doesn't exist, return 0
      console.log('0');
      process.exit(0);
    })
    .finally(() => prisma.\$disconnect());
" 2>/dev/null || echo "0")
```

**Returns:**
- `0` = Empty database (no users exist)
- `> 0` = Database has data

**Used to decide:**
- Should we seed production?
- Should we seed unknown environment?

## Logging Output Examples

### Development Deploy (Auto-Reseed)

```
🚀 Starting Lobbyist Registration System...
📦 Environment: development

🔄 Development environment detected - auto-reseeding enabled
   This ensures fresh demo data on every deploy

🔄 Performing database reset (force mode)...

⚠️  This will DELETE ALL DATA and recreate schema

Applying migration `20241017_initial_schema`
Applying migration `20241018_add_board_members`
Applying migration `20241019_add_violations`

✅ Database reset complete

🌱 Seeding database with demo data...
   Using 'Rule of 3' pattern (3 entities, 3 children each)

Created 12 users (3 per role)
Created 3 lobbyists (Maria Chen, Liam O'Sullivan, Aisha Patel)
Created 3 employers (TechCorp, GreenFuture, BuildRight)
Created 3 board members (Sarah Johnson, Michael Torres, Jennifer Kim)
Created 9 registrations
Created 36 expense reports
Created 9 board member calendars with 27 receipts
Created 3 violations
Created 2 appeals
Created 15 contract exceptions

✅ Database seeding complete!

🎯 Starting Next.js server...
```

### Production Deploy (Data Preservation)

```
🚀 Starting Lobbyist Registration System...
📦 Environment: production

🔒 Production environment detected - data preservation mode
   Use FORCE_RESEED=true to reset (for demos)

📊 Checking database for existing data...
✅ Database has data (User count: 45) - preserving data

🔧 Running database migrations...

Datamodel: Unchanged (no new migrations)

✅ Skipping seed - preserving existing data

🎯 Starting Next.js server...
```

### Production Force Reseed (Demo Mode)

```
🚀 Starting Lobbyist Registration System...
📦 Environment: production

⚠️  FORCE_RESEED=true detected - forcing database reset and re-seed...

🔄 Performing database reset (force mode)...

⚠️  This will DELETE ALL DATA and recreate schema

[... migration output ...]

✅ Database reset complete

🌱 Seeding database with demo data...
   Using 'Rule of 3' pattern (3 entities, 3 children each)

[... seed output ...]

✅ Database seeding complete!

🎯 Starting Next.js server...
```

## Safety Features

### Multiple Confirmation Points

1. **Environment variable check** - Must explicitly set ENVIRONMENT or FORCE_RESEED
2. **User count verification** - Checks database state before decisions
3. **Clear warning messages** - Logs show exactly what will happen
4. **Idempotent migrations** - Migrations can run multiple times safely

### Data Loss Prevention

| Scenario | Data Loss Risk | Protection |
|----------|----------------|------------|
| Dev deploy | Expected (intentional) | Automatic, documented |
| Prod deploy | **NONE** | Preserved by default |
| Prod force reseed | High (intentional) | Requires manual flag |
| Migration failure | None | Transactions, rollback |

### Rollback Procedures

**If dev auto-reseed fails:**
- Check startup logs for errors
- Verify DATABASE_URL secret is correct
- Test seed script locally
- Seed script errors don't prevent server startup

**If prod accidentally reseeded:**
1. Check Cloud SQL automatic backups (7-day retention)
2. Review Cloud Build logs to find when it happened
3. Restore from backup using gcloud:
   ```bash
   gcloud sql backups list --instance=lobbyist-registration-db
   gcloud sql backups restore BACKUP_ID \
     --backup-instance=lobbyist-registration-db \
     --backup-project=lobbyist-475218
   ```

**If production data corrupted:**
1. Stop accepting traffic to service
2. Restore from Cloud SQL backup
3. Review audit logs to understand what happened
4. Implement additional safeguards

## Testing the Flow

### Test Matrix

| Test Case | Environment | FORCE_RESEED | User Count | Expected Behavior |
|-----------|-------------|--------------|------------|-------------------|
| 1 | development | unset | 0 | Reset & Seed |
| 2 | development | unset | 12 | Reset & Seed |
| 3 | production | unset | 0 | Migrate & Seed |
| 4 | production | unset | 45 | Migrate only |
| 5 | production | true | 45 | Reset & Seed |
| 6 | unknown | unset | 0 | Migrate & Seed |
| 7 | unknown | unset | 12 | Migrate only |

### Test Commands

```bash
# Test Case 1-2: Dev auto-reseed
git push origin develop
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration-dev" --limit=50 | grep -A 5 "Development environment"

# Test Case 4: Prod data preservation
git push origin main
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" --limit=50 | grep -A 5 "Production environment"

# Test Case 5: Prod force reseed
gcloud run services update lobbyist-registration --region us-west1 --update-env-vars FORCE_RESEED=true
gcloud run deploy lobbyist-registration --region us-west1 --image <current-image>
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lobbyist-registration" --limit=50 | grep -A 5 "FORCE_RESEED"
gcloud run services update lobbyist-registration --region us-west1 --remove-env-vars FORCE_RESEED
```

## Related Documentation

- **[RESEEDING-GUIDE.md](RESEEDING-GUIDE.md)** - Comprehensive operations guide
- **[scripts/startup.sh](scripts/startup.sh)** - Implementation code
- **[cloudbuild-dev.yaml](cloudbuild-dev.yaml)** - Dev deployment config
- **[cloudbuild-prod.yaml](cloudbuild-prod.yaml)** - Prod deployment config
- **[prisma/seed.ts](prisma/seed.ts)** - Demo data generation
