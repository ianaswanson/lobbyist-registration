import {
  PrismaClient,
  UserRole,
  RegistrationStatus,
  ReportStatus,
  Quarter,
  ExpenseReportType,
  ViolationStatus,
  ViolationType,
  EntityType,
  AppealStatus,
} from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

/**
 * ⚠️ SECURITY NOTE: TEST CREDENTIALS FOR DEVELOPMENT/DEMO ONLY
 *
 * This file contains test account credentials that are:
 * - Intentionally documented for development and demo purposes
 * - NOT connected to real email accounts or users
 * - Never used in production environments
 * - Required for automated testing, demos, and development
 *
 * These credentials are publicly documented in DEMO-GUIDE.html
 * and are the equivalent of "test@example.com" / "password123"
 * commonly found in open-source projects.
 *
 * Production environments:
 * - Use government SSO (Azure AD or Google Identity)
 * - Never seed test data
 * - Store real secrets in Google Secret Manager
 *
 * GitGuardian/Security Scanners: This is intentional test data,
 * not a credential leak. See GITGUARDIAN-ALERT-ANALYSIS.md for details.
 */

// ============================================================================
// SECTION 1: CLEAR DATABASE
// ============================================================================

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");

  // Delete in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.appeal.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.contractException.deleteMany();
  await prisma.hourLog.deleteMany();
  await prisma.boardLobbyingReceipt.deleteMany();
  await prisma.boardCalendarEntry.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.employerLobbyistPayment.deleteMany();
  await prisma.expenseLineItem.deleteMany();
  await prisma.employerExpenseReport.deleteMany();
  await prisma.lobbyistExpenseReport.deleteMany();
  await prisma.lobbyistEmployer.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.lobbyist.deleteMany();
  await prisma.user.deleteMany();

  console.log("   ✓ Database cleared");
}

// ============================================================================
// SECTION 2: CREATE BASE USERS (Rule of 3)
// ============================================================================

async function createBaseUsers() {
  console.log("👤 Creating base users (Rule of 3)...");

  // 1 admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@multnomah.gov",
      name: "County Administrator",
      role: UserRole.ADMIN,
      password: await hashPassword("Demo2025!Admin"),
    },
  });
  console.log("   ✓ Created 1 admin user");

  // 3 APPROVED lobbyist users
  const lobbyistUsers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `lobbyist${i}@example.com`,
        name: `Lobbyist ${i}`,
        role: UserRole.LOBBYIST,
        password: await hashPassword("lobbyist123"),
      },
    });
    lobbyistUsers.push(user);
  }
  console.log("   ✓ Created 3 approved lobbyist users");

  // 3 PENDING lobbyist users (for admin review)
  const pendingLobbyistUsers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `pending${i}@example.com`,
        name: `Pending Lobbyist ${i}`,
        role: UserRole.LOBBYIST,
        password: await hashPassword("lobbyist123"),
      },
    });
    pendingLobbyistUsers.push(user);
  }
  console.log("   ✓ Created 3 pending lobbyist users");

  // 3 employer users
  const employerUsers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `employer${i}@example.com`,
        name: `Employer Contact ${i}`,
        role: UserRole.EMPLOYER,
        password: await hashPassword("employer123"),
      },
    });
    employerUsers.push(user);
  }
  console.log("   ✓ Created 3 employer users");

  // 3 board member users
  const boardMemberUsers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `commissioner${i}@multnomah.gov`,
        name: `Commissioner ${i}`,
        role: UserRole.BOARD_MEMBER,
        password: await hashPassword("board123"),
      },
    });
    boardMemberUsers.push(user);
  }
  console.log("   ✓ Created 3 board member users");

  // 1 public user (for demonstration)
  const publicUser = await prisma.user.create({
    data: {
      email: "public@example.com",
      name: "Public User",
      role: UserRole.PUBLIC,
      password: await hashPassword("public123"),
    },
  });
  console.log("   ✓ Created 1 public user");

  return {
    adminUser,
    lobbyistUsers,
    pendingLobbyistUsers,
    employerUsers,
    boardMemberUsers,
    publicUser,
  };
}

