# Reset Demo Data

Reset the database to clean, comprehensive demo data with 3+ examples of each record type.

## Your Task

1. **Update package.json** - Add the `db:reset` command if it doesn't exist:
   ```json
   "db:reset": "npx prisma migrate reset --force"
   ```

2. **Enhance prisma/seed.ts** - Ensure comprehensive demo data with:
   - ✅ 3+ lobbyists (2 approved, 1 pending)
   - ✅ 3+ employers
   - ✅ 3+ lobbyist expense reports (different quarters/statuses)
   - ✅ 3+ employer expense reports (different quarters/statuses)
   - ✅ Realistic expense line items (4-5 per report)
   - ✅ Hour logs (showing 10-hour threshold scenarios)
   - ✅ 3+ notifications (different types)
   - ✅ Board member data (already comprehensive)
   - ✅ Violations and appeals (already comprehensive)
   - ✅ Contract exceptions (already comprehensive)

3. **Run the reset** - Execute the database reset:
   ```bash
   npm run db:reset
   ```

4. **Verify** - Check that all data categories have 3+ examples

## Important Notes
- The seed script already has good board member, violation, and appeal data
- Focus on adding: 3rd employer, more expense reports, line items, hour logs, notifications
- Make data realistic and demo-worthy (not just test data)
- Preserve the existing security notice header in seed.ts
- All test credentials should remain documented in output

## Success Criteria
- User can run `npm run db:reset` anytime to get pristine demo data
- All major data categories have 3+ examples
- Data looks polished for stakeholder demos
- Admin testing workflows (approvals, violations) can be tested repeatedly
