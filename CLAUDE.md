# CLAUDE.md - Lobbyist Registration System

## Project Overview
Web application to satisfy Multnomah County's Government Accountability Ordinance (effective July 1, 2026) establishing lobbyist registration and reporting requirements.

## Current Project Status
- ✅ **Planning Complete:** User story map, wireframes, and technical architecture defined
- ✅ **UI/UX Complete:** Navigation redesign, dashboard improvements, role-based separation
- ✅ **Board Member Calendar:** §3.001 compliance feature complete
- ✅ **Dev Deployment:** Live on Google Cloud Run with Cloud SQL PostgreSQL
- ✅ **Production Deployment:** Live on Google Cloud Run with Cloud SQL PostgreSQL
- ✅ **Modernization Complete:** Phases 1-4 complete (testing, CI/CD, PostgreSQL, security/monitoring)
- ✅ **Security & Monitoring:** Sentry error tracking, Secret Manager, Dependabot, SECURITY.md, MONITORING.md
- 📅 **Target Launch:** June 2026 (before July 1, 2026 ordinance effective date)
- 🔄 **Next:** Fix E2E tests, stakeholder demos

## Deployment Status

### Dev Environment ✅
- **URL:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
- **Status:** Active (auto-deploy from `develop` branch via Cloud Build)
- **Database:** Cloud SQL PostgreSQL (`lobbyist_dev` database)
- **Features:** All features including latest improvements
- **Seed Data:** Rule of 3 pattern (3 lobbyists, 3 employers, 3 board members, realistic Portland data)
- **Purpose:** Testing and iteration
- **Min Instances:** 1 (always-on for consistent demo data)

### Production Environment ✅
- **URL:** https://lobbyist-registration-zzp44w3snq-uw.a.run.app
- **Status:** Active (manual approval deploys from `main` branch via Cloud Build)
- **Database:** Cloud SQL PostgreSQL (`lobbyist_prod` database)
- **Features:** Production-ready with all modernization phases complete
- **Seed Data:** Rule of 3 pattern (same as dev)
- **Purpose:** Stakeholder demos and production use
- **Min Instances:** 0 (scales to zero when not in use)
- **Monitoring:** Sentry error tracking, Cloud Run metrics, Cloud SQL monitoring

## Project Artifacts

### Planning & Design
- `user-story-map.html` - Visual user story map with all user journeys and priorities
- `wireframes/` - Interactive HTML wireframes for 5 screens:
  - `01-lobbyist-registration.html` - Multi-step registration wizard
  - `02-quarterly-expense-report.html` - Expense reporting with CSV upload
  - `03-admin-compliance-dashboard.html` - Admin monitoring interface
  - `04-public-search-interface.html` - Public transparency search
  - `dashboard-ux-improvements.html` - Interactive UX prototype (Oct 19, 2025)

### Documentation
- `CLAUDE.md` - This file - project overview and development guidelines
- `PROJECT.md` - Comprehensive requirements and roadmap
- `SECURITY.md` - Security vulnerability disclosure policy and measures
- `MONITORING.md` - Monitoring and alerting setup guide
- `MODERNIZATION-ROADMAP.md` - 8-week modernization plan (Phases 1-4 complete)
- `ARCHITECTURE-DECISIONS.md` - Architectural framework and design patterns

### Session Summaries
- `SESSION-SUMMARY-2025-10-19-UX-Improvements.md` - Navigation & dashboard redesign
- `SESSION-SUMMARY-2025-10-17-Database-Seeding.md` - Runtime seeding implementation
- `SESSION-SUMMARY-2025-10-17-Production-Migration.md` - Production deployment work
- `SESSION-SUMMARY-2025-10-17-Runtime-Seeding.md` - Database initialization
- `SESSION-SUMMARY-2025-10-17-Security.md` - Security improvements
- `SESSION-SUMMARY-2025-10-18-Feature-Flags.md` - Feature flag system

### Compliance & Demos
- `DEMO-GUIDE.html` - Interactive demo walkthrough (also available online)
- `ORDINANCE-COMPLIANCE.html` - Compliance matrix showing requirements met
- `Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf` - Source ordinance

### Deployment
- `DEPLOYMENT-PLAN.md` - Complete Google Cloud deployment guide
- `QUICKSTART-DEPLOY.md` - Fast-track deployment instructions
- `DEPLOYMENT-CHECKLIST.md` - Step-by-step deployment checklist

