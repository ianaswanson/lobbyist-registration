# Lobbyist Registration System - Project Overview

## Vision
Create a transparent, accessible web application that enables Multnomah County to track and publicly disclose lobbying activities, enhancing accountability and public trust in county government.

## Mission
Provide lobbyists, their employers, county officials, and the public with a simple, compliant system to register lobbying activities, report expenses, and access transparency data as required by Multnomah County Ordinance establishing lobbying reporting requirements.

## Problem Statement
Multnomah County has no existing system to track lobbying activities, making it difficult to ensure transparency and prevent undue influence on county decision-making. The new ordinance (effective July 1, 2026) requires:

- Lobbyists to register and report quarterly expenses
- Employers to report lobbying expenditures
- Board members to post calendars and report lobbying receipts
- Public access to all lobbying data

Without a digital system, compliance will be difficult, data will be fragmented, and public transparency will be limited.

## Solution
A purpose-built web application providing:

1. **Registration Portal** - Easy lobbyist registration with employer authorization
2. **Quarterly Reporting** - Automated reminder system and simple expense reporting
3. **Transparency Dashboard** - Public searchable database of all lobbying activities
4. **Compliance Monitoring** - Admin tools to track deadlines, violations, and appeals
5. **Board Member Tools** - Calendar posting and receipt tracking

## Target Users

### Primary Users
1. **Lobbyists** (~50-200 estimated)
   - Need to register
   - Submit quarterly expense reports
   - Update information when changes occur

2. **Employers of Lobbyists** (~30-100 organizations)
   - Authorize lobbyists to represent them
   - Submit quarterly expenditure reports
   - View their registered lobbyists

3. **County Board Members** (5 commissioners)
   - Post quarterly calendars
   - Report lobbying receipts
   - View lobbyist information

4. **County Administrators** (~5-10 staff)
   - Review registrations
   - Monitor compliance
   - Issue fines and manage appeals
   - Generate reports

### Secondary Users
5. **General Public** (unlimited)
   - Search lobbyist registry
   - View expense reports
   - Access board member calendars
   - Download data for analysis

6. **News Media**
   - Research lobbying activities
   - Track spending trends
   - Investigate potential conflicts

## Key Features & Requirements

### 1. Lobbyist Registration (§3.802)

**Requirements from Ordinance:**
- Registration required within **3 working days** after exceeding 10 hours lobbying per quarter
- Must include:
  - Lobbyist name, email, phone, address
  - Employer name, email, phone, address
  - Description of employer's trade/business/profession
  - **Official authorization document** signed by employer officer
  - General subjects of legislative interest
- **Must update within 30 days** of any changes

**Features to Build:**
- Multi-step registration form with validation
- Document upload for authorization (PDF/image)
- Email confirmation upon registration
- Update/edit mechanism for registered lobbyists
- Change history tracking
- Reminder system for updates

### 2. Exemptions (§3.803)

**Who is NOT required to register:**
- News media publishing/broadcasting news
- Government officials acting in official capacity
- Individuals giving public testimony only (no other lobbying)
- People responding to direct County requests
- Advisory committee/commission/workgroup participants
- **Anyone spending ≤10 hours per quarter lobbying** (excluding travel)

**Features to Build:**
- Exemption checker tool (help users understand if they must register)
- Hour tracking/calculator
- Clear guidance on exemptions

### 3. Lobbyist Quarterly Expense Statements (§3.805)

**Requirements from Ordinance:**
- Filed **quarterly** by all active lobbyists
- Due dates:
  - **April 15** (Jan 1 - Mar 31)
  - **July 15** (Apr 1 - Jun 30)
  - **October 15** (Jul 1 - Sep 30)
  - **January 15** (Oct 1 - Dec 31)
- Must include:
  - Total money spent on food, refreshments, entertainment for lobbying
  - **Itemized list** for any expenditure >$50 to/for any public official:
    - Official's name
    - Date
    - Payee name
    - Purpose
    - Amount
  - Estimates allowed if exact amount unknown (update in next report)
  - Does NOT include: personal living/travel expenses, office overhead, salaries
  - Copy of any ORS 244.100 notices

