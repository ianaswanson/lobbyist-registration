# Security Policy

## Reporting a Vulnerability

The Multnomah County Lobbyist Registration System takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**Security Contact:** ian@piratesofpinehurst.com

Please include the following information in your report:

- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Location of the affected source code (file path, line number)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Potential impact of the vulnerability
- Any suggested remediation

### What to Expect

- **Acknowledgment:** We will acknowledge receipt of your report within 48 hours
- **Assessment:** We will investigate and assess the severity within 5 business days
- **Updates:** We will keep you informed of our progress throughout the remediation process
- **Resolution:** We will notify you when the vulnerability has been fixed
- **Credit:** With your permission, we will credit you in our security advisories

### Response Timeline

- **Critical vulnerabilities:** Patched within 7 days
- **High severity:** Patched within 14 days
- **Medium severity:** Patched within 30 days
- **Low severity:** Patched within 60 days

## Supported Versions

Currently, security updates are provided for:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

This application implements multiple security controls:

### Application Security
- **Authentication:** NextAuth.js with secure session management
- **Authorization:** Role-based access control (Admin, Lobbyist, Employer, Board Member, Public)
- **User Administration:** Admin-only user management with audit trail
  - Admin-only access to user CRUD operations
  - Soft delete (users marked INACTIVE, never hard-deleted)
  - Self-protection rules (admins cannot modify/delete themselves)
  - Last admin protection (prevents deactivation of final admin account)
  - Secure password generation (16-character random passwords)
  - Forced password reset on first login
  - Complete audit trail (UserAuditLog tracks all user modifications)
  - Email immutability (email addresses cannot be changed after creation)
- **Input Validation:** Server-side validation for all user inputs
- **SQL Injection Protection:** Parameterized queries via Prisma ORM
- **XSS Protection:** React automatic escaping + Content Security Policy
- **CSRF Protection:** Built-in Next.js protection

### Infrastructure Security
- **HTTPS Only:** All traffic encrypted in transit (TLS 1.2+)
- **Secret Management:** Google Cloud Secret Manager for sensitive data
- **Database Security:** Cloud SQL with private IP and encrypted at rest
- **Error Tracking:** Sentry with PII filtering enabled
- **Dependency Scanning:** Dependabot automated security updates

### Data Protection
- **PII Handling:** Sensitive data (email, phone, SSN) filtered from logs and error reports
- **Data Encryption:** Database encrypted at rest and in transit
- **Session Security:** 8-hour maximum session lifetime with 1-hour activity-based refresh. Secure, httpOnly cookies with SameSite CSRF protection
- **Audit Logging:** All administrative actions logged

### Compliance
- **WCAG 2.1 AA:** Accessibility compliance
- **GDPR Ready:** Data protection and privacy controls
- **Government Standards:** Follows government security best practices

### Session Management Policy

Our session management follows government security standards:

- **Maximum Session Lifetime:** 8 hours (standard government workday)
  - Users must re-authenticate after 8 hours regardless of activity
  - Prevents indefinite session persistence

- **Activity-Based Refresh:** 1 hour
  - Active users receive refreshed tokens every hour
  - Prevents mid-task logout during form submissions
  - Suitable for quarterly reporting workflows

- **Automatic Logout:** Users are logged out after 8 hours of inactivity
  - Protects against session hijacking on shared computers
  - Meets government security compliance requirements

- **Cookie Security:**
  - `httpOnly`: Prevents JavaScript access (XSS protection)
  - `secure`: HTTPS-only transmission in production
  - `sameSite: lax`: CSRF protection
  - `__Secure-` prefix: Browser-enforced HTTPS requirement

**User Impact:** Users filling out lengthy forms (expense reports, registrations) will not be interrupted as long as they show activity within 1-hour intervals. After 8 hours total, re-authentication is required.

## Security Testing

We perform regular security assessments:

- Automated dependency vulnerability scanning (Dependabot)
- Static code analysis (ESLint security plugins)
- Type safety enforcement (TypeScript strict mode)
- Code quality checks (Prettier, pre-commit hooks)

## Known Limitations

Current security considerations:

1. **SQLite in Development:** Local development uses SQLite (file-based). Production uses Cloud SQL PostgreSQL with proper access controls.

2. **E2E Test Data:** Test environments contain synthetic data only. Never use production credentials in tests.

3. **Public Data:** Lobbyist registrations and expense reports are public by law (Multnomah County Ordinance §3.800-809). This is intentional transparency, not a vulnerability.

## Security Disclosure Policy

We follow coordinated vulnerability disclosure:

1. Security researchers are given time to report vulnerabilities privately
2. We work with researchers to validate and fix issues
3. Public disclosure occurs only after a fix is available
4. We credit security researchers (with their permission)

## Questions?

For general security questions (not vulnerability reports), please open a GitHub issue with the `security` label.

## Legal

This security policy is provided in good faith. We reserve the right to modify this policy at any time. Researchers who follow this policy will be considered to have acted in good faith.

---

**Last Updated:** October 23, 2025
**Project:** Multnomah County Lobbyist Registration System
**Maintained by:** Ian Swanson
