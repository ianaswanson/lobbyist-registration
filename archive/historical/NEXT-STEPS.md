# Next Steps - Lobbyist Registration System
**Last Updated:** October 19, 2025
**Current Status:** UX improvements completed and deployed to dev

---

## Current State

✅ **Completed:**
- Navigation redesign (removed redundant items, reorganized by task frequency)
- Dashboard improvements (role-based separation, frequency-based hierarchy)
- Board Member Calendar feature (§3.001 compliance)
- Deployed to dev environment

🔄 **In Progress:**
- API implementation to replace placeholder alerts

❌ **Not Started:**
- Production deployment
- Stakeholder demos
- Phase 2 features

---

## Immediate Next Steps (This Week)

### 1. Push Git Commits to Origin
**Status:** Ready to push
**Commits ahead:** 16 commits on main branch

```bash
git push origin main
```

**Why:** Backup work, enable collaboration, version control

---

### 2. API Implementation Decision

You need to **choose an approach** for completing the API work:

#### Option A: Quick Wins First ⭐ (Recommended)
**Timeline:** Start today, 2-3 hours

1. Install `sonner` toast library
2. Replace all 24 `alert()` calls in working features with toast notifications
3. Users get immediate UX improvement
4. Then tackle one fake API at a time

**Pros:**
- Immediate user experience improvement
- Low risk (just replacing alerts, APIs already work)
- Builds momentum

**Cons:**
- Doesn't fix the "fake" features yet

---

#### Option B: Complete One Feature End-to-End
**Timeline:** 1-2 days per feature

1. Pick **Admin Review** (highest priority)
2. Build everything for that one feature:
   - API routes
   - Database migrations
   - Email notifications
   - UI updates
   - Testing
3. Ship complete feature
4. Repeat for next priority

**Pros:**
- Delivers complete, working features one at a time
- Easier to test thoroughly
- Clear progress milestones

**Cons:**
- Takes longer to see broad improvements
- Context switching between features

---

#### Option C: API Rush
**Timeline:** 1-2 days of focused API work

1. Create all 6 missing API routes in one session
2. Create all database migrations
3. Then connect UIs to APIs
4. Test everything at once

**Pros:**
- Fastest to "done"
- Consistent patterns across all APIs
- Good for focused sprint

**Cons:**
- Harder to test incrementally
- Higher risk (many moving parts)
- Might miss edge cases

---

## API Implementation Roadmap

**Reference:** See `API-IMPLEMENTATION-ROADMAP.md` for complete details

### Category 1: Quick Wins (2-3 hours)
Replace `alert()` with `sonner` toast notifications in:
- `app/(authenticated)/admin/violations/ViolationsClient.tsx` (4 alerts)
- `app/(authenticated)/admin/contract-exceptions/ContractExceptionsClient.tsx` (9 alerts)
- `app/(authenticated)/admin/appeals/AppealsClient.tsx` (8 alerts)
- `app/(authenticated)/my-violations/MyViolationsClient.tsx` (3 alerts)

**These features already work** - APIs exist, just need better UX.

---

### Category 2: Build Missing APIs (26-37 hours)

#### 🔴 Priority 1: Admin Review APIs (8-12 hours)
**Files to create:**
- `app/api/admin/registrations/[id]/route.ts`
- `app/api/admin/reports/[id]/route.ts`

**Database changes needed:**
- Add status enums (PENDING, APPROVED, REJECTED)
- Add review fields (reviewedBy, reviewedAt, rejectionReason)
- Create ClarificationRequest model

**Functionality:**
- Approve/reject lobbyist registrations
- Review expense reports (approve/reject/request clarification)
- Send email notifications
- Create audit logs

---

#### 🟡 Priority 2: Expense Report APIs (6-8 hours)
**Files to create:**
- `app/api/reports/lobbyist/route.ts`
- `app/api/reports/employer/route.ts`

**Database:** Schema already exists ✅
- LobbyistExpenseReport
- EmployerExpenseReport
- ExpenseLineItem
- EmployerLobbyistPayment

**Functionality:**
- Save draft or submit final report
- Create expense line items (bulk insert)
- Calculate totals
- Send confirmation emails

---

#### 🟡 Priority 3: Lobbyist Registration API (6-8 hours)
**File to create:**
- `app/api/register/lobbyist/route.ts`

**Database:** Schema already exists ✅
- Lobbyist
- Employer
- LobbyistEmployer

**Functionality:**
- Multi-step registration submission
- File upload integration (authorization document)
- Create lobbyist and employer records
- Set status to PENDING
- Send notifications

---

#### 🟢 Priority 4: Board Member Calendar API (4-6 hours)
**File to create:**
- `app/api/board-member/calendar/route.ts`

**Database:** Schema already exists ✅
- BoardMember
- BoardCalendarEntry
- BoardLobbyingReceipt

**Functionality:**
- Submit quarterly calendar entries (bulk)
- Submit lobbying receipts >$50 (bulk)
- Set quarter/year metadata
- Mark as publicly posted

