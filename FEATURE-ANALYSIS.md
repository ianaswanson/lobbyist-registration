# Feature Analysis: Problem-First Approach

**Created:** 2025-11-03
**Purpose:** Deep analysis of potential features, focusing on real problems and UX-first solutions

---

## Analysis Framework

For each feature, we'll ask:
1. **What's the real problem?** (Not just "what feature was requested")
2. **Who experiences this problem?** (Lobbyists, admins, public, board members)
3. **How painful is it?** (Scale: 1-10)
4. **What's the simplest solution?** (Start with minimal UX, not maximal features)
5. **What's the ROI?** (Value gained vs. complexity added)

---

## Feature #4: Amendment History Tracking

### The Real Problem
**Current friction:** Once a report is submitted, if a lobbyist realizes they made an error (wrong amount, missed an expense, typo in description), they have two bad options:
1. Accept the error (bad for accuracy/compliance)
2. Contact admin to manually fix it (bad for admin time, no transparency)

**Who it affects:**
- **Lobbyists** (8/10 pain): Need to fix honest mistakes but process is unclear
- **Public** (7/10 pain): Can't see if reports were changed after submission
- **Admins** (5/10 pain): Manual amendment requests are annoying

### UX-First Solution

**DON'T BUILD:** Complex version control system with diffs and branching

**DO BUILD:** Simple "Submit Amendment" workflow

```
┌─────────────────────────────────────────────┐
│ Expense Report Q3 2025                      │
│ Status: APPROVED                            │
│                                             │
│ [View Report] [Submit Amendment]            │
└─────────────────────────────────────────────┘

When user clicks "Submit Amendment":

┌─────────────────────────────────────────────┐
│ Submit Amendment to Q3 2025 Report          │
│                                             │
│ Your original report is locked. This        │
│ creates a NEW report that will replace it.  │
│                                             │
│ Reason for amendment (required):            │
│ ┌─────────────────────────────────────────┐ │
│ │ I discovered I missed 3 expenses that   │ │
│ │ occurred in early September             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Continue to Edit Report]                   │
└─────────────────────────────────────────────┘

Result:
- Copy all data from original report → new draft
- User edits the copy
- New report shows "Amendment to [original]"
- Public can see both versions with timestamps
- Admin gets notification "John Doe amended Q3 report"
```

**Why this is better:**
- No complex version diffing
- Clear audit trail (original + amended, both preserved)
- Existing form/validation code works
- Public transparency: both versions visible
- Admin awareness: notification on amendments

**Effort:** 2-3 days (not 4-5)
**Recommendation:** ✅ **BUILD THIS** - High value, low complexity

---

## Feature #5: Advanced Workflow Management

### The Real Problem
**Hypothetical problem:** "What if we have 50 registrations to review and 5 staff members?"

**Reality check:**
- Multnomah County has how many lobbyists? (Probably <100)
- How many registrations per month? (Probably <10)
- How many admin staff? (Probably 1-3)

**Real problem this tries to solve:** Assignment conflicts, unclear ownership, duplicated effort

### UX-First Solution

**DON'T BUILD:** Complex workflow engine with routing rules and SLA tracking

**DO BUILD:** Simple "Claim for Review" pattern

```
Admin Registration Queue:

┌─────────────────────────────────────────────┐
│ Pending Registrations (8)                   │
├─────────────────────────────────────────────┤
│ ○ John Doe - Technology Lobbyist            │
│   Submitted: Oct 28, 2025                   │
│   [Claim] [View]                            │
├─────────────────────────────────────────────┤
│ ● Jane Smith - Healthcare Lobbyist          │
│   Claimed by: Sarah Admin (2 hours ago)     │
│   [View]                                    │
└─────────────────────────────────────────────┘

When admin clicks "Claim":
- Record: claimedBy = current admin, claimedAt = now
- Show claimed items in "My Reviews" section
- Auto-release if not completed within 24 hours
- Simple UX: "I'm working on this" signal
```