**Features to Build:**
- Quarterly reporting form
- Automated email reminders (2 weeks before, 1 week before, day before, day of)
- Expense line items with validation
- Total calculations
- Estimate flag with follow-up tracking
- Late submission tracking
- Report PDF generation
- Historical report viewing

### 4. Employer Expense Statements (§3.806)

**Requirements from Ordinance:**
- Filed **quarterly** by any person/org that employed a registered lobbyist
- Same due dates as lobbyist reports
- Must include:
  - Total money spent on lobbying activities (excluding lobbyist living/travel)
  - Itemized list for any expenditure >$50 to/for public official (same details as above)
  - Name of each registered lobbyist paid, with total amount paid to each
  - Copy of any ORS 244.100 notices

**Features to Build:**
- Employer reporting form
- Auto-populate list of registered lobbyists for that employer
- Expense tracking per lobbyist
- Automated reminders
- Report validation (check against lobbyist reports for discrepancies)
- PDF generation

### 5. Board Member Calendar & Reporting (§3.001)

**Requirements from Ordinance:**
- Post **quarterly calendar** within 15 days after quarter ends
- Calendar must include:
  - Event title
  - Date
  - Time
  - Primary participants or organizations in attendance
  - (Exempt under Oregon Public Records Law if applicable)
- Post **lobbying receipt statement** quarterly showing:
  - Total money received for food/refreshments/entertainment from lobbyists
  - Name of each lobbyist who spent >$50 on board member
  - Date, payee, purpose, amount of expenditures
- Must remain **publicly posted for at least 1 year**

**Features to Build:**
- Board member dashboard
- Calendar entry form (bulk import option)
- Lobbying receipt form
- Automatic 1-year retention
- Public view of board calendars
- Integration with lobbyist expense reports (cross-reference)

### 6. Prohibited Conduct (§3.804)

**Legal Prohibitions:**
- Cannot instigate legislation to create lobbying work against it
- Cannot influence Board vote via promises/threats of campaign financing
- Cannot lobby for **contingency fee** (payment based on success)
- Public officials cannot receive payment (except from County) for lobbying
- **1-year cooling off period**: Former public officials cannot lobby on matters they had authority over

**Features to Build:**
- Prohibited conduct warnings during registration
- Attestation/certification checkboxes
- Former public official declaration
- Cooling-off period tracking
- Violation reporting mechanism

### 7. Penalties & Enforcement (§3.807-§3.809)

**Requirements from Ordinance:**
- All reports must be **verified under penalty of false swearing**
- No false statements or misrepresentations allowed
- Violations: **Fine up to $500**
- Initial implementation: education letters preferred over fines
- **Appeals**: Must be postmarked within **30 days** of fine notice
- Appeal triggers hearing

**Features to Build:**
- Verification/attestation on all submissions
- Compliance dashboard for admins
- Violation tracking system
- Fine issuance workflow
- Appeal submission form
- Appeal deadline tracking
- Hearing scheduling
- Penalty history

### 8. Contract Regulation Amendment (§9.230)

**Requirements from Ordinance:**
- County cannot contract with elected officials, employees, or volunteers who influenced the contract authorization during or **within 1 year after** County service
- Contracts in violation are **void** unless exception granted
- Chair can grant exception with written findings:
  - Best interests of County favor the contract, OR
  - Person's influence was minimal
- Exception must be **publicly posted**

**Features to Build:**
- Former official registry
- Contract conflict checker
- 1-year tracking system
- Exception request workflow
- Public posting of exceptions

### 9. Public Transparency Dashboard

**Core Requirements:**
- All data must be **publicly accessible**
- Searchable by:
  - Lobbyist name
  - Employer/organization
  - Subject matter
  - Date range
  - Board member
  - Expenditure amount
- Downloadable data (CSV/Excel)
- Historical trends and analytics
- Mobile-responsive

**Features to Build:**
- Public search interface
- Advanced filters
- Data visualization (charts/graphs)
- Export functionality
- API for data access (future)
- Printable reports

