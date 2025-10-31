#!/bin/sh
set -e

echo "🚀 Starting Lobbyist Registration System..."
echo "📦 Environment: ${ENVIRONMENT:-unknown}"
echo ""

# Function to check if database has data
check_database_data() {
  echo "📊 Checking database for existing data..."

  # Try to count users using Prisma
  # This approach works whether schema exists or not
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
        // If table doesn't exist or connection fails, return 0
        console.log('0');
        process.exit(0);
      })
      .finally(() => prisma.\$disconnect());
  " 2>/dev/null || echo "0")

  echo "$USER_COUNT"
}

# Determine reseeding strategy based on environment
SHOULD_RESEED="false"

# Check if force reseed is explicitly requested (takes highest priority)
if [ "$FORCE_RESEED" = "true" ]; then
  echo "⚠️  FORCE_RESEED=true detected - forcing database reset and re-seed..."
  echo ""
  SHOULD_RESEED="true"
  FORCE_RESET="true"
# Development environment: ALWAYS reset and reseed on every deploy
elif [ "$ENVIRONMENT" = "development" ]; then
  echo "🔄 Development environment detected - auto-reseeding enabled"
  echo "   This ensures fresh demo data on every deploy"
  echo ""
  SHOULD_RESEED="true"
  FORCE_RESET="true"
# Production environment: Only reseed if database is empty
elif [ "$ENVIRONMENT" = "production" ]; then
  echo "🔒 Production environment detected - data preservation mode"
  echo "   Use FORCE_RESEED=true to reset (for demos)"
  echo ""
  USER_COUNT=$(check_database_data)
  if [ "$USER_COUNT" = "0" ]; then
    echo "📊 Database is empty - initial seed will run"
    SHOULD_RESEED="true"
    FORCE_RESET="false"
  else
    echo "✅ Database has data (User count: $USER_COUNT) - preserving data"
    SHOULD_RESEED="false"
    FORCE_RESET="false"
  fi
# Unknown environment: Check if database is empty
else
  echo "⚠️  Unknown environment - checking database state"
  echo ""
  USER_COUNT=$(check_database_data)
  if [ "$USER_COUNT" = "0" ]; then
    SHOULD_RESEED="true"
    FORCE_RESET="false"
  else
    SHOULD_RESEED="false"
    FORCE_RESET="false"
  fi
fi

# Handle database migrations and seeding based on reset strategy
if [ "$FORCE_RESET" = "true" ]; then
  echo "🔄 Performing database reset (force mode)..."
  echo ""
  echo "⚠️  This will DELETE ALL DATA and recreate schema"
  echo ""

  # Force reset: drop all tables, recreate, and migrate
  npx prisma db push --force-reset --accept-data-loss
  echo ""
  echo "✅ Database reset complete"
  echo ""

  # IMPORTANT: db push --force-reset clears migration history
  # Baseline all migrations so future deployments work correctly
  echo "📝 Baselining migrations for future deployments..."
  for migration in $(ls -1 prisma/migrations/ | grep -v migration_lock.toml); do
    echo "  ✅ Marking $migration as applied..."
    npx prisma migrate resolve --applied "$migration" || true
  done
  echo ""
  echo "✅ Migration history synchronized"
  echo ""
else
  # Normal mode: run migrations
  echo "🔧 Running database migrations..."

  # Capture migration output to check for errors
  MIGRATION_OUTPUT=$(npx prisma migrate deploy 2>&1) || MIGRATION_FAILED=true

  if [ "$MIGRATION_FAILED" = "true" ]; then
    # Check if we got P3005 (schema exists but not tracked) or P3018 (column already exists)
    # Both indicate migration history is out of sync with actual schema
    if echo "$MIGRATION_OUTPUT" | grep -qE "P3005|P3018"; then
      echo ""
      echo "⚠️  Migration history out of sync - baselining existing migrations..."
      echo "   The database schema exists but migrations aren't tracked correctly."
      echo "   Marking all existing migrations as applied..."
      echo ""

      # Baseline all existing migrations (mark as applied without running)
      for migration in $(ls -1 prisma/migrations/ | grep -v migration_lock.toml); do
        echo "  ✅ Marking $migration as applied..."
        npx prisma migrate resolve --applied "$migration" || true
      done

      echo ""
      echo "✅ Migration baseline complete"
      echo ""

      # Now try migrations again - should only run new ones
      echo "🔧 Applying any new migrations..."
      npx prisma migrate deploy
    else
      # Some other error - show output and fail
      echo "❌ Migration failed with error:"
      echo "$MIGRATION_OUTPUT"
      exit 1
    fi
  else
    # Success on first try
    echo "$MIGRATION_OUTPUT"
  fi

  echo ""
  echo "✅ Database migrations complete"
  echo ""
fi

# Seed database if needed
if [ "$SHOULD_RESEED" = "true" ]; then
  echo "🌱 Seeding database with demo data..."
  echo "   Using 'Rule of 3' pattern (3 entities, 3 children each)"
  echo ""
  npm run db:seed
  echo ""
  echo "✅ Database seeding complete!"
  echo ""
else
  echo "✅ Skipping seed - preserving existing data"
  echo ""
fi

# Start the Next.js server
echo "🎯 Starting Next.js server..."
echo ""
exec node server.js
