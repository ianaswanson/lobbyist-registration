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

if [ "$USER_COUNT" = "0" ]; then
  echo "📊 Database is empty (User count: 0)"
  echo ""

  # Check if migrations table exists to determine if we need migrations
  MIGRATIONS_EXIST=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    prisma.\$connect()
      .then(() => prisma.\$queryRaw\`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
      \`)
      .then(result => {
        console.log(result[0].count > 0 ? 'yes' : 'no');
        process.exit(0);
      })
      .catch(err => {
        console.log('no');
        process.exit(0);
      })
      .finally(() => prisma.\$disconnect());
  " 2>/dev/null || echo "no")

  if [ "$MIGRATIONS_EXIST" = "no" ]; then
    # Check if schema exists but migrations don't (manual setup case)
    TABLES_EXIST=$(node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      prisma.\$connect()
        .then(() => prisma.\$queryRaw\`
          SELECT COUNT(*) as count
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'User'
        \`)
        .then(result => {
          console.log(result[0].count > 0 ? 'yes' : 'no');
          process.exit(0);
        })
        .catch(err => {
          console.log('no');
          process.exit(0);
        })
        .finally(() => prisma.\$disconnect());
    " 2>/dev/null || echo "no")

    if [ "$TABLES_EXIST" = "yes" ]; then
      echo "✅ Database schema already exists (managed outside migrations)"
      echo ""
    else
      # Fresh database - run migrations first
      echo "🔧 Running database migrations..."
      npx prisma migrate deploy
      echo ""
    fi
  else
    echo "✅ Database schema already exists (managed outside migrations)"
    echo ""
  fi

  # Seed the database with test data
  echo "🌱 Seeding database with test data..."
  npm run db:seed

  echo ""
  echo "✅ Database initialization complete!"
  echo ""
else
  echo "✅ Database already has data (User count: $USER_COUNT)"
  echo "✅ Skipping migrations and seed"
  echo ""
fi

# Start the Next.js server
echo "🎯 Starting Next.js server..."
echo ""
exec node server.js