### 10. Administrative Tools

**Compliance Monitoring:**
- Dashboard showing:
  - Registration status
  - Upcoming deadlines
  - Overdue reports
  - Violations and fines
  - Appeals pending
- Bulk notification system
- Report review/approval workflow
- Data quality checks

**User Management:**
- Role-based access control:
  - Public (read-only transparency data)
  - Lobbyist (register, report)
  - Employer (authorize lobbyists, report)
  - Board Member (calendar, receipts)
  - Admin (full system access)
- Account creation/deactivation
- Password reset
- Audit logging

## Technical Architecture

### Phase 1: Rapid Prototype (Current)

**Technology Stack:**
```
Frontend:     Next.js 15 (App Router)
              React 19
              TypeScript
              Tailwind CSS
              shadcn/ui components

Backend:      Next.js API Routes
              TypeScript

Database:     SQLite
              Prisma ORM

Auth:         NextAuth.js

Files:        Local filesystem

Email:        Nodemailer (local SMTP)
```

**Why These Choices:**
- Fast development velocity
- Single codebase (easy to manage)
- Zero infrastructure setup
- Hot reload for rapid iteration
- Easy to show stakeholders

### Phase 4: Government Production Hardening (Future)

**Technology Stack:**
```
Frontend:     Next.js 15 (same)
              Deployed to Vercel/Cloud Run

Backend:      Next.js API Routes (or separate FastAPI)

Database:     PostgreSQL
              Google Cloud SQL or Azure Database

Auth:         Azure AD or Google Identity Platform
              (Government SSO)

Files:        Google Cloud Storage or Azure Blob

Email:        SendGrid or Gov't email service

Infrastructure: Docker containers
                Terraform for IaC
                Cloud Run or Azure App Service
```

**Migration Path:**
- Database: Prisma supports PostgreSQL with same schema
- Auth: Swap NextAuth provider
- Storage: Abstract file operations, swap adapter
- Deploy: Dockerize and push to cloud
- Security: Penetration testing, ATO process
- Training: User guides, admin documentation

### Database Schema (Core Entities)

```sql
-- User Management
users
  id, email, role, name, created_at, updated_at

-- Lobbyist Registration
lobbyists
  id, user_id, name, email, phone, address,
  registration_date, status, hours_current_quarter

employers
  id, name, email, phone, address, business_description,
  created_at, updated_at

lobbyist_employers (many-to-many relationship)
  id, lobbyist_id, employer_id,
  authorization_document_url, authorization_date,
  start_date, end_date, subjects_of_interest

-- Quarterly Reporting
lobbyist_expense_reports
  id, lobbyist_id, quarter, year,
  total_food_entertainment, status,
  submitted_at, due_date

expense_line_items
  id, report_id, report_type,
  official_name, date, payee, purpose, amount,
  is_estimate

employer_expense_reports
  id, employer_id, quarter, year,
  total_lobbying_spend, status,
  submitted_at, due_date

employer_lobbyist_payments
  id, employer_report_id, lobbyist_id, amount_paid

-- Board Member Tracking
board_members
  id, user_id, name, district,
  term_start, term_end, is_active

board_calendar_entries
  id, board_member_id, event_title,
  event_date, event_time, participants_list,
  quarter, year

board_lobbying_receipts
  id, board_member_id, lobbyist_id,
  amount, date, payee, purpose,
  quarter, year

-- Compliance & Enforcement
violations
  id, entity_type, entity_id,
  violation_type, description,
  fine_amount, status, issued_date

appeals
  id, violation_id, submitted_date,
  appeal_deadline, reason, status,
  hearing_date, decision

contract_exceptions
  id, former_official_id, contract_description,
  justification, approved_by, approved_date,
  publicly_posted_date

-- Audit Trail
audit_log
  id, user_id, action, entity_type, entity_id,
  changes_json, ip_address, timestamp
```

### Security & Compliance

**Authentication & Authorization:**
- Role-based access control (RBAC)
- Multi-factor authentication (future)
- Session management
- Password complexity requirements

