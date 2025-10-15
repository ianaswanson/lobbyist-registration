# Lobbyist Registration System - Project Proposal

**Prepared for:** Multnomah County
**Project:** Government Accountability Ordinance Web Application
**Date:** October 15, 2025
**Launch Deadline:** June 2026 (Before July 1, 2026 ordinance effective date)

---

## Executive Summary

This proposal outlines the development of a web-based lobbyist registration and reporting system to satisfy the requirements of Multnomum County's Government Accountability Ordinance (§3.800-3.811). The system will enable lobbyists, employers, and board members to register and report lobbying activities, while providing public transparency through a searchable database and giving county administrators compliance monitoring tools.

We present three implementation approaches with detailed cost estimates for initial development and ongoing maintenance.

---

## Project Scope

### Core Requirements
- **Lobbyist Registration System** - Multi-step registration wizard with exemption checker
- **Quarterly Expense Reporting** - Multiple input methods (manual, CSV upload, bulk paste)
- **Employer Expense Reporting** - Separate reporting interface for employers
- **Board Member Transparency** - Calendar and receipt posting system
- **Public Search Interface** - Advanced search with data export capabilities
- **Admin Compliance Dashboard** - Alert-driven interface for monitoring deadlines and violations
- **Automated Notifications** - Email reminders for registration and reporting deadlines
- **Accessibility Compliance** - WCAG 2.1 AA standards

### Technical Deliverables
- Fully functional web application
- Database with migration-based schema management
- User authentication and role-based access control
- CSV import/export functionality
- Responsive design for mobile and desktop
- Comprehensive documentation
- Testing and quality assurance

---

## Implementation Approaches

### Option 1: Traditional .NET Development Team

**Team Composition:**
- 2x Full-Stack .NET Developers
- 1x Business Systems Analyst (BSA)
- 1x Project Manager

**Timeline:** 20 weeks (5 months)

**Estimated Hours Breakdown:**

| Phase | Activity | Hours |
|-------|----------|-------|
| **Planning & Requirements** | Requirements gathering, technical design, database schema design | 120 hrs |
| **Development - Sprint 1** | Project setup, authentication, database infrastructure | 160 hrs |
| **Development - Sprint 2** | Lobbyist registration, exemption checker | 200 hrs |
| **Development - Sprint 3** | Quarterly expense reporting (all input methods) | 240 hrs |
| **Development - Sprint 4** | Employer reporting, board member features | 200 hrs |
| **Development - Sprint 5** | Public search interface, CSV export | 160 hrs |
| **Development - Sprint 6** | Admin dashboard, compliance monitoring | 200 hrs |
| **Development - Sprint 7** | Email notifications, automated workflows | 120 hrs |
| **Testing & QA** | Integration testing, accessibility testing, bug fixes | 200 hrs |
| **Deployment & Training** | Production deployment, user training, documentation | 80 hrs |
| **Project Management** | Sprint planning, stakeholder meetings, reporting | 120 hrs |
| **BSA Activities** | Requirements refinement, user acceptance testing, documentation | 100 hrs |

**Total Development Hours:** 1,900 hours

**Cost Estimate (assuming blended rate of $85/hr):** $161,500

**Notes on Timeline:**
- Traditional waterfall approach with weekly sprint cycles
- Includes time for stakeholder review gates between sprints
- County procurement and approval processes accounted for
- Assumes standard government change request processes

---

### Option 2: AI-Assisted Development (Claude Code)

**Team Composition:**
- 1x Senior Developer (Human oversight & stakeholder management)
- Claude Code (AI pair programmer)

**Timeline:** 8 weeks (2 months)

**Estimated Hours Breakdown:**

