# Future Enhancements

**Last Updated:** October 31, 2025

This document lists potential enhancements beyond the current implementation. These features were identified during RFI review but were not included in the initial build to maintain focus on ordinance compliance.

---

## Timeline Context

The core system was built in **10 days** to meet all ordinance requirements (§3.800-§3.809, §3.001, §9.230). The features listed below represent additional capabilities that could be added in future phases as needs evolve.

---

## Phase 5+ Enhancement Candidates

### 1. Payment Processing Integration
**Current State:** Violations and fines are tracked in the system
**Enhancement:** Online payment processing for fines via credit card or ACH

**Implementation Options:**
- Stripe integration (~1-2 days)
- Cybersource (government-focused, ~2-3 days)
- PayGov or similar government payment gateway (~3-5 days depending on procurement)

**Effort:** 3-5 days development + gateway setup/testing
**Value:** Convenience for filers, automated payment tracking for admin

---

### 2. Single Sign-On (SSO)
**Current State:** Email/password authentication via NextAuth
**Enhancement:** SSO integration with Google Workspace or Azure AD

**Implementation Options:**
- Google Workspace (NextAuth has built-in provider)
- Azure AD / Microsoft Entra (NextAuth has built-in provider)
- Okta or other enterprise SSO

**Effort:** 2-3 days for basic integration, 3-5 days with role mapping
**Value:** Reduced password management burden, aligns with county IT policies

---

### 3. Multi-Factor Authentication (MFA)
**Current State:** Single-factor authentication (email + password)
**Enhancement:** SMS or authenticator app-based MFA

**Implementation Options:**
- Time-based OTP (TOTP) via authenticator apps
- SMS codes via Twilio
- Email-based codes (simpler, lower security)

**Effort:** 3-4 days with proper security testing
**Value:** Enhanced account security, especially for admin accounts

---

### 4. Amendment History Tracking
**Current State:** Reports can be edited before submission
**Enhancement:** Version history for submitted reports, public access to original + amended versions

**Implementation:**
- Add version number to report schema
- Track changes with timestamps
- Public UI to view original vs. amended
- Notification to admin when report is amended

**Effort:** 4-5 days
**Value:** Transparency for investigative reporting, audit compliance

---

### 5. Advanced Workflow Management
**Current State:** Simple review queues (any admin can review any submission)
**Enhancement:** Task assignment, workflow routing, SLA tracking

**Features:**
- Assign registrations/reports to specific staff
- Configurable approval workflows (e.g., junior staff review → senior staff approve)
- SLA tracking (e.g., "Review registrations within 5 business days")
- Workload balancing

**Effort:** 7-10 days
**Value:** Useful for larger teams with specialized roles

---

### 6. Ad Hoc Reporting / Query Builder
**Current State:** Compliance dashboard + CSV export
**Enhancement:** Custom report builder for admin analysis

**Features:**
- Visual query builder (e.g., "Show me all lobbyists registered in 2025 with expenses >$10k")
- Saved reports/templates
- Scheduled report generation
- Custom aggregations and groupings

**Effort:** 10-15 days (complex feature)
**Value:** Reduced dependency on CSV exports for custom analysis

---

### 7. Visual Analytics Dashboard
**Current State:** Summary statistics on compliance dashboard
**Enhancement:** Interactive charts and graphs

**Features:**
- Lobbying activity trends over time
- Top spenders by quarter
- Most lobbied officials/topics
- Geographic distribution of lobbyists
- Filters and drill-downs

**Effort:** 5-7 days
**Value:** Executive-level insights, easier to spot patterns

---

### 8. Automated Email Campaigns
**Current State:** Transactional emails (welcome, password reset, approval notifications)
**Enhancement:** Bulk email campaigns with scheduling

**Features:**
- Template editor with merge fields
- Schedule reminder emails (e.g., "Q2 reports due in 7 days")
- Target specific user groups (e.g., "All lobbyists with pending registrations")
- Email delivery tracking

**Effort:** 5-7 days
**Value:** Proactive deadline reminders, improved compliance rates

---

### 9. "No Activity" Report Option
**Current State:** Reports require data entry even if no activity occurred
**Enhancement:** Checkbox for "No lobbying activity this quarter"