**Data Security:**
- HTTPS only (TLS 1.3)
- Encrypted database connections
- Encrypted file storage
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- CSRF protection (Next.js built-in)

**Audit & Compliance:**
- Complete audit trail (who, what, when)
- Immutable logs
- Data retention policies
- Backup and recovery procedures
- Disaster recovery plan

**Accessibility:**
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast ratios
- Alternative text for images
- Accessible forms with proper labels

## Development Roadmap

### Milestone 1: Foundation (Weeks 1-2)
- [ ] Project setup (Next.js, Prisma, TypeScript)
- [ ] Database schema design and initial migration
- [ ] Authentication system (basic NextAuth)
- [ ] User roles and permissions
- [ ] Basic UI layout and navigation

### Milestone 2: Lobbyist Registration (Weeks 3-4)
- [ ] Registration form with validation
- [ ] Employer authorization workflow
- [ ] Document upload system
- [ ] Registration confirmation emails
- [ ] Update/edit registration
- [ ] Admin registration review

### Milestone 3: Quarterly Reporting (Weeks 5-7)
- [ ] Lobbyist expense report form
- [ ] Employer expense report form
- [ ] Quarterly deadline calculations
- [ ] Automated reminder system
- [ ] Report submission workflow
- [ ] Report history and viewing
- [ ] Admin report review

### Milestone 4: Board Member Tools (Weeks 8-9)
- [ ] Board member dashboard
- [ ] Calendar entry system
- [ ] Lobbying receipt tracking
- [ ] Quarterly posting automation
- [ ] Public calendar view

### Milestone 5: Public Dashboard (Weeks 10-11)
- [ ] Public search interface
- [ ] Advanced filtering
- [ ] Lobbyist directory
- [ ] Expense report viewing
- [ ] Data export (CSV/Excel)
- [ ] Basic data visualization

### Milestone 6: Compliance & Admin (Weeks 12-13)
- [ ] Compliance monitoring dashboard
- [ ] Violation tracking
- [ ] Fine issuance workflow
- [ ] Appeal submission and tracking
- [ ] Contract conflict checker
- [ ] Exception request workflow

### Milestone 7: Testing & Refinement (Weeks 14-15)
- [ ] User acceptance testing
- [ ] Accessibility audit
- [ ] Security review
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation

### Milestone 8: Production Preparation (Weeks 16-18)
- [ ] Migration to PostgreSQL
- [ ] Cloud deployment setup
- [ ] SSO integration
- [ ] Backup/recovery testing
- [ ] Training materials
- [ ] User guides
- [ ] Admin documentation

## Success Metrics

### Compliance Metrics
- % of lobbyists registered on time (target: >95%)
- % of quarterly reports submitted on time (target: >90%)
- Average time from registration to approval (target: <3 days)
- Number of violations issued
- Appeal resolution time (target: <30 days)

### User Experience Metrics
- Registration completion rate (target: >90%)
- Average time to complete registration (target: <15 minutes)
- Report submission completion rate (target: >95%)
- User support tickets per month (target: <10)
- User satisfaction score (target: >4/5)

### Transparency Metrics
- Public dashboard page views
- Number of data downloads
- Search queries performed
- Media inquiries using the system
- Public feedback sentiment

### Technical Metrics
- System uptime (target: 99.5%)
- Page load time (target: <3 seconds)
- Mobile responsiveness score (target: 100/100)
- Accessibility score (target: WCAG 2.1 AA)
- Security audit findings (target: 0 critical)

## Risk Management

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data migration issues | Medium | High | Extensive testing, rollback plan |
| Integration with gov't SSO | High | Medium | Early POC, vendor support |
| Performance at scale | Low | Medium | Load testing, caching strategy |
| Security vulnerabilities | Medium | High | Regular audits, penetration testing |

### Operational Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Training, user support, communications |
| Delayed approval process | High | Medium | Early stakeholder engagement |
| Staff turnover | Medium | Medium | Documentation, knowledge transfer |
| Budget constraints | Low | High | Phased approach, open source tools |