// ============================================================================
// SECTION 3: CREATE APPROVED DATA (Rule of 3)
// ============================================================================

async function createApprovedData(
  users: Awaited<ReturnType<typeof createBaseUsers>>
) {
  console.log("📊 Creating approved data (Rule of 3)...");

  // ──────────────────────────────────────────────────────────────────────
  // 3 APPROVED LOBBYISTS
  // ──────────────────────────────────────────────────────────────────────
  const lobbyists = [];
  for (let i = 0; i < 3; i++) {
    const lobbyist = await prisma.lobbyist.create({
      data: {
        userId: users.lobbyistUsers[i].id,
        name: `Lobbyist ${i + 1}`,
        email: `lobbyist${i + 1}@example.com`,
        phone: `503-555-010${i + 1}`,
        address: `${100 + i * 100} Main St, Portland, OR 9720${i + 1}`,
        status: RegistrationStatus.APPROVED,
        hoursCurrentQuarter: 25.5,
        registrationDate: new Date(`2025-0${i + 1}-15`),
        reviewedBy: users.adminUser.id,
        reviewedAt: new Date(`2025-0${i + 1}-16`),
      },
    });
    lobbyists.push(lobbyist);
  }
  console.log("   ✓ Created 3 approved lobbyists");

  // ──────────────────────────────────────────────────────────────────────
  // 3 EMPLOYERS
  // ──────────────────────────────────────────────────────────────────────
  const employers = [];
  const employerNames = [
    "TechCorp Industries",
    "Healthcare Advocates Group",
    "Green Energy Coalition",
  ];
  const employerDescriptions = [
    "Technology consulting and software development firm specializing in government solutions",
    "Non-profit organization advocating for healthcare policy reform",
    "Environmental advocacy organization promoting renewable energy and climate action",
  ];

  for (let i = 0; i < 3; i++) {
    const employer = await prisma.employer.create({
      data: {
        userId: users.employerUsers[i].id,
        name: employerNames[i],
        email: `employer${i + 1}@example.com`,
        phone: `503-555-020${i + 1}`,
        address: `${200 + i * 100} Business Pkwy, Portland, OR 9720${i + 3}`,
        businessDescription: employerDescriptions[i],
      },
    });
    employers.push(employer);
  }
  console.log("   ✓ Created 3 employers");

  // ──────────────────────────────────────────────────────────────────────
  // 3 LOBBYIST-EMPLOYER LINKS (each lobbyist → 1 employer)
  // ──────────────────────────────────────────────────────────────────────
  const lobbyistEmployers = [];
  const subjectsOfInterest = [
    "Technology policy, data privacy, government IT contracts",
    "Healthcare funding, Medicaid expansion, mental health services",
    "Climate action, renewable energy, environmental regulations",
  ];

  for (let i = 0; i < 3; i++) {
    const link = await prisma.lobbyistEmployer.create({
      data: {
        lobbyistId: lobbyists[i].id,
        employerId: employers[i].id,
        authorizationDocumentUrl: `/uploads/auth-lobbyist${i + 1}-employer${i + 1}.pdf`,
        authorizationDate: new Date(`2025-0${i + 1}-10`),
        subjectsOfInterest: subjectsOfInterest[i],
      },
    });
    lobbyistEmployers.push(link);
  }
  console.log("   ✓ Created 3 lobbyist-employer links");

  // ──────────────────────────────────────────────────────────────────────
  // 3 BOARD MEMBERS
  // ──────────────────────────────────────────────────────────────────────
  const boardMembers = [];
  for (let i = 0; i < 3; i++) {
    const boardMember = await prisma.boardMember.create({
      data: {
        userId: users.boardMemberUsers[i].id,
        name: `Commissioner ${i + 1}`,
        district: `District ${i + 1}`,
        termStart: new Date(`202${2 + i}-01-01`),
        isActive: true,
      },
    });
    boardMembers.push(boardMember);
  }
  console.log("   ✓ Created 3 board members");

  // ──────────────────────────────────────────────────────────────────────
  // 3 LOBBYISTS × 3 QUARTERS = 9 LOBBYIST EXPENSE REPORTS
  // ──────────────────────────────────────────────────────────────────────
  const quarters: Quarter[] = ["Q1", "Q2", "Q3"];
  const lobbyistReports = [];

  for (const lobbyist of lobbyists) {
    for (const quarter of quarters) {
      const report = await prisma.lobbyistExpenseReport.create({
        data: {
          lobbyistId: lobbyist.id,
          quarter,
          year: 2025,
          status: ReportStatus.APPROVED,
          totalFoodEntertainment: 450.75,
          submittedAt: new Date("2025-04-09"),
          dueDate: new Date("2025-04-15"),
          reviewedBy: users.adminUser.id,
          reviewedAt: new Date("2025-04-10"),
        },
      });
      lobbyistReports.push(report);

      // 3 EXPENSE LINE ITEMS PER REPORT
      for (let i = 1; i <= 3; i++) {
        await prisma.expenseLineItem.create({
          data: {
            reportId: report.id,
            reportType: ExpenseReportType.LOBBYIST,
            officialName: `Commissioner ${i}`,
            date: new Date(`2025-0${quarters.indexOf(quarter) + 1}-0${i}`),
            payee: `Restaurant ${i}`,
            purpose: `Meeting ${i} discussion regarding policy topics`,
            amount: 150.25,
            isEstimate: false,
          },
        });
      }
    }
  }
  console.log(
    "   ✓ Created 9 lobbyist expense reports (3 lobbyists × 3 quarters)"
  );
  console.log("   ✓ Created 27 expense line items (9 reports × 3 items)");

  // ──────────────────────────────────────────────────────────────────────
  // 3 EMPLOYERS × 3 QUARTERS = 9 EMPLOYER EXPENSE REPORTS
  // ──────────────────────────────────────────────────────────────────────
  const employerReports = [];

  for (const employer of employers) {
    for (const quarter of quarters) {
      const report = await prisma.employerExpenseReport.create({
        data: {
          employerId: employer.id,
          quarter,
          year: 2025,
          status: ReportStatus.APPROVED,
          totalLobbyingSpend: 16235.5,
          submittedAt: new Date("2025-04-12"),
          dueDate: new Date("2025-04-15"),
          reviewedBy: users.adminUser.id,
          reviewedAt: new Date("2025-04-13"),
        },
      });
      employerReports.push(report);

      // 3 EXPENSE LINE ITEMS PER REPORT
      for (let i = 1; i <= 3; i++) {
        await prisma.expenseLineItem.create({
          data: {
            reportId: report.id,
            reportType: ExpenseReportType.EMPLOYER,
            officialName: `Commissioner ${i}`,
            date: new Date(`2025-0${quarters.indexOf(quarter) + 1}-0${i + 5}`),
            payee: `Vendor ${i}`,
            purpose: `Event ${i} for stakeholder engagement`,
            amount: 300.5,
            isEstimate: false,
          },
        });
      }

      // 3 LOBBYIST PAYMENTS PER REPORT (linking to our 3 lobbyists)
      for (let i = 0; i < 3; i++) {
        await prisma.employerLobbyistPayment.create({
          data: {
            employerReportId: report.id,
            lobbyistId: lobbyists[i].id,
            amountPaid: 5000.0,
          },
        });
      }
    }
  }
  console.log(
    "   ✓ Created 9 employer expense reports (3 employers × 3 quarters)"
  );
  console.log(
    "   ✓ Created 27 employer expense line items (9 reports × 3 items)"
  );
  console.log(
    "   ✓ Created 27 lobbyist payment records (9 reports × 3 payments)"
  );

  // ──────────────────────────────────────────────────────────────────────
  // 3 BOARD MEMBERS × 3 CALENDAR ENTRIES = 9 CALENDAR ENTRIES
  // ──────────────────────────────────────────────────────────────────────
  for (const boardMember of boardMembers) {
    for (let i = 0; i < 3; i++) {
      await prisma.boardCalendarEntry.create({
        data: {
          boardMemberId: boardMember.id,
          eventTitle: `Board Meeting ${i + 1}`,
          eventDate: new Date(`2025-0${i + 1}-15`),
          eventTime: `${10 + i}:00 AM - ${12 + i}:00 PM`,
          participantsList: `County staff, Community members, Stakeholder ${i + 1}`,
          quarter: quarters[i],
          year: 2025,
        },
      });
    }
  }
  console.log("   ✓ Created 9 board calendar entries (3 members × 3 entries)");

  // ──────────────────────────────────────────────────────────────────────
  // 3 BOARD MEMBERS × 3 QUARTERS × 3 RECEIPTS = 27 RECEIPTS
  // ──────────────────────────────────────────────────────────────────────
  for (const boardMember of boardMembers) {
    for (const quarter of quarters) {
      for (let i = 0; i < 3; i++) {
        await prisma.boardLobbyingReceipt.create({
          data: {
            boardMemberId: boardMember.id,
            lobbyistId: lobbyists[i].id,
            amount: 100.0 + i * 25,
            date: new Date(`2025-0${quarters.indexOf(quarter) + 1}-${10 + i}`),
            payee: `Restaurant ${i + 1}`,
            purpose: `Lunch meeting ${i + 1} regarding policy discussion`,
            quarter,
            year: 2025,
          },
        });
      }
    }
  }
  console.log(
    "   ✓ Created 27 board lobbying receipts (3 members × 3 quarters × 3 receipts)"
  );

  // ──────────────────────────────────────────────────────────────────────
  // 3 LOBBYISTS × 3 HOUR LOGS = 9 HOUR LOGS
  // ──────────────────────────────────────────────────────────────────────
  for (const lobbyist of lobbyists) {
    for (let i = 0; i < 3; i++) {
      await prisma.hourLog.create({
        data: {
          lobbyistId: lobbyist.id,
          activityDate: new Date(`2025-10-${5 + i * 5}`),
          hours: 3.5 + i,
          description: `Lobbying activity ${i + 1}: Meeting with county officials and staff`,
          quarter: Quarter.Q4,
          year: 2025,
        },
      });
    }
  }
  console.log("   ✓ Created 9 hour logs (3 lobbyists × 3 logs)");

  return {
    lobbyists,
    employers,
    boardMembers,
    lobbyistReports,
    employerReports,
  };
}

