#!/bin/bash
# scripts/reset-dev-db.sh
# Reset dev database without redeploying
#
# Usage: ./scripts/reset-dev-db.sh
#
# Prerequisites:
#   1. Cloud SQL Proxy running: cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432
#   2. gcloud CLI authenticated with access to Secret Manager
#   3. psql client installed for safety checks

set -e  # Exit on any error

# ============================================================================
# PSQL PATH SETUP
# ============================================================================
# Use Homebrew PostgreSQL@15 if psql not in PATH
if ! command -v psql &> /dev/null; then
  export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
fi

echo "🔄 Resetting dev database..."
echo ""

# ============================================================================
# SAFETY CHECK 1: Verify Cloud SQL Proxy is running
# ============================================================================
if ! lsof -i :5432 > /dev/null 2>&1; then
  echo "❌ Cloud SQL Proxy not running on port 5432"
  echo ""
  echo "Start it first:"
  echo "  cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432"
  exit 1
fi

# ============================================================================
# SAFETY CHECK 2: Fetch database credentials from Secret Manager
# ============================================================================
echo "🔑 Fetching database credentials from Secret Manager..."
DATABASE_URL_CLOUD=$(gcloud secrets versions access latest --secret="lobbyist-db-url-dev" 2>&1)
if [ $? -ne 0 ]; then
  echo "❌ Failed to fetch database credentials from Secret Manager"
  echo "   Error: $DATABASE_URL_CLOUD"
  echo ""
  echo "Ensure you're authenticated:"
  echo "  gcloud auth login"
  echo "  gcloud config set project lobbyist-475218"
  exit 1
fi

# Convert Cloud Run DATABASE_URL (Unix socket) to local TCP connection
# Extract password from URL: postgresql://user:PASSWORD@host/db?host=/cloudsql/...
PASSWORD=$(echo "$DATABASE_URL_CLOUD" | sed -n 's/.*:\([^@]*\)@.*/\1/p')
DATABASE_URL="postgresql://lobbyist_user:${PASSWORD}@127.0.0.1:5432/lobbyist_dev"

export DATABASE_URL

# ============================================================================
# SAFETY CHECK 3: Block production database
# ============================================================================
if [[ "$DATABASE_URL" == *"lobbyist_prod"* ]]; then
  echo "🚨 BLOCKED: This script cannot run against production database"
  echo "   Detected: lobbyist_prod in DATABASE_URL"
  exit 1
fi

# ============================================================================
# SAFETY CHECK 4: Verify connection to correct database
# ============================================================================
echo "🔍 Verifying database connection..."
CURRENT_DB=$(psql "$DATABASE_URL" -t -c "SELECT current_database();" 2>&1)
if [ $? -ne 0 ]; then
  echo "❌ Failed to connect to database"
  echo "   Error: $CURRENT_DB"
  echo ""
  echo "Verify Cloud SQL Proxy is connected to the correct instance:"
  echo "  cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432"
  exit 1
fi

CURRENT_DB=$(echo "$CURRENT_DB" | xargs)  # Trim whitespace
if [ "$CURRENT_DB" != "lobbyist_dev" ]; then
  echo "❌ Safety check failed: Not connected to lobbyist_dev database"
  echo "   Current database: $CURRENT_DB"
  echo "   Expected: lobbyist_dev"
  exit 1
fi

echo "✅ Connected to: $CURRENT_DB"
echo ""

# ============================================================================
# USER CONFIRMATION
# ============================================================================
echo "⚠️  WARNING: This will DELETE ALL DATA in the dev database"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Aborted by user"
  exit 0
fi

echo ""
echo "🗑️  Dropping and recreating schema..."

# ============================================================================
# RESET DATABASE SCHEMA
# ============================================================================
# Using db push with force-reset to avoid migration history issues
npx prisma db push --force-reset --accept-data-loss --skip-generate

if [ $? -ne 0 ]; then
  echo "❌ Failed to reset database schema"
  exit 1
fi

# ============================================================================
# SEED DATABASE
# ============================================================================
echo ""
echo "🌱 Seeding database with Rule of 3 demo data..."
npm run db:seed

if [ $? -ne 0 ]; then
  echo "❌ Failed to seed database"
  exit 1
fi

# ============================================================================
# VERIFICATION
# ============================================================================
echo ""
echo "🔍 Verifying seed data..."
LOBBYIST_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Lobbyist\";" 2>&1 | xargs)
EMPLOYER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Employer\";" 2>&1 | xargs)
BOARD_MEMBER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"BoardMember\";" 2>&1 | xargs)

echo "  Lobbyists: $LOBBYIST_COUNT"
echo "  Employers: $EMPLOYER_COUNT"
echo "  Board Members: $BOARD_MEMBER_COUNT"

if [ "$LOBBYIST_COUNT" -eq 0 ]; then
  echo ""
  echo "⚠️  Warning: No lobbyists found after seeding"
fi

echo ""
echo "✅ Dev database reset complete!"
echo ""
echo "Access the dev environment at:"
echo "  https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app"