### Political Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Ordinance changes | Low | High | Flexible architecture, configuration |
| Leadership changes | Medium | Medium | Document decisions, broad buy-in |
| Public backlash | Low | Medium | Transparency, public engagement |
| Legal challenges | Low | High | Legal review, compliance focus |

## Budget Estimate

### Phase 1: Prototype Development
- Development: ~80-120 hours
- Testing: ~20-30 hours
- Infrastructure: $0 (local development)
- **Total Phase 1: ~$8,000-$12,000** (contractor rates)

### Phase 2: Production Deployment
- Security audit: $5,000-$10,000
- Accessibility audit: $3,000-$5,000
- Cloud hosting (annual): $2,400-$6,000
- Domain/SSL: $100-$200/year
- **Total Phase 2: ~$10,500-$21,200**

### Ongoing Costs (Annual)
- Cloud hosting: $2,400-$6,000
- Support/maintenance: $6,000-$12,000
- Enhancements: $3,000-$6,000
- **Total Annual: ~$11,400-$24,000**

## Stakeholder Communication Plan

### Key Stakeholders
1. **Board of Commissioners** - Final approval, policy decisions
2. **County Attorney** - Legal compliance, ordinance interpretation
3. **IT Department** - Infrastructure, security, support
4. **Communications Office** - Public education, rollout
5. **Lobbyists & Employers** - Primary users, feedback
6. **Public Interest Groups** - Transparency advocates, testing

### Communication Cadence
- **Weekly:** Development updates to project team
- **Bi-weekly:** Demo sessions with stakeholders
- **Monthly:** Status report to Board
- **Quarterly:** Public update on county website

## Planning Phase Complete ✅

### Completed Artifacts
1. ✅ **User Story Map** (`user-story-map.html`)
   - 5 user role journeys visualized
   - MVP, Phase 2, Phase 3 priorities defined
   - Complete feature breakdown by role

2. ✅ **Wireframes** (`wireframes/`)
   - 4 core screens designed with interactive HTML
   - Multi-step registration wizard
   - Expense reporting with CSV upload capability
   - Admin compliance dashboard
   - Public search interface with advanced filters
   - Design rationale documented in each wireframe

3. ✅ **Project Documentation**
   - CLAUDE.md - Development guide for AI assistants
   - PROJECT.md (this file) - Comprehensive requirements
   - Ordinance requirements extracted and mapped