// ============================================================================
// SECTION 4: CREATE PENDING DATA (Rule of 3)
// ============================================================================

async function createPendingData(
  users: Awaited<ReturnType<typeof createBaseUsers>>
) {
  console.log("⏳ Creating pending data for admin review (Rule of 3)...");

  // ──────────────────────────────────────────────────────────────────────
  // 3 PENDING LOBBYISTS
  // ──────────────────────────────────────────────────────────────────────
  const pendingLobbyists = [];
  for (let i = 0; i < 3; i++) {
    const lobbyist = await prisma.lobbyist.create({
      data: {
        userId: users.pendingLobbyistUsers[i].id,
        name: `Pending Lobbyist ${i + 1}`,
        email: `pending${i + 1}@example.com`,
        phone: `503-555-030${i + 1}`,
        address: `${300 + i * 100} Pending Ave, Portland, OR 9720${i + 6}`,
        status: RegistrationStatus.PENDING,
        hoursCurrentQuarter: 15.0,
        registrationDate: new Date("2025-10-15"),
      },
    });
    pendingLobbyists.push(lobbyist);
  }
  console.log("   ✓ Created 3 pending lobbyist registrations");

  // ──────────────────────────────────────────────────────────────────────
  // 3 PENDING EMPLOYERS (no user accounts)
  // ──────────────────────────────────────────────────────────────────────
  const pendingEmployers = [];
  for (let i = 0; i < 3; i++) {
    const employer = await prisma.employer.create({
      data: {
        name: `Pending Employer ${i + 1}`,
        email: `pending.employer${i + 1}@example.com`,
        phone: `503-555-040${i + 1}`,
        address: `${400 + i * 100} Pending Blvd, Portland, OR 9720${i + 9}`,
        businessDescription: `Pending organization ${i + 1} focused on policy advocacy`,
      },
    });
    pendingEmployers.push(employer);
  }
  console.log("   ✓ Created 3 pending employers");

  // Link pending lobbyists to pending employers
  for (let i = 0; i < 3; i++) {
    await prisma.lobbyistEmployer.create({
      data: {
        lobbyistId: pendingLobbyists[i].id,
        employerId: pendingEmployers[i].id,
        authorizationDocumentUrl: `/uploads/auth-pending${i + 1}.pdf`,
        authorizationDate: new Date("2025-10-10"),
        subjectsOfInterest: `Policy area ${i + 1}, regulatory matters`,
      },
    });
  }
  console.log("   ✓ Created 3 pending lobbyist-employer links");

  return { pendingLobbyists, pendingEmployers };
}