**Why this is better:**
- Solves the actual problem (coordination) without over-engineering
- No complex routing/assignment logic
- Self-service (admins claim what they want)
- Auto-timeout prevents abandoned claims
- Works for teams of 1 or 10

**Effort:** 1-2 days
**Recommendation:** ⚠️ **MAYBE** - Only if team size >2 admins. Otherwise unnecessary.

---

## Feature #6: Ad Hoc Reporting / Query Builder

### The Real Problem
**Current friction:** Admin needs to answer questions like:
- "How many lobbyists registered in 2025?"
- "What's the total lobbying spend by quarter?"
- "Which employers spent >$50k on lobbying?"

**Current solution:** Export to CSV → open in Excel → manual analysis

**Who it affects:**
- **Admins** (6/10 pain): Annoying but doable with CSV export
- **Public** (8/10 pain): Can't easily answer these questions without requesting data

### UX-First Solution

**DON'T BUILD:** Visual query builder (complex, high effort, low usage)

**DO BUILD:** Pre-built "Insights" with filters

```
┌─────────────────────────────────────────────┐
│ Lobbyist Insights                           │
├─────────────────────────────────────────────┤
│ Filters:                                    │
│ Year: [2025 ▼]  Quarter: [All ▼]            │
│                                             │
│ Total Lobbyists Registered: 47              │
│ Total Lobbying Expenses: $284,500           │
│ Top 5 Spenders:                             │
│   1. TechCorp Industries - $89,200          │
│   2. Healthcare Advocates - $52,300         │
│   ...                                       │
│                                             │
│ [Download Full Report as CSV]               │
└─────────────────────────────────────────────┘
```

**Pre-built reports to include:**
1. Lobbyist registration summary (by year, by status)
2. Top spenders (by quarter, by year)
3. Expense trends (quarterly totals over time)
4. Compliance rates (on-time vs late submissions)
5. Violation summary (by type, by filer)

**Why this is better:**
- Answers 80% of questions with 20% of effort
- No learning curve (vs query builder)
- Fast to build (just API routes + simple UI)
- Public-facing (transparency win)
- CSV export still available for custom analysis

**Effort:** 3-4 days
**Recommendation:** ✅ **BUILD THIS** - High public value, moderate effort

---

## Feature #7: Visual Analytics Dashboard

### The Real Problem
**Current friction:** Numbers in tables are hard to scan, trends are invisible, patterns require manual analysis

**Who it affects:**
- **Admins** (5/10 pain): Nice to have but not essential
- **Public** (7/10 pain): Hard to understand lobbying trends
- **County leadership** (8/10 pain): Need high-level insights for policy decisions

### UX-First Solution

**DON'T BUILD:** Complex interactive Tableau-style dashboard with 20 chart types

**DO BUILD:** 3-5 simple, auto-updating charts on public page

```
Public Dashboard - Lobbying Activity

┌─────────────────────────────────────────────┐
│ Chart 1: Quarterly Lobbying Expenses        │
│                                             │
│ $100k ┤     ┌─┐                             │
│       │     │ │       ┌─┐                   │
│  $50k ┤  ┌─┐│ │    ┌─┐│ │                   │
│       │  │ ││ │    │ ││ │                   │
│    0k └──┴─┴┴─┴────┴─┴┴─┴──────            │
│         Q1  Q2  Q3  Q4  Q1  Q2              │
│         2024        2025                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Chart 2: Top 10 Lobbyist Employers          │
│                                             │
│ TechCorp         ████████████ $89k          │
│ Healthcare Adv   ████████ $52k              │
│ Green Energy     ███████ $42k               │
│ ...                                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Chart 3: Lobbyist Registration Growth       │
│                                             │
│ 50 ┤               ┌─────                   │
│    │           ┌───┘                        │
│ 25 ┤       ┌───┘                            │
│    │   ┌───┘                                │
│  0 └───┴───────────────────────────         │
│     2024  Q2  Q3  Q4  2025  Q2              │
└─────────────────────────────────────────────┘
```

**Chart library:** Use Chart.js or Recharts (simple, lightweight, free)

