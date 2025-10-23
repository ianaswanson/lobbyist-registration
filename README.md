# Multnomah County Lobbyist Registration System

A modern web application for managing lobbyist registration and reporting in compliance with Multnomah County's Government Accountability Ordinance (effective July 1, 2026).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Overview

This civic technology project provides a transparent, accessible platform for:
- **Lobbyists**: Register and submit quarterly expense reports
- **Employers**: Report lobbying expenditures
- **Board Members**: Post calendars and track lobbying contacts
- **County Administrators**: Monitor compliance and manage registrations
- **General Public**: Search and view lobbying activity

## Live Demo

**Production Instance:** [https://lobbyist-registration-zzp44w3snq-uw.a.run.app](https://lobbyist-registration-zzp44w3snq-uw.a.run.app)

- [Interactive Demo Guide](https://lobbyist-registration-zzp44w3snq-uw.a.run.app/DEMO-GUIDE.html)
- [Ordinance Compliance Matrix](https://lobbyist-registration-zzp44w3snq-uw.a.run.app/ORDINANCE-COMPLIANCE.html)

> **Note**: For production use, consider setting up a [custom domain](docs/CUSTOM-DOMAIN-SETUP.md) (e.g., `lobbyist.multco.us`) for better branding and URL stability.

## Features

### Phase 1 (MVP) - Complete ✅
- **Lobbyist Registration Portal**
  - Multi-step registration wizard
  - Document upload (employer authorization)
  - 30-day update mechanism

- **Quarterly Expense Reporting**
  - Manual entry, CSV upload, and bulk paste options
  - Automated deadline reminders (April 15, July 15, Oct 15, Jan 15)
  - Itemization for expenditures >$50
  - CSV template download for bulk import

- **Board Member Transparency**
  - Quarterly calendar posting
  - Lobbying contact tracking
  - Public posting (minimum 1 year retention)

- **Public Transparency Dashboard**
  - Searchable lobbyist registry
  - Advanced filtering and search
  - Public expense report viewing

- **Admin Compliance Panel**
  - Registration review and approval
  - Compliance monitoring
  - Violation tracking
  - Fine issuance ($500 maximum per ordinance §3.808)

### Phase 2 (Planned)
- Enhanced notification system
- Advanced analytics and reporting
- Export functionality for public records requests
- Mobile app companion

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Cloud SQL) with Prisma ORM
- **Secrets**: Google Cloud Secret Manager
- **Auth**: NextAuth.js (planned: Government SSO)
- **Deployment**: Docker, Google Cloud Run with Cloud Build Triggers
- **CI/CD**: GitHub Actions (PR checks) + Cloud Build (deployments)
- **Monitoring**: Sentry error tracking, Cloud Run metrics, Cloud SQL monitoring
- **Security**: Dependabot automated dependency updates
- **Testing**: Playwright (E2E), Vitest (Unit)

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Git
- OpenSSL (for generating secrets)
- **Google Cloud SDK** (`gcloud` CLI) for database access
- **Cloud SQL Proxy** for local development with PostgreSQL

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ianaswanson/lobbyist-registration.git
cd lobbyist-registration

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Get database password from Secret Manager:
# gcloud secrets versions access latest --secret="lobbyist-db-url-dev"
# Generate auth secret: openssl rand -base64 32
# Edit .env and configure DATABASE_URL and NEXTAUTH_SECRET

# Start Cloud SQL Proxy (in separate terminal)
cloud-sql-proxy lobbyist-475218:us-west1:lobbyist-registration-db --port=5432

# Set up database
npx prisma migrate dev
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**For detailed setup instructions, see [CLAUDE.md](CLAUDE.md#local-development)**

### Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Create database migration
npm run prisma:seed      # Load test data
```

## Project Structure

```
├── .beads/             # Issue tracking (Beads)
├── .github/            # GitHub Actions workflows and Dependabot
├── wireframes/         # Interactive HTML wireframes
├── app/                # Next.js 15 app router
│   ├── (authenticated)/ # Protected routes (dashboard, reports, etc.)
│   ├── (public)/       # Public routes (search, calendars)
│   ├── api/            # API routes
│   └── auth/           # Authentication pages
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   └── forms/          # Form components
├── lib/                # Utilities, database client, helpers
├── prisma/             # Database schema and migrations (PostgreSQL)
├── tests/              # Test suites (Playwright E2E, Vitest unit)
├── public/             # Static assets
├── docs/               # Session summaries and guides
├── CLAUDE.md           # Development guide
├── PROJECT.md          # Comprehensive project documentation
├── SECURITY.md         # Security vulnerability disclosure policy
└── MONITORING.md       # Monitoring and alerting setup guide
```

## Documentation

### Getting Started
- **[CLAUDE.md](CLAUDE.md)** - Developer guide with local development instructions
- **[.env.example](.env.example)** - Environment variable template

### Project Documentation
- **[PROJECT.md](PROJECT.md)** - Complete project requirements and roadmap
- **[Wireframes](wireframes/)** - Interactive design specifications
- **[User Story Map](user-story-map.html)** - Visual feature mapping

### Security & Operations
- **[SECURITY.md](SECURITY.md)** - Security vulnerability disclosure policy and measures
- **[MONITORING.md](MONITORING.md)** - Monitoring, alerting, and observability setup
- **[MODERNIZATION-ROADMAP.md](MODERNIZATION-ROADMAP.md)** - 8-week modernization plan (Phases 1-4 complete)
- **[ARCHITECTURE-DECISIONS.md](ARCHITECTURE-DECISIONS.md)** - Architectural framework and design patterns

### Deployment
- **[DEPLOYMENT-PLAN.md](DEPLOYMENT-PLAN.md)** - Google Cloud deployment guide
- **[QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md)** - Fast-track deployment
- **[README-DEPLOYMENT.md](README-DEPLOYMENT.md)** - Deployment quick reference

## Compliance

This system implements requirements from Multnomah County Code:
- **§3.800-3.809** - Lobbyist registration and reporting
- **§3.001(C)** - Board member reporting requirements
- **§9.230(C)** - Contract regulation and cooling-off periods

Full ordinance: [Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf](Government_Accountably_Ordinance_4.2.25_-_CA_Approved.pdf)

### Accessibility

- WCAG 2.1 AA compliance
- Screen reader compatible
- Keyboard navigation
- Responsive design (mobile-first)

## Deployment

### Docker (Local)

```bash
docker build -t lobbyist-registry .
docker run -p 3000:3000 lobbyist-registry
```

### Google Cloud Run

See [DEPLOYMENT-PLAN.md](DEPLOYMENT-PLAN.md) or [QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md) for complete instructions.

Quick deploy:
```bash
gcloud run deploy lobbyist-registration \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

## Contributing

This is a civic technology project for Multnomah County, Oregon. Contributions are welcome!

### Development Workflow

1. Check available tasks: `bd ready` (using [Beads](https://github.com/dustinblackman/beads) issue tracker)
2. Create a feature branch
3. Make changes following the guidelines in [CLAUDE.md](CLAUDE.md)
4. Submit a pull request

### Key Development Rules

- **Database changes**: Only through Prisma migrations (`npm run prisma:migrate`)
- **Issue tracking**: Use Beads (`bd`) for task management
- **Accessibility**: All features must meet WCAG 2.1 AA standards
- **Testing**: Include tests for new features
- **Documentation**: Update docs for user-facing changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Status

- ✅ **Planning Complete**: User story map, wireframes, technical architecture
- ✅ **MVP Development Complete**: All Phase 1 features implemented
- ✅ **Production Deployment**: Live on Google Cloud Run with PostgreSQL
- ✅ **Modernization Complete**: Phases 1-4 complete (testing, CI/CD, PostgreSQL, security/monitoring)
  - Phase 1: Code quality foundation (Prettier, Husky, build quality gates)
  - Phase 2: Testing infrastructure (Vitest, 80% coverage)
  - Phase 3: Production infrastructure (PostgreSQL migration, GitHub Actions, Dependabot)
  - Phase 4: Security & monitoring (Sentry, Secret Manager, security documentation)
- ✅ **Security & Monitoring**: Sentry error tracking, Secret Manager, SECURITY.md, MONITORING.md
- 🔄 **Current**: Gathering stakeholder feedback, planning Phase 5+ enhancements
- 📅 **Target Launch**: June 2026 (before July 1, 2026 ordinance effective date)

## Contact

**Developer**: Ian Swanson
**Jurisdiction**: Multnomah County, Oregon
**Repository**: [github.com/ianaswanson/lobbyist-registration](https://github.com/ianaswanson/lobbyist-registration)

## Acknowledgments

Built with civic technology principles:
- Open source and transparent
- Accessible to all users
- Privacy-respecting
- Community-driven development

---

**Note**: This is a prototype/demonstration system. For production use by Multnomah County, additional security review, accessibility audit, and Authority to Operate (ATO) process required.