// ============================================================================
// SECTION 5: CREATE VIOLATIONS & APPEALS (Rule of 3)
// ============================================================================

async function createViolationsAndAppeals(
  approvedData: Awaited<ReturnType<typeof createApprovedData>>
) {
  console.log("⚠️  Creating violations and appeals (Rule of 3)...");

  // ──────────────────────────────────────────────────────────────────────
  // 3 VIOLATIONS
  // ──────────────────────────────────────────────────────────────────────
  const violationTypes: ViolationType[] = [
    "LATE_REGISTRATION",
    "LATE_REPORT",
    "MISSING_AUTHORIZATION",
  ];
  const violations = [];

  for (let i = 0; i < 3; i++) {
    const violation = await prisma.violation.create({
      data: {
        entityType: EntityType.LOBBYIST,
        entityId: approvedData.lobbyists[i].id,
        violationType: violationTypes[i],
        description: `Violation ${i + 1}: ${violationTypes[i]} - Detailed description of the violation`,
        fineAmount: 150.0 + i * 100,
        status: ViolationStatus.ISSUED,
        issuedDate: new Date(`2025-09-${10 + i}`),
        isFirstTimeViolation: i === 0,
      },
    });
    violations.push(violation);
  }
  console.log("   ✓ Created 3 violations");

  // ──────────────────────────────────────────────────────────────────────
  // 3 VIOLATIONS × 3 APPEALS = 9 APPEALS
  // ──────────────────────────────────────────────────────────────────────
  const appealStatuses: AppealStatus[] = ["PENDING", "SCHEDULED", "DECIDED"];
  let appealCount = 0;

  for (const violation of violations) {
    for (let i = 0; i < 3; i++) {
      await prisma.appeal.create({
        data: {
          violationId: violation.id,
          reason: `Appeal reason ${i + 1}: Detailed explanation of why this violation should be reconsidered. This includes evidence and justification.`,
          submittedDate: new Date(`2025-09-${15 + i}`),
          appealDeadline: new Date(`2025-10-${15 + i}`),
          status: appealStatuses[i],
          hearingDate: i > 0 ? new Date(`2025-10-${20 + i}`) : undefined,
          decision:
            i === 2
              ? "Appeal decision: After review, the appeal is upheld/denied based on evidence presented."
              : undefined,
          decidedAt: i === 2 ? new Date(`2025-10-${25 + i}`) : undefined,
        },
      });
      appealCount++;
    }
  }
  console.log(`   ✓ Created ${appealCount} appeals (3 violations × 3 appeals)`);

  return { violations };
}

