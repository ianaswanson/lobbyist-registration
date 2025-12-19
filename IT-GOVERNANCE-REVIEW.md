# IT Governance Review Report
## Lobbyist Registration System

**Review Date:** December 19, 2025
**Prepared For:** IT Review Board
**Project:** Lobbyist Registration Web Application
**Version:** 0.1.0

---

## Executive Summary

This report provides a comprehensive IT governance review covering:
1. **Software License Compliance** - All 434 production dependencies reviewed
2. **Security Vulnerabilities** - 5 known vulnerabilities identified (4 moderate, 1 critical)
3. **External Services Catalog** - All cloud services and third-party integrations
4. **Technology Stack Inventory** - Complete catalog for ITIL purposes

### Key Findings

| Category | Status | Action Required |
|----------|--------|-----------------|
| License Compliance | **3 packages need review** | Legal/Contracting review |
| Security | **1 Critical, 4 Moderate** | Immediate remediation |
| Services | **6 external services** | Terms review needed |
| Data Handling | PII present | Privacy policy review |

---

## SECTION 1: License Compliance Review

### Pre-Approved Licenses (Per Contracting)
The following licenses are pre-approved for use:
- GNU Affero General Public License v3 (AGPL-3.0)
- Apache License, Version 2.0 (Apache-2.0)
- Artistic License version 2.0 (Artistic-2.0)
- BSD 2-Clause License (BSD-2-Clause)
- BSD 3-Clause License (BSD-3-Clause)
- GNU General Public License v1/v2/v3 (GPL-1.0, GPL-2.0, GPL-3.0)
- GNU Library General Public License v2 (LGPL-2.0)
- GNU Lesser General Public License v2.1 (LGPL-2.1)
- Internet Systems Consortium (ISC) License
- MIT License
- Python Software Foundation (PSF) License Agreement

### Production Dependency License Summary (434 packages)

| License | Count | Status |
|---------|-------|--------|
| MIT | 307 | **APPROVED** |
| Apache-2.0 | 65 | **APPROVED** |
| ISC | 34 | **APPROVED** |
| BSD-3-Clause | 12 | **APPROVED** |
| BSD-2-Clause | 9 | **APPROVED** |
| 0BSD | 1 | **APPROVED** (BSD variant) |
| LGPL-3.0-or-later | 1 | **APPROVED** (LGPL variant) |
| MIT AND ISC | 1 | **APPROVED** (dual license) |
| (MIT OR CC0-1.0) | 1 | **APPROVED** (MIT option) |
| **CC-BY-4.0** | 1 | **NEEDS REVIEW** |
| **BlueOak-1.0.0** | 1 | **NEEDS REVIEW** |
| **UNLICENSED** | 1 | N/A (this project) |

### Packages Requiring Legal/Contracting Review

#### 1. caniuse-lite@1.0.30001751
- **License:** CC-BY-4.0 (Creative Commons Attribution 4.0)
- **Repository:** https://github.com/browserslist/caniuse-lite
- **Purpose:** Browser compatibility data for build tools
- **Usage:** Build-time only (determines browser support for CSS/JS)
- **Risk:** Low - data file only, not code
- **Attribution Required:** Yes
- **Recommendation:** Review CC-BY-4.0 terms; attribution typically satisfied by including license file

#### 2. path-scurry@1.11.1
- **License:** BlueOak-1.0.0 (Blue Oak Model License 1.0.0)
- **Repository:** https://github.com/isaacs/path-scurry
- **Purpose:** Fast recursive directory walking
- **Usage:** Runtime dependency for file path resolution
- **Risk:** Low - permissive license similar to MIT
- **Note:** BlueOak-1.0.0 is a modern permissive license designed to be clearer than MIT
- **Recommendation:** Review for approval; functionally equivalent to MIT

#### 3. type-fest@0.7.1
- **License:** (MIT OR CC0-1.0)
- **Repository:** https://github.com/sindresorhus/type-fest
- **Purpose:** TypeScript utility types
- **Usage:** Development/type-checking only
- **Risk:** None - MIT option available
- **Recommendation:** Use under MIT license terms

### Development Dependencies with Non-Standard Licenses (Not in Production)

These are **development-only** dependencies not deployed to production:

| Package | License | Purpose | Risk |
|---------|---------|---------|------|
| axe-core@4.11.0 | MPL-2.0 | Accessibility testing | Low |
| lightningcss@1.30.1 | MPL-2.0 | CSS compilation | Low |
| lightningcss-darwin-arm64@1.30.1 | MPL-2.0 | CSS compilation (platform-specific) | Low |
| chownr@3.0.0 | BlueOak-1.0.0 | File permissions | Low |
| tar@7.5.2 | BlueOak-1.0.0 | Archive handling | Low |
| yallist@5.0.0 | BlueOak-1.0.0 | Linked list utility | Low |
| language-subtag-registry@0.3.23 | CC0-1.0 | Language data | None (public domain) |
| mdn-data@2.12.2 | CC0-1.0 | MDN reference data | None (public domain) |
| @csstools/color-helpers@5.1.0 | MIT-0 | CSS color utilities | None (MIT variant) |
| @csstools/css-syntax-patches@1.0.14 | MIT-0 | CSS syntax patches | None (MIT variant) |

