# Amendment Workflow - TODO for Fresh Context

**Issue:** `lobbyist-registration-61`
**Status:** In progress (needs testing/verification)

## Quick Context

Working on Issue #49 - Amendment workflow for submitted expense reports. Database design is **CORRECT**, but had implementation bugs.

## What Was Done

### ✅ Fixed
1. **Database Schema** - Added amendment fields (originalReportId, amendedByReportId, amendmentReason, AMENDED status)
2. **Removed Unique Constraint** - Allows multiple reports for same lobbyist/quarter/year (required for amendments)
3. **Amendment Creation APIs** - Added explicit UUID generation with `randomUUID()`
4. **Report Detail Pages** - Fixed Prisma relation names (Lobbyist not lobbyist, etc.)
5. **Form/API Integration** - Added reportId handling throughout
6. **Turbopack Cache** - Cleared `.next` to remove stale code

### Files Changed
- `prisma/schema.prisma` - Amendment fields
- `app/api/reports/lobbyist/[id]/amend/route.ts` - Lobbyist amendment endpoint
- `app/api/reports/employer/[id]/amend/route.ts` - Employer amendment endpoint
- `app/api/reports/lobbyist/route.ts` - Save endpoint with reportId handling
- `app/api/reports/employer/route.ts` - Employer save endpoint
- `app/(authenticated)/reports/*/[id]/page.tsx` - Detail pages with correct relations
- `app/(authenticated)/reports/*/edit/[id]/page.tsx` - Edit pages passing reportId
- `components/forms/expense-report/*Form.tsx` - Forms with reportId support
- `components/AmendmentDialog.tsx` - New amendment UI
- `components/ReportAmendmentSection.tsx` - New amendment history display

## What Needs Testing

### Critical Path Test
1. ✅ View a submitted report (Q2 2025)
2. ⚠️ Click "Submit Amendment" button
3. ⚠️ Enter amendment reason
4. ⚠️ Verify amendment created (new draft report)
5. ⚠️ Verify original marked as AMENDED
6. ⚠️ Edit the amendment draft
7. ⚠️ Save changes (should update the amendment, not create new)
8. ⚠️ Submit the amendment
9. ⚠️ View report list (should show both original AMENDED and new SUBMITTED)
10. ⚠️ View amendment history on report detail page

### Edge Cases
- [ ] Try to amend an already-amended report (should fail with message)
- [ ] Create amendment, then create NEW Q3 report (should not conflict)
- [ ] Multiple amendments (if allowed) maintain chain integrity
- [ ] Public pages show both versions

## Known Issues

**Last Error:** Server was on port 3002 instead of 3000 (now fixed on 3000)

## Database State

Run diagnostic: `npx tsx scripts/check-db-constraints.ts`

Expected output:
```
✅ No unique constraints exist
✅ Amendment chains are valid
⚠️ Found duplicate lobbyist reports (THIS IS EXPECTED)
   - Report 1: AMENDED status
   - Report 2: DRAFT/SUBMITTED status with originalReportId
```

## Key Design Points

1. **NO unique constraint on (lobbyistId, quarter, year)** - This is INTENTIONAL
2. **Duplicates are expected** - Original + Amendment(s)
3. **Bidirectional links** - originalReportId ↔ amendedByReportId maintain integrity
4. **Full audit trail** - Both versions preserved for transparency
5. **reportId in edit flow** - Critical for updating the right report

## Reference Documents

- `AMENDMENT-WORKFLOW-ANALYSIS.md` - Complete backend analysis
- `scripts/check-db-constraints.ts` - Database diagnostic tool
- Original issue in Beads: Use `bd show 49` and `bd show 61`

## Next Steps

1. **Test the workflow** - Walk through critical path
2. **Fix any errors** - Check server logs at `bd show 06a5e0` or BashOutput
3. **Verify database integrity** - Run diagnostic script
4. **Update documentation** - If any changes made
5. **Close issue** - `bd close 61` when confirmed working

## Current Server

- **URL:** http://localhost:3000
- **Status:** Running (background ID: 06a5e0)
- **Database:** Cloud SQL via proxy (background ID: c2af86)
- **Check logs:** `BashOutput bash_id=06a5e0`
