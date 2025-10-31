# API Implementation Roadmap
## Replacing Browser Alerts with Proper Backend Integration

**Status:** Analysis Complete
**Date:** October 19, 2025
**Total Alert Usages:** 40+ instances across 12 files

---

## Executive Summary

Currently, the application has two types of incomplete implementations:

1. **Partially Implemented** (10 instances) - Have working API routes but use `alert()` for user feedback
2. **Completely Fake** (30 instances) - No backend implementation, just browser alerts showing what *would* happen

This document outlines what needs to be built to complete the application.

---

## Category 1: Partially Implemented ✅ (Just Need Better UX)

These features have working API routes and database operations, but use browser `alert()` dialogs for user feedback. We just need to replace alerts with proper toast notifications.

### Files to Fix:
- `app/(authenticated)/admin/violations/ViolationsClient.tsx` (4 alerts)
- `app/(authenticated)/admin/contract-exceptions/ContractExceptionsClient.tsx` (9 alerts)
- `app/(authenticated)/admin/appeals/AppealsClient.tsx` (8 alerts)
- `app/(authenticated)/my-violations/MyViolationsClient.tsx` (3 alerts)

### Solution: Install Toast Library

**Quick Win:** Install `sonner` (React toast library) and replace alerts

```bash
npm install sonner
```

Then replace:
```tsx
// Before:
alert("Violation issued successfully!")

// After:
import { toast } from "sonner"
toast.success("Violation issued successfully!")
```

**Estimated Time:** 2-3 hours to replace all alerts in these 4 files

---

## Category 2: Completely Fake ❌ (Need Full Implementation)

These features have NO backend implementation. The forms collect data, show an alert, and then do nothing. The data is lost.

### 🔴 Priority 1: Admin Review Actions (CRITICAL)

**Screenshot Issue:** This is what you're seeing - "Registration approved for Sarah Johnson"

#### Files:
- `components/admin/ReviewRegistrationsList.tsx`
- `components/admin/ReviewReportsList.tsx`

#### What's Missing:

**1. Registration Review API** (`/api/admin/registrations/[id]/route.ts`)

```typescript
// POST /api/admin/registrations/[id]
// Actions: approve, reject
// Database updates needed:
// - Update Lobbyist status: PENDING → APPROVED or REJECTED
// - Update LobbyistEmployer status
// - Send email notification to lobbyist
// - Create audit log entry
```

**2. Report Review API** (`/api/admin/reports/[id]/route.ts`)

```typescript
// POST /api/admin/reports/[id]
// Actions: approve, reject, request_clarification
// Database updates needed:
// - Update LobbyistExpenseReport or EmployerExpenseReport status
// - Send email notification
// - If clarification requested, create ClarificationRequest record
// - Create audit log entry
```

#### Database Schema Additions Needed:

```prisma
// Add to Lobbyist model
enum LobbyistStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

model Lobbyist {
  // ... existing fields
  status LobbyistStatus @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  rejectionReason String?
}

// Add to expense report models
enum ReportStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  CLARIFICATION_REQUESTED
}

model LobbyistExpenseReport {
  // ... existing fields
  status ReportStatus @default(SUBMITTED)
  reviewedBy String?
  reviewedAt DateTime?
  reviewNotes String?
}

// New model for clarification requests
model ClarificationRequest {
  id String @id @default(cuid())
  reportId String
  reportType String // "LOBBYIST" or "EMPLOYER"
  requestedBy String // Admin user ID
  question String
  response String?
  respondedAt DateTime?
  createdAt DateTime @default(now())
}
```

**Estimated Time:** 8-12 hours

---

### 🟡 Priority 2: Expense Report Submissions (HIGH)

#### Files:
- `components/forms/expense-report/LobbyistExpenseReportForm.tsx`
- `components/forms/expense-report/EmployerExpenseReportForm.tsx`

#### What's Missing:

**1. Lobbyist Expense Report API** (`/api/reports/lobbyist/route.ts`)

```typescript
// POST /api/reports/lobbyist
// Save draft or submit final report
// Database operations:
// - Create/Update LobbyistExpenseReport record
// - Create ExpenseLineItem records (bulk insert)
// - Calculate totals
// - Set status (DRAFT or SUBMITTED)
// - Send confirmation email if submitted
```