## Project Context
This is a **civic technology project** focused on government transparency and accountability. The application will be used by:
- Lobbyists (registration and quarterly reporting)
- Employers of lobbyists (expense reporting)
- County Board Members (calendar posting and receipt tracking)
- County Administrators (compliance monitoring)
- General Public (transparency dashboard)

## Development Approach

### Current Production Stack ✅
**Tech Stack:**
- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes (monolithic)
- **Database:** PostgreSQL (Cloud SQL) with Prisma ORM
- **Auth:** NextAuth.js with secure session management
- **Secrets:** Google Cloud Secret Manager
- **Deployment:** Google Cloud Run (containerized with Docker)
- **CI/CD:** GitHub Actions + Cloud Build Triggers
- **Error Tracking:** Sentry (with PII filtering)
- **Security:** Dependabot automated dependency updates
- **Infrastructure:** GCP (Cloud Run, Cloud SQL, Secret Manager, Cloud Build)

**Philosophy:** Production-ready government application with security, monitoring, and scalability

### Completed Modernization Phases (Oct 2025)
- **Phase 1:** Code Quality Foundation - Prettier, Husky, pre-commit hooks, build quality gates
- **Phase 2:** Testing Infrastructure - Vitest unit tests, 80% code coverage, component tests
- **Phase 3:** Production Infrastructure - PostgreSQL migration, GitHub Actions CI/CD, Dependabot
- **Phase 4:** Security & Monitoring - Sentry error tracking, Secret Manager, security documentation

### Future Enhancements (Phase 5+)
**Planned for Post-Launch:**
- Auth: NextAuth → Government SSO (Azure AD or Google Identity)
- Storage: Local files → Cloud Storage (GCS for document uploads)
- Infrastructure: Terraform for infrastructure-as-code
- Monitoring: Custom dashboards, advanced alerting
- Performance: CDN, caching strategies, query optimization

## Critical Development Rules

### Issue Tracking with Beads
**THIS PROJECT USES BEADS (`bd`) FOR ISSUE TRACKING**

Beads is initialized in `.beads/` directory. Use it for all task management instead of TodoWrite tool.

**Common Commands:**
```bash
# List all issues
bd list

# Create new issue
bd create "Issue title" --labels feature,mvp

# Show issue details
bd show <id>

# Update issue status
bd update <id> --status in-progress
bd update <id> --status done

# Mark dependencies (issue X blocks issue Y)
bd dep add <blocker-id> <blocked-id>

# Show ready work (no blockers)
bd ready

# Show blocked issues
bd blocked
```

**Issue Labels to Use:**
- `mvp` - Phase 1 must-have features
- `phase2` - Post-launch enhancements
- `phase3` - Future improvements
- `bug` - Defects to fix
- `feature` - New functionality
- `wireframe` - Implementing wireframe designs
- `database` - Database schema or migration work
- `ui` - Frontend/UI work
- `backend` - API/backend work
- `accessibility` - WCAG compliance work
- `documentation` - Docs and guides

**Workflow:**
1. Before starting work: `bd ready` to see available tasks
2. Pick an issue and mark in-progress: `bd update <id> --status in-progress`
3. Complete work and close: `bd close <id>`
4. Create new issues as discovered: `bd create "New task"`

### Database Management
**GOLDEN RULE: Schema changes ONLY through migration files**

```bash
# To change database schema
npm run prisma:migrate dev --name descriptive_name

# NEVER manually alter database
# NEVER modify schema without migration
# ALWAYS commit migration files
```

**Why:** Prevents "vibe coding" chaos where database structure becomes unpredictable.

### File Structure
```
/
├── .beads/              # Beads issue tracking database
├── .github/             # GitHub Actions workflows and Dependabot config
├── wireframes/          # Interactive HTML wireframes
│   ├── index.html                    # Wireframe index
│   ├── 01-lobbyist-registration.html
│   ├── 02-quarterly-expense-report.html
│   ├── 03-admin-compliance-dashboard.html
│   └── 04-public-search-interface.html
├── app/                 # Next.js 15 app router
│   ├── (authenticated)/ # Protected routes
│   ├── (public)/        # Public routes (no auth required)
│   ├── api/             # API routes
│   └── auth/            # Authentication pages
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   └── ...              # Feature-specific components
├── lib/                 # Utilities, db client, helpers
├── types/               # TypeScript type definitions
├── prisma/              # Database layer
│   ├── schema.prisma    # Database schema (source of truth)
│   ├── migrations/      # Version-controlled schema changes
│   └── seed.ts          # Rule of 3 demo data generation
├── public/              # Static assets
├── tests/               # Test suites
│   ├── e2e/             # Playwright end-to-end tests
│   └── unit/            # Vitest unit tests
├── docs/                # Session summaries and guides
├── scripts/             # Utility scripts
├── user-story-map.html  # Visual user story map
├── CLAUDE.md            # This file - development guide
├── PROJECT.md           # Project requirements and roadmap
├── SECURITY.md          # Security vulnerability disclosure policy
├── MONITORING.md        # Monitoring and alerting setup guide
└── Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf
```