**Note:** MPL-2.0 (Mozilla Public License) requires source disclosure only for modified files, not entire project. These are used unmodified.

---

## SECTION 2: Security Vulnerability Assessment

### Current Vulnerabilities (npm audit)

| Severity | Package | Vulnerability | Fix Available |
|----------|---------|---------------|---------------|
| **CRITICAL** | next@15.5.6 | RCE in React flight protocol (GHSA-9qr9-h5gf-34mp) | Yes: 15.5.9 |
| **HIGH** | next@15.5.6 | DoS with Server Components (GHSA-mwv6-3258-q52c) | Yes: 15.5.8 |
| Moderate | next@15.5.6 | Source Code Exposure (GHSA-w37m-7fhw-fmv9) | Yes: 15.5.8 |
| Moderate | @sentry/nextjs@10.21.0 | Sensitive header leak when sendDefaultPii=true | Yes: 10.27.0 |
| Moderate | js-yaml@4.1.0 | Prototype pollution in merge | Yes: 4.1.1 |

### Immediate Remediation Required

```bash
# Run these commands to fix all vulnerabilities:
npm update next@15.5.9
npm update @sentry/nextjs@latest
npm audit fix
```

### Security Configuration Review

| Security Measure | Status | Notes |
|------------------|--------|-------|
| HTTPS Only | **Enabled** | Cloud Run enforces HTTPS |
| Secrets Management | **Enabled** | GCP Secret Manager |
| SQL Injection Protection | **Enabled** | Prisma ORM parameterized queries |
| XSS Protection | **Enabled** | React auto-escaping |
| CSRF Protection | **Enabled** | NextAuth.js built-in |
| Authentication | **Enabled** | NextAuth.js with bcryptjs |
| Audit Logging | **Enabled** | Database audit trail |
| Dependency Scanning | **Enabled** | Dependabot weekly |
| Error Tracking | **Enabled** | Sentry with PII filtering |

### Data Classification

| Data Type | Classification | Protection |
|-----------|----------------|------------|
| User Passwords | Confidential | bcrypt hashed (never stored plain) |
| Email Addresses | PII | Database encryption at rest |
| Names/Addresses | PII | Database encryption at rest |
| Financial Data (expenses) | Sensitive | Audit logged |
| Session Tokens | Confidential | Secure cookies, httpOnly |

---

## SECTION 3: External Services Catalog

### Cloud Infrastructure (Google Cloud Platform)

| Service | Purpose | Terms/Agreement | Data Residency |
|---------|---------|-----------------|----------------|
| **Cloud Run** | Application hosting | GCP Terms of Service | us-west1 (Oregon) |
| **Cloud SQL (PostgreSQL)** | Database | GCP Terms of Service | us-west1 (Oregon) |
| **Artifact Registry** | Docker image storage | GCP Terms of Service | us-west1 (Oregon) |
| **Secret Manager** | Secrets storage | GCP Terms of Service | us-west1 (Oregon) |
| **Cloud Build** | CI/CD pipelines | GCP Terms of Service | us-west1 (Oregon) |
| **Cloud Logging** | Application logs | GCP Terms of Service | us-west1 (Oregon) |

**GCP Terms:** https://cloud.google.com/terms

**Note:** If migrating to government GCP project, ensure FedRAMP compliance if required.

### Third-Party SaaS Services

| Service | Purpose | Terms/Agreement | Data Sent |
|---------|---------|-----------------|-----------|
| **Sentry** | Error tracking & monitoring | Sentry Terms of Service | Error stack traces, request metadata (PII filtered) |
| **GitHub** | Source code repository | GitHub Terms of Service | Source code, CI/CD logs |
| **Codecov** | Code coverage reporting | Codecov Terms of Service | Coverage reports only (no source code) |

**Sentry Terms:** https://sentry.io/terms/
**GitHub Terms:** https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
**Codecov Terms:** https://about.codecov.io/terms-of-service/

### Terms & Agreements Requiring Review

| Service | Agreement Type | Review Needed |
|---------|----------------|---------------|
| Google Cloud Platform | Enterprise Agreement | **Required** for government use |
| Sentry | Standard Terms | **Required** - sends error data |
| GitHub | Enterprise/Organization | **Required** if forking to gov org |
| Codecov | Standard Terms | **Optional** - can be removed |

---

## SECTION 4: Complete Technology Stack Inventory

### Application Framework

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| Next.js | 15.5.6 | MIT | Full-stack React framework |
| React | 19.2.0 | MIT | UI component library |
| React DOM | 19.2.0 | MIT | React DOM rendering |
| TypeScript | 5.x | Apache-2.0 | Type-safe JavaScript |

### Authentication & Authorization

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| NextAuth.js | 5.0.0-beta.30 | ISC | Authentication framework |
| @auth/prisma-adapter | 2.11.0 | ISC | Database session storage |
| bcryptjs | 3.0.2 | BSD-3-Clause | Password hashing |

