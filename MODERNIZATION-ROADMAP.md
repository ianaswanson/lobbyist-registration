# Modernization Roadmap
## Lobbyist Registration System - Production Readiness

**Document Version:** 1.0
**Created:** October 21, 2025
**Target Completion:** December 13, 2025 (8 weeks)
**Project Phase:** Pre-Launch Hardening

---

## Executive Summary

This roadmap transforms the lobbyist registration system from a functional prototype to a production-ready government platform. The work is organized into 4 phases over 8 weeks, addressing critical gaps in code quality, testing, infrastructure, and monitoring.

**Key Outcomes:**
- ✅ Production-grade code quality enforcement
- ✅ Comprehensive test coverage (E2E + Unit + Integration)
- ✅ Enterprise database infrastructure (PostgreSQL)
- ✅ Automated security and dependency management
- ✅ Real-time monitoring and error tracking
- ✅ Government-compliant secrets management

**Investment:** ~8 weeks development time, ~$77/month recurring costs

---

## Timeline Overview

```
Week 1-2: Code Quality Foundation (Phase 1)
Week 3-4: Testing Infrastructure (Phase 2)
Week 5-6: Production Infrastructure (Phase 3)
Week 7-8: Security & Monitoring (Phase 4)
```

---

## Phase 1: Code Quality Foundation
**Duration:** 2 weeks (Oct 21 - Nov 1)
**Goal:** Establish automated code quality enforcement
**Risk Level:** Low
**User Impact:** None (internal improvements)

### Week 1: Formatting & Linting

#### Day 1-2: Prettier Setup
- [ ] Install Prettier + Tailwind plugin
- [ ] Create `.prettierrc.json` configuration
- [ ] Add `.prettierignore` file
- [ ] Format entire codebase (`npx prettier --write .`)
- [ ] Add `format` and `format:check` scripts to package.json
- [ ] Test formatting on sample files

**Deliverable:** Consistently formatted codebase
**Success Criteria:** All files pass `npm run format:check`

#### Day 3-4: Pre-Commit Hooks
- [ ] Install Husky + lint-staged
- [ ] Configure `.husky/pre-commit` hook
- [ ] Set up lint-staged config in package.json
- [ ] Test hooks with intentionally bad commits
- [ ] Document hook bypass process (for emergencies)
- [ ] Train team on new workflow

**Deliverable:** Automated quality checks on every commit
**Success Criteria:** Cannot commit poorly formatted code

#### Day 5: Conventional Commits
- [ ] Install Commitlint + config
- [ ] Create `.commitlintrc.json` with scopes
- [ ] Add commit-msg hook to Husky
- [ ] Update CONTRIBUTING.md with commit examples
- [ ] Test various commit message formats
- [ ] Set up commit message template

**Deliverable:** Standardized commit message format
**Success Criteria:** All commits follow conventional format

**Dependencies:** None
**Blockers:** None
**Rollback Plan:** Remove Husky hooks if problematic

---

### Week 2: Build Quality Gates

#### Day 6-7: Fix TypeScript Errors
- [ ] Run `tsc --noEmit` to find all type errors
- [ ] Create inventory of errors by severity
- [ ] Fix critical errors (type safety issues)
- [ ] Fix medium errors (implicit any, etc.)
- [ ] Add missing type definitions
- [ ] Update tsconfig.json strictness settings

**Deliverable:** Zero TypeScript errors
**Success Criteria:** `npm run build` succeeds without warnings

#### Day 8-9: Fix ESLint Errors
- [ ] Run `npm run lint` to find all issues
- [ ] Fix auto-fixable issues (`--fix` flag)
- [ ] Manually fix remaining issues
- [ ] Add custom ESLint rules for project
- [ ] Document any intentional rule exceptions
- [ ] Remove ESLint exceptions from code

**Deliverable:** Zero ESLint errors
**Success Criteria:** `npm run lint` passes with no warnings

#### Day 10: Enable Build Quality Gates
- [ ] Remove `ignoreDuringBuilds: true` from next.config.ts
- [ ] Remove `ignoreBuildErrors: true` from next.config.ts
- [ ] Test build locally
- [ ] Update Cloud Build config to fail on lint/type errors
- [ ] Add quality gate step to cloudbuild-dev.yaml
- [ ] Document quality standards in README

**Deliverable:** Strict build quality enforcement
**Success Criteria:** Build fails if code has errors

