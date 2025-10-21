# E2E Test Coverage - Lobbyist Registration System

**Last Updated:** 2025-10-21

## Purpose
This document tracks all Playwright E2E tests - what exists, what's passing, what needs fixes, and what still needs to be created.

---

## Test Files Status

### ✅ Existing Test Files

#### 1. `tests/e2e/lobbyist-expense-report.spec.ts`
**Status:** 9 tests total - 4 passing ✅, 5 need minor fixes ⚠️

**Passing Tests:**
- ✅ Should validate that expenses are required
- ✅ Should show loading states during submission
- ✅ Should display total amount correctly
- ✅ Should allow removing expenses

**Tests Needing Fixes:**
- ⚠️ Should allow lobbyist to submit expense report
  - Issue: Looking for "Q1 2025" as single string, but it's in separate table cells
  - Fix needed: Update selector to find cells separately

- ⚠️ Should allow lobbyist to save draft
  - Issue: Expects expenses to remain visible after save, but form behavior changed
  - Fix needed: Update assertion or behavior expectation

- ⚠️ Should allow editing a draft report
  - Issue: Can't find Dashboard link after save
  - Fix needed: Wait for redirect or update navigation flow

- ⚠️ Should not allow editing a submitted report
  - Issue: Can't find submitted report in list
  - Fix needed: Verify server-side rendering refresh or add wait

- ⚠️ Should load existing expenses when changing quarter/year
  - Issue: Strict mode violation - $150.00 appears in multiple places
  - Fix needed: Use more specific selector (table cell vs summary)

**Tests Recently Added:**
- ✅ Editing workflow test (create draft, navigate away, edit, verify persistence)
- ✅ Prevent editing submitted reports
- ✅ Auto-load existing data when changing quarter/year

#### 2. `tests/e2e/my-violations.spec.ts`
**Status:** 8 tests total - 1 passing ✅, 7 skipped (awaiting test data) ⏸️

**Passing Tests:**
- ✅ Should display violations list (basic navigation)

**Skipped Tests (need seed data):**
- ⏸️ Should submit an appeal for an issued violation
- ⏸️ Should validate appeal reason is required
- ⏸️ Should display appeal deadline correctly
- ⏸️ Should show different violation statuses with correct styling
- ⏸️ Should display violation details correctly
- ⏸️ Should not show appeal button for non-appealable violations
- ⏸️ Should close appeal dialog when clicking cancel

**Prerequisites to unskip:**
- Add test violations to `prisma/seed.ts`
- Create violations with various statuses (ISSUED, PAID, APPEALED, etc.)
- Link violations to john.doe@lobbying.com lobbyist

#### 3. `tests/e2e/admin-review.spec.ts`
**Status:** 13 tests - Status unknown (not tested in this session)

**Known Tests:**
- Admin registration review workflow
- Admin expense report review workflow
- Navigation between review pages
- Role-based access control

---

## 🚧 Missing Test Files

### Priority 1: Core Workflows

#### `tests/e2e/employer-expense-report.spec.ts` (NOT CREATED)
**Priority:** HIGH - Employer reporting is core functionality

**Tests Needed:**
- Should display employer expense report form
- Should add direct expenses (food/entertainment)
- Should add lobbyist payments
- Should calculate total correctly (expenses + payments)
- Should save as draft
- Should submit report
- Should redirect after submission
- Should allow editing draft reports
- Should prevent editing submitted reports
- Should load existing data when changing quarter/year
- Should validate required fields
- Should show loading states

**Estimated:** ~12 tests

#### `tests/e2e/lobbyist-registration.spec.ts` (NOT CREATED)
**Priority:** HIGH - Registration is required before any other lobbyist action

**Tests Needed:**
- Should display registration form
- Should validate required fields
- Should validate email format
- Should save registration
- Should handle file upload (authorization letter)
- Should update existing registration
- Should track 30-day update requirement
- Should calculate 10-hour threshold
- Should enforce 3-day registration deadline

**Estimated:** ~9 tests

### Priority 2: Public Features

#### `tests/e2e/search.spec.ts` (NOT CREATED)
**Priority:** MEDIUM - Public transparency is key value

**Tests Needed:**
- Should search lobbyists by name
- Should search employers by name
- Should filter by date range
- Should filter by expense amount
- Should export results to CSV
- Should show/hide advanced filters
- Should clear filters
- Should display lobbyist details
- Should display employer details

**Estimated:** ~9 tests

#### `tests/e2e/exemption-checker.spec.ts` (NOT CREATED)
**Priority:** MEDIUM - First step in user journey

**Tests Needed:**
- Should check hours and determine exemption status
- Should show "Exempt" result for <10 hours
- Should show "Must Register" for ≥10 hours
- Should show authorization requirement for employees
- Should handle edge cases (exactly 10 hours)
- Should redirect to sign in when ready to register

**Estimated:** ~6 tests