**Why this is better:**
- Focus on 3-5 most important metrics (not 50)
- Read-only (no complex interactions needed)
- Auto-updates from database (no manual refresh)
- Public-facing (transparency + engagement)
- Fast to build with modern chart libraries

**Effort:** 2-3 days (not 5-7) with pre-built chart library
**Recommendation:** ✅ **BUILD THIS** - High impact for low effort

---

## Feature #9: "No Activity" Report Option

### The Real Problem
**Current friction:** Lobbyist had zero activity in Q2 but still must:
1. Log in
2. Navigate to "Submit Report"
3. Fill out form header
4. Leave expense section blank (or put $0?)
5. Submit

**This feels bureaucratic and annoying for a simple "nothing happened" attestation.**

**Who it affects:**
- **Lobbyists** (4/10 pain): Annoying but only takes 2 minutes
- **Employers** (4/10 pain): Same issue

### UX-First Solution

**DON'T BUILD:** Separate "No Activity" form/workflow

**DO BUILD:** Single checkbox on existing form

```
┌─────────────────────────────────────────────┐
│ Quarterly Expense Report - Q2 2025         │
│                                             │
│ ☑ No lobbying activity this quarter        │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ By checking this box, I attest that no  │ │
│ │ lobbying expenses were incurred during  │ │
│ │ this reporting period.                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Submit Report]                             │
└─────────────────────────────────────────────┘

When checked:
- Hide expense line item fields
- Change submit button to "Submit Zero-Activity Report"
- Record as SUBMITTED with zero expenses
- Public disclosure shows "No activity reported"
```

**Why this is better:**
- Same form, fewer steps
- Clear attestation (legal compliance)
- No separate workflow to maintain
- Faster submissions = higher compliance

**Effort:** 0.5 days (just add checkbox + conditional logic)
**Recommendation:** ✅ **BUILD THIS** - Tiny effort, meaningful UX improvement

---

## Feature #10: Shared/Multi-User Accounts

### The Real Problem
**Current friction:** Large lobbying firm (e.g., 5 lobbyists) has:
- 1 shared email (e.g., compliance@biglobbyco.com)
- Multiple people who need to submit reports
- No way to delegate/collaborate

**Two scenarios:**
1. **Small firms** (1-2 lobbyists): Not a problem
2. **Large firms** (5+ lobbyists): Sharing credentials is bad security

**Who it affects:**
- **Large lobbying firms** (7/10 pain): Security risk + coordination overhead
- **Small firms** (1/10 pain): Non-issue

### UX-First Solution

**DON'T BUILD:** Complex role-based permission system within organizations

**DO BUILD:** Simple "Authorized Submitters" list

```
Account Settings (for Primary Account Owner)

┌─────────────────────────────────────────────┐
│ Authorized Submitters                       │
│                                             │
│ These users can submit reports on behalf   │
│ of this organization.                       │
│                                             │
│ • john@biglobbyco.com (Primary Owner)       │
│ • sarah@biglobbyco.com [Remove]             │
│ • mike@biglobbyco.com [Remove]              │
│                                             │
│ Add New Submitter:                          │
│ Email: [_______________] [Send Invite]      │
└─────────────────────────────────────────────┘

When Sarah logs in:
- She sees all reports for BigLobbyCo
- She can create/submit new reports
- Reports show "Submitted by Sarah Smith on behalf of BigLobbyCo"
- Audit trail tracks individual actions
```

**Why this is better:**
- Solves security problem (no shared passwords)
- Simple permission model (can submit = yes/no)
- Audit trail preserves accountability
- Primary owner controls access

**Effort:** 3-4 days
**Recommendation:** ⚠️ **MAYBE** - Only if you observe large firms struggling. Otherwise, defer.

---

## Feature #11: Configurable Registration Fields

### The Real Problem
**Hypothetical:** "What if the ordinance changes and adds a new required field?"

**Current solution:** Developer adds field to schema → migration → form update → deploy (30 min)

**Question:** How often does the ordinance change? (Probably every 2-5 years, if ever)

### UX-First Solution

**DON'T BUILD:** Custom field builder (complex, rarely used)