**Dependencies:** Day 6-9 (must fix errors first)
**Blockers:** None
**Rollback Plan:** Re-enable ignores temporarily if critical deploy needed

---

## Phase 2: Testing Infrastructure
**Duration:** 2 weeks (Nov 4 - Nov 15)
**Goal:** Achieve 80% test coverage
**Risk Level:** Medium
**User Impact:** None (internal improvements)

### Week 3: Unit Testing Setup

#### Day 11-12: Vitest Configuration
- [ ] Install Vitest + React Testing Library
- [ ] Create `vitest.config.ts`
- [ ] Set up test environment (jsdom)
- [ ] Configure path aliases (@/...)
- [ ] Add `test` and `test:watch` scripts
- [ ] Create example test file to validate setup

**Deliverable:** Functional unit test environment
**Success Criteria:** Sample test runs successfully

#### Day 13-15: Business Logic Tests
- [ ] Test utility functions (lib/utils.ts)
- [ ] Test date/deadline calculations (lib/dates.ts)
- [ ] Test validation logic (lib/validators.ts)
- [ ] Test formatting functions (lib/formatters.ts)
- [ ] Test password hashing (lib/password.ts)
- [ ] Achieve 80% coverage on lib/ directory

**Deliverable:** Core business logic tested
**Success Criteria:** All lib/ files have 80%+ coverage

**Dependencies:** Day 11-12
**Blockers:** None
**Rollback Plan:** Tests are additive, no rollback needed

---

### Week 4: Component & Integration Tests

#### Day 16-17: Component Tests
- [ ] Test form components (validation, submission)
- [ ] Test table components (sorting, filtering)
- [ ] Test dialog/modal components
- [ ] Test navigation component
- [ ] Test dashboard cards
- [ ] Achieve 70% coverage on components/ directory

**Deliverable:** UI components tested
**Success Criteria:** All critical components have tests

#### Day 18-19: API Route Tests
- [ ] Set up API testing utilities
- [ ] Test authentication endpoints
- [ ] Test registration endpoints
- [ ] Test report submission endpoints
- [ ] Test data retrieval endpoints
- [ ] Mock database calls appropriately

**Deliverable:** API routes tested
**Success Criteria:** All API routes have happy path + error tests

#### Day 20: Coverage Reporting
- [ ] Configure coverage thresholds (80%)
- [ ] Set up coverage reports (HTML + LCOV)
- [ ] Add coverage badge to README
- [ ] Configure CI to enforce coverage
- [ ] Document uncovered code (with justification)
- [ ] Create coverage improvement plan

**Deliverable:** Automated coverage enforcement
**Success Criteria:** Build fails if coverage < 80%

**Dependencies:** Day 13-19
**Blockers:** None
**Rollback Plan:** Lower coverage thresholds if needed

---

## Phase 3: Production Infrastructure
**Duration:** 2 weeks (Nov 18 - Nov 29)
**Goal:** Enterprise-grade database and deployment
**Risk Level:** High (data migration)
**User Impact:** Temporary downtime during migration

### Week 5: PostgreSQL Migration

#### Day 21-22: Cloud SQL Setup
- [ ] Create Cloud SQL PostgreSQL instance
- [ ] Configure instance (memory, CPU, storage)
- [ ] Set up automated backups (daily)
- [ ] Configure point-in-time recovery
- [ ] Set up connection pooling
- [ ] Create database and user accounts

**Deliverable:** Running PostgreSQL instance
**Success Criteria:** Can connect from local machine

#### Day 23-24: Schema Migration
- [ ] Update prisma/schema.prisma (provider = postgresql)
- [ ] Test migration on local PostgreSQL
- [ ] Generate new migration files
- [ ] Update DATABASE_URL in .env
- [ ] Test all queries with PostgreSQL
- [ ] Fix any SQLite-specific code

**Deliverable:** Application runs on PostgreSQL locally
**Success Criteria:** All E2E tests pass with PostgreSQL

#### Day 25: Production Deployment
- [ ] Export data from SQLite (if any production data exists)
- [ ] Update Cloud Run env vars (DATABASE_URL)
- [ ] Run migrations on production database
- [ ] Import data to PostgreSQL
- [ ] Smoke test production environment
- [ ] Monitor for 24 hours

**Deliverable:** Production running on PostgreSQL
**Success Criteria:** Zero data loss, all features working

**Dependencies:** None
**Blockers:** Cloud SQL provisioning (can take 15 minutes)
**Rollback Plan:** Keep SQLite database as backup, can revert DATABASE_URL