#### `tests/e2e/board-calendars.spec.ts` (NOT CREATED)
**Priority:** MEDIUM - Ordinance §3.001 requirement

**Tests Needed:**
- Should display board member calendars (public access)
- Should filter by board member
- Should show calendar events
- Should show lobbying receipts >$50
- Should filter by quarter
- Should enforce 1-year retention display

**Estimated:** ~6 tests

### Priority 3: Board Member Features

#### `tests/e2e/board-member-calendar-form.spec.ts` (NOT CREATED)
**Priority:** MEDIUM - Board member workflow

**Tests Needed:**
- Should add calendar events
- Should add lobbying receipts
- Should submit quarterly
- Should save as draft
- Should validate required fields
- Should enforce $50 threshold for receipts

**Estimated:** ~6 tests

### Priority 4: Admin Features

#### `tests/e2e/admin-compliance.spec.ts` (NOT CREATED)
**Priority:** LOW - Admin monitoring, already has review tests

**Tests Needed:**
- Should display compliance dashboard
- Should show pending registrations count
- Should show pending reports count
- Should show overdue reports
- Should show upcoming deadlines
- Should navigate to review pages

**Estimated:** ~6 tests

#### `tests/e2e/admin-violations.spec.ts` (NOT CREATED)
**Priority:** LOW - Admin enforcement

**Tests Needed:**
- Should create new violation
- Should issue fine (max $500)
- Should send educational letter
- Should view violation history
- Should filter violations by status
- Should track appeal status

**Estimated:** ~6 tests

#### `tests/e2e/admin-appeals.spec.ts` (NOT CREATED)
**Priority:** LOW - Admin appeal processing

**Tests Needed:**
- Should list pending appeals
- Should approve appeal (overturn violation)
- Should deny appeal (uphold violation)
- Should track 30-day appeal window
- Should add resolution notes

**Estimated:** ~5 tests

---

## Test Data Requirements

### Seed Script Updates Needed (`prisma/seed.ts`)

#### Violations Test Data
```typescript
// Add to seed script:
- 2-3 violations for john.doe@lobbying.com with status ISSUED (appealable)
- 1 violation with status PAID (not appealable)
- 1 violation with status APPEALED (under review)
- Include issuedDate, fineAmount, description, violationType
```

#### Additional Reports for Testing
```typescript
// Add to seed script:
- Draft lobbyist reports (for editing tests)
- Draft employer reports (for editing tests)
- Submitted reports from previous quarters (for list display)
```

#### Board Member Calendar Data
```typescript
// Already exists in seed script (added in previous session):
- Commissioner Williams calendar events + receipts
- Commissioner Chen calendar events + receipts
```

---

## Test Coverage Summary

### Current State
- **Test Files Created:** 3
- **Total Tests Written:** 30
- **Tests Passing:** 5 ✅
- **Tests Needing Fixes:** 5 ⚠️
- **Tests Skipped (need data):** 7 ⏸️
- **Tests in Unknown State:** 13 ❓

### Target State
- **Test Files Needed:** 11 total (3 exist, 8 to create)
- **Estimated Total Tests:** ~100+
- **Priority 1 (Core):** 2 files, ~21 tests
- **Priority 2 (Public):** 3 files, ~21 tests
- **Priority 3 (Board):** 1 file, ~6 tests
- **Priority 4 (Admin):** 2 files, ~11 tests

---

## Next Steps (Recommended Order)

### Immediate (This Session)
1. ✅ Created My Violations tests (done)
2. 🔄 Fix 5 lobbyist expense report tests (in progress)

### Short Term (Next Session)
1. Create `tests/e2e/employer-expense-report.spec.ts` (~12 tests)
2. Add test data to seed script (violations, draft reports)
3. Unskip 7 My Violations tests
4. Create `tests/e2e/lobbyist-registration.spec.ts` (~9 tests)

### Medium Term
1. Create public feature tests (search, exemption, board calendars)
2. Create board member workflow tests
3. Run full test suite and fix any issues
4. Document test coverage percentage

### Long Term (Phase 2)
1. Add admin workflow tests
2. Add integration tests for APIs
3. Add performance tests
4. Set up CI/CD test automation

---

## Notes

### Navigation Changes Applied (2025-10-21)
All tests updated to use new navigation structure:
- Old: Direct link `text=Quarterly Reports`
- New: Dropdown `button:has-text("My Work")` → `text=My Reports`
- All tests now click "New Report" button to access form

### API Fixes Applied (2025-10-21)
- Fixed violations API: `status: "ACTIVE"` → `status: "ISSUED"`
- Fixed violations API: `issueDate` → `issuedDate`

### Form Behavior Changes (2025-10-21)
- Final report submission now redirects to list page after 1.5s
- Draft save stays on form page (no redirect)
- Success messages display for 3-5 seconds before clearing

---

**Status:** 🟡 IN PROGRESS - Systematic test coverage expansion underway
