#!/bin/bash
# Quick reset for dev database - simplified version without psql checks
# Uses Prisma exclusively

set -e

echo "🔄 Quick dev database reset..."
echo ""

# Check Cloud SQL Proxy is running
if ! lsof -i :5432 > /dev/null 2>&1; then
  echo "❌ Cloud SQL Proxy not running on port 5432"
  echo "Start it: cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432"
  exit 1
fi

# Get DATABASE_URL from Secret Manager and convert to local TCP format
echo "🔑 Fetching credentials..."
DB_URL_RAW=$(/opt/homebrew/bin/gcloud secrets versions access latest --secret="lobbyist-db-url-dev")

# Convert Cloud Run URL (Unix socket) to local TCP via Python helper
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_URL=$(echo "$DB_URL_RAW" | python3 "$SCRIPT_DIR/convert-db-url.py")
export DATABASE_URL

# Verify not production
if [[ "$DATABASE_URL" == *"lobbyist_prod"* ]]; then
  echo "🚨 BLOCKED: Cannot run against production"
  exit 1
fi

echo "✅ Connected to lobbyist_dev"
echo ""

# User confirmation
echo "⚠️  This will DELETE ALL DATA in dev database"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Aborted"
  exit 0
fi

echo ""
echo "🗑️  Resetting schema..."
npx prisma db push --force-reset --accept-data-loss --skip-generate

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Reset complete!"
echo ""
echo "Dev environment: https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app"