// ============================================================================
// SECTION 6: CREATE CONTRACT EXCEPTIONS (Rule of 3)
// ============================================================================

async function createContractExceptions() {
  console.log("📋 Creating contract exceptions (Rule of 3)...");

  for (let i = 1; i <= 3; i++) {
    await prisma.contractException.create({
      data: {
        formerOfficialId: `FO-2024-00${i}`,
        formerOfficialName: `Former Official ${i}`,
        contractDescription: `Contract ${i}: Professional services agreement for county project. Former official now works for contracting firm.`,
        justification: `Written findings per §9.230(C): After review, the Chair finds that the best interests of the County favor this contract because: (1) Specialized expertise, (2) Competitive pricing, (3) Project continuity, (4) No undue influence during authorization.`,
        approvedBy: "County Chair Jessica Vega Pederson",
        approvedDate: new Date(`2024-0${i + 3}-15`),
        publiclyPostedDate: new Date(`2024-0${i + 3}-20`),
      },
    });
  }
  console.log("   ✓ Created 3 contract exceptions");
}

// ============================================================================
// SECTION 7: CREATE AUDIT LOGS (Rule of 3)
// ============================================================================

async function createAuditLogs(
  users: Awaited<ReturnType<typeof createBaseUsers>>,
  approvedData: Awaited<ReturnType<typeof createApprovedData>>
) {
  console.log("📝 Creating audit log entries (Rule of 3)...");

  const actions = ["LOGIN", "CREATE", "UPDATE"];
  const entityTypes = [
    "User",
    "LobbyistExpenseReport",
    "EmployerExpenseReport",
  ];

  // 3 users × 3 actions = 9 audit logs
  for (let userIdx = 0; userIdx < 3; userIdx++) {
    const user = users.lobbyistUsers[userIdx];
    for (let actionIdx = 0; actionIdx < 3; actionIdx++) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: actions[actionIdx],
          entityType: entityTypes[actionIdx],
          entityId:
            actionIdx === 0
              ? user.id
              : approvedData.lobbyistReports[userIdx * 3 + actionIdx].id,
          changesJson:
            actionIdx > 0
              ? JSON.stringify({ field: "value", quarter: "Q1" })
              : undefined,
          ipAddress: `192.168.1.${100 + userIdx * 10 + actionIdx}`,
        },
      });
    }
  }
  console.log("   ✓ Created 9 audit log entries (3 users × 3 actions)");
}

