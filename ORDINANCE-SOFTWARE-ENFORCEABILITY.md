# Ordinance Requirements - Software Enforceability Analysis

This document categorizes each ordinance requirement by whether software can enforce it, assist with detection, or whether it's entirely honor-system based.

---

## CATEGORY DEFINITIONS

### 🟢 Software Enforceable
Requirements the system can **directly validate or prevent** violations of.
- Example: Form field validation, required fields, deadline reminders

### 🟡 Software Assisted (Detection Only)
Requirements the system can **help detect violations** but cannot prevent them.
- Example: Connect registration dates with receipt dates to flag suspicious patterns
- System can alert admins but relies on data user provides

### 🔴 Honor System / External Integration Required
Requirements the system **cannot automatically verify** without external data or user honesty.
- **BUT software CAN:** Require attestations/certifications, track attestations with audit trails, flag suspicious patterns for manual review, generate compliance reports
- Example: Whether someone actually spent 10 hours lobbying (system can require "I certify I did not exceed 10 hours" checkbox and log attestation)
- Example: Expense exclusions (system can require "I certify I properly excluded personal expenses" and flag unusual patterns)

---

## SOFTWARE SUPPORT FOR HONOR SYSTEM REQUIREMENTS

Even when software cannot automatically verify compliance, it can provide **significant support** through:

### 1. Attestation & Certification
**What it means:** Require users to explicitly certify they comply with honor-system requirements

**Examples:**
- ☑️ "I certify I registered within 3 working days of exceeding the 10-hour lobbying threshold"
- ☑️ "I certify I have not exceeded 10 hours of lobbying this quarter (excluding travel time)"
- ☑️ "I certify I have properly excluded personal living expenses, travel expenses, and office overhead per §3.805(A)(3)"
- ☑️ "I certify I have not engaged in any prohibited conduct under §3.804 (instigating opposition, promises/threats, contingent compensation)"
- ☑️ "I declare under penalty of false swearing that all information provided is true and accurate"

**Software captures:**
- ✅ Date/time of attestation
- ✅ User IP address
- ✅ Exact checkbox text shown to user
- ✅ User account details

### 2. Audit Trail & Logging
**What it means:** Create permanent, tamper-proof records of all attestations and submissions

**Examples:**
- 📝 Log every registration with timestamp: "User submitted registration on 2026-08-15 at 2:34pm PT"
- 📝 Log first expense date: "First expense to board member dated 2026-08-10" → Flag: Registration 5 days after first lobbying expense
- 📝 Log all attestation responses: "User attested to 3-day compliance on 2026-08-15"
- 📝 Log estimate updates: "User marked expense as estimate on Q1 report, but never updated in Q2 or Q3 reports"

**Software provides:**
- ✅ Complete history of user actions
- ✅ Timeline of compliance activities
- ✅ Evidence for enforcement proceedings
- ✅ Immutable audit logs (cannot be altered after creation)

### 3. Pattern Detection & Flagging
**What it means:** Identify suspicious patterns that may indicate violations for manual review

**Examples:**
- 🚩 **3-Day Deadline Flags:**
  - Registration date is >3 working days after first expense receipt date
  - User consistently registers exactly on day 3 (pattern suggesting gaming the system)

- 🚩 **10-Hour Threshold Flags:**
  - User reports 9.5-9.9 hours every quarter (suspiciously close to threshold)
  - User has significant lobbying expenses but claims <10 hours
  - Employer reports paying lobbyist $50k but lobbyist claims <10 hours

- 🚩 **Expense Exclusion Flags:**
  - Total expenses seem unusually low given activity level
  - User reports $0 expenses but has calendar meetings with board members
  - Pattern comparison: Similar lobbyists report 3x higher expenses for same activity level

- 🚩 **Prohibited Conduct Flags:**
  - Cross-reference: Registered lobbyist name matches staff directory (potential violation of §3.804(D))
  - Former employee database match within 1 year of termination (potential violation of §3.804(E))
  - Lobbyist registers opposing positions on same legislation within short timeframe (potential §3.804(A) violation)