## Key Features to Implement

### 1. Lobbyist Registration Portal
- Registration form with all required fields (§3.802)
- Employer authorization document upload
- 30-day update mechanism
- Three-day registration deadline after exceeding 10 hours

### 2. Quarterly Expense Reporting
- Lobbyist expense statements (§3.805)
- Employer expense statements (§3.806)
- **Multiple input methods:** Manual entry, CSV upload, bulk paste (wireframe implemented)
- Automated deadline reminders (April 15, July 15, Oct 15, Jan 15)
- Expenditure tracking (>$50 itemization requirement)
- Estimate vs. actual expense workflow
- CSV template download for bulk import
- Preview and validation before import

### 3. Board Member Transparency
- Quarterly calendar posting (§3.001)
- Lobbying receipt tracking
- Public posting for minimum 1 year

### 4. Public Transparency Dashboard
- Searchable lobbyist registry
- Public expense reports
- Board member calendars
- Advanced search and filtering

### 5. Admin/Compliance Panel
- Registration review and approval
- Compliance monitoring
- Fine issuance (§3.808 - up to $500)
- Appeal tracking (§3.809 - 30-day window)
- Violation tracking

### 6. Notification System
- Quarterly deadline reminders
- Registration confirmations
- Compliance alerts
- Appeal deadline notices

## Government Compliance Requirements

### Accessibility
- WCAG 2.1 AA compliance minimum
- Screen reader compatible
- Keyboard navigation
- Color contrast ratios
- Alt text for images

### Security
- HTTPS only
- Data encryption at rest and in transit
- Audit logging (who, what, when)
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (Prisma handles this)

### Data Privacy
- PII handling procedures
- Data retention policies
- Right to access/correct data
- Public records law compliance

### Performance
- Fast page loads (<3s)
- Mobile responsive
- Works on government networks
- Offline-capable forms (progressive enhancement)

## Working with Claude Code

### Before Starting Development
1. Check existing issues: `bd ready` or `bd list`
2. Review relevant wireframe in `wireframes/` directory
3. Review user story map: `user-story-map.html`
4. Read relevant ordinance section from PDF

### When Starting a New Feature
1. Create/find issue in Beads: `bd create "Feature name" --labels feature,mvp`
2. Mark as in-progress: `bd update <id> --status in-progress`
3. Reference wireframe if available (4 core screens have wireframes)
4. Create database migrations if needed
5. Build API routes following wireframe data requirements
6. Create UI components matching wireframe design
7. Test workflow end-to-end
8. Close issue: `bd close <id>`
9. Document any assumptions or deviations from wireframe

### When Making Schema Changes
```bash
# 1. Modify prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate dev --name add_field_name
# 3. Update TypeScript types
npm run prisma:generate
# 4. Commit migration file
git add prisma/migrations/
```

### When Implementing Wireframes
Wireframes are in `wireframes/` and are interactive HTML with design notes:
- `01-lobbyist-registration.html` - Multi-step registration wizard
- `02-quarterly-expense-report.html` - Expense reporting with CSV upload
- `03-admin-compliance-dashboard.html` - Admin monitoring interface
- `04-public-search-interface.html` - Public transparency search

Each wireframe includes a "Design Notes" section at bottom explaining:
- Why certain approaches were chosen
- Alternative approaches considered
- Accessibility considerations
- Mobile responsiveness notes
- Future enhancements

**Use wireframes as specifications, not pixel-perfect mockups.** Focus on:
- Information architecture
- Field requirements from ordinance
- User workflow
- Validation rules
- Accessibility patterns

### Testing Approach
- Test with realistic data (use seed scripts)
- Validate all required fields from ordinance
- Test deadline calculations
- Test role-based access
- Test file uploads (registration, expense reports)
- Test CSV upload/import workflow
- Test public dashboard search with multiple filters
- Test accessibility (keyboard nav, screen readers)

## Ordinance Reference

The complete ordinance is located at:
`/Users/ianswanson/ai-dev/lobbyist-registration/Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf`