---

## Technical Prerequisites

### Before Starting API Work:

1. **Choose email service:**
   - Options: SendGrid, AWS SES, Resend
   - Need API key/credentials
   - Set up email templates

2. **Choose file storage:**
   - Options: Local filesystem, Google Cloud Storage, AWS S3
   - For authorization documents
   - Need upload/retrieval logic

3. **Install dependencies:**
   ```bash
   npm install sonner  # Toast notifications
   npm install @react-email/components  # Email templates (optional)
   ```

4. **Database migrations:**
   ```bash
   npx prisma migrate dev --name add_review_statuses
   ```

---

## Testing Strategy

### For Each API:
- [ ] Create record successfully
- [ ] Data persists to database
- [ ] Can retrieve via API
- [ ] Success toast shown
- [ ] Error handling works
- [ ] Email notifications sent (if applicable)
- [ ] Audit log created
- [ ] Works across user roles
- [ ] Form resets after submission
- [ ] Loading states work
- [ ] Validation prevents invalid data

### Manual Testing:
1. Test in local dev (http://localhost:3000)
2. Test in Cloud Run dev (https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app)
3. Test all user roles
4. Test error scenarios

### Automated Testing (Future):
- Playwright E2E tests
- API integration tests
- Unit tests for validation logic

---

## Questions to Answer

Before starting implementation, clarify:

1. **Email service choice?** (SendGrid, AWS SES, Resend, or mock for now?)
2. **File storage choice?** (Local, GCS, S3, or skip file uploads initially?)
3. **Notification timing?** (Real-time, polling, or async queue?)
4. **Audit trail detail?** (Log every field change or just major events?)
5. **Implementation approach?** (Option A, B, or C above?)

---

## Estimated Timeline

### Option A: Quick Wins First
- Week 1: Replace alerts (2-3 hours) ✅
- Week 2: Admin Review APIs (8-12 hours)
- Week 3: Expense Report APIs (6-8 hours)
- Week 4: Registration API (6-8 hours)
- Week 5: Board Member API (4-6 hours)
- **Total: 4-5 weeks**

### Option B: One Feature at a Time
- Week 1: Quick wins (2-3 hours) + Admin Review complete (8-12 hours)
- Week 2: Lobbyist Registration complete (6-8 hours)
- Week 3: Expense Reports complete (6-8 hours)
- Week 4: Board Member Calendar complete (4-6 hours)
- **Total: 4 weeks**

### Option C: API Rush
- Week 1: Quick wins (2-3 hours) + All APIs (16-20 hours)
- Week 2: Testing and bug fixes (8-12 hours)
- **Total: 2-3 weeks** (but higher risk)

---

## Success Criteria

### Definition of "Done" for API Work:
- ✅ No more `alert()` calls in production code
- ✅ All forms submit to real API routes
- ✅ Data persists to database
- ✅ Users receive confirmation (toast notifications)
- ✅ Email notifications sent (or mocked if not ready)
- ✅ Error handling in place
- ✅ Loading states implemented
- ✅ Form validation prevents invalid submissions
- ✅ Works in dev environment
- ✅ Tested across all user roles

---

## After API Implementation

### Next Phase:
1. **Stakeholder demos** - Show working system to county officials
2. **Gather feedback** - Iterate on UX and features
3. **Production planning** - Database migration, secrets, deployment
4. **Phase 2 features** - Analytics dashboard, contract exceptions, etc.
5. **Accessibility audit** - WCAG 2.1 AA compliance verification
6. **Security review** - Penetration testing, vulnerability scanning
7. **Documentation** - User guides, admin training materials
8. **Production launch** - Before July 1, 2026 ordinance effective date

---

## Key Files Reference

### Documentation:
- `API-IMPLEMENTATION-ROADMAP.md` - Detailed API work breakdown
- `SESSION-SUMMARY-2025-10-19-UX-Improvements.md` - Today's UX work summary
- `CLAUDE.md` - Project overview and development guidelines
- `PROJECT.md` - Complete requirements and roadmap

### Wireframes:
- `wireframes/dashboard-ux-improvements.html` - Interactive UX prototype
- `wireframes/01-lobbyist-registration.html`
- `wireframes/02-quarterly-expense-report.html`
- `wireframes/03-admin-compliance-dashboard.html`
- `wireframes/04-public-search-interface.html`

### Database:
- `prisma/schema.prisma` - Database schema (source of truth)
- `prisma/migrations/` - Version-controlled schema changes
- `prisma/seed.ts` - Test data generation

---

## Decision Point

**YOU ARE HERE** 👉 Need to decide which approach to take for API implementation.

**Recommendation:** Start with **Option A (Quick Wins First)**
1. Install sonner and replace alerts (today)
2. Pick one feature and complete it end-to-end (this week)
3. Iterate based on what you learn

**Next action:** Tell Claude which option you choose, or ask questions to help decide.