**2. Employer Expense Report API** (`/api/reports/employer/route.ts`)

```typescript
// POST /api/reports/employer
// Save draft or submit final report
// Database operations:
// - Create/Update EmployerExpenseReport record
// - Create ExpenseLineItem records
// - Create EmployerLobbyistPayment records
// - Calculate totals
// - Validate against lobbyist reports (cross-reference)
```

#### Database Schema Already Exists ✅

Good news: The schema for these is already defined in `prisma/schema.prisma`:
- `LobbyistExpenseReport`
- `EmployerExpenseReport`
- `ExpenseLineItem`
- `EmployerLobbyistPayment`

**Just need to create the API routes!**

**Estimated Time:** 6-8 hours

---

### 🟡 Priority 3: Lobbyist Registration (HIGH)

#### File:
- `components/forms/LobbyistRegistrationWizard.tsx`

#### What's Missing:

**API Route:** `/api/register/lobbyist/route.ts`

```typescript
// POST /api/register/lobbyist
// Multi-step registration submission
// Database operations:
// - Create Lobbyist record (if not exists)
// - Create Employer record (if not exists)
// - Create LobbyistEmployer relationship
// - Upload authorization document to file storage
// - Set status to PENDING (awaiting admin review)
// - Send confirmation email
// - Send notification to admin
```

#### Database Schema Already Exists ✅

Schema is defined:
- `Lobbyist`
- `Employer`
- `LobbyistEmployer`

**File Upload Integration Needed:**
- Currently using `/api/upload` route
- Need to associate uploaded files with lobbyist registration
- Store file paths in `authorizationDocumentUrl` field

**Estimated Time:** 6-8 hours

---

### 🟢 Priority 4: Board Member Forms (MEDIUM)

#### File:
- `components/forms/board-member/BoardMemberCalendarForm.tsx`

#### What's Missing:

**API Route:** `/api/board-member/calendar/route.ts`

```typescript
// POST /api/board-member/calendar
// Submit quarterly calendar and receipts
// Database operations:
// - Create BoardCalendarEntry records (bulk)
// - Create BoardLobbyingReceipt records (bulk)
// - Associate with current BoardMember
// - Set quarter/year metadata
// - Mark as publicly posted (after 1-year retention)
```

#### Database Schema Already Exists ✅

Schema is defined:
- `BoardMember`
- `BoardCalendarEntry`
- `BoardLobbyingReceipt`

**Estimated Time:** 4-6 hours

---

## Implementation Priority Summary

| Priority | Feature | Complexity | Impact | Time Estimate |
|----------|---------|------------|--------|---------------|
| 🔴 **P1** | Admin Review (Registrations) | High | Critical | 4-6 hours |
| 🔴 **P1** | Admin Review (Reports) | High | Critical | 4-6 hours |
| 🟡 **P2** | Lobbyist Expense Reports | Medium | High | 3-4 hours |
| 🟡 **P2** | Employer Expense Reports | Medium | High | 3-4 hours |
| 🟡 **P3** | Lobbyist Registration | Medium | High | 6-8 hours |
| 🟢 **P4** | Board Member Calendar | Low | Medium | 4-6 hours |
| 🟢 **Quick Win** | Replace Alerts with Toasts | Low | UX | 2-3 hours |

**Total Estimated Time:** 26-37 hours

---

## Recommended Implementation Order

### Week 1: Foundation
1. ✅ **Install toast library** (sonner) - 30 min
2. 🔴 **Admin review APIs** (registration & reports) - 8-12 hours
3. 🎨 **Replace alerts with toasts** in existing features - 2-3 hours

### Week 2: Core Features
4. 🟡 **Lobbyist registration API** - 6-8 hours
5. 🟡 **Lobbyist expense report API** - 3-4 hours
6. 🟡 **Employer expense report API** - 3-4 hours

### Week 3: Final Features
7. 🟢 **Board member calendar API** - 4-6 hours
8. 🧪 **End-to-end testing** - 4-6 hours
9. 📝 **Update documentation** - 2 hours

