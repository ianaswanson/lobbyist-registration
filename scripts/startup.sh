#!/bin/sh
set -e

echo "🚀 Starting Lobbyist Registration System..."
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

# Check if force reseed is requested
if [ "$FORCE_RESEED" = "true" ]; then
  echo "⚠️  FORCE_RESEED=true detected - forcing database re-seed..."
  echo ""
  USER_COUNT="0"
else
  # Check if database has data
  USER_COUNT=$(check_database_data)
fi

# ALWAYS run migrations (they are idempotent - safe to re-run)
echo "🔧 Running database migrations..."
npx prisma migrate deploy
echo ""

# Only seed database if it's empty
if [ "$USER_COUNT" = "0" ]; then
  echo "📊 Database is empty (User count: 0)"
  echo ""
  echo "🌱 Seeding database with test data..."
  npm run db:seed
  echo ""
  echo "✅ Database initialization complete!"
  echo ""
else
  echo "✅ Database already has data (User count: $USER_COUNT)"
  echo "✅ Skipping seed (migrations already applied)"
  echo ""
fi

# Start the Next.js server
echo "🎯 Starting Next.js server..."
echo ""
exec node server.js
