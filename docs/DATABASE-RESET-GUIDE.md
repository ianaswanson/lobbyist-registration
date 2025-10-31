# Database Reset Guide

## Overview

This guide explains how to reset the development database without triggering a Cloud Run deployment.

## Use Cases

- **After demos:** Restore pristine demo data
- **After testing:** Clean up test data
- **Development iteration:** Fresh start between feature development
- **Data corruption:** Recover from bad migrations or seed data

## Prerequisites

### 1. Install Cloud SQL Proxy

**macOS:**
```bash
brew install cloud-sql-proxy
```

**Linux:**
```bash
curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/
```

### 2. Install PostgreSQL Client (psql)

**macOS:**
```bash
brew install postgresql@17
```

**Linux:**
```bash
sudo apt-get install postgresql-client
```

### 3. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project lobbyist-475218
```

## Quick Reset (Development Only)

### Step 1: Start Cloud SQL Proxy

In a **separate terminal window**, run:

```bash
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
```

**Keep this terminal open** while running the reset script.

### Step 2: Run Reset Script

```bash
npm run db:reset:dev
```

Or directly:

```bash
./scripts/reset-dev-db.sh
```

### Step 3: Confirm Reset

The script will:
1. ✅ Check Cloud SQL Proxy is running
2. ✅ Fetch credentials from Secret Manager
3. ✅ Verify connection to `lobbyist_dev` database
4. ⚠️  **Ask for confirmation** (type `yes` to proceed)
5. 🗑️  Drop and recreate schema
6. 🌱 Seed with Rule of 3 demo data
7. 🔍 Verify seed data counts

**Expected output:**
```
🔄 Resetting dev database...

🔑 Fetching database credentials from Secret Manager...
🔍 Verifying database connection...
✅ Connected to: lobbyist_dev

⚠️  WARNING: This will DELETE ALL DATA in the dev database

Are you sure you want to continue? (yes/no): yes

🗑️  Dropping and recreating schema...
🌱 Seeding database with Rule of 3 demo data...
🔍 Verifying seed data...
  Lobbyists: 3
  Employers: 3
  Board Members: 3

✅ Dev database reset complete!

Access the dev environment at:
  https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
```

## Safety Features

The script includes multiple safety checks:

### 1. Cloud SQL Proxy Verification
Ensures proxy is running on port 5432 before attempting reset.

### 2. Production Database Protection
**Blocks execution** if connected to `lobbyist_prod` database.

### 3. Database Name Verification
Verifies connection to `lobbyist_dev` before proceeding.

### 4. User Confirmation
Requires explicit `yes` confirmation before deleting data.

### 5. Post-Reset Verification
Validates seed data was created successfully.

## Troubleshooting

### Error: "Cloud SQL Proxy not running on port 5432"

**Solution:** Start Cloud SQL Proxy in a separate terminal:
```bash
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
```

### Error: "Failed to fetch database credentials from Secret Manager"

**Solution:** Authenticate with Google Cloud:
```bash
gcloud auth login
gcloud config set project lobbyist-475218
```

Verify you have access to Secret Manager:
```bash
gcloud secrets list
```

### Error: "Safety check failed: Not connected to lobbyist_dev database"

**Solution:** Check your Cloud SQL Proxy connection. Ensure it's pointing to the correct instance:
```bash
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
```

### Error: "Failed to reset database schema"

**Possible causes:**
1. Active connections to the database (close Prisma Studio, other clients)
2. Database permission issues
3. Schema corruption

**Solution:**
1. Stop all database clients (Prisma Studio, pgAdmin, etc.)
2. Kill Cloud SQL Proxy and restart it
3. Try again

### Warning: "No lobbyists found after seeding"

**Possible causes:**
1. Seed script failed silently
2. Database constraints preventing data insertion
3. Seed data script errors

**Solution:**
1. Check seed script output for errors
2. Run seed manually: `npm run db:seed`
3. Check database logs in Cloud Console

## Production Database Resets

**⚠️ NEVER use this script for production resets.**

Production database operations must:
- Go through proper change management
- Require multiple approvals
- Use scheduled maintenance windows
- Have verified backups
- Be executed via Cloud Build with audit logs

For production data management, contact the SRE team.

## Alternative Methods

### Method 1: Local Development Reset
If you're using a local PostgreSQL instance (not Cloud SQL):

```bash
npm run db:reset
```

This uses Prisma's built-in reset command.

### Method 2: Cloud Build Deployment
Push to `develop` branch to trigger full deployment with database reset:

```bash
git push origin develop
```

**Duration:** 3-5 minutes (includes Cloud Build, container deployment, Cloud Run startup)

**Use when:** You need to test the full deployment pipeline, not just database state.

### Method 3: Manual Cloud SQL Console
Use the Google Cloud Console to:
1. Connect to Cloud SQL instance
2. Open SQL editor
3. Drop and recreate tables manually
4. Run seed script via Cloud Run console

**Not recommended:** Error-prone and no safety checks.

## Script Maintenance

The reset script is located at:
```
/Users/ianswanson/ai-dev/lobbyist-registration/scripts/reset-dev-db.sh
```

**Last updated:** October 30, 2025

**Maintained by:** SRE team

## Related Documentation

- [DEPLOYMENT-PLAN.md](../DEPLOYMENT-PLAN.md) - Full deployment guide
- [QUICKSTART-DEPLOY.md](../QUICKSTART-DEPLOY.md) - Fast-track deployment
- [CLAUDE.md](../CLAUDE.md) - Development guidelines (see "Database Management" section)
- [MONITORING.md](../MONITORING.md) - Database monitoring setup

## Support

For issues with this script:
1. Check troubleshooting section above
2. Review Cloud SQL logs in Google Cloud Console
3. Check Cloud SQL Proxy logs in terminal
4. Contact SRE team if issue persists

## Audit Log

| Date       | Change                                      | Author        |
|------------|---------------------------------------------|---------------|
| 2025-10-30 | Initial script creation with safety checks  | Ian Swanson   |