**DO BUILD:** Nothing. Use normal development process.

**Why this is better:**
- Ordinance changes are rare (legislative process is slow)
- Developer changes are fast (30 min vs 7-10 days to build configurator)
- Configurator adds complexity to every form render
- Testing becomes harder (dynamic fields = more edge cases)

**Effort:** 0 days
**Recommendation:** ❌ **DON'T BUILD** - Solving a non-problem with over-engineering

---

## Feature #12: Mobile-Native App

### The Real Problem
**Current friction:** Using mobile browser works but:
- No push notifications for deadlines
- Camera uploads are clunky
- No offline mode
- Home screen bookmark doesn't feel "native"

**Who it affects:**
- **Mobile-primary users** (5/10 pain): Works but not ideal
- **Desktop users** (0/10 pain): Non-issue

### UX-First Solution

**DON'T BUILD:** Full native iOS/Android apps (40-60 days)

**DO BUILD:** Progressive Web App (PWA) features

```
Add to next.config.ts:

- Service worker for offline caching
- Web app manifest (installable to home screen)
- Push notification API for deadline reminders
- Camera API for photo uploads

Result:
- "Install to Home Screen" prompt on mobile
- App-like experience (no browser chrome)
- Push notifications work
- 90% of native app benefits
- Works on iOS and Android
- 2-3 days vs 40-60 days
```

**Why this is better:**
- Same codebase (no separate iOS/Android maintenance)
- 95% of the value for 5% of the effort
- No app store approval process
- Instant updates (no user downloads)
- Modern browser support is excellent

**Effort:** 2-3 days for PWA features
**Recommendation:** ✅ **BUILD THIS** - Great ROI, modern approach

---

## Feature #13: Integration with County Financial Systems

### The Real Problem
**Hypothetical:** "We could auto-detect lobbying by scanning county payments to vendors"