---

### Week 6: CI/CD Enhancement

#### Day 26-27: GitHub Actions Setup
- [ ] Create `.github/workflows/pr-checks.yml`
- [ ] Add lint, type-check, test steps
- [ ] Configure test matrix (Node versions)
- [ ] Add E2E tests to CI
- [ ] Set up test result reporting
- [ ] Configure branch protection rules

**Deliverable:** Automated PR checks
**Success Criteria:** All checks run on every PR

#### Day 28: Dependabot Configuration
- [ ] Create `.github/dependabot.yml`
- [ ] Configure update schedule (weekly)
- [ ] Set up dependency grouping
- [ ] Configure auto-merge for patches
- [ ] Test with manual trigger
- [ ] Document review process

**Deliverable:** Automated dependency updates
**Success Criteria:** Dependabot creates first PR

#### Day 29-30: Deployment Pipeline Improvements
- [ ] Add database migration step to cloudbuild-prod.yaml
- [ ] Enhance health checks in deployment
- [ ] Add smoke tests post-deployment
- [ ] Configure deployment notifications (Slack/Email)
- [ ] Document rollback procedures
- [ ] Create deployment runbook

**Deliverable:** Production-grade deployment pipeline
**Success Criteria:** Deployments include migrations and validation

**Dependencies:** Day 21-25 (PostgreSQL must be set up)
**Blockers:** GitHub org settings (need admin access)
**Rollback Plan:** Can disable GitHub Actions if problematic

---

## Phase 4: Security & Monitoring
**Duration:** 2 weeks (Dec 2 - Dec 13)
**Goal:** Production observability and security hardening
**Risk Level:** Low
**User Impact:** None (internal improvements)

### Week 7: Monitoring & Alerting

#### Day 31-32: Sentry Setup
- [ ] Create Sentry project
- [ ] Install @sentry/nextjs
- [ ] Configure sentry.client.config.ts
- [ ] Configure sentry.server.config.ts
- [ ] Set up error boundaries
- [ ] Test error tracking

**Deliverable:** Real-time error tracking
**Success Criteria:** Errors appear in Sentry dashboard

#### Day 33-34: Performance Monitoring
- [ ] Enable Sentry performance monitoring
- [ ] Set up transaction tracking
- [ ] Configure slow query alerts
- [ ] Add custom performance metrics
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Configure alert thresholds

**Deliverable:** Application performance visibility
**Success Criteria:** Can track slow pages and API calls

#### Day 35: Alert Configuration
- [ ] Set up Slack integration for alerts
- [ ] Configure email alerts for critical errors
- [ ] Create on-call rotation (if team size allows)
- [ ] Document alert response procedures
- [ ] Test alert delivery
- [ ] Create dashboard for stakeholders

**Deliverable:** Proactive incident detection
**Success Criteria:** Team receives alert within 1 minute of error

**Dependencies:** None
**Blockers:** Sentry account provisioning
**Rollback Plan:** Can disable Sentry if causing performance issues

---

### Week 8: Security Hardening

#### Day 36-37: Secret Manager Migration
- [ ] Enable Secret Manager API
- [ ] Create secrets in Secret Manager
- [ ] Update Cloud Run to use Secret Manager
- [ ] Remove env vars from cloudbuild files
- [ ] Update application to fetch secrets
- [ ] Test with different secret versions

**Deliverable:** Encrypted secrets management
**Success Criteria:** App runs with secrets from Secret Manager

#### Day 38-39: Security Scanning
- [ ] Add Trivy container scanning to Cloud Build
- [ ] Configure GitHub security scanning
- [ ] Enable Dependabot security alerts
- [ ] Run OWASP ZAP scan (baseline)
- [ ] Address any high/critical findings
- [ ] Document security exceptions

**Deliverable:** Automated security scanning
**Success Criteria:** No high/critical vulnerabilities in production

#### Day 40: Security Documentation
- [ ] Create SECURITY.md with disclosure policy
- [ ] Document authentication architecture
- [ ] Create data flow diagrams
- [ ] Document audit logging
- [ ] Create incident response plan
- [ ] Get security review from county IT

**Deliverable:** Security documentation package
**Success Criteria:** County IT approves security posture

**Dependencies:** None
**Blockers:** Secret Manager API enablement
**Rollback Plan:** Can revert to env vars if Secret Manager issues

---

## Dependency Matrix

