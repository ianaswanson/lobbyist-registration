# Archive

This directory contains historical documentation that was moved from the root directory to reduce clutter. All documents are preserved for reference but are no longer actively maintained.

## Directory Structure

### `session-summaries/` (21 files)
Development session summaries documenting the complete history of the project:

- **Oct 17, 2025:** Database seeding, IaC setup, production migration, runtime seeding, security improvements
- **Oct 18, 2025:** Feature flags implementation
- **Oct 19, 2025:** UX improvements (navigation redesign)
- **Oct 21, 2025:** API integration tests, Cloud Build setup, UI fixes
- **Oct 22, 2025:** All 4 modernization phases (code quality, testing, CI/CD, security)
- **Oct 22, 2025:** PostgreSQL migration (Phase C), Rule of 3 demo data, SQLite multi-instance fix
- **Oct 23, 2025:** E2E test fixes and completion

These documents provide detailed historical context for all major development decisions and implementations.

### `deployment-docs/` (15 files)
Various deployment guides and documentation created during the deployment evolution:

- **Guides:** Deployment checklists, plans, recommendations, strategies, workflows
- **References:** Quick-start deploy, deployment index, options comparison
- **Status Reports:** Deployment report 2025-10-16, production status, production URL
- **Environment Docs:** Dev environment setup
- **Testing:** Deploy test documentation

**Current Deployment:** See `CLAUDE.md` and `MODERNIZATION-ROADMAP.md` in root for up-to-date deployment information.

### `migration-docs/` (12 files)
Documentation of completed migrations and modernization work:

- **PostgreSQL Migration:** Phase B (Cloud SQL setup), Phase C (dev and production deployment), migration plans and summaries
- **Modernization:** Quick-start guides, summaries, coverage checks
- **Database:** Runtime seeding implementation, Cloud SQL reseed session
- **Bug Fixes:** Polymorphic lineItems fix

**Current Status:** All migrations complete. PostgreSQL is now in production for both dev and prod environments.

### `historical/` (14 files)
One-off documents, completed roadmaps, and temporary documentation:

- **Roadmaps:** API implementation roadmap (completed)
- **Inventories:** TypeScript error inventory (resolved)
- **Reviews:** Seed data review (683 lines)
- **Analysis:** GitGuardian alert analysis
- **Setup Guides:** GitHub setup, accessibility guidelines
- **Project Docs:** Infrastructure-as-code, progress reports, proposals
- **Improvements:** Navigation improvements (completed)
- **Testing:** Testing issues (resolved)
- **Deployment:** Rule of 3 deployment success, quick-fill setup
- **Security:** Sentry setup details

## Active Documentation (Root Directory)

The following documents remain in the root directory as active, maintained references:

- **README.md** - Project readme
- **CLAUDE.md** - Main development guide (always up-to-date)
- **PROJECT.md** - Comprehensive project requirements
- **SECURITY.md** - Security policy and vulnerability disclosure
- **MONITORING.md** - Monitoring and alerting setup
- **ARCHITECTURE-DECISIONS.md** - Core architectural framework
- **MODERNIZATION-ROADMAP.md** - Current development roadmap
- **E2E-TEST-COVERAGE.md** - E2E test documentation
- **DEMO-QUICK-REFERENCE.md** - Quick reference for demos
- **SENTRY-SETUP.md** - Sentry error tracking setup

## Finding Historical Information

Use the following guide to find archived documentation:

| Topic | Location |
|-------|----------|
| How we implemented feature X | `session-summaries/SESSION-SUMMARY-YYYY-MM-DD-*.md` |
| Why we chose approach Y | `session-summaries/` or `migration-docs/` |
| Deployment process evolution | `deployment-docs/` |
| PostgreSQL migration details | `migration-docs/POSTGRESQL-*.md` |
| Modernization phase details | `session-summaries/SESSION-SUMMARY-2025-10-22-PHASE-*.md` |
| Original project proposal | `historical/PROPOSAL.md` |
| Completed roadmaps | `historical/*-ROADMAP.md` |

## Archive Statistics

- **Total Files:** 62 markdown files
- **Total Lines:** ~22,000 lines of documentation
- **Date Range:** October 17-23, 2025
- **Projects Documented:** Deployment, PostgreSQL migration, Modernization Phases 1-4, E2E testing

---

**Note:** This archive preserves the complete development history of the Lobbyist Registration System through October 2025. All work documented here is complete and in production.