**Reality check:**
- County financial systems are likely legacy (SAP, Oracle, etc.)
- Integration requires IT approval, security review, procurement
- Data matching is fuzzy (company names don't always match)
- High effort, medium value

### UX-First Solution

**DON'T BUILD:** Full integration (too complex, too many dependencies)

**DO BUILD:** CSV import helper for admin

```
Admin tool: "Import Vendor Payments"

1. Admin exports vendor payments from county system (manual CSV)
2. Upload CSV to Accountability Portal
3. System matches vendor names to registered employers
4. Shows potential matches for admin review:

   CSV Row: "Payment to TechCorp Inc - $15,000 (Sept 2025)"
   Possible Match: TechCorp Industries (registered employer)
   [Link as Related] [Ignore] [Not a Match]

4. Admin confirms matches
5. System flags lobbyists for "Did you report this payment?"
```

**Why this is better:**
- No integration dependencies (IT/security/procurement)
- Admin control over matching (fuzzy logic is hard)
- Works with any financial system (CSV is universal)
- Useful for spot-checks/audits

**Effort:** 3-4 days
**Recommendation:** ⚠️ **MAYBE** - Only if admin requests this for audit purposes

---

## Feature #14: Proactive Compliance Monitoring

### The Real Problem
**Current friction:** Admin must manually notice:
- Unusual spending patterns (500% increase)
- Suspicious data (duplicate entries, round numbers)
- Overdue reports (deadline passed, no submission)

**Who it affects:**
- **Admins** (7/10 pain): Manual review is time-consuming and error-prone

### UX-First Solution

**DON'T BUILD:** Complex ML anomaly detection

**DO BUILD:** Simple rule-based alerts

```
Admin Compliance Dashboard - Alerts Tab

⚠️ Unusual Activity (3)

1. ⚠️ John Doe Q3 expenses ($89,000) are 450% higher than Q2 ($16,200)
   [View Report] [Mark Reviewed]

2. ⚠️ Jane Smith has 3 identical expense entries ($1,500 dinner at Andina on Sept 15)
   [View Report] [Mark Reviewed]

3. ⚠️ Q4 2025 reports due in 3 days - 5 lobbyists have not submitted
   [Send Reminder Email] [View List]

📊 Compliance Score: 92% on-time submission rate (last 4 quarters)
```

**Rules to implement:**
- Expense increase >300% from previous quarter → flag
- Duplicate entries (same date + amount + vendor) → flag
- Report due in 3 days with no submission → flag
- Report with missing required fields → flag
- Round numbers (e.g., exactly $10,000) → gentle flag

**Why this is better:**
- Catches obvious issues automatically
- Admin reviews flagged items (not everything)
- Simple SQL queries (no ML needed)
- Reduces manual spot-checking time

**Effort:** 3-4 days
**Recommendation:** ✅ **BUILD THIS** - High admin value, catches compliance issues early

---

## Feature #15: Public API for Third-Party Access

### The Real Problem
**Current friction:** Civic tech developers, journalists, researchers want programmatic access to lobbying data but must:
- Scrape the website (brittle, breaks on UI changes)
- Request bulk CSV exports (manual, admin burden)

**Who it affects:**
- **Developers/journalists** (8/10 pain): Hard to build tools on top of data
- **Public** (6/10 pain): Limits innovation/transparency apps

### UX-First Solution

**DON'T BUILD:** Complex API with auth, rate limiting, webhooks

**DO BUILD:** Simple read-only JSON endpoints

```
Public API (no auth required):

GET /api/public/lobbyists
→ Returns list of registered lobbyists (paginated)

GET /api/public/lobbyists/:id
→ Returns lobbyist details + reports

GET /api/public/reports
→ Returns all expense reports (filterable by year/quarter)

GET /api/public/board-members/:id/calendar
→ Returns board member calendar entries

Response format: JSON
Rate limiting: 100 requests/minute per IP
Documentation: Simple README with curl examples
```

**Why this is better:**
- Read-only (no security risk)
- Uses existing database queries (already built for UI)
- No API keys needed (public data is public)
- Simple rate limiting prevents abuse
- Enables civic innovation

**Effort:** 1-2 days (mostly just exposing existing queries as JSON)
**Recommendation:** ✅ **BUILD THIS** - Tiny effort, huge transparency win

---

## Summary & Recommendations

### ✅ **HIGH PRIORITY** (Build These)

| Feature | Effort | Value | Reason |
|---------|--------|-------|--------|
| **#9 - No Activity Checkbox** | 0.5 days | High | Tiny effort, reduces friction, increases compliance |
| **#15 - Public API** | 1-2 days | Very High | Enables transparency innovation, minimal effort |
| **#4 - Amendment History** | 2-3 days | High | Solves real pain point, simple UX |
| **#7 - Visual Analytics** | 2-3 days | High | Public engagement, leadership insights |
| **#14 - Compliance Alerts** | 3-4 days | High | Reduces admin burden, catches issues early |
| **#6 - Insights Dashboard** | 3-4 days | Medium-High | Answers common questions, reduces CSV exports |
| **#12 - PWA Features** | 2-3 days | Medium | Modern mobile UX without native app complexity |

**Total Effort: 14-20 days**

---

### ⚠️ **MEDIUM PRIORITY** (Build If Requested)

| Feature | Effort | Value | Reason |
|---------|--------|-------|--------|
| **#5 - Claim for Review** | 1-2 days | Medium | Only useful if team >2 admins |
| **#10 - Multi-User Accounts** | 3-4 days | Medium | Only useful for large firms |
| **#13 - CSV Import Helper** | 3-4 days | Medium | Only if admin requests for audits |

---

### ❌ **LOW PRIORITY** (Don't Build)

| Feature | Reason |
|---------|--------|
| **#11 - Configurable Fields** | Over-engineering a non-problem |
| **#12 - Native Mobile Apps** | PWA provides 95% of value for 5% of effort |

---

## Next Steps

1. **Validate assumptions** - Talk to 2-3 lobbyists and 1-2 admins about these pain points
2. **Start with quick wins** - #9 (No Activity) and #15 (Public API) can ship this week
3. **Iterate** - Ship small, gather feedback, adjust priorities

Would you like me to create Beads issues for the high-priority features?