```
Phase 1 (Code Quality) ──→ Phase 2 (Testing)
                           Phase 2 ──→ Phase 3 (Infrastructure)
                                       Phase 3 ──→ Phase 4 (Security)

Within Phase 3:
PostgreSQL Setup (Day 21-25) ──→ CI/CD Enhancement (Day 26-30)
```

**Critical Path:** Phase 1 → Phase 2 → PostgreSQL Migration → GitHub Actions

**Parallel Work Opportunities:**
- Sentry setup (Phase 4) can start during Phase 3
- Dependabot (Day 28) can happen anytime after GitHub Actions
- Security documentation (Day 40) can start early

---

## Resource Requirements

### Development Team
- **1 Full-Stack Developer** (40 hours/week for 8 weeks)
- **0.25 DevOps Engineer** (10 hours/week for Weeks 5-6)
- **0.25 Security Reviewer** (10 hours for Week 8)

### Infrastructure Costs

| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Cloud SQL (PostgreSQL) | $50 | $600 |
| Sentry (Team plan) | $26 | $312 |
| UptimeRobot (Pro) | $7 | $84 |
| Secret Manager | ~$1 | ~$12 |
| **Total** | **$84/month** | **$1,008/year** |

**Note:** GitHub Actions and Dependabot are free for public repos.

### Tools & Licenses
- ✅ All development tools are free/open-source
- ✅ No additional license costs

---

## Risk Management

### High-Risk Activities

#### 1. PostgreSQL Migration (Day 21-25)
**Risk:** Data loss during migration
**Likelihood:** Low
**Impact:** Critical

**Mitigation:**
- Export SQLite data before migration
- Test migration on staging first
- Keep SQLite database as backup for 30 days
- Schedule during low-traffic window
- Have rollback plan ready

**Rollback:** Revert DATABASE_URL to SQLite

---

#### 2. Enabling Build Quality Gates (Day 10)
**Risk:** Blocks critical hotfix deployment
**Likelihood:** Low
**Impact:** Medium

**Mitigation:**
- Fix all errors before enabling gates
- Document emergency bypass procedure
- Test gates on non-critical branch first
- Communicate change to all team members

**Rollback:** Re-enable `ignoreBuildErrors` temporarily

---

#### 3. Secret Manager Migration (Day 36-37)
**Risk:** App cannot access secrets, production down
**Likelihood:** Low
**Impact:** High

**Mitigation:**
- Test thoroughly in dev environment
- Deploy during maintenance window
- Keep env var fallback for 1 week
- Have IAM permissions ready in advance

**Rollback:** Revert to environment variables

---

### Medium-Risk Activities

#### 4. GitHub Actions Setup (Day 26-27)
**Risk:** CI/CD blocks legitimate PRs
**Likelihood:** Medium
**Impact:** Low

**Mitigation:**
- Start with warnings instead of blocking
- Allow admin bypass initially
- Monitor for false positives
- Iterate on thresholds

**Rollback:** Disable required checks in branch protection

---

## Success Metrics

### Code Quality
- ✅ 100% of commits follow conventional format
- ✅ 0 TypeScript errors in codebase
- ✅ 0 ESLint warnings in codebase
- ✅ 100% of files pass Prettier formatting

### Testing
- ✅ 80%+ code coverage (unit + integration)
- ✅ 100% of critical paths have E2E tests
- ✅ Tests run in <2 minutes
- ✅ 0 flaky tests

### Infrastructure
- ✅ Database uptime: 99.9%
- ✅ Automated backups: Daily
- ✅ Point-in-time recovery: Available
- ✅ Zero data loss events

### CI/CD
- ✅ 100% of PRs run automated checks
- ✅ Dependencies updated within 7 days
- ✅ Deployment time: <10 minutes
- ✅ Rollback time: <5 minutes

### Security
- ✅ 0 high/critical vulnerabilities
- ✅ All secrets encrypted at rest
- ✅ Security audit logs: 90 day retention
- ✅ Incident response plan: Documented

### Monitoring
- ✅ Error detection: <1 minute
- ✅ Uptime monitoring: 1 minute intervals
- ✅ Performance tracking: All API routes
- ✅ Alert response time: <15 minutes

---

## Milestones

### Milestone 1: Code Quality Foundation (Week 2)
**Date:** November 1, 2025
**Exit Criteria:**
- [ ] All code passes Prettier formatting
- [ ] Pre-commit hooks prevent bad commits
- [ ] Build fails on TypeScript/ESLint errors
- [ ] Team trained on new workflow

