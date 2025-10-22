# TypeScript Error Inventory - Phase A
## PostgreSQL Migration Preparation

**Date:** October 22, 2025
**Total Errors:** 47 TypeScript errors found
**Command:** `npx tsc --noEmit`

---

## Error Categories

### 1. Next.js 15 Async Params (7 errors) - 🔴 CRITICAL
**Priority:** Must fix before Phase C testing

**Problem:** Next.js 15 changed route params to be async (Promise-based), but our code treats them as synchronous.

**Files affected:**
1. `app/api/admin/registrations/[id]/route.ts` - GET handler
2. `app/api/admin/reports/[id]/route.ts` - GET handler
3. `app/api/appeals/[id]/route.ts` - POST handler
4. `app/api/contract-exceptions/[id]/route.ts` - GET handler
5. `app/api/reports/employer/[id]/route.ts` - GET handler
6. `app/api/reports/lobbyist/[id]/route.ts` - GET handler
7. `app/api/violations/[id]/route.ts` - GET handler

**Current pattern (BROKEN):**
```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // ❌ Wrong - params is a Promise in Next.js 15
}
```

**Required fix:**
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ Correct - await the Promise
}
```

**Impact on migration:**
- These API routes will be tested during Phase C
- Will cause runtime errors if not fixed
- Blocks successful E2E testing

**Fix required:** YES ✅

---

### 2. Prisma Query Issues - Missing Includes (28 errors) - 🟡 MEDIUM
**Priority:** Query bugs, but won't block schema migration

**Problem:** Prisma queries missing `include` statements for related data.

**Common errors:**
- `lineItems does not exist in type 'LobbyistExpenseReportInclude'`
- `lobbyist does not exist in type` (missing include)
- `employer does not exist in type` (missing include)
- `lobbyistPayments does not exist in type` (missing include)

**Files affected:**
- `app/(authenticated)/admin/review/reports/page.tsx` (6 errors)
- `app/(authenticated)/reports/employer/[id]/page.tsx` (12 errors)
- `app/(authenticated)/reports/employer/page.tsx` (2 errors)
- `app/(authenticated)/reports/lobbyist/[id]/page.tsx` (8 errors)
- `app/(authenticated)/reports/lobbyist/page.tsx` (2 errors)
- `app/api/admin/reports/[id]/route.ts` (2 errors)

**Example fix needed:**
```typescript
// Current (BROKEN)
const report = await prisma.lobbyistExpenseReport.findUnique({
  where: { id },
  // Missing include statement
})

// Fixed
const report = await prisma.lobbyistExpenseReport.findUnique({
  where: { id },
  include: {
    lineItems: true,
    lobbyist: { include: { user: true } }
  }
})
```

**Impact on migration:**
- These are runtime query bugs, not schema issues
- Won't block Prisma schema changes
- Will cause UI to show incomplete data
- E2E tests might fail on these pages

**Fix required:** NO for Phase A (can defer to later)
**Reason:** These don't block schema migration itself

---

### 3. Type Mismatches (7 errors) - 🟡 MEDIUM
**Priority:** TypeScript strictness issues

**Errors:**
- Date vs. string serialization (1 error)
  - `app/(authenticated)/admin/review/registrations/page.tsx:73` - createdAt type mismatch
- Implicit 'any' types (6 errors)
  - Various reduce/map callbacks missing type annotations
  - Files: employer/lobbyist report detail pages

**Impact on migration:**
- Won't block schema changes
- Won't cause runtime errors (just type safety)

**Fix required:** NO for Phase A

---

### 4. Missing Properties (3 errors) - 🟡 MEDIUM
**Priority:** Data model issues

**Errors:**
1. `app/(authenticated)/admin/compliance/page.tsx:186` - Missing `entityName` property on Violation
2. `app/(authenticated)/admin/compliance/page.tsx:188` - Null check on `issuedDate`

**Impact on migration:**
- UI bugs but won't block schema migration
- May need to add entityName to Violation model (separate issue)

**Fix required:** NO for Phase A

---

## Summary by Priority

| Priority | Count | Fix in Phase A? | Reason |
|----------|-------|-----------------|--------|
| 🔴 CRITICAL | 7 | ✅ YES | Next.js 15 async params - blocks E2E testing |
| 🟡 MEDIUM | 40 | ❌ NO | Query/type issues - don't block migration |
| Total | 47 | 7 to fix | Focus on critical blockers only |

---

## Phase A Recommendation

**Fix only the 7 critical API route files:**

1. ✅ `app/api/admin/registrations/[id]/route.ts` - Change params to async
2. ✅ `app/api/admin/reports/[id]/route.ts` - Change params to async
3. ✅ `app/api/appeals/[id]/route.ts` - Change params to async
4. ✅ `app/api/contract-exceptions/[id]/route.ts` - Change params to async
5. ✅ `app/api/reports/employer/[id]/route.ts` - Change params to async
6. ✅ `app/api/reports/lobbyist/[id]/route.ts` - Change params to async
7. ✅ `app/api/violations/[id]/route.ts` - Change params to async

**Defer the other 40 errors:**
- Prisma query issues (28 errors) - Don't block schema migration
- Type mismatches (7 errors) - Don't cause runtime errors
- Missing properties (3 errors) - Separate data model work
- Null checks (2 errors) - Minor safety issues

---

## Rationale

**Why fix only 7 errors?**

1. **Goal of Phase A:** Ensure schema migration won't fail
   - The 7 API route errors will cause E2E tests to fail
   - Prisma query errors are bugs but won't block migration

2. **Time efficiency:**
   - Fixing 7 files: ~1-2 hours
   - Fixing all 47 errors: ~6-8 hours
   - We want to get to PostgreSQL quickly

3. **Risk management:**
   - After migration to PostgreSQL, we'll run full E2E tests
   - We can fix remaining errors when they appear in testing
   - Better to fix incrementally than upfront

---

## Next Steps

1. **Get user approval** for this approach
2. **Fix 7 critical API route files** (async params)
3. **Test build:** `npm run build` should succeed (or have only non-critical warnings)
4. **Commit fixes**
5. **Mark Phase A complete:** `bd close lobbyist-registration-36`
6. **Move to Phase B:** GCP SRE agent creates Cloud SQL instance

---

## Files to Fix (Detailed)

### File 1: app/api/admin/registrations/[id]/route.ts
**Line:** GET handler signature
**Fix:** Change `{ params }: { params: { id: string } }` to `{ params }: { params: Promise<{ id: string }> }`
**Change:** Add `const { id } = await params;`

### File 2: app/api/admin/reports/[id]/route.ts
**Line:** GET handler signature
**Fix:** Same as File 1

### File 3: app/api/appeals/[id]/route.ts
**Line:** POST handler signature
**Fix:** Same as File 1

### File 4: app/api/contract-exceptions/[id]/route.ts
**Line:** GET handler signature
**Fix:** Same as File 1

### File 5: app/api/reports/employer/[id]/route.ts
**Line:** GET handler signature
**Fix:** Same as File 1

### File 6: app/api/reports/lobbyist/[id]/route.ts
**Line:** GET handler signature
**Fix:** Same as File 1

### File 7: app/api/violations/[id]/route.ts
**Line:** GET handler signature
**Fix:** Same as File 1

---

## Estimated Time

- **Reading files:** 15 minutes (7 files)
- **Making fixes:** 30 minutes (simple pattern)
- **Testing build:** 10 minutes
- **Total:** ~1 hour

---

**Created:** October 22, 2025
**Phase:** A - TypeScript Error Inventory
**Status:** Complete - awaiting approval to fix