**Features:**
- Single checkbox attestation for zero-activity quarters
- Recorded as submitted (satisfies reporting requirement)
- Admin can see which filers reported no activity
- Public disclosure shows "No activity reported"

**Effort:** 1-2 days
**Value:** Reduces friction for inactive quarters, faster submissions

---

### 10. Shared/Multi-User Accounts
**Current State:** One user per account
**Enhancement:** Organizations can have multiple authorized users

**Features:**
- Primary account owner + authorized users
- Role-based permissions within an organization (e.g., "Can submit reports" vs "Can view only")
- Audit trail shows which user took which action
- Admin approval for adding/removing users

**Effort:** 5-7 days
**Value:** Larger lobbying firms with multiple staff members

---

### 11. Configurable Registration Fields
**Current State:** Fixed fields based on ordinance requirements
**Enhancement:** Admin can customize registration form fields

**Features:**
- Add custom fields (text, dropdown, checkbox, etc.)
- Mark fields as required or optional
- Field visibility rules (e.g., "Show X only if Y is checked")
- Export custom fields in reports

**Effort:** 7-10 days
**Value:** Adaptability to ordinance changes without code changes

---

### 12. Mobile-Native App
**Current State:** Responsive web app (works on mobile browsers)
**Enhancement:** Native iOS/Android apps

**Features:**
- Camera integration for document uploads
- Push notifications for deadlines
- Offline mode with sync
- Fingerprint/Face ID authentication

**Effort:** 20-30 days (iOS) + 20-30 days (Android)
**Value:** Better mobile experience, push notifications

---

### 13. Integration with County Financial Systems
**Current State:** Standalone system for lobbying compliance
**Enhancement:** Integration with county accounting/budgeting systems

**Features:**
- Auto-sync vendor payments to detect lobbying expenditures
- Cross-reference contract awards with lobbyist employers
- Flag potential conflicts of interest
- Sync fine payments to accounting system

**Effort:** Highly variable (depends on county systems)
**Value:** Reduced manual data entry, automated compliance checks

---

### 14. Proactive Compliance Monitoring
**Current State:** Admin manually reviews submissions
**Enhancement:** Automated anomaly detection and alerts

**Features:**
- Flag unusual spending patterns (e.g., 300% increase from previous quarter)
- Detect missing required fields or incomplete data
- Identify potential duplicate entries
- Alert admin to overdue reports before deadline

**Effort:** 5-7 days
**Value:** Catch errors early, reduce admin review time

---

### 15. Public API for Third-Party Access
**Current State:** Public search interface via web UI
**Enhancement:** RESTful API for programmatic access

**Features:**
- JSON endpoints for lobbyist data, reports, etc.
- Rate limiting and API keys
- Documentation (OpenAPI/Swagger)
- Webhooks for data updates

**Effort:** 7-10 days
**Value:** Enables civic tech developers to build apps on top of the data

---

## Prioritization Framework

When deciding which enhancements to build next, consider:

1. **Ordinance Alignment**: Does this help meet new legal requirements?
2. **User Pain Points**: What friction do users report most?
3. **Admin Efficiency**: Does this reduce manual work for county staff?
4. **Public Value**: Does this improve transparency or accessibility?
5. **Implementation Effort**: What's the ROI (value / development time)?

---

## Not Recommended (Low ROI)

Some features from vendor demos are **not recommended** for this use case:

- **Physical Badge Issuance**: Not required by ordinance, adds administrative burden
- **Campaign Finance Integration**: Separate ordinance/jurisdiction, different data models
- **Lobbyist-to-Lobbyist Messaging**: No use case identified
- **Calendar Cloning Between Years**: Registration periods are straightforward, not worth complexity

---

## Estimated Phase 5 Timeline

If prioritizing top 5 enhancements:
1. Payment processing (3-5 days)
2. SSO integration (2-3 days)
3. Amendment history (4-5 days)
4. No Activity reports (1-2 days)
5. Visual analytics (5-7 days)

**Total: 15-22 days** for Phase 5 implementation

---

## Notes

- All effort estimates assume a single developer working full-time
- Estimates include development, testing, and deployment (not procurement/legal review)
- Infrastructure costs remain minimal (~$84-100/month) unless adding paid services (Twilio, Stripe, etc.)
- These are enhancements, not fixes—the current system is fully functional and compliant

---

**End of Document**