**Demo:** Show stakeholders commit hook in action

---

### Milestone 2: Testing Infrastructure (Week 4)
**Date:** November 15, 2025
**Exit Criteria:**
- [ ] 80%+ code coverage achieved
- [ ] All critical paths have unit tests
- [ ] Coverage enforced in CI
- [ ] Test suite runs in <2 minutes

**Demo:** Show test coverage report and fast feedback loop

---

### Milestone 3: Production Infrastructure (Week 6)
**Date:** November 29, 2025
**Exit Criteria:**
- [ ] PostgreSQL running in production
- [ ] Automated backups configured
- [ ] GitHub Actions running on all PRs
- [ ] Dependabot creating update PRs

**Demo:** Show GitHub PR checks and database backups

---

### Milestone 4: Security & Monitoring (Week 8)
**Date:** December 13, 2025
**Exit Criteria:**
- [ ] Sentry tracking all errors
- [ ] Uptime monitoring active
- [ ] Secrets in Secret Manager
- [ ] Security scan passing

**Demo:** Show error tracking dashboard and alerts

---

## Communication Plan

### Weekly Status Updates
**Audience:** Project stakeholders
**Format:** Email summary
**Content:**
- Completed tasks
- Blockers/risks
- Next week's priorities
- Metrics update

### Bi-Weekly Demos
**Audience:** County IT, project sponsor
**Format:** 30-minute live demo
**Content:**
- Show new capabilities
- Demonstrate quality improvements
- Review metrics dashboard
- Answer questions

### Daily Standups
**Audience:** Development team
**Format:** 15-minute sync
**Content:**
- Yesterday's progress
- Today's plan
- Blockers

---

## Post-Launch Support

### Month 1 After Launch
- Monitor error rates daily
- Review performance metrics weekly
- Address any production issues (Priority 1)
- Gather user feedback
- Create backlog for improvements

### Months 2-3 After Launch
- Continue monitoring (weekly reviews)
- Address medium-priority bugs
- Optimize slow queries
- Update documentation based on usage
- Plan next phase of enhancements

### Ongoing Maintenance
- Weekly Dependabot PR reviews
- Monthly security scan reviews
- Quarterly infrastructure review
- Continuous test coverage improvement

---

## Appendix

### A. Detailed Task List by Phase

This roadmap contains **40 days of work** organized into:
- **15 tasks** in Phase 1 (Code Quality)
- **10 tasks** in Phase 2 (Testing)
- **9 tasks** in Phase 3 (Infrastructure)
- **6 tasks** in Phase 4 (Security & Monitoring)

**Total:** 40 discrete tasks across 8 weeks

---

### B. Recommended Tools & Services

| Category | Tool | Cost | Justification |
|----------|------|------|---------------|
| **Code Quality** | Prettier | Free | Industry standard |
| **Git Hooks** | Husky | Free | Most popular |
| **Testing** | Vitest | Free | Fastest for Next.js |
| **Database** | Cloud SQL (PostgreSQL) | $50/mo | Government-grade |
| **Monitoring** | Sentry | $26/mo | Best error tracking |
| **Uptime** | UptimeRobot | $7/mo | Simple, reliable |
| **CI/CD** | GitHub Actions | Free | Native integration |
| **Dependencies** | Dependabot | Free | GitHub native |
| **Secrets** | Secret Manager | $1/mo | Google Cloud native |

---

### C. Training Materials Needed

- [ ] Developer onboarding guide (new workflow)
- [ ] Commit message cheat sheet
- [ ] Testing best practices guide
- [ ] Deployment runbook
- [ ] Incident response procedures
- [ ] Security guidelines

---

### D. Stakeholder Sign-Off

| Stakeholder | Role | Sign-Off Required | Date |
|-------------|------|-------------------|------|
| County IT Director | Infrastructure approval | Phase 3 start | Nov 18 |
| Security Officer | Security review | Phase 4 end | Dec 13 |
| Project Sponsor | Budget approval | Before start | Oct 21 |
| Product Owner | Roadmap approval | Before start | Oct 21 |

---

## Next Steps

1. **This Week:** Review roadmap with team, get stakeholder sign-off
2. **Next Week:** Begin Phase 1 (Prettier + Husky setup)
3. **Ongoing:** Track progress in Beads, update this roadmap weekly

---

**Document Owner:** Development Team
**Last Updated:** October 21, 2025
**Next Review:** October 28, 2025 (weekly)