4. ✅ **Issue Tracking** (`.beads/`)
   - Beads system initialized
   - All MVP issues (#1-25) completed

## MVP Development Complete ✅

### Implemented Features (Phase 1)
- ✅ **Lobbyist Registration** - Multi-step wizard with document upload
- ✅ **Quarterly Expense Reporting** - Manual entry, CSV upload, bulk paste modes
- ✅ **Board Member Calendar** - Manual entry, CSV upload, ICS/iCal import
- ✅ **Board Member Receipts** - CSV upload, bulk paste modes
- ✅ **Public Search** - Searchable registry with filters and CSV export
- ✅ **Admin Dashboard** - Compliance monitoring and review workflows
- ✅ **Authentication** - NextAuth with role-based access control
- ✅ **Database** - Prisma ORM with SQLite, migrations, seed data
- ✅ **Accessibility** - WCAG 2.1 AA compliant throughout
- ✅ **Email Notifications** - Console logging (production: SendGrid/gov email)

### Test Credentials (Seed Data)
- **Admin:** admin@multnomah.gov / admin123
- **Lobbyist:** john.doe@lobbying.com / lobbyist123
- **Employer:** contact@techcorp.com / employer123
- **Board Member:** commissioner@multnomah.gov / board123
- **Public:** public@example.com / public123

## Production Deployment Complete ✅

### Deployment Details
- **Platform:** Google Cloud Run (serverless containers)
- **Region:** us-west1 (Oregon)
- **Container Registry:** Artifact Registry
- **Build System:** Cloud Build
- **Database:** SQLite (prototype), PostgreSQL ready for Phase 2
- **Secrets Management:** Google Secret Manager
- **Cost:** Free tier (~$0-5/month for demo usage)
- **Deployment Date:** October 15, 2025

### Live URLs
- **Application:** https://lobbyist-registration-679888289147.us-west1.run.app
- **Demo Guide:** https://lobbyist-registration-679888289147.us-west1.run.app/DEMO-GUIDE.html
- **Compliance Matrix:** https://lobbyist-registration-679888289147.us-west1.run.app/ORDINANCE-COMPLIANCE.html

### Deployment Documentation
- `DEPLOYMENT-PLAN.md` - Complete deployment guide with all steps
- `QUICKSTART-DEPLOY.md` - Fast-track deployment (5 minutes)
- `DEPLOYMENT-CHECKLIST.md` - Interactive checklist for deployment
- `deploy.sh` - Automated deployment script
- `grant-access.sh` - Script to grant users access

### Key Design Decisions Made
- **Multi-step registration** to reduce cognitive load
- **Multiple input methods** for expense reporting (manual, CSV upload, bulk paste)
- **Alert-driven admin interface** to prioritize urgent compliance items
- **Collapsible advanced filters** for public search to keep UI simple
- **CSV template download** for bulk expense imports

## Next Steps

### Immediate Actions (This Week)
1. ✅ Create CLAUDE.md and PROJECT.md
2. ✅ Create user story map
3. ✅ Design core wireframes
4. ✅ Initialize Beads issue tracking
5. **→ Populate Beads with MVP issues from user story map**
6. **→ Initialize Next.js project with TypeScript**
7. **→ Set up Prisma with initial schema based on wireframes**

### Short-term Actions (Next 2 Weeks)
1. Create database schema migration (all tables)
2. Set up authentication (NextAuth.js)
3. Build lobbyist registration form (following wireframe #1)
4. Implement document upload for authorization
5. Create admin review interface

### Medium-term Actions (Next Month)
1. Implement quarterly expense reporting (following wireframe #2 with CSV upload)
2. Build admin compliance dashboard (following wireframe #3)
3. Create public search interface (following wireframe #4)
4. Implement email notification system
5. Demo to initial stakeholders

## Phase 2: Ordinance Compliance (Current)

### Overview
Phase 2 focuses on completing all ordinance-mandated features that were marked as "Future" in the compliance matrix. These are critical enforcement and tracking features required for full legal compliance.

### Phase 2 Issues (Beads #26-30)
1. **#26 - Violation Tracking & Fine Issuance (§3.808, §3.809)** - IN PROGRESS
   - Admin UI to record violations
   - Fine issuance workflow (up to $500)
   - Fine payment tracking
   - Violation history per lobbyist/employer
   - Educational letters vs. fines toggle

2. **#27 - Appeals Process Workflow (§3.809)**
   - Appeal submission form for violators
   - 30-day deadline tracking (postmarked)
   - Hearing scheduling interface
   - Appeal decision recording
   - Appeal status tracking

3. **#28 - Contract Exception Management (§9.230)**
   - Former official registry (1-year cooling off)
   - Contract conflict checker
   - Exception request workflow
   - Written findings by Chair/designee
   - Public posting of granted exceptions

4. **#29 - Lobbyist Hour Tracking (§3.803(F))**
   - Lobbyist hour logging interface
   - Quarterly hour totals (excludes travel time)
   - Automatic registration trigger when >10 hours
   - Hour history tracking

5. **#30 - Payment Processor Integration**
   - Stripe or government payment system
   - Annual registration fee tracking
   - Receipt generation
   - Payment history

### Phase 2 Timeline
- **Duration:** 3-4 weeks
- **Completion Target:** Mid-November 2025
- **Deployment:** Incremental updates to production

---

## Phase 3: Advanced Features (Future)

### Overview
Phase 3 includes enhancements beyond ordinance requirements, focusing on user experience improvements and advanced analytics.

### Phase 3 Issues (Beads #31+)
1. **#31 - Public Analytics Dashboard**
   - Top spenders visualization
   - Trending subjects analysis
   - Spending trends over time
   - Interactive charts and graphs

### Phase 3 Features: Advanced Bulk Import (COMPLETED ✅)

#### Board Member Calendar Bulk Import
**Problem:** Board members may have dozens of calendar entries per quarter. Manual entry is time-consuming and error-prone.

**Proposed Solutions:**
1. **ICS/iCal File Import** (Priority: High)
   - Allow board members to export their calendar from Outlook, Google Calendar, Apple Calendar, etc. as .ics file
   - Parse ICS file format to extract event details (title, date, time, participants)
   - Intelligent participant detection (parse attendee list, meeting notes)
   - Preview imported events before adding to database
   - Benefits:
     - Dramatically reduces data entry time
     - Increases accuracy (no manual transcription errors)
     - Seamless integration with existing calendar workflows
     - Most calendar applications support ICS export

2. **CSV Upload for Calendar Entries**
   - Template: Event Title, Date (YYYY-MM-DD), Time (HH:MM), Participants
   - Similar to expense CSV upload workflow
   - Good for batch creation of events

3. **Calendar Sync Integration** (Future)
   - Direct OAuth integration with Google Calendar, Outlook Calendar
   - Automated quarterly sync with permission
   - Real-time or scheduled pulls

**Technical Considerations:**
- Use `ical` npm package for parsing ICS files
- Validate date/time formats across different calendar exports
- Handle recurring events (may need manual review)
- Privacy filtering for private/confidential events

#### Board Member Lobbying Receipts Bulk Import
**Problem:** Board members receiving multiple lobbying interactions need efficient entry methods matching lobbyist/employer workflows.

**Proposed Solutions:**
1. **CSV Upload for Receipts**
   - Template: Lobbyist Name, Date (YYYY-MM-DD), Payee, Purpose, Amount, Is Estimate (TRUE/FALSE)
   - Reuse existing CSV upload component from expense reporting
   - Same validation and preview workflow

2. **Bulk Paste Mode for Receipts**
   - Copy/paste from spreadsheets
   - Tab or comma-separated values
   - Reuse existing BulkPasteMode component

3. **Cross-Reference with Lobbyist Reports**
   - Suggest receipts from submitted lobbyist expense reports
   - Pre-populate receipt data where lobbyist already reported expense to board member
   - Reduces duplicate data entry and increases accuracy

**Benefits:**
- Consistency across all reporting interfaces
- Reduced training burden (users already familiar with these input methods)
- Faster quarterly compliance
- Better data accuracy

**Implementation Notes:**
- Refactor ManualEntryMode, CSVUploadMode, BulkPasteMode to be more generic/reusable
- Create shared types for different line item formats
- Consider a "line item factory" pattern for different entity types

### Technical Debt & Code Quality
- Extract shared CSV/Bulk paste logic into reusable hooks
- Create unified "bulk import" component framework
- Add comprehensive error handling for file parsing
- Implement file size limits and validation
- Add progress indicators for large file uploads

## References

### Legal Documents
- Multnomah County Government Accountability Ordinance (April 2, 2025)
- Oregon Revised Statutes (ORS) 244.100
- Oregon Public Records Law

### Technical References
- Next.js 15 Documentation
- Prisma Documentation
- WCAG 2.1 Guidelines
- OWASP Security Guidelines
- ICS/iCal Format Specification (RFC 5545)

### Similar Systems
- City of Portland Lobbyist Registry
- Metro Lobbyist Registration
- Oregon State Lobbyist Database (ORESTAR)

---

**Document Version:** 3.0
**Last Updated:** October 16, 2025
**Project Status:** Phase 1 Complete → Phase 2 In Progress (Ordinance Compliance)
**Current Phase:** Phase 2 - Ordinance Compliance (Issues #26-30)
**Production URL:** https://lobbyist-registration-679888289147.us-west1.run.app
**Target Launch:** June 2026 (before July 1, 2026 ordinance effective date)

---

## Issue Tracking
This project uses **Beads** for issue tracking. All development tasks are managed via `bd` command.
- Location: `.beads/lobbyist-registration.db`
- View issues: `bd list`
- Show ready work: `bd ready`
- Create issues: `bd create "Issue title" --labels mvp,feature`