**Software generates:**
- ✅ Weekly/monthly admin reports with flagged accounts
- ✅ Risk scores based on pattern analysis
- ✅ Prioritized review queue for compliance staff

### 4. Compliance Reporting
**What it means:** Generate reports showing compliance status and areas needing manual review

**Admin Dashboard Reports:**
- 📊 **Attestation Compliance:** "95% of lobbyists have attested to 3-day compliance, 5% have not attested"
- 📊 **Pattern Flags:** "12 accounts flagged for suspicious 10-hour reporting patterns"
- 📊 **Missing Attestations:** "8 expense reports submitted without expense exclusion certification"
- 📊 **Cross-Reference Discrepancies:** "3 board members reported lower receipts than lobbyist expenses to them"
- 📊 **Cooling-Off Violations:** "2 potential §3.804(E) violations detected (former employees registered as lobbyists within 1 year)"

### 5. Educational Prompts & Reminders
**What it means:** Guide users to comply with honor-system requirements through clear instructions

**Examples:**
- 💡 **During registration:** "You must register within 3 working days of exceeding 10 hours of lobbying. When did you first exceed 10 hours?"
- 💡 **Expense exclusions help text:** "Do NOT include: personal living expenses, travel costs, office rent, staff salaries. DO include: food, entertainment, and refreshments provided to public officials."
- 💡 **10-hour calculator:** "Use our calculator to estimate your lobbying hours. Remember: travel time does not count."
- 💡 **Prohibited conduct reminder:** "Before submitting, review the 5 types of prohibited conduct in §3.804."

### 6. Periodic Re-Certification
**What it means:** Require users to periodically re-confirm compliance with honor-system requirements

**Examples:**
- 🔄 **Quarterly re-certification:** "Each quarter, before submitting expense report, re-certify you have not engaged in prohibited conduct"
- 🔄 **Annual compliance review:** "Once per year, review and re-certify all registration information is accurate and you comply with all ordinance requirements"
- 🔄 **Update reminders:** "Your registration has not been updated in 6 months. Please review and confirm all information is still accurate."

---

## REVISED RECOMMENDATION: What Software SHOULD Do for Honor System Items

Instead of treating honor-system requirements as "nothing we can do," implement:

1. ✅ **Required attestation checkboxes** for all honor-system requirements
2. ✅ **Audit logging** of all attestations with timestamps and IP addresses
3. ✅ **Pattern detection algorithms** flagging suspicious behavior for manual review
4. ✅ **Admin compliance reports** showing attestation rates and flagged accounts
5. ✅ **Educational prompts** explaining requirements at point of submission
6. ✅ **Periodic re-certification** workflows (quarterly or annual)

**Result:** While software cannot verify truthfulness, it creates:
- 📋 **Legal accountability** through explicit attestations
- 🔍 **Detection mechanisms** for likely violations
- 📊 **Compliance visibility** for admin staff
- 🛡️ **Deterrent effect** through logging and flagging
- ✅ **Evidence trail** for enforcement proceedings

---

