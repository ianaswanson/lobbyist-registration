#!/bin/sh
set -e

echo "🚀 Starting Lobbyist Registration System..."
echo ""

# Database path (relative to /app in container)
DB_PATH="/app/prisma/dev.db"

# Function to check if database has data
check_database() {
  if [ ! -f "$DB_PATH" ]; then
    echo "📊 Database file does not exist"
    return 1
  fi

  # Check if User table has any records
  # Using a simple query that works with sqlite3
  USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")

  if [ "$USER_COUNT" = "0" ]; then
    echo "📊 Database exists but is empty (User count: 0)"
    return 1
  else
    echo "✅ Database has data (User count: $USER_COUNT)"
    return 0
  fi
}

# Check and seed database if needed
if ! check_database; then
  echo ""
  echo "🌱 Database is empty or missing - initializing..."
  echo ""

  # Ensure prisma directory exists
  mkdir -p /app/prisma

  # Run migrations to create tables
  echo "📦 Running database migrations..."
  npx prisma migrate deploy

  # Seed the database with test data
  echo ""
  echo "🌱 Seeding database with test data..."
  npm run db:seed

  echo ""
  echo "✅ Database initialization complete!"
  echo ""
else
  echo "✅ Database already initialized - skipping seed"
  echo ""
fi

# Start the Next.js server
echo "🎯 Starting Next.js server..."
echo ""
exec node server.js