---

## Technical Implementation Guide

### Step 1: Install Toast Notifications

```bash
npm install sonner
```

Add to `app/layout.tsx`:
```tsx
import { Toaster } from "sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

### Step 2: Create API Route Template

All API routes should follow this pattern:

```typescript
// app/api/[feature]/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Check role authorization
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // 3. Parse and validate request body
    const body = await req.json()
    // ... validation logic

    // 4. Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // ... database operations
    })

    // 5. Send notifications (if needed)
    // await sendEmail(...)

    // 6. Return success response
    return NextResponse.json(result)

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Step 3: Database Migrations

Create migration for new status fields:

```bash
npx prisma migrate dev --name add_review_statuses
```

### Step 4: Email Notifications

Create email templates in `lib/email-templates/`:
- `registration-approved.tsx`
- `registration-rejected.tsx`
- `report-approved.tsx`
- `clarification-requested.tsx`

---

## Testing Checklist

### For Each Feature:
- [ ] Can create record successfully
- [ ] Data persists to database
- [ ] Can retrieve record via API
- [ ] Success message shown (toast)
- [ ] Error handling works
- [ ] Email notifications sent
- [ ] Audit log created
- [ ] Works across user roles
- [ ] Form resets after submission
- [ ] Loading states work
- [ ] Validation prevents invalid data

---

## Files That Need Creation

### New API Routes:
1. `app/api/admin/registrations/[id]/route.ts` - Approve/reject registrations
2. `app/api/admin/reports/[id]/route.ts` - Review expense reports
3. `app/api/reports/lobbyist/route.ts` - Submit lobbyist reports
4. `app/api/reports/employer/route.ts` - Submit employer reports
5. `app/api/register/lobbyist/route.ts` - Complete registration
6. `app/api/board-member/calendar/route.ts` - Submit calendar/receipts

### Database Migrations:
1. `prisma/migrations/XXX_add_review_statuses/` - Add status enums
2. `prisma/migrations/XXX_add_clarification_requests/` - New table

### Email Templates:
1. `lib/email-templates/registration-approved.tsx`
2. `lib/email-templates/registration-rejected.tsx`
3. `lib/email-templates/report-submitted.tsx`
4. `lib/email-templates/report-approved.tsx`
5. `lib/email-templates/clarification-requested.tsx`

### Utility Functions:
1. `lib/send-email.ts` - Email sending service
2. `lib/audit-log.ts` - Audit trail helper
3. `lib/file-storage.ts` - File upload management

---

## Current State vs. Desired State

### Current State (Fake):
```
User fills form → Click Submit → alert("Success!") → Data lost → No database update
```

### Desired State (Real):
```
User fills form → Click Submit →
  → Loading spinner shown
  → POST to API route
  → Database transaction
  → Email notification
  → Success toast
  → Form resets
  → Redirect to confirmation page
```

---

## Quick Win: Replace Alerts Today

Before building the full APIs, you can quickly improve UX by:

1. Install sonner: `npm install sonner`
2. Replace all existing `alert()` in working features
3. Add loading states to buttons
4. Show proper error messages

**This alone will make the app feel more professional!**

---

## Questions to Answer Before Starting

1. **Email Service:** Which email provider? (SendGrid, AWS SES, Resend?)
2. **File Storage:** Where to store authorization documents? (Local, S3, GCS?)
3. **Notifications:** Real-time updates? (Polling, WebSockets, Server-Sent Events?)
4. **Audit Trail:** How detailed? (Log every field change or just major events?)
5. **Testing:** Unit tests? E2E tests? Manual testing?

---

## Next Steps

**Option A: Quick Wins First (Recommended)**
1. Install `sonner` and replace alerts in working features (2-3 hours)
2. Users get immediate UX improvement
3. Then tackle fake implementations one by one

**Option B: Complete One Feature End-to-End**
1. Pick Priority 1 (Admin Review)
2. Build API, UI, emails, everything
3. Ship complete feature
4. Repeat for next priority

**Option C: API Rush**
1. Create all 6 API routes in one session
2. Then connect UIs to APIs
3. Faster but riskier (harder to test incrementally)

---

**Which approach would you like to take?**
