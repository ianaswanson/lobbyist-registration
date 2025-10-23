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
  const lobbyistData = [
    { email: "john.doe@lobbying.com", name: "John Doe" },
    { email: "jane.smith@advocacy.com", name: "Jane Smith" },
    { email: "michael.chen@greenlobby.org", name: "Michael Chen" },
  ];
  const lobbyistUsers = [];
  for (const data of lobbyistData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: UserRole.LOBBYIST,
        password: await hashPassword("lobbyist123"),
      },
    });
    lobbyistUsers.push(user);
  }
  console.log("   ✓ Created 3 approved lobbyist users");

  // 3 PENDING lobbyist users (for admin review)
  const pendingLobbyistData = [
    {
      email: "sarah.martinez@portlandadvocates.com",
      name: "Sarah Martinez",
    },
    {
      email: "robert.johnson@transportationalliance.org",
      name: "Robert Johnson",
    },
    { email: "emily.wong@housingfirst.org", name: "Emily Wong" },
  ];
  const pendingLobbyistUsers = [];
  for (const data of pendingLobbyistData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: UserRole.LOBBYIST,
        password: await hashPassword("lobbyist123"),
      },
    });
    pendingLobbyistUsers.push(user);
  }
  console.log("   ✓ Created 3 pending lobbyist users");

  // 3 employer users
  const employerData = [
    { email: "contact@techcorp.com", name: "Sarah Johnson" },
    { email: "info@healthadvocates.org", name: "David Kim" },
    { email: "contact@greenenergy.org", name: "Maria Rodriguez" },
  ];
  const employerUsers = [];
  for (const data of employerData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: UserRole.EMPLOYER,
        password: await hashPassword("employer123"),
      },
    });
    employerUsers.push(user);
  }
  console.log("   ✓ Created 3 employer users");

  // 3 board member users
  const boardMemberData = [
    { email: "commissioner@multnomah.gov", name: "Commissioner Williams" },
    { email: "commissioner.chen@multnomah.gov", name: "Commissioner Chen" },
    { email: "commissioner.garcia@multnomah.gov", name: "Commissioner Garcia" },
  ];
  const boardMemberUsers = [];
  for (const data of boardMemberData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
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
  const approvedLobbyistData = [
    {
      name: "John Doe",
      email: "john.doe@lobbying.com",
      phone: "503-555-0101",
      address: "123 Main St, Portland, OR 97201",
      hours: 25.5,
      regDate: "2025-01-15",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@advocacy.com",
      phone: "503-555-0102",
      address: "456 Oak Ave, Portland, OR 97202",
      hours: 18.0,
      regDate: "2025-02-01",
    },
    {
      name: "Michael Chen",
      email: "michael.chen@greenlobby.org",
      phone: "503-555-0103",
      address: "789 Elm St, Portland, OR 97203",
      hours: 22.5,
      regDate: "2025-02-15",
    },
  ];

  const lobbyists = [];
  for (let i = 0; i < 3; i++) {
    const data = approvedLobbyistData[i];
    const lobbyist = await prisma.lobbyist.create({
      data: {
        userId: users.lobbyistUsers[i].id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: RegistrationStatus.APPROVED,
        hoursCurrentQuarter: data.hours,
        registrationDate: new Date(data.regDate),
        reviewedBy: users.adminUser.id,
        reviewedAt: new Date(data.regDate.replace(/-15$/, "-16")),
      },
    });
    lobbyists.push(lobbyist);
  }
  console.log("   ✓ Created 3 approved lobbyists");

  // ──────────────────────────────────────────────────────────────────────
  // 3 EMPLOYERS
  // ──────────────────────────────────────────────────────────────────────
  const employersData = [
    {
      name: "TechCorp Industries",
      email: "contact@techcorp.com",
      phone: "503-555-0201",
      address: "789 Business Pkwy, Portland, OR 97207",
      description:
        "Technology consulting and software development firm specializing in government solutions",
    },
    {
      name: "Healthcare Advocates Group",
      email: "info@healthadvocates.org",
      phone: "503-555-0202",
      address: "321 Medical Plaza, Portland, OR 97208",
      description:
        "Non-profit organization advocating for healthcare policy reform",
    },
    {
      name: "Green Energy Coalition",
      email: "contact@greenenergy.org",
      phone: "503-555-0203",
      address: "444 Renewable Way, Portland, OR 97209",
      description:
        "Environmental advocacy organization promoting renewable energy and climate action",
    },
  ];

  const employers = [];
  for (let i = 0; i < 3; i++) {
    const data = employersData[i];
    const employer = await prisma.employer.create({
      data: {
        userId: users.employerUsers[i].id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        businessDescription: data.description,
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
    "Renewable energy policy, climate action, carbon reduction",
  ];

  for (let i = 0; i < 3; i++) {
    const link = await prisma.lobbyistEmployer.create({
      data: {
        lobbyistId: lobbyists[i].id,
        employerId: employers[i].id,
        authorizationDocumentUrl: `/uploads/auth-${lobbyists[i].name.toLowerCase().replace(/ /g, "-")}-${employers[i].name.toLowerCase().replace(/ /g, "-")}.pdf`,
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
  const boardMembersData = [
    {
      name: "Commissioner Williams",
      district: "District 3",
      termStart: "2023-01-01",
    },
    {
      name: "Commissioner Chen",
      district: "District 1",
      termStart: "2022-01-01",
    },
    {
      name: "Commissioner Garcia",
      district: "District 2",
      termStart: "2024-01-01",
    },
  ];

  const boardMembers = [];
  for (let i = 0; i < 3; i++) {
    const data = boardMembersData[i];
    const boardMember = await prisma.boardMember.create({
      data: {
        userId: users.boardMemberUsers[i].id,
        name: data.name,
        district: data.district,
        termStart: new Date(data.termStart),
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

  // Expense data organized by lobbyist and quarter (storytelling approach)
  const expenseData = [
    // John Doe (Technology Policy) - meets with Commissioner Williams
    [
      // Q1
      {
        expenses: [
          {
            date: "2025-01-22",
            payee: "Jake's Famous Crawfish",
            purpose:
              "Lunch meeting to discuss technology infrastructure budget priorities",
            amount: 125.5,
            official: "Commissioner Williams",
          },
          {
            date: "2025-02-15",
            payee: "Portland City Grill",
            purpose:
              "Dinner meeting re: IT modernization roadmap for county services",
            amount: 142.75,
            official: "Commissioner Williams",
          },
          {
            date: "2025-03-08",
            payee: "Starbucks Reserve",
            purpose: "Coffee meeting about data privacy ordinance amendments",
            amount: 67.0,
            official: "Commissioner Williams",
          },
        ],
        total: 335.25,
        submitted: "2025-04-10",
      },
      // Q2
      {
        expenses: [
          {
            date: "2025-04-18",
            payee: "Imperial Restaurant",
            purpose:
              "Lunch discussion on cybersecurity funding for county systems",
            amount: 138.25,
            official: "Commissioner Williams",
          },
          {
            date: "2025-05-22",
            payee: "Le Pigeon",
            purpose:
              "Dinner meeting about cloud migration strategy for public records",
            amount: 185.0,
            official: "Commissioner Williams",
          },
          {
            date: "2025-06-10",
            payee: "Blue Star Donuts",
            purpose: "Coffee meeting re: open data portal development",
            amount: 89.25,
            official: "Commissioner Williams",
          },
        ],
        total: 412.5,
        submitted: "2025-07-12",
      },
      // Q3
      {
        expenses: [
          {
            date: "2025-07-19",
            payee: "Screen Door",
            purpose:
              "Lunch meeting about digital accessibility compliance requirements",
            amount: 115.5,
            official: "Commissioner Williams",
          },
          {
            date: "2025-08-25",
            payee: "Departure Restaurant",
            purpose:
              "Dinner discussion on AI ethics policy for government technology",
            amount: 172.5,
            official: "Commissioner Williams",
          },
          {
            date: "2025-09-14",
            payee: "Coava Coffee",
            purpose:
              "Coffee meeting re: broadband expansion in underserved areas",
            amount: 90.0,
            official: "Commissioner Williams",
          },
        ],
        total: 378.0,
        submitted: "2025-10-11",
      },
    ],
    // Jane Smith (Healthcare Policy) - meets with Commissioner Chen
    [
      // Q1
      {
        expenses: [
          {
            date: "2025-01-28",
            payee: "Andina Restaurant",
            purpose:
              "Lunch meeting to discuss Medicaid expansion funding priorities",
            amount: 152.25,
            official: "Commissioner Chen",
          },
          {
            date: "2025-02-19",
            payee: "Higgins Restaurant",
            purpose:
              "Dinner meeting re: mental health crisis intervention programs",
            amount: 198.5,
            official: "Commissioner Chen",
          },
          {
            date: "2025-03-15",
            payee: "Heart Coffee",
            purpose:
              "Coffee meeting about community health worker certification",
            amount: 78.0,
            official: "Commissioner Chen",
          },
        ],
        total: 428.75,
        submitted: "2025-04-13",
      },
      // Q2
      {
        expenses: [
          {
            date: "2025-04-22",
            payee: "Ataula",
            purpose:
              "Lunch discussion on behavioral health services integration",
            amount: 142.0,
            official: "Commissioner Chen",
          },
          {
            date: "2025-05-18",
            payee: "Nostrana",
            purpose:
              "Dinner meeting about healthcare navigator program expansion",
            amount: 178.0,
            official: "Commissioner Chen",
          },
          {
            date: "2025-06-12",
            payee: "Stumptown Coffee",
            purpose: "Coffee meeting re: maternal health outcome improvements",
            amount: 75.0,
            official: "Commissioner Chen",
          },
        ],
        total: 395.0,
        submitted: "2025-07-14",
      },
      // Q3
      {
        expenses: [
          {
            date: "2025-07-25",
            payee: "Canard",
            purpose:
              "Lunch meeting about substance abuse treatment facility funding",
            amount: 165.5,
            official: "Commissioner Chen",
          },
          {
            date: "2025-08-20",
            payee: "Castagna",
            purpose:
              "Dinner discussion on health equity initiatives in rural areas",
            amount: 205.0,
            official: "Commissioner Chen",
          },
          {
            date: "2025-09-18",
            payee: "Courier Coffee",
            purpose: "Coffee meeting re: prescription drug assistance programs",
            amount: 75.0,
            official: "Commissioner Chen",
          },
        ],
        total: 445.5,
        submitted: "2025-10-10",
      },
    ],
    // Michael Chen (Environmental Policy) - meets with Commissioner Garcia
    [
      // Q1
      {
        expenses: [
          {
            date: "2025-01-30",
            payee: "Bamboo Sushi",
            purpose:
              "Lunch meeting to discuss renewable energy incentive programs",
            amount: 128.5,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-02-25",
            payee: "Beast Restaurant",
            purpose:
              "Dinner meeting re: electric vehicle charging infrastructure",
            amount: 168.0,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-03-20",
            payee: "Barista",
            purpose: "Coffee meeting about solar panel permitting streamlining",
            amount: 66.0,
            official: "Commissioner Garcia",
          },
        ],
        total: 362.5,
        submitted: "2025-04-14",
      },
      // Q2
      {
        expenses: [
          {
            date: "2025-04-24",
            payee: "Oven and Shaker",
            purpose:
              "Lunch discussion on carbon reduction goals for county operations",
            amount: 135.25,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-05-28",
            payee: "Paley's Place",
            purpose:
              "Dinner meeting about green building standards for new construction",
            amount: 195.0,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-06-16",
            payee: "Water Avenue Coffee",
            purpose:
              "Coffee meeting re: climate action plan implementation timeline",
            amount: 88.0,
            official: "Commissioner Garcia",
          },
        ],
        total: 418.25,
        submitted: "2025-07-13",
      },
      // Q3
      {
        expenses: [
          {
            date: "2025-07-22",
            payee: "Ox Restaurant",
            purpose:
              "Lunch meeting about urban forestry expansion and tree preservation",
            amount: 145.0,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-08-28",
            payee: "Ned Ludd",
            purpose:
              "Dinner discussion on composting infrastructure and food waste reduction",
            amount: 175.0,
            official: "Commissioner Garcia",
          },
          {
            date: "2025-09-20",
            payee: "Sterling Coffee",
            purpose:
              "Coffee meeting re: watershed protection and stormwater management",
            amount: 65.0,
            official: "Commissioner Garcia",
          },
        ],
        total: 385.0,
        submitted: "2025-10-12",
      },
    ],
  ];

  // Due dates for each quarter
  const dueDates = {
    Q1: "2025-04-15",
    Q2: "2025-07-15",
    Q3: "2025-10-15",
  };

  // Create reports and expenses for each lobbyist
  for (let lobbyistIdx = 0; lobbyistIdx < lobbyists.length; lobbyistIdx++) {
    const lobbyist = lobbyists[lobbyistIdx];
    const lobbyistExpenses = expenseData[lobbyistIdx];

    for (let quarterIdx = 0; quarterIdx < quarters.length; quarterIdx++) {
      const quarter = quarters[quarterIdx];
      const quarterData = lobbyistExpenses[quarterIdx];

      const report = await prisma.lobbyistExpenseReport.create({
        data: {
          lobbyistId: lobbyist.id,
          quarter,
          year: 2025,
          status: ReportStatus.APPROVED,
          totalFoodEntertainment: quarterData.total,
          submittedAt: new Date(quarterData.submitted),
          dueDate: new Date(dueDates[quarter]),
          reviewedBy: users.adminUser.id,
          reviewedAt: new Date(quarterData.submitted.replace(/-\d{2}$/, "-13")),
        },
      });
      lobbyistReports.push(report);

      // Create 3 expense line items per report
      for (const expense of quarterData.expenses) {
        await prisma.expenseLineItem.create({
          data: {
            reportId: report.id,
            reportType: ExpenseReportType.LOBBYIST,
            officialName: expense.official,
            date: new Date(expense.date),
            payee: expense.payee,
            purpose: expense.purpose,
            amount: expense.amount,
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

  // Monthly retainers for each employer (each employer pays only their lobbyist)
  const employerPaymentData = [
    // TechCorp → John Doe
    { monthlyRetainer: 15000.0, lobbyistIdx: 0 },
    // Healthcare Advocates → Jane Smith
    { monthlyRetainer: 12666.67, lobbyistIdx: 1 },
    // Green Energy Coalition → Michael Chen
    { monthlyRetainer: 14000.0, lobbyistIdx: 2 },
  ];

  // Submit/due dates for each quarter
  const employerSubmitDates = {
    Q1: { submitted: "2025-04-11", due: "2025-04-15" },
    Q2: { submitted: "2025-07-12", due: "2025-07-15" },
    Q3: { submitted: "2025-10-10", due: "2025-10-15" },
  };

  // Month-end dates for each quarter
  const monthEndDates = {
    Q1: ["2025-01-31", "2025-02-28", "2025-03-31"],
    Q2: ["2025-04-30", "2025-05-31", "2025-06-30"],
    Q3: ["2025-07-31", "2025-08-31", "2025-09-30"],
  };

  for (let empIdx = 0; empIdx < employers.length; empIdx++) {
    const employer = employers[empIdx];
    const paymentInfo = employerPaymentData[empIdx];
    const lobbyistName = lobbyists[paymentInfo.lobbyistIdx].name;

    for (const quarter of quarters) {
      const dates = employerSubmitDates[quarter];
      const months = monthEndDates[quarter];

      // Calculate quarterly total (3 months × monthly retainer)
      const quarterlyTotal = paymentInfo.monthlyRetainer * 3;

      const report = await prisma.employerExpenseReport.create({
        data: {
          employerId: employer.id,
          quarter,
          year: 2025,
          status: ReportStatus.APPROVED,
          totalLobbyingSpend: quarterlyTotal,
          submittedAt: new Date(dates.submitted),
          dueDate: new Date(dates.due),
          reviewedBy: users.adminUser.id,
          reviewedAt: new Date(dates.submitted.replace(/-\d{2}$/, "-13")),
        },
      });
      employerReports.push(report);

      // 3 MONTHLY RETAINER PAYMENTS (one per month in quarter)
      for (let monthIdx = 0; monthIdx < 3; monthIdx++) {
        await prisma.expenseLineItem.create({
          data: {
            reportId: report.id,
            reportType: ExpenseReportType.EMPLOYER,
            officialName: lobbyistName,
            date: new Date(months[monthIdx]),
            payee: lobbyistName,
            purpose:
              "Monthly retainer - " + subjectsOfInterest[empIdx].split(",")[0],
            amount:
              monthIdx === 2 && paymentInfo.monthlyRetainer === 12666.67
                ? 12666.66 // Adjust last month to avoid rounding errors
                : paymentInfo.monthlyRetainer,
            isEstimate: false,
          },
        });
      }
    }
  }
  console.log(
    "   ✓ Created 9 employer expense reports (3 employers × 3 quarters)"
  );
  console.log(
    "   ✓ Created 27 employer payment line items (9 reports × 3 months)"
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
    employerLineItems: 27, // 9 reports × 3 monthly payments

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
  console.log(
    "\n🎯 APPROVED LOBBYISTS (3) - Technology, Healthcare, Environment:"
  );
  console.log("   Email:    john.doe@lobbying.com (Technology)");
  console.log("   Email:    jane.smith@advocacy.com (Healthcare)");
  console.log("   Email:    michael.chen@greenlobby.org (Environment)");
  console.log("   Password: lobbyist123");
  console.log(
    "\n⏳ PENDING LOBBYISTS (3) - Education, Transportation, Housing:"
  );
  console.log("   Email:    sarah.martinez@portlandadvocates.com");
  console.log("   Email:    robert.johnson@transportationalliance.org");
  console.log("   Email:    emily.wong@housingfirst.org");
  console.log("   Password: lobbyist123");
  console.log("\n🏢 EMPLOYERS (3):");
  console.log("   Email:    contact@techcorp.com (TechCorp Industries)");
  console.log(
    "   Email:    info@healthadvocates.org (Healthcare Advocates Group)"
  );
  console.log("   Email:    contact@greenenergy.org (Green Energy Coalition)");
  console.log("   Password: employer123");
  console.log("\n🏛️  BOARD MEMBERS (3):");
  console.log(
    "   Email:    commissioner@multnomah.gov (Commissioner Williams)"
  );
  console.log(
    "   Email:    commissioner.chen@multnomah.gov (Commissioner Chen)"
  );
  console.log(
    "   Email:    commissioner.garcia@multnomah.gov (Commissioner Garcia)"
  );
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