// ============================================================================
// SECTION 8: VALIDATION FUNCTION
// ============================================================================

async function validateSeedData() {
  console.log("✅ Validating seed data (Rule of 3 Pattern)...");

  const counts = {
    adminUsers: await prisma.user.count({ where: { role: UserRole.ADMIN } }),
    approvedLobbyistUsers: await prisma.user.count({
      where: {
        role: UserRole.LOBBYIST,
        lobbyist: { status: RegistrationStatus.APPROVED },
      },
    }),
    pendingLobbyistUsers: await prisma.user.count({
      where: {
        role: UserRole.LOBBYIST,
        lobbyist: { status: RegistrationStatus.PENDING },
      },
    }),
    employerUsers: await prisma.user.count({
      where: { role: UserRole.EMPLOYER },
    }),
    boardMemberUsers: await prisma.user.count({
      where: { role: UserRole.BOARD_MEMBER },
    }),
    publicUsers: await prisma.user.count({ where: { role: UserRole.PUBLIC } }),

    approvedLobbyists: await prisma.lobbyist.count({
      where: { status: RegistrationStatus.APPROVED },
    }),
    pendingLobbyists: await prisma.lobbyist.count({
      where: { status: RegistrationStatus.PENDING },
    }),
    employers: await prisma.employer.count({
      where: { userId: { not: null } },
    }),
    pendingEmployers: await prisma.employer.count({ where: { userId: null } }),
    boardMembers: await prisma.boardMember.count(),

    lobbyistEmployerLinks: await prisma.lobbyistEmployer.count(),
    lobbyistReports: await prisma.lobbyistExpenseReport.count({
      where: { status: ReportStatus.APPROVED },
    }),
    employerReports: await prisma.employerExpenseReport.count({
      where: { status: ReportStatus.APPROVED },
    }),

    lobbyistLineItems: await prisma.expenseLineItem.count({
      where: { reportType: ExpenseReportType.LOBBYIST },
    }),
    employerLineItems: await prisma.expenseLineItem.count({
      where: { reportType: ExpenseReportType.EMPLOYER },
    }),
    lobbyistPayments: await prisma.employerLobbyistPayment.count(),

    calendarEntries: await prisma.boardCalendarEntry.count(),
    lobbyingReceipts: await prisma.boardLobbyingReceipt.count(),
    hourLogs: await prisma.hourLog.count(),

    violations: await prisma.violation.count(),
    appeals: await prisma.appeal.count(),
    contractExceptions: await prisma.contractException.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  const expected = {
    adminUsers: 1,
    approvedLobbyistUsers: 3,
    pendingLobbyistUsers: 3,
    employerUsers: 3,
    boardMemberUsers: 3,
    publicUsers: 1,

    approvedLobbyists: 3,
    pendingLobbyists: 3,
    employers: 3,
    pendingEmployers: 3,
    boardMembers: 3,

    lobbyistEmployerLinks: 6, // 3 approved + 3 pending
    lobbyistReports: 9, // 3 lobbyists × 3 quarters
    employerReports: 9, // 3 employers × 3 quarters

    lobbyistLineItems: 27, // 9 reports × 3 items
    employerLineItems: 27, // 9 reports × 3 items
    lobbyistPayments: 27, // 9 reports × 3 payments

    calendarEntries: 9, // 3 members × 3 entries
    lobbyingReceipts: 27, // 3 members × 3 quarters × 3 receipts
    hourLogs: 9, // 3 lobbyists × 3 logs

    violations: 3,
    appeals: 9, // 3 violations × 3 appeals
    contractExceptions: 3,
    auditLogs: 9, // 3 users × 3 actions
  };

  let passed = true;
  const maxLabelLength = Math.max(
    ...Object.keys(expected).map((k) => k.length)
  );

  for (const [key, value] of Object.entries(counts)) {
    const exp = expected[key as keyof typeof expected];
    const label = key.padEnd(maxLabelLength);

    if (value !== exp) {
      console.error(`   ❌ ${label}: expected ${exp}, got ${value}`);
      passed = false;
    } else {
      console.log(`   ✓ ${label}: ${value}`);
    }
  }

  if (!passed) {
    throw new Error(
      "❌ Validation failed! Seed data does not match Rule of 3 pattern"
    );
  }

  console.log("\n✅ All validation checks passed!");
  return true;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log("🌱 Starting database seed (Rule of 3 Pattern)...\n");

  await clearDatabase();
  const users = await createBaseUsers();
  const approvedData = await createApprovedData(users);
  const pendingData = await createPendingData(users);
  const violations = await createViolationsAndAppeals(approvedData);
  await createContractExceptions();
  await createAuditLogs(users, approvedData);
  await validateSeedData();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Database seeding completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 Rule of 3 Pattern Summary:");
  console.log("   • Every entity type: 3 base records");
  console.log("   • Every relationship: 3 children per parent");
  console.log("   • Cascading totals: 3 → 9 → 27");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 TEST ACCOUNTS CREATED:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔑 ADMIN:");
  console.log("   Email:    admin@multnomah.gov");
  console.log("   Password: Demo2025!Admin");
  console.log("\n🎯 APPROVED LOBBYISTS (3):");
  console.log("   Email:    lobbyist1@example.com");
  console.log("   Email:    lobbyist2@example.com");
  console.log("   Email:    lobbyist3@example.com");
  console.log("   Password: lobbyist123");
  console.log("\n⏳ PENDING LOBBYISTS (3):");
  console.log("   Email:    pending1@example.com");
  console.log("   Email:    pending2@example.com");
  console.log("   Email:    pending3@example.com");
  console.log("   Password: lobbyist123");
  console.log("\n🏢 EMPLOYERS (3):");
  console.log("   Email:    employer1@example.com");
  console.log("   Email:    employer2@example.com");
  console.log("   Email:    employer3@example.com");
  console.log("   Password: employer123");
  console.log("\n🏛️  BOARD MEMBERS (3):");
  console.log("   Email:    commissioner1@multnomah.gov");
  console.log("   Email:    commissioner2@multnomah.gov");
  console.log("   Email:    commissioner3@multnomah.gov");
  console.log("   Password: board123");
  console.log("\n👥 PUBLIC USER:");
  console.log("   Email:    public@example.com");
  console.log("   Password: public123");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌐 Visit http://localhost:3000/auth/signin to test!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
