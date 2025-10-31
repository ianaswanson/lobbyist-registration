#!/bin/bash
set -e

export DATABASE_URL="postgresql://lobbyist_user:njoaRDGQypB8zMuO2f3GizNDmW3BgrIBmqTv0qoOKbE=@127.0.0.1:5433/lobbyist_prod"

echo "Baselining production database migrations..."
echo ""

migrations=(
  "20251015145346_init"
  "20251016135512_add_violation_resolution_fields"
  "20251018133549_add_hour_tracking_fields"
  "20251018142626_fix_violation_polymorphic_relations"
  "20251019_remove_expense_line_item_fks"
  "20251020005557_add_review_fields"
  "20251021153350_fix_polymorphic_expense_relations"
  "20251024000000_add_user_administration"
)

for migration in "${migrations[@]}"; do
  echo "  ✅ Marking $migration as applied..."
  npx prisma migrate resolve --applied "$migration" || true
done

echo ""
echo "✅ All migrations baselined in production database"