| Phase | Activity | Human Hours | Claude Code Hours |
|-------|----------|-------------|-------------------|
| **Planning & Wireframing** | Requirements review, wireframe stakeholder approval | 40 hrs | 20 hrs |
| **Initial Setup** | Next.js project, Prisma, authentication, UI library | 8 hrs | 4 hrs |
| **Core Development** | All registration, reporting, and search features | 60 hrs | 120 hrs |
| **CSV Import/Export** | Template creation, validation, bulk operations | 10 hrs | 15 hrs |
| **Admin Dashboard** | Compliance monitoring, alert system, review workflow | 16 hrs | 30 hrs |
| **Email Notifications** | Automated deadline reminders, configuration | 8 hrs | 10 hrs |
| **Accessibility & Polish** | WCAG compliance, responsive design refinement | 20 hrs | 25 hrs |
| **Testing** | Manual QA, stakeholder demos, bug fixes | 40 hrs | 30 hrs |
| **Deployment** | Production setup, database migration, go-live | 12 hrs | 6 hrs |
| **Documentation** | User guides, admin documentation, technical docs | 16 hrs | 10 hrs |

**Total Human Hours:** 230 hours
**Total Claude Code Hours:** 270 hours

**Cost Estimate:**
- Human Developer @ $120/hr: $27,600
- Claude Code @ $15/hr: $4,050
- **Total:** $31,650

**Notes on Timeline:**
- Rapid prototyping approach with continuous stakeholder feedback
- Claude Code handles repetitive coding tasks at high speed
- Human developer focuses on architecture, review, and stakeholder communication
- Faster iteration cycles due to AI-assisted development
- Same quality and compliance standards as traditional approach

**Time Savings Factors:**
- Claude Code can scaffold components in minutes vs hours
- Instant boilerplate generation for forms, validation, API routes
- Rapid iteration on UI based on stakeholder feedback
- Database schema changes via migrations prevent rework
- Automated testing setup and execution

---

## Ongoing Maintenance & Support

### Annual Maintenance Plan

**Scope of Maintenance:**
- Security updates and dependency upgrades
- Bug fixes and minor enhancements
- Performance monitoring and optimization
- Database backups and maintenance
- One (1) new feature per year (medium complexity)
- Quarterly security reviews
- Accessibility audits

#### Option 1: Traditional .NET Team Maintenance

**Annual Hours Estimate:**

| Activity | Hours/Year |
|----------|------------|
| Security updates & dependency upgrades | 40 hrs |
| Bug fixes (average 2-3 per quarter) | 60 hrs |
| Performance monitoring & optimization | 20 hrs |
| Database maintenance | 15 hrs |
| New feature development (1 per year) | 120 hrs |
| Security reviews (quarterly) | 40 hrs |
| Accessibility audit | 20 hrs |
| Documentation updates | 15 hrs |
| **Total Annual Hours** | **330 hrs** |

**Annual Cost @ $85/hr:** $28,050

---

#### Option 2: AI-Assisted Maintenance

**Annual Hours Estimate:**

| Activity | Human Hours | Claude Code Hours |
|----------|-------------|-------------------|
| Security updates & dependency upgrades | 8 hrs | 12 hrs |
| Bug fixes (average 2-3 per quarter) | 12 hrs | 18 hrs |
| Performance monitoring & optimization | 6 hrs | 8 hrs |
| Database maintenance | 4 hrs | 6 hrs |
| New feature development (1 per year) | 24 hrs | 60 hrs |
| Security reviews (quarterly) | 16 hrs | 12 hrs |
| Accessibility audit | 6 hrs | 8 hrs |
| Documentation updates | 4 hrs | 6 hrs |
| **Total Annual Hours** | **80 hrs** | **130 hrs** |

**Annual Cost:**
- Human Developer @ $120/hr: $9,600
- Claude Code @ $15/hr: $1,950
- **Total Annual Cost:** $11,550

**Annual Savings vs Traditional:** $16,500 (59% reduction)

---

## Cost Comparison Summary

### Initial Development

| Approach | Timeline | Total Cost | Cost/Week |
|----------|----------|------------|-----------|
| Traditional .NET Team | 20 weeks | $161,500 | $8,075 |
| AI-Assisted (Claude Code) | 8 weeks | $31,650 | $3,956 |
| **Savings with AI** | **12 weeks faster** | **$129,850** | **51% reduction** |

