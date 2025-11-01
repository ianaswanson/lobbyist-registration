#!/bin/bash
# Quick reset for PRODUCTION database
# ⚠️  WARNING: This will DELETE ALL DATA in production

set -e

echo "🚨 PRODUCTION DATABASE RESET"
echo "⚠️  This will DELETE ALL DATA in production and reseed with demo data"
echo ""

# Check Cloud SQL Proxy is running on port 5433
if ! lsof -i :5433 > /dev/null 2>&1; then
  echo "❌ Cloud SQL Proxy not running on port 5433"
  echo "Start it: cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5433 &"
  exit 1
fi

# Get DATABASE_URL from Secret Manager and convert to local TCP format
echo "🔑 Fetching production credentials..."
DB_URL_RAW=$(/opt/homebrew/bin/gcloud secrets versions access latest --secret="lobbyist-db-url")

# Convert Cloud Run URL (Unix socket) to local TCP via Python helper
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_URL=$(echo "$DB_URL_RAW" | python3 "$SCRIPT_DIR/convert-db-url.py" --port 5433)
export DATABASE_URL

# Verify production
if [[ "$DATABASE_URL" != *"lobbyist_prod"* ]]; then
  echo "🚨 ERROR: Not connected to production database"
  exit 1
fi

echo "✅ Connected to lobbyist_prod"
echo ""

# Triple confirmation for production
echo "⚠️⚠️⚠️  FINAL WARNING  ⚠️⚠️⚠️"
echo "This will DELETE ALL DATA in PRODUCTION database"
echo "Database: lobbyist_prod"
echo "All records will be replaced with demo data"
echo ""
read -p "Type 'RESET PRODUCTION' to continue: " CONFIRM

if [ "$CONFIRM" != "RESET PRODUCTION" ]; then
  echo "❌ Aborted (confirmation did not match)"
  exit 0
fi

echo ""
echo "🗑️  Resetting production schema..."
export PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes"
npx prisma db push --force-reset --accept-data-loss --skip-generate

echo ""
echo "🌱 Seeding production database..."
npm run db:seed

echo ""
echo "✅ Production reset complete!"
echo ""
echo "Production environment: https://lobbyist-registration-zzp44w3snq-uw.a.run.app"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@multnomah.gov / admin123"
echo "  Lobbyist: john.doe@lobbying.com / lobbyist123"
echo "  Employer: contact@techcorp.com / employer123"
echo "  Board: commissioner@multnomah.gov / board123"
echo ""
