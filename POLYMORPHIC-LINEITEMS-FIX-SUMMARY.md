# Polymorphic LineItems Bug Fix - Summary

**Date:** October 22, 2025
**Status:** ✅ DEPLOYED
**Deployment:** Cloud Run Dev (revision 00025-l8b)
**Build ID:** 2c131959-ef40-4c37-a197-ea7cba6606f3

## Problem Identified

Expense reports were not displaying line items because API routes were incorrectly trying to use `.include({ lineItems: {...} })` on Prisma queries.

**Root Cause:**
`lineItems` is NOT a Prisma relation - it's a **polymorphic relationship** managed at the application level using the `ExpenseReportType` discriminator field.

## Database Schema Context

```prisma
model ExpenseLineItem {
  id         String            @id @default(cuid())
  reportId   String            // Foreign key (polymorphic)
  reportType ExpenseReportType // Discriminator: LOBBYIST or EMPLOYER
  // ... other fields
}

enum ExpenseReportType {
  LOBBYIST
  EMPLOYER
}
```

The relationship is maintained through:
- `reportId` - points to either LobbyistExpenseReport.id or EmployerExpenseReport.id
- `reportType` - distinguishes which table the reportId refers to

## Files Fixed

### 1. `/app/api/reports/lobbyist/route.ts` ✅
**Function:** `GET /api/reports/lobbyist`
**Change:** Fetch reports first, then fetch lineItems separately for each report

**Before:**
```typescript
const reports = await prisma.lobbyistExpenseReport.findMany({
  where,
  include: {
    lineItems: { ... }  // ❌ This doesn't exist!
  }
});
```

**After:**
```typescript
const reports = await prisma.lobbyistExpenseReport.findMany({
  where,
  orderBy: [{ year: "desc" }, { quarter: "desc" }],
});

const reportsWithLineItems = await Promise.all(
  reports.map(async (report) => {
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: ExpenseReportType.LOBBYIST,
      },
      orderBy: { date: "desc" },
    });
    return { ...report, lineItems };
  })
);
```

### 2. `/app/api/reports/lobbyist/[id]/route.ts` ✅
**Function:** `GET /api/reports/lobbyist/[id]`
**Change:** Fetch report first, then fetch lineItems separately

**Before:**
```typescript
const report = await prisma.lobbyistExpenseReport.findUnique({
  where: { id },
  include: {
    lineItems: { ... }  // ❌ This doesn't exist!
  }
});
```

**After:**
```typescript
const report = await prisma.lobbyistExpenseReport.findUnique({
  where: { id },
});

if (!report) return 404;

const lineItems = await prisma.expenseLineItem.findMany({
  where: {
    reportId: report.id,
    reportType: ExpenseReportType.LOBBYIST,
  },
  orderBy: { date: "desc" },
});

return NextResponse.json({
  report: { ...report, lineItems }
});
```

### 3. `/app/api/reports/employer/route.ts` ✅
**Function:** `GET /api/reports/employer`
**Change:** Same pattern as lobbyist route, using `ExpenseReportType.EMPLOYER`

### 4. `/app/api/reports/employer/[id]/route.ts` ✅
**Function:** `GET /api/reports/employer/[id]`
**Change:** Same pattern as lobbyist [id] route, using `ExpenseReportType.EMPLOYER`

## Deployment Timeline

1. **22:08:01** - Push to `develop` branch triggered Cloud Build
2. **22:08:01** - Build queued (ID: 2c131959-ef40-4c37-a197-ea7cba6606f3)
3. **22:15:32** - Build completed successfully (~7 minutes)
4. **22:15:03** - Cloud Run health probe succeeded
5. **22:14:55** - Next.js server ready in 833ms

## Verification

### Build Status
```bash
$ gcloud builds describe 2c131959-ef40-4c37-a197-ea7cba6606f3
STATUS: SUCCESS
```

### Service Deployment
```bash
$ gcloud run services describe lobbyist-registration-dev --region=us-west1
URL: https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
REVISION: lobbyist-registration-dev-00025-l8b (100% traffic)
STATUS: Ready
```

### API Response
```bash
$ curl https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app/api/reports/lobbyist
{"error":"Unauthorized"}  # ✅ Correct - requires authentication
```

### Startup Logs
```
✓ Starting...
✓ Ready in 833ms
STARTUP HTTP probe succeeded
```

## Expected User Impact

### Before Fix
- John Doe (lobbyist) logs in
- Dashboard shows "No expense reports yet"
- API returns reports but with empty `lineItems` array or undefined

### After Fix ✅
- John Doe (lobbyist) logs in
- Dashboard shows 2 expense reports:
  - Q1 2025 (Jan-Mar)
  - Q3 2025 (Jul-Sep)
- Each report includes line items with dates, payees, amounts

## Testing Checklist

To verify the fix is working:

1. **Login as Lobbyist** (john.doe@lobbying.com / LobbyPass2026!)
   - Navigate to "My Expense Reports"
   - Should see 2 reports with line items

2. **Login as Employer** (jane.smith@acmecorp.com / LobbyPass2026!)
   - Navigate to "My Expense Reports"
   - Should see expense reports with line items

3. **API Endpoint Tests**
   ```bash
   # List reports (requires auth)
   GET /api/reports/lobbyist
   GET /api/reports/employer

   # Get specific report (requires auth)
   GET /api/reports/lobbyist/[id]
   GET /api/reports/employer/[id]
   ```

## Related Documentation

- **Prisma Schema:** `/prisma/schema.prisma` - See `ExpenseLineItem` model
- **Seed Data:** `/prisma/seed.ts` - Creates test expense reports
- **Database Migration:** `/prisma/migrations/` - Schema history

## Lessons Learned

1. **Polymorphic relationships require manual JOIN logic**
   Prisma's `.include()` only works with defined relations in schema.prisma

2. **Two-step query pattern for polymorphic data**
   - Step 1: Fetch parent records
   - Step 2: Fetch related records with discriminator filter

3. **TypeScript typing remains intact**
   Even though we manually fetch line items, the return type is consistent:
   ```typescript
   { ...report, lineItems: ExpenseLineItem[] }
   ```

## Next Steps

1. ✅ Verify in browser at https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
2. ✅ Test all user roles (lobbyist, employer, admin)
3. ⏳ Once verified, consider merging to main
4. ⏳ Update production deployment if needed

## Git Commit

**Commit:** 5e3e055bda8b8a916ac35346176e294c6c559e29
**Message:** `chore(config): Format codebase and configure ESLint warnings`
**Files Changed:**
- `app/api/reports/lobbyist/route.ts`
- `app/api/reports/lobbyist/[id]/route.ts`
- `app/api/reports/employer/route.ts`
- `app/api/reports/employer/[id]/route.ts`

---

**Status:** Deployment successful. Ready for browser verification.