### Year 1 Total Cost (Development + Maintenance)

| Approach | Development | Maintenance | Year 1 Total |
|----------|-------------|-------------|--------------|
| Traditional .NET Team | $161,500 | $28,050 | $189,550 |
| AI-Assisted (Claude Code) | $31,650 | $11,550 | $43,200 |
| **Total Year 1 Savings** | | | **$146,350 (77%)** |

### 5-Year Total Cost of Ownership

| Approach | Initial Dev | 5yr Maintenance | 5yr Total |
|----------|-------------|-----------------|-----------|
| Traditional .NET Team | $161,500 | $140,250 | $301,750 |
| AI-Assisted (Claude Code) | $31,650 | $57,750 | $89,400 |
| **5-Year Savings** | | | **$212,350 (70%)** |

---

## Risk Assessment & Mitigation

### Traditional .NET Approach
**Risks:**
- Longer timeline increases risk of missing July 1, 2026 deadline
- Higher cost may impact budget approval
- Developer availability (county staffing constraints)
- Scope creep in waterfall process

**Mitigation:**
- Start immediately to ensure timeline buffer
- Fixed-scope contract with change request process
- Dedicated team commitment
- Regular stakeholder checkpoints

### AI-Assisted Approach
**Risks:**
- Novel approach may face internal skepticism
- Requires skilled developer to guide Claude Code
- Stakeholder comfort with AI-generated code

**Mitigation:**
- All code reviewed by senior developer
- Same quality and security standards as traditional development
- Continuous stakeholder demos to build confidence
- Comprehensive testing and QA process
- Well-documented codebase for future maintainability

---

## Recommendations

We recommend **Option 2: AI-Assisted Development with Claude Code** for the following reasons:

1. **Cost Effective:** 77% savings in Year 1, 70% savings over 5 years
2. **Faster Time to Market:** 8 weeks vs 20 weeks ensures comfortable deadline margin
3. **Quality Assurance:** Human oversight ensures code quality and compliance
4. **Maintainability:** Modern tech stack (Next.js/TypeScript) is industry-standard and well-supported
5. **Flexibility:** Faster iteration allows for stakeholder feedback incorporation
6. **Future-Proof:** County gains experience with AI-assisted development for future projects

### Success Factors
- Experienced senior developer to guide the AI and manage stakeholders
- Regular stakeholder demos (weekly) to validate features
- Clear acceptance criteria based on ordinance requirements
- Comprehensive testing before launch
- User training and documentation for all stakeholder groups

---

## Next Steps

1. **Approve approach and budget** (Week 1)
2. **Assign senior developer resource** (Week 1)
3. **Kickoff meeting with stakeholders** (Week 2)
4. **Begin development** (Week 2)
5. **Weekly progress demos** (Weeks 2-8)
6. **User acceptance testing** (Week 8)
7. **Training and documentation** (Week 9)
8. **Production launch** (Week 10)
9. **Post-launch monitoring** (Weeks 10-12)

---

## Appendix: Technology Stack

### Proposed Stack (Option 2: AI-Assisted)
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui (accessibility-first component library)
- **Backend:** Next.js API routes
- **Database:** PostgreSQL (production), Prisma ORM
- **Authentication:** NextAuth.js
- **Email:** SendGrid or AWS SES
- **Hosting:** Vercel or Google Cloud Run
- **File Storage:** AWS S3 or Google Cloud Storage

### Traditional Stack (Option 1: .NET Team)
- **Frontend:** ASP.NET MVC, Razor Pages, Bootstrap
- **Backend:** .NET 8, C#
- **Database:** SQL Server
- **Authentication:** ASP.NET Identity
- **Email:** SMTP / Microsoft Exchange
- **Hosting:** IIS on Windows Server or Azure App Service

---

**Questions or clarifications? Contact: [Your Name/Team]**