Key sections:
- **§3.800** - Purpose and Policy
- **§3.801** - Definitions
- **§3.802** - Registration Requirements
- **§3.803** - Exemptions
- **§3.804** - Prohibited Conduct
- **§3.805** - Lobbyist Expense Statements
- **§3.806** - Employer Expense Statements
- **§3.807** - False Statement Penalties
- **§3.808** - Penalties (up to $500 fine)
- **§3.809** - Appeals (30-day window)
- **§3.001(C)** - Board Member Reporting
- **§9.230(C)** - Contract Regulation (1-year cooling off)

## Design Principles

### User Experience
- **Simple first:** Start with basic workflows
- **Progressive disclosure:** Don't overwhelm users
- **Clear instructions:** Many users won't be tech-savvy
- **Helpful errors:** Guide users to fix problems
- **Confirmation messages:** Reassure users actions succeeded

### Data Model
- **Normalize properly:** Avoid data duplication
- **Track history:** Keep audit trail of changes
- **Soft deletes:** Never hard-delete data (compliance)
- **Timestamps:** created_at, updated_at on everything

### Code Quality
- **TypeScript strict mode:** Catch errors early
- **Component reuse:** Build once, use everywhere
- **Error boundaries:** Graceful failure handling
- **Loading states:** Never leave users hanging
- **Optimistic updates:** Feel fast even when slow

## Deployment Path

### Local Development

**Prerequisites:** Cloud SQL Proxy for PostgreSQL database access

```bash
# 1. Start Cloud SQL Proxy (in separate terminal)
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432

# 2. Set DATABASE_URL for local development
export DATABASE_URL="postgresql://lobbyist_user:PASSWORD@127.0.0.1:5432/lobbyist_dev"

# 3. Start Next.js dev server
npm run dev

# Other useful commands:
npm run prisma:studio    # View database with Prisma Studio
npm run prisma:seed      # Reseed database with Rule of 3 demo data
npm run db:reset         # Drop, recreate, migrate, and seed database
```

**Note:** Get the database password from Secret Manager:
```bash
gcloud secrets versions access latest --secret="lobbyist-db-url-dev"
```

### Development Environment (Cloud Run)
- **Auto-deploys** from `develop` branch via Cloud Build Triggers
- **URL:** https://lobbyist-registration-dev-zzp44w3snq-uw.a.run.app
- **Database:** Cloud SQL PostgreSQL (`lobbyist_dev`)
- **Purpose:** Testing and iteration

### Production Environment (Cloud Run)
- **Manual approval deploys** from `main` branch via Cloud Build Triggers
- **URL:** https://lobbyist-registration-zzp44w3snq-uw.a.run.app
- **Database:** Cloud SQL PostgreSQL (`lobbyist_prod`)
- **Purpose:** Live application for stakeholders

### Pre-Launch Checklist (Future)
- [ ] Government security review
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Penetration testing
- [ ] Training materials for users
- [ ] User documentation and help guides
- [ ] Authority to Operate (ATO) certification

## Contact & Governance
- **Developer:** Ian Swanson
- **Jurisdiction:** Multnomah County, Oregon
- **Ordinance Effective Date:** July 1, 2026
- **Target Launch:** Q2 2026 (before effective date)
- **Repository:** (TBD)

## Planning Artifacts Completed

✅ **User Story Map** (`user-story-map.html`)
- 5 user role journeys mapped
- Activities and tasks identified
- Priority levels assigned (MVP, Phase 2, Phase 3)
- Visualizes entire system scope

✅ **Wireframes** (`wireframes/`)
- 4 core screens designed with interactive HTML
- Design decisions documented in each wireframe
- Multiple input methods designed for expense reporting (manual, CSV, paste)
- Accessibility patterns established

✅ **Project Documentation** (`PROJECT.md`)
- Complete requirements from ordinance
- 18-week development roadmap
- Success metrics defined
- Risk management plan

## Notes for Claude Code

- This is a **data-intensive CRUD application** - your strength
- Requirements are **legally defined** - stick to ordinance text
- **Wireframes exist** - use them as specifications for the 4 core screens
- **User story map exists** - reference it for priorities and user flows
- **Government users** - prioritize clarity over cleverness
- **Public transparency** - assume all data may be public record
- **Long-term maintenance** - write maintainable, documented code
- **Accessibility is not optional** - it's a legal requirement
- **Use Beads (`bd`)** - all task tracking via Beads, not TodoWrite tool

When in doubt about a requirement, refer to:
1. Relevant wireframe (if available)
2. User story map for context
3. Ordinance PDF for legal requirements
4. PROJECT.md for comprehensive details