## § 3.802 - LOBBYIST REGISTRATION REQUIREMENTS

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Name, email, phone, address** | 🟢 Software Enforceable | System can require these fields, validate formats |
| **Employer name, contact info** | 🟢 Software Enforceable | System can require these fields, validate formats |
| **Business description** | 🟢 Software Enforceable | System can require field (cannot verify accuracy) |
| **Authorization document upload** | 🟢 Software Enforceable | System can require file upload before submission |
| **General subjects of lobbying** | 🟢 Software Enforceable | System can require field (cannot verify accuracy) |
| **3-working-day deadline after exceeding 10 hours** | 🔴 Honor System | **System has no way to know when lobbying occurred.** Could potentially connect registration date with expense receipt dates to flag suspicious patterns (e.g., expenses dated >3 days before registration), but this is detection after the fact, not enforcement. |
| **30-day update requirement** | 🟡 Software Assisted | System can track when changes occurred and flag if not updated within 30 days. But system cannot know about external changes (e.g., lobbyist changed employers but hasn't told the system). |

**Implementation Recommendations:**
- **3-day deadline:**
  - ✅ **Attestation:** Required checkbox: "I certify I registered within 3 working days of exceeding the 10-hour lobbying threshold"
  - ✅ **Tracking:** Log registration date and first expense date; flag discrepancies >3 working days
  - ✅ **Pattern detection:** Admin report showing registration dates vs. first expense dates
  - ✅ **Education:** Display clear explanation of 3-day requirement during registration
- **30-day updates:**
  - ✅ Track last modification date and send reminder emails
  - ✅ Flag accounts with no updates for extended periods (90+ days)
  - ✅ Annual re-certification: "I confirm all registration information remains accurate"

---

## § 3.803 - EXEMPTIONS (10-Hour Threshold)

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **10-hour lobbying threshold** | 🔴 Honor System | **System cannot know how many hours someone has actually spent lobbying.** The system can only track what users self-report. This is fundamentally honor-system unless there's video surveillance or tracking integration (not feasible/appropriate). |
| **Travel time exclusion** | 🔴 Honor System | System cannot verify travel time vs. actual lobbying time. User must self-report. |

**Implementation Recommendations:**
- **10-hour threshold:**
  - ✅ **Attestation (for registered lobbyists):** "I certify I exceeded 10 hours of lobbying this quarter (excluding travel time)"
  - ✅ **Attestation (for non-registered):** "I certify I did not exceed 10 hours of lobbying this quarter (excluding travel time)" (optional exemption tracking)
  - ✅ **Hour tracking calculator:** Self-assessment tool with examples of what counts as lobbying vs. travel
  - ✅ **Pattern detection:** Flag accounts with significant expenses but claiming <10 hours
  - ✅ **Cross-reference:** Flag when employer reports substantial payments but lobbyist claims <10 hours
  - ✅ **Education:** Clear examples of "lobbying" activities and travel time exclusions

---

## § 3.804 - PROHIBITED CONDUCT

All 5 prohibited conduct items are **🔴 Honor System / External**. Software cannot prevent or detect these without external data:

| Prohibition | Category | Rationale |
|-------------|----------|-----------|
| **(A) Instigating opposition for employment** | 🔴 Honor System | Requires knowledge of lobbyist's intent and behind-the-scenes actions. System has no visibility. |
| **(B) Promises/threats re: candidacy** | 🔴 Honor System | Private conversations between lobbyist and board member. System cannot monitor. |
| **(C) Contingent compensation** | 🔴 Honor System | Employment agreement terms are private. System cannot access contract details unless explicitly uploaded and reviewed. |
| **(D) Public official outside compensation** | 🟡 Software Assisted | System could cross-reference registered lobbyists with public official roster and flag matches. But requires integration with HR/staff directory. |
| **(E) 1-year cooling-off for former officials** | 🟡 Software Assisted | System could flag registrations where lobbyist name matches former official database (if integrated). Requires HR/former employee data integration. |

**Implementation Recommendations:**
- **Attestation:**
  - ✅ **Registration:** Required checkbox: "I certify I have read and understand the prohibited conduct requirements under §3.804 and will not engage in such conduct"
  - ✅ **Quarterly re-certification:** "I certify I have not engaged in any prohibited conduct this quarter (instigating opposition, promises/threats regarding candidacy, contingent compensation, receiving outside compensation as public official, or lobbying within 1-year cooling-off period)"
- **Pattern Detection:**
  - ✅ **(D) Public official compensation:** Cross-reference registered lobbyists with staff directory; flag matches for admin review
  - ✅ **(E) 1-year cooling-off:** Cross-reference registered lobbyists with former employee database (termination date within 1 year); flag matches
  - ✅ **(A) Instigating opposition:** Flag lobbyists who register opposing positions on same legislation within short timeframe
- **Tracking:**
  - ✅ Log all prohibited conduct attestations with timestamps
  - ✅ Track violation reports submitted by public/officials
- **Education:**
  - ✅ Display all 5 prohibited conduct rules prominently during registration
  - ✅ Provide examples and scenarios for each prohibition
- **Reporting:**
  - ✅ Public/official reporting mechanism for suspected violations
  - ✅ Admin dashboard showing flagged accounts and violation reports

---

## § 3.805 - LOBBYIST EXPENSE STATEMENTS

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Total food/refreshments/entertainment expenses** | 🟢 Software Enforceable | System can require field, validate it's a number |
| **Itemize expenses >$50** (name, date, payee, purpose, amount) | 🟢 Software Enforceable | System can require fields and validate >$50 threshold |
| **Exclusions** (personal living, travel, office overhead, salaries) | 🔴 Honor System | System cannot verify what expenses user chose to exclude. User must understand and apply rules correctly. **However, system can flag suspicious patterns (e.g., unusually low total expenses given activity level).** |
| **Estimate flag and follow-up** | 🟢 Software Enforceable | System can require estimate flag, track which expenses need follow-up, send reminders |
| **ORS 244.100 notices** | 🟡 Software Assisted | System can require file upload field labeled "ORS 244.100 Notices (if any)". Cannot verify if user actually had conflicts that required notices. Could potentially cross-reference expense recipient names with board member names and flag for review. |
| **Quarterly deadlines** (Apr 15, Jul 15, Oct 15, Jan 15) | 🟢 Software Enforceable | System can track deadlines, send reminders, prevent submission after deadline, or flag late submissions |

**Implementation Recommendations:**
- **Exclusions:**
  - ✅ **Attestation:** Required checkbox: "I certify I have properly excluded personal living expenses, travel expenses, office overhead (including salaries), and other non-reportable expenses per §3.805(A)(3)"
  - ✅ **Education:** Detailed help text with examples:
    - ❌ DO NOT REPORT: Hotel stays, airfare, rental cars, office rent, staff salaries, utilities, supplies
    - ✅ DO REPORT: Meals/drinks with public officials, entertainment expenses, event tickets provided to officials
  - ✅ **Pattern Detection:**
    - Flag: Total expenses unusually low compared to peer lobbyists with similar activity
    - Flag: User reports $0 expenses but has multiple calendar meetings with board members
    - Flag: Employer reports paying lobbyist $50k+ but lobbyist reports minimal expenses
  - ✅ **Admin Report:** "Expense Exclusion Audit" showing flagged accounts with suspicious patterns
- **ORS 244.100:**
  - ✅ **Upload field:** Optional file upload labeled "ORS 244.100 Conflict of Interest Notices (if any)"
  - ✅ **Help text:** "If any of your expenses were to a public official who had a conflict of interest, you must provide copies of ORS 244.100 notices here"
  - ✅ **Pattern Detection:** Flag expenses to board members where no ORS 244.100 notice was uploaded
  - ✅ **Admin Report:** "Missing ORS 244.100 Notices" showing expenses to board members without uploaded notices

---

## § 3.806 - EMPLOYER EXPENSE STATEMENTS

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Total lobbying expenses** (excluding living/travel) | 🟢 Software Enforceable | System can require field, validate it's a number |
| **Itemize expenses >$50** | 🟢 Software Enforceable | System can require fields and validate >$50 threshold |
| **Payments to lobbyists** (name, total amount) | 🟢 Software Enforceable | System can require fields. Could potentially cross-reference with registered lobbyist roster to validate names. |
| **ORS 244.100 notices** | 🟡 Software Assisted | Same as § 3.805 - system can require upload field but cannot verify necessity |
| **Quarterly deadlines** | 🟢 Software Enforceable | System can track deadlines, send reminders, flag late submissions |

**Implementation Recommendations:**
- Cross-reference: When employer enters "payments to lobbyists", validate lobbyist name against registered lobbyist database
- Flag employers who report payments to unregistered individuals

---

## § 3.807 - FALSE SWEARING DECLARATION

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Written declaration on all forms** | 🟢 Software Enforceable | System can display declaration text and require acknowledgment checkbox before submission |
| **Prohibition on false statements** | 🔴 Honor System | System cannot verify truthfulness of statements. This is a legal deterrent, not a technical control. |

**Implementation Recommendations:**
- Display prominent declaration: "I declare under penalty of false swearing that the information provided is true and accurate"
- Require checkbox acknowledgment
- Legal language serves as deterrent even though system cannot verify

---

## § 3.808 - PENALTIES

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Fine up to $500** | 🟢 Software Enforceable | System can track fines, amounts, payment status |
| **Violation determination** | 🔴 Honor System / Admin Decision | System cannot automatically determine violations for most ordinance requirements. Admin must review and decide. |

**Implementation Recommendations:**
- System provides violation tracking and fine issuance workflow
- Admin manually reviews potential violations and issues fines
- System tracks payment status and sends payment reminders

---

## § 3.809 - APPEALS

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **30-day appeal window** | 🟢 Software Enforceable | System can track fine issuance date and calculate 30-day deadline, accept/reject appeals based on deadline |
| **Postmark date** | 🟡 Software Assisted | For electronic appeals, system uses submission timestamp. For mailed appeals, admin must manually enter postmark date. |

**Implementation Recommendations:**
- Track fine issuance date and calculate appeal deadline automatically
- Accept appeals electronically (system uses submission timestamp)
- Provide admin field to manually enter postmark date for mailed appeals

---

## § 3.001 - BOARD MEMBER REPORTING

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **Quarterly calendar posting** (event title, date, time, participants) | 🟢 Software Enforceable | System can require fields, validate completeness |
| **15-day deadline after quarter ends** | 🟢 Software Enforceable | System can track deadlines, send reminders, flag late submissions |
| **Total receipts from lobbyists** | 🟡 Software Assisted | System can require field. Could potentially cross-reference with lobbyist expense reports to detect discrepancies (lobbyist reported $200 to board member, but board member only reported $100). |
| **Itemize receipts >$50** | 🟢 Software Enforceable | System can require fields, validate >$50 threshold |
| **1-year public retention** | 🟢 Software Enforceable | System can automatically archive/hide records after 1 year |

**Implementation Recommendations:**
- Cross-reference: Add admin audit report comparing board member receipts to lobbyist expense reports
- Flag discrepancies for investigation

---

## § 9.230 - CONTRACT REGULATION

| Requirement | Category | Rationale |
|-------------|----------|-----------|
| **1-year cooling-off prohibition** | 🟡 Software Assisted | System could flag contracts where vendor name matches former employee database (if integrated with HR/procurement systems). Cannot enforce without external integration. |
| **Exception request process** | 🟢 Software Enforceable | System can provide workflow for exception requests, written findings, approvals |
| **Public posting of exceptions** | 🟢 Software Enforceable | System can display granted exceptions publicly |

**Implementation Recommendations:**
- If integrated with HR: Flag contract vendors matching former employees within 1 year
- If integrated with procurement: Automatically check new contracts against former employee database
- Standalone: Provide manual exception request workflow with public posting

---

## SUMMARY BY CATEGORY

### 🟢 Software Enforceable (27 items)
Requirements the system can directly enforce through validation, required fields, deadlines, and workflows:
- All form field requirements (name, email, phone, address, etc.)
- Required file uploads (authorization documents)
- Deadline tracking and reminders (quarterly deadlines, 15-day deadline, 30-day appeal deadline)
- Itemization thresholds (>$50 expenses)
- Estimate flags and follow-up tracking
- False swearing declaration display
- Fine tracking and payment status
- Exception request workflows
- 1-year public retention
- Calendar posting requirements

### 🟡 Software Assisted - Detection Only (8 items)
Requirements where the system can flag suspicious patterns or detect potential violations but cannot prevent them:
- 30-day registration update requirement (can flag no updates, but can't know about external changes)
- ORS 244.100 notices (can flag expenses to board members without uploaded notices)
- Public official outside compensation (D) - can flag if integrated with staff directory
- 1-year cooling-off for former officials (E) - can flag if integrated with HR
- Board member receipt cross-referencing (can flag discrepancies with lobbyist reports)
- Postmark dates for mailed appeals
- Contract regulation (can flag if integrated with HR/procurement)
- Violation determination (admin decision, system assists with tracking)

### 🔴 Honor System / External Integration Required (11 items)
Requirements the system fundamentally cannot automatically verify without external data or user honesty:
- **3-working-day registration deadline** (system doesn't know when lobbying occurred)
- **10-hour threshold** (system can't track actual lobbying hours)
- **Travel time exclusion** (system can't verify travel vs. lobbying time)
- **Expense exclusions** (system can't verify what user chose to exclude)
- **Prohibited conduct (A) - Instigating opposition** (intent and behind-the-scenes actions)
- **Prohibited conduct (B) - Promises/threats** (private conversations)
- **Prohibited conduct (C) - Contingent compensation** (private employment agreements)
- **False statement verification** (system cannot verify truthfulness)
- **Business description accuracy** (system can require field but not verify accuracy)
- **General subjects of lobbying accuracy** (system can require field but not verify accuracy)
- **Violation determination for most ordinance requirements** (requires admin judgment)

**BUT software provides significant value through:**
- ✅ **Attestations:** Require explicit certification of compliance (legal accountability)
- ✅ **Audit Trails:** Log all attestations with timestamps and IP addresses (evidence for enforcement)
- ✅ **Pattern Detection:** Flag suspicious patterns for manual review (e.g., expenses vs. claimed hours)
- ✅ **Cross-Referencing:** Compare related data to detect discrepancies (e.g., lobbyist expenses vs. board member receipts)
- ✅ **Compliance Reports:** Generate admin dashboards showing attestation rates and flagged accounts
- ✅ **Education:** Provide clear guidance at point of submission

---

## RECOMMENDATIONS FOR ORDINANCE COMPLIANCE CLAIMS

When updating the compliance HTML or documentation, we should be more precise about what "implemented" means:

### Current Status Should Be:
- ✅ **Form Fields Implemented** - System collects all required data
- ✅ **Deadline Tracking Implemented** - System tracks deadlines and sends reminders
- ✅ **Validation Implemented** - System validates required fields and formats
- ⚠️ **3-Day Deadline** - Educational message displayed; detection not possible
- ⚠️ **10-Hour Threshold** - Self-assessment tool provided; system cannot enforce
- ⚠️ **Prohibited Conduct** - Rules displayed; system cannot detect violations
- ⚠️ **Expense Exclusions** - Help text provided; user must apply rules correctly
- ⚠️ **ORS 244.100 Notices** - Upload field provided; system flags missing notices for expenses to board members

### What We Should NOT Claim:
- ❌ "System enforces 3-day registration deadline" - We provide education, not enforcement
- ❌ "System tracks 10-hour threshold" - User self-reports; system cannot verify
- ❌ "System prevents prohibited conduct" - System displays rules; cannot detect violations
- ❌ "System verifies expense exclusions" - User applies rules; system cannot verify accuracy

---

## RECOMMENDATIONS FOR SOFTWARE IMPLEMENTATION

### Tier 1: Core Enforcement (27 items - Must Have)
Implement all **🟢 Software Enforceable** requirements:
- Form validation for all required fields
- File upload requirements
- Deadline tracking and automated reminders
- Itemization threshold validation
- False swearing declaration display
- Fine and appeal tracking workflows

### Tier 2: Detection & Auditing (8 items - Should Have)
Implement **🟡 Software Assisted** detection features:
- Admin audit reports flagging suspicious patterns:
  - Registration date vs. expense dates (3-day deadline detection)
  - Board member receipts vs. lobbyist expense reports (discrepancy detection)
  - Expenses to board members without ORS 244.100 notices
  - Registered lobbyists matching staff directory (if HR integration available)
- Manual data entry fields for external information (postmark dates)

### Tier 3: Education & Self-Reporting (11 items - Must Have)
For **🔴 Honor System** requirements, provide educational support:
- Comprehensive help text explaining rules
- Examples and scenarios
- Self-assessment tools (hour tracking calculator)
- Prominent display of prohibited conduct rules
- Acknowledgment checkboxes
- User guides and training materials

---

## CONCLUSION

**Key Insight:** Approximately 60% of ordinance requirements can be directly enforced by software, 18% can be detection-assisted, and 24% cannot be automatically verified. **However, even honor-system requirements benefit significantly from software support through attestations, tracking, pattern detection, and reporting.**

### The software's role is:

1. **✅ Enforce** what can be enforced (form fields, deadlines, validation, required uploads)
2. **🔍 Detect** suspicious patterns where possible (audit reports, cross-referencing, anomaly detection)
3. **📋 Track** attestations and certifications (audit trail with timestamps, IP addresses, legal accountability)
4. **🚩 Flag** likely violations for manual review (pattern detection algorithms, admin dashboards)
5. **📚 Educate** users on honor-system requirements (help text, examples, scenarios, guidance)
6. **📊 Report** compliance status to admins (attestation rates, flagged accounts, risk scores)

### Revised Approach to Honor System Requirements

**OLD THINKING:** "Can't verify = nothing we can do"

**NEW THINKING:** "Can't verify = use attestations + tracking + pattern detection + reporting"

**Example: 3-Day Registration Deadline**
- ❌ System cannot prevent late registration (honor system)
- ✅ System CAN require attestation: "I certify I registered within 3 working days"
- ✅ System CAN log registration date and first expense date
- ✅ System CAN flag when registration date > 3 days after first expense
- ✅ System CAN generate admin report of flagged accounts
- ✅ System CAN provide audit trail for enforcement proceedings

**Result:** Legal accountability + detection mechanisms + compliance visibility

### Implementation Tiers

**Tier 1: Direct Enforcement (27 items)**
- Form validation, required fields, deadline tracking
- These are "must-have" features that prevent submission without required data

**Tier 2: Detection & Auditing (8 items)**
- Cross-referencing, pattern detection, anomaly flagging
- These are "should-have" features that help admins find violations

**Tier 3: Attestation & Education (11 items)**
- Required certifications, help text, examples, tracking
- These are "must-have" features that create legal accountability and audit trails

**All three tiers are equally important** for a compliant system.

### Critical Recommendation

When communicating compliance status, use precise language:

**✅ GOOD:**
- "System requires attestation of 3-day compliance and flags suspicious patterns"
- "System collects all required data with validation and deadline tracking"
- "System provides pattern detection for 10-hour threshold violations"
- "System tracks all attestations with audit trail for enforcement"

**❌ BAD:**
- "System enforces 3-day registration deadline" (implies prevention)
- "System verifies 10-hour threshold" (cannot verify actual hours)
- "System ensures expense exclusions are correct" (cannot verify accuracy)
- "Requirement cannot be implemented" (ignores attestation/tracking value)

### Final Recommendation

**Honor-system requirements should NOT be marked as "not implemented."** Instead:
- ✅ "Attestation & Tracking Implemented"
- ✅ "Educational Support Implemented"
- ✅ "Pattern Detection Implemented"
- ✅ "Audit Trail Implemented"

This transparency ensures stakeholders understand:
1. What software **can directly enforce** (prevention)
2. What software **can help detect** (pattern flagging)
3. What software **cannot verify but tracks** (attestations with legal accountability)

**Bottom Line:** Even honor-system requirements have robust software support. The software creates accountability, detection, and audit trails—just not automatic prevention.
