#!/bin/bash
set -e

echo "🔧 Baselining Prisma migrations for production database..."
echo ""
echo "This script will mark all existing migrations as applied without running them."
echo "Use this when the database schema exists but migration history is missing."
echo ""

# Ensure we have the DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is required"
  exit 1
fi

# List all migrations
echo "📋 Found migrations:"
ls -1 prisma/migrations/ | grep -v migration_lock.toml

echo ""
echo "🔄 Resolving migration baseline..."

# Use Prisma's migrate resolve command to mark migrations as applied
# This tells Prisma "yes, these migrations have already been applied to the database"
for migration in $(ls -1 prisma/migrations/ | grep -v migration_lock.toml); do
  echo "  ✅ Marking $migration as applied..."
  npx prisma migrate resolve --applied "$migration" || true
done

echo ""
echo "✅ Migration baseline complete!"
echo ""
echo "Now you can run 'npx prisma migrate deploy' to apply any new migrations."