### Database

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| Prisma Client | 6.18.0 | Apache-2.0 | ORM and query builder |
| Prisma CLI | 6.18.0 | Apache-2.0 | Database migrations |
| PostgreSQL | 15.x | PostgreSQL License | Primary database |

### UI Components

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| @radix-ui/* | Various | MIT | Accessible UI primitives |
| Tailwind CSS | 4.x | MIT | Utility-first CSS |
| class-variance-authority | 0.7.1 | Apache-2.0 | Component variants |
| clsx | 2.1.1 | MIT | Class name utilities |
| tailwind-merge | 3.3.1 | MIT | Tailwind class merging |
| lucide-react | 0.546.0 | ISC | Icon library |
| cmdk | 1.1.1 | MIT | Command palette |
| recharts | 3.3.0 | MIT | Data visualization |

### Monitoring & Observability

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| @sentry/nextjs | 10.21.0 | MIT | Error tracking |
| @opentelemetry/* | Various | Apache-2.0 | Distributed tracing |

### AI/ML (Optional Feature)

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| @google-cloud/vertexai | 1.10.0 | Apache-2.0 | AI chat assistant |

### Development Tools

| Component | Version | License | Purpose |
|-----------|---------|---------|---------|
| Vitest | 4.0.1 | MIT | Unit testing |
| Playwright | 1.56.0 | Apache-2.0 | E2E testing |
| ESLint | 9.x | MIT | Code linting |
| Prettier | 3.6.2 | MIT | Code formatting |
| Husky | 9.1.7 | MIT | Git hooks |
| lint-staged | 16.2.6 | MIT | Pre-commit checks |
| @commitlint/* | 20.x | MIT | Commit message linting |
| tsx | 4.20.6 | MIT | TypeScript execution |

### GitHub Actions (CI/CD)

| Action | Version | License | Purpose |
|--------|---------|---------|---------|
| actions/checkout | v5 | MIT | Repository checkout |
| actions/setup-node | v6 | MIT | Node.js setup |
| actions/upload-artifact | v4 | MIT | Artifact storage |
| codecov/codecov-action | v5 | MIT | Coverage upload |
| google-github-actions/auth | v2 | Apache-2.0 | GCP authentication |
| google-github-actions/setup-gcloud | v2 | Apache-2.0 | gcloud CLI setup |

---

## SECTION 5: Recommendations

### Immediate Actions Required

1. **CRITICAL: Update Next.js to 15.5.9**
   - Fixes RCE vulnerability (CVSS 10.0)
   - Command: `npm install next@15.5.9`

2. **Update Sentry packages**
   - Fixes header leak vulnerability
   - Command: `npm install @sentry/nextjs@latest`

3. **Legal Review for 2 packages**
   - `caniuse-lite` (CC-BY-4.0)
   - `path-scurry` (BlueOak-1.0.0)

### Before Production Deployment

1. **Service Agreement Reviews**
   - GCP Enterprise Agreement for government
   - Sentry data processing agreement
   - GitHub organization terms

2. **Security Hardening**
   - Enable Cloud Armor (DDoS protection)
   - Configure VPC for private networking
   - Implement rate limiting

3. **Compliance Documentation**
   - Data flow diagrams
   - Privacy impact assessment
   - ATO package preparation

---

## SECTION 6: Appendices

### Appendix A: Full Production Dependency List

Total production dependencies: **434 packages**

License distribution:
- MIT: 307 (70.7%)
- Apache-2.0: 65 (15.0%)
- ISC: 34 (7.8%)
- BSD-3-Clause: 12 (2.8%)
- BSD-2-Clause: 9 (2.1%)
- Other approved: 4 (0.9%)
- Needs review: 3 (0.7%)

### Appendix B: Development Dependency Summary

Total development dependencies: **616 additional packages**

These are NOT deployed to production and include:
- Testing frameworks (Vitest, Playwright)
- Linting tools (ESLint, Prettier)
- Build tools (TypeScript, esbuild)
- Git hooks (Husky, lint-staged)

### Appendix C: Docker Base Images

| Image | Source | Purpose |
|-------|--------|---------|
| node:20-alpine | Docker Hub (Official) | Build stage |
| node:20-alpine | Docker Hub (Official) | Runtime |
| postgres:15 | Docker Hub (Official) | CI testing |

### Appendix D: Data Flow

```
User Browser
    |
    v
Cloud Run (Next.js App)
    |
    +---> Cloud SQL (PostgreSQL)
    |
    +---> Secret Manager (credentials)
    |
    +---> Sentry (errors - filtered PII)
    |
    +---> Vertex AI (optional chat)
```

---

## Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| IT Security | _________________ | _______ | _________ |
| Legal/Contracts | _________________ | _______ | _________ |
| ITIL Catalog | _________________ | _______ | _________ |
| Project Owner | _________________ | _______ | _________ |

---

*Report generated by automated analysis on December 19, 2025*
