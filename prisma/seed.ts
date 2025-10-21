import { PrismaClient, UserRole, RegistrationStatus, ReportStatus, Quarter } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

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

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.appeal.deleteMany()
  await prisma.violation.deleteMany()
  await prisma.contractException.deleteMany()
  await prisma.boardLobbyingReceipt.deleteMany()
  await prisma.boardCalendarEntry.deleteMany()
  await prisma.boardMember.deleteMany()
  await prisma.employerLobbyistPayment.deleteMany()
  await prisma.expenseLineItem.deleteMany()
  await prisma.employerExpenseReport.deleteMany()
  await prisma.lobbyistExpenseReport.deleteMany()
  await prisma.lobbyistEmployer.deleteMany()
  await prisma.employer.deleteMany()
  await prisma.lobbyist.deleteMany()
  await prisma.user.deleteMany()

  // Create test users with hashed passwords
  console.log('👤 Creating users...')

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@multnomah.gov',
      name: 'County Administrator',
      role: UserRole.ADMIN,
      password: await hashPassword('Demo2025!Admin'),
    },
  })
  console.log('   ✓ Admin user created: admin@multnomah.gov / Demo2025!Admin')

  const lobbyist1User = await prisma.user.create({
    data: {
      email: 'john.doe@lobbying.com',
      name: 'John Doe',
      role: UserRole.LOBBYIST,
      password: await hashPassword('lobbyist123'),
    },
  })
  console.log('   ✓ Lobbyist user created: john.doe@lobbying.com / lobbyist123')

  const lobbyist2User = await prisma.user.create({
    data: {
      email: 'jane.smith@advocacy.com',
      name: 'Jane Smith',
      role: UserRole.LOBBYIST,
      password: await hashPassword('lobbyist123'),
    },
  })
  console.log('   ✓ Lobbyist user created: jane.smith@advocacy.com / lobbyist123')

  const employerUser = await prisma.user.create({
    data: {
      email: 'contact@techcorp.com',
      name: 'Sarah Johnson',
      role: UserRole.EMPLOYER,
      password: await hashPassword('employer123'),
    },
  })
  console.log('   ✓ Employer user created: contact@techcorp.com / employer123')

  const boardMemberUser = await prisma.user.create({
    data: {
      email: 'commissioner@multnomah.gov',
      name: 'Commissioner Williams',
      role: UserRole.BOARD_MEMBER,
      password: await hashPassword('board123'),
    },
  })
  console.log('   ✓ Board member created: commissioner@multnomah.gov / board123')

  const boardMember2User = await prisma.user.create({
    data: {
      email: 'commissioner.chen@multnomah.gov',
      name: 'Commissioner Chen',
      role: UserRole.BOARD_MEMBER,
      password: await hashPassword('board123'),
    },
  })
  console.log('   ✓ Board member created: commissioner.chen@multnomah.gov / board123')

  const publicUser = await prisma.user.create({
    data: {
      email: 'public@example.com',
      name: 'Public User',
      role: UserRole.PUBLIC,
      password: await hashPassword('public123'),
    },
  })
  console.log('   ✓ Public user created: public@example.com / public123')

  const employer3User = await prisma.user.create({
    data: {
      email: 'contact@greenenergy.org',
      name: 'Maria Rodriguez',
      role: UserRole.EMPLOYER,
      password: await hashPassword('employer123'),
    },
  })
  console.log('   ✓ Employer user created: contact@greenenergy.org / employer123')

  // Create lobbyist profiles
  console.log('🎯 Creating lobbyist profiles...')

  const lobbyist1 = await prisma.lobbyist.create({
    data: {
      userId: lobbyist1User.id,
      name: 'John Doe',
      email: 'john.doe@lobbying.com',
      phone: '503-555-0101',
      address: '123 Main St, Portland, OR 97201',
      status: RegistrationStatus.APPROVED,
      hoursCurrentQuarter: 25.5,
      registrationDate: new Date('2025-01-15'),
    },
  })

  const lobbyist2 = await prisma.lobbyist.create({
    data: {
      userId: lobbyist2User.id,
      name: 'Jane Smith',
      email: 'jane.smith@advocacy.com',
      phone: '503-555-0102',
      address: '456 Oak Ave, Portland, OR 97202',
      status: RegistrationStatus.APPROVED,
      hoursCurrentQuarter: 18.0,
      registrationDate: new Date('2025-02-01'),
    },
  })
  console.log('   ✓ Created 2 lobbyist profiles')

  // Create employer profiles
  console.log('🏢 Creating employer profiles...')

  const employer1 = await prisma.employer.create({
    data: {
      userId: employerUser.id,
      name: 'TechCorp Industries',
      email: 'contact@techcorp.com',
      phone: '503-555-0201',
      address: '789 Business Pkwy, Portland, OR 97203',
      businessDescription: 'Technology consulting and software development firm specializing in government solutions',
    },
  })

  const employer2 = await prisma.employer.create({
    data: {
      name: 'Healthcare Advocates Group',
      email: 'info@healthadvocates.org',
      phone: '503-555-0202',
      address: '321 Medical Plaza, Portland, OR 97204',
      businessDescription: 'Non-profit organization advocating for healthcare policy reform',
    },
  })

  const employer3 = await prisma.employer.create({
    data: {
      userId: employer3User.id,
      name: 'Green Energy Coalition',
      email: 'contact@greenenergy.org',
      phone: '503-555-0203',
      address: '444 Renewable Way, Portland, OR 97206',
      businessDescription: 'Environmental advocacy organization promoting renewable energy and climate action',
    },
  })
  console.log('   ✓ Created 3 employer profiles')

  // Link lobbyists to employers
  console.log('🔗 Linking lobbyists to employers...')

  await prisma.lobbyistEmployer.create({
    data: {
      lobbyistId: lobbyist1.id,
      employerId: employer1.id,
      authorizationDocumentUrl: '/uploads/auth-john-techcorp.pdf',
      authorizationDate: new Date('2025-01-10'),
      subjectsOfInterest: 'Technology policy, data privacy, government IT contracts',
    },
  })

  await prisma.lobbyistEmployer.create({
    data: {
      lobbyistId: lobbyist2.id,
      employerId: employer2.id,
      authorizationDocumentUrl: '/uploads/auth-jane-health.pdf',
      authorizationDate: new Date('2025-01-20'),
      subjectsOfInterest: 'Healthcare funding, Medicaid expansion, mental health services',
    },
  })
  console.log('   ✓ Linked lobbyists to employers')

  // Create board members
  console.log('🏛️  Creating board members...')

  const boardMember = await prisma.boardMember.create({
    data: {
      userId: boardMemberUser.id,
      name: 'Commissioner Williams',
      district: 'District 3',
      termStart: new Date('2023-01-01'),
      isActive: true,
    },
  })

  const boardMember2 = await prisma.boardMember.create({
    data: {
      userId: boardMember2User.id,
      name: 'Commissioner Chen',
      district: 'District 1',
      termStart: new Date('2022-01-01'),
      isActive: true,
    },
  })
  console.log('   ✓ Created 2 board members')

  // Create quarterly expense reports
  console.log('📊 Creating quarterly expense reports...')

  const lobbyistReport = await prisma.lobbyistExpenseReport.create({
    data: {
      lobbyistId: lobbyist1.id,
      quarter: Quarter.Q1,
      year: 2025,
      totalFoodEntertainment: 455.75,
      status: ReportStatus.APPROVED,
      submittedAt: new Date('2025-04-10'),
      dueDate: new Date('2025-04-15'),
      reviewedBy: adminUser.id,
      reviewedAt: new Date('2025-04-11'),
    },
  })

  // Add expense line items for lobbyist1 Q1 report
  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: lobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Williams',
        date: new Date('2025-01-22'),
        payee: 'Jake\'s Famous Crawfish',
        purpose: 'Lunch meeting to discuss technology infrastructure budget priorities',
        amount: 125.50,
        isEstimate: false,
      },
      {
        reportId: lobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Chen',
        date: new Date('2025-02-05'),
        payee: 'Canard',
        purpose: 'Dinner meeting regarding green energy initiatives',
        amount: 185.25,
        isEstimate: false,
      },
      {
        reportId: lobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Deputy Director Sarah Martinez',
        date: new Date('2025-03-10'),
        payee: 'Starbucks',
        purpose: 'Coffee meeting on IT procurement policies',
        amount: 18.00,
        isEstimate: false,
      },
      {
        reportId: lobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Williams',
        date: new Date('2025-03-28'),
        payee: 'Le Pigeon',
        purpose: 'Working dinner discussing broadband expansion',
        amount: 127.00,
        isEstimate: false,
      },
    ],
  })

  const employerReport = await prisma.employerExpenseReport.create({
    data: {
      employerId: employer1.id,
      quarter: Quarter.Q1,
      year: 2025,
      totalLobbyingSpend: 16235.50,
      status: ReportStatus.APPROVED,
      submittedAt: new Date('2025-04-12'),
      dueDate: new Date('2025-04-15'),
      reviewedBy: adminUser.id,
      reviewedAt: new Date('2025-04-13'),
    },
  })

  // Add lobbyist payments for employer1 Q1
  await prisma.employerLobbyistPayment.create({
    data: {
      employerReportId: employerReport.id,
      lobbyistId: lobbyist1.id,
      amountPaid: 15000.00,
    },
  })

  // Add expense line items for employer1 Q1 report
  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: employerReport.id,
        reportType: 'EMPLOYER',
        officialName: 'Board of Commissioners',
        date: new Date('2025-01-18'),
        payee: 'Portland Convention Center',
        purpose: 'Technology industry forum and networking event',
        amount: 850.00,
        isEstimate: false,
      },
      {
        reportId: employerReport.id,
        reportType: 'EMPLOYER',
        officialName: 'Commissioner Williams',
        date: new Date('2025-02-14'),
        payee: 'Urban Farmer',
        purpose: 'Legislative stakeholder dinner',
        amount: 285.50,
        isEstimate: false,
      },
      {
        reportId: employerReport.id,
        reportType: 'EMPLOYER',
        officialName: 'IT Department Staff',
        date: new Date('2025-03-20'),
        payee: 'Multnomah Athletic Club',
        purpose: 'Technology demonstration and networking lunch',
        amount: 100.00,
        isEstimate: false,
      },
    ],
  })

  // Add lobbyist1 Q3 report (APPROVED - shows successful review)
  const lobbyist1Q3Report = await prisma.lobbyistExpenseReport.create({
    data: {
      lobbyistId: lobbyist1.id,
      quarter: Quarter.Q3,
      year: 2025,
      totalFoodEntertainment: 398.25,
      status: ReportStatus.APPROVED,
      submittedAt: new Date('2025-10-12'),
      dueDate: new Date('2025-10-15'),
      reviewedBy: adminUser.id,
      reviewedAt: new Date('2025-10-13'),
    },
  })

  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: lobbyist1Q3Report.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Chen',
        date: new Date('2025-08-15'),
        payee: 'Portland City Grill',
        purpose: 'Lunch meeting on renewable energy contracts',
        amount: 142.50,
        isEstimate: false,
      },
      {
        reportId: lobbyist1Q3Report.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Williams',
        date: new Date('2025-09-22'),
        payee: 'Departure Restaurant',
        purpose: 'Dinner meeting regarding county IT modernization',
        amount: 178.75,
        isEstimate: false,
      },
      {
        reportId: lobbyist1Q3Report.id,
        reportType: 'LOBBYIST',
        officialName: 'Budget Director James Thompson',
        date: new Date('2025-09-30'),
        payee: 'Dutch Bros',
        purpose: 'Coffee meeting on Q4 budget priorities',
        amount: 77.00,
        isEstimate: false,
      },
    ],
  })

  // Add employer3 Q3 report (DRAFT - shows work in progress)
  const employer3Q3Report = await prisma.employerExpenseReport.create({
    data: {
      employerId: employer3.id,
      quarter: Quarter.Q3,
      year: 2025,
      totalLobbyingSpend: 8450.00,
      status: ReportStatus.DRAFT,
      dueDate: new Date('2025-10-15'),
    },
  })

  await prisma.employerLobbyistPayment.create({
    data: {
      employerReportId: employer3Q3Report.id,
      lobbyistId: lobbyist2.id,
      amountPaid: 8000.00,
    },
  })

  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: employer3Q3Report.id,
        reportType: 'EMPLOYER',
        officialName: 'Commissioner Chen',
        date: new Date('2025-08-05'),
        payee: 'Bamboo Sushi',
        purpose: 'Working lunch on climate action plan',
        amount: 250.00,
        isEstimate: false,
      },
      {
        reportId: employer3Q3Report.id,
        reportType: 'EMPLOYER',
        officialName: 'Environmental Services Director',
        date: new Date('2025-09-10'),
        payee: 'Portland Art Museum',
        purpose: 'Green energy showcase event',
        amount: 200.00,
        isEstimate: false,
      },
    ],
  })

  console.log('   ✓ Created expense reports with comprehensive line items')

  // Create pending lobbyist registration for testing admin review
  console.log('⏳ Creating pending registrations for admin review...')

  const pendingLobbyistUser = await prisma.user.create({
    data: {
      email: 'michael.chen@advocacy.com',
      name: 'Michael Chen',
      role: UserRole.LOBBYIST,
      password: await hashPassword('lobbyist123'),
    },
  })

  const pendingEmployer = await prisma.employer.create({
    data: {
      name: 'Community Advocacy Group',
      email: 'info@communityadvocacy.org',
      phone: '503-555-0303',
      address: '555 Advocacy Lane, Portland, OR 97205',
      businessDescription: 'Non-profit focused on affordable housing and homelessness services',
    },
  })

  const pendingLobbyist = await prisma.lobbyist.create({
    data: {
      userId: pendingLobbyistUser.id,
      name: 'Michael Chen',
      email: 'michael.chen@advocacy.com',
      phone: '503-555-0303',
      address: '555 Advocacy Lane, Portland, OR 97205',
      status: RegistrationStatus.PENDING,
      hoursCurrentQuarter: 15.0,
      registrationDate: new Date('2025-10-15'),
    },
  })

  await prisma.lobbyistEmployer.create({
    data: {
      lobbyistId: pendingLobbyist.id,
      employerId: pendingEmployer.id,
      authorizationDocumentUrl: '/uploads/auth-michael-community.pdf',
      authorizationDate: new Date('2025-10-10'),
      subjectsOfInterest: 'Housing policy, homelessness services, affordable housing',
    },
  })
  console.log('   ✓ Created 1 pending lobbyist registration')

  // Create additional pending reports for admin review
  console.log('📋 Creating pending reports for admin review...')

  const pendingLobbyistReport = await prisma.lobbyistExpenseReport.create({
    data: {
      lobbyistId: lobbyist2.id,
      quarter: Quarter.Q2,
      year: 2025,
      totalFoodEntertainment: 520.75,
      status: ReportStatus.SUBMITTED,
      submittedAt: new Date('2025-07-12'),
      dueDate: new Date('2025-07-15'),
    },
  })

  // Create expense line items for the pending report
  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: pendingLobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Williams',
        date: new Date('2025-06-15'),
        payee: 'Portland City Grill',
        purpose: 'Lunch meeting to discuss housing policy',
        amount: 85.50,
        isEstimate: false,
      },
      {
        reportId: pendingLobbyistReport.id,
        reportType: 'LOBBYIST',
        officialName: 'Commissioner Chen',
        date: new Date('2025-06-22'),
        payee: 'Starbucks',
        purpose: 'Coffee meeting regarding homelessness services',
        amount: 12.75,
        isEstimate: false,
      },
    ],
  })

  const pendingEmployerReport = await prisma.employerExpenseReport.create({
    data: {
      employerId: employer2.id,
      quarter: Quarter.Q2,
      year: 2025,
      totalLobbyingSpend: 22500.00,
      status: ReportStatus.LATE,
      submittedAt: new Date('2025-07-18'), // 3 days late
      dueDate: new Date('2025-07-15'),
    },
  })

  await prisma.employerLobbyistPayment.create({
    data: {
      employerReportId: pendingEmployerReport.id,
      lobbyistId: lobbyist2.id,
      amountPaid: 22500.00,
    },
  })

  await prisma.expenseLineItem.createMany({
    data: [
      {
        reportId: pendingEmployerReport.id,
        reportType: 'EMPLOYER',
        officialName: 'Board of Commissioners',
        date: new Date('2025-06-10'),
        payee: 'Portland Convention Center',
        purpose: 'Healthcare policy forum and networking event',
        amount: 2500.00,
        isEstimate: false,
      },
    ],
  })

  console.log('   ✓ Created 2 pending expense reports (1 submitted, 1 late)')

  // Create board calendar entries (4 quarters, 2 commissioners)
  console.log('📅 Creating board calendar entries...')

  await prisma.boardCalendarEntry.createMany({
    data: [
      // Commissioner Williams - Q1
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Board Meeting - Regular Session',
        eventDate: new Date('2025-01-15'),
        eventTime: '10:00 AM - 12:00 PM',
        participantsList: 'County staff, TechCorp representatives, Public attendees',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Technology Committee Meeting',
        eventDate: new Date('2025-02-20'),
        eventTime: '2:00 PM - 4:00 PM',
        participantsList: 'IT Department heads, TechCorp lobbyist, Cybersecurity consultants',
        quarter: Quarter.Q1,
        year: 2025,
      },
      // Commissioner Williams - Q2
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Budget Review Session',
        eventDate: new Date('2025-04-10'),
        eventTime: '9:00 AM - 11:00 AM',
        participantsList: 'Finance Director, Budget Committee, Community advocates',
        quarter: Quarter.Q2,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Transportation Policy Hearing',
        eventDate: new Date('2025-05-22'),
        eventTime: '1:00 PM - 5:00 PM',
        participantsList: 'Transit agency staff, Environmental groups, Construction lobbyists',
        quarter: Quarter.Q2,
        year: 2025,
      },
      // Commissioner Williams - Q3
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Public Safety Forum',
        eventDate: new Date('2025-07-18'),
        eventTime: '6:00 PM - 8:00 PM',
        participantsList: 'Sheriff, Police Chief, Community organizations, Public attendees',
        quarter: Quarter.Q3,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Housing Development Workshop',
        eventDate: new Date('2025-08-12'),
        eventTime: '2:00 PM - 4:00 PM',
        participantsList: 'Housing Bureau, Developers, Affordable housing advocates',
        quarter: Quarter.Q3,
        year: 2025,
      },
      // Commissioner Williams - Q4
      {
        boardMemberId: boardMember.id,
        eventTitle: 'Year-End Budget Planning',
        eventDate: new Date('2025-10-05'),
        eventTime: '10:00 AM - 3:00 PM',
        participantsList: 'Department heads, County Administrator, Finance team',
        quarter: Quarter.Q4,
        year: 2025,
      },

      // Commissioner Chen - Q1
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Environmental Policy Review',
        eventDate: new Date('2025-01-22'),
        eventTime: '1:00 PM - 3:00 PM',
        participantsList: 'Environmental groups, Industry representatives, DEQ staff',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Healthcare Access Forum',
        eventDate: new Date('2025-03-14'),
        eventTime: '10:00 AM - 12:00 PM',
        participantsList: 'Hospital administrators, Health advocates, Insurance lobbyists',
        quarter: Quarter.Q1,
        year: 2025,
      },
      // Commissioner Chen - Q2
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Education Funding Hearing',
        eventDate: new Date('2025-04-18'),
        eventTime: '3:00 PM - 6:00 PM',
        participantsList: 'School board members, Teachers union, Parent groups',
        quarter: Quarter.Q2,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Parks and Recreation Planning',
        eventDate: new Date('2025-06-08'),
        eventTime: '11:00 AM - 1:00 PM',
        participantsList: 'Parks department, Recreation groups, Conservation organizations',
        quarter: Quarter.Q2,
        year: 2025,
      },
      // Commissioner Chen - Q3
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Climate Action Summit',
        eventDate: new Date('2025-07-25'),
        eventTime: '9:00 AM - 5:00 PM',
        participantsList: 'Environmental organizations, Energy companies, Climate scientists',
        quarter: Quarter.Q3,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Small Business Support Meeting',
        eventDate: new Date('2025-09-10'),
        eventTime: '2:00 PM - 4:00 PM',
        participantsList: 'Chamber of Commerce, Small business owners, Economic development staff',
        quarter: Quarter.Q3,
        year: 2025,
      },
      // Commissioner Chen - Q4
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Veterans Services Review',
        eventDate: new Date('2025-10-11'),
        eventTime: '10:00 AM - 12:00 PM',
        participantsList: 'Veterans Affairs staff, VA representatives, Veterans groups',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        eventTitle: 'Community Development Workshop',
        eventDate: new Date('2025-11-15'),
        eventTime: '1:00 PM - 4:00 PM',
        participantsList: 'Urban planners, Community leaders, Development corporations',
        quarter: Quarter.Q4,
        year: 2025,
      },
    ],
  })
  console.log('   ✓ Created board calendar entries (4 quarters, 2 commissioners)')

  // Create board lobbying receipts (4 quarters, 2 commissioners)
  console.log('💰 Creating board lobbying receipts...')

  await prisma.boardLobbyingReceipt.createMany({
    data: [
      // Commissioner Williams receipts
      {
        boardMemberId: boardMember.id,
        lobbyistId: lobbyist1.id,
        amount: 125.00,
        date: new Date('2025-02-15'),
        payee: 'Portland City Grill',
        purpose: 'Lunch meeting to discuss technology infrastructure',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        lobbyistId: lobbyist2.id,
        amount: 85.50,
        date: new Date('2025-03-08'),
        payee: 'Starbucks',
        purpose: 'Coffee meeting regarding education policy',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        lobbyistId: lobbyist1.id,
        amount: 210.00,
        date: new Date('2025-05-12'),
        payee: 'The Benson Hotel',
        purpose: 'Breakfast meeting on transportation funding',
        quarter: Quarter.Q2,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        lobbyistId: lobbyist1.id,
        amount: 155.75,
        date: new Date('2025-08-20'),
        payee: 'Jake\'s Grill',
        purpose: 'Lunch meeting regarding housing development',
        quarter: Quarter.Q3,
        year: 2025,
      },
      {
        boardMemberId: boardMember.id,
        lobbyistId: lobbyist2.id,
        amount: 95.00,
        date: new Date('2025-10-03'),
        payee: 'Canard',
        purpose: 'Dinner meeting on environmental regulations',
        quarter: Quarter.Q4,
        year: 2025,
      },

      // Commissioner Chen receipts
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist2.id,
        amount: 175.00,
        date: new Date('2025-01-28'),
        payee: 'Departure Restaurant',
        purpose: 'Lunch meeting on healthcare access initiatives',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist1.id,
        amount: 68.50,
        date: new Date('2025-03-05'),
        payee: 'Dutch Bros',
        purpose: 'Coffee meeting on environmental policy',
        quarter: Quarter.Q1,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist2.id,
        amount: 140.25,
        date: new Date('2025-04-22'),
        payee: 'Bamboo Sushi',
        purpose: 'Working lunch on education funding',
        quarter: Quarter.Q2,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist1.id,
        amount: 220.00,
        date: new Date('2025-06-15'),
        payee: 'Multnomah Whiskey Library',
        purpose: 'Evening meeting on parks development',
        quarter: Quarter.Q2,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist2.id,
        amount: 115.00,
        date: new Date('2025-07-30'),
        payee: 'Bollywood Theater',
        purpose: 'Lunch meeting on climate action plan',
        quarter: Quarter.Q3,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist1.id,
        amount: 82.50,
        date: new Date('2025-09-18'),
        payee: 'Blue Star Donuts',
        purpose: 'Coffee meeting on small business support',
        quarter: Quarter.Q3,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist2.id,
        amount: 190.00,
        date: new Date('2025-10-25'),
        payee: 'Le Pigeon',
        purpose: 'Dinner meeting on veterans services',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        boardMemberId: boardMember2.id,
        lobbyistId: lobbyist1.id,
        amount: 105.75,
        date: new Date('2025-11-20'),
        payee: 'Tasty n Alder',
        purpose: 'Breakfast meeting on community development',
        quarter: Quarter.Q4,
        year: 2025,
      },
    ],
  })
  console.log('   ✓ Created board lobbying receipts (4 quarters, 2 commissioners)')

  // Create violations and appeals
  console.log('⚠️  Creating violations and appeals...')

  // Violation 1: Late registration (ISSUED status)
  const violation1 = await prisma.violation.create({
    data: {
      entityType: 'LOBBYIST',
      entityId: pendingLobbyist.id,
      violationType: 'LATE_REGISTRATION',
      description: 'Failed to register within 3 working days after exceeding 10 hours threshold. Registration was submitted 7 days after threshold was reached.',
      fineAmount: 250.00,
      status: 'ISSUED',
      issuedDate: new Date('2025-10-20'),
      isFirstTimeViolation: true,
    },
  })

  // Violation 2: Late report (ISSUED status, will have appeal)
  const violation2 = await prisma.violation.create({
    data: {
      entityType: 'LOBBYIST_REPORT',
      entityId: pendingLobbyistReport.id,
      violationType: 'LATE_REPORT',
      description: 'Q2 2025 expense report submitted 5 days after the July 15 deadline.',
      fineAmount: 150.00,
      status: 'ISSUED',
      issuedDate: new Date('2025-07-20'),
      isFirstTimeViolation: false,
    },
  })

  // Violation 3: Missing authorization (APPEALED status)
  const violation3 = await prisma.violation.create({
    data: {
      entityType: 'LOBBYIST',
      entityId: lobbyist2.id,
      violationType: 'MISSING_AUTHORIZATION',
      description: 'Authorization document from employer not provided within required timeframe.',
      fineAmount: 200.00,
      status: 'APPEALED',
      issuedDate: new Date('2025-09-15'),
      isFirstTimeViolation: false,
    },
  })

  // Violation 4: False statement (UPHELD after appeal)
  const violation4 = await prisma.violation.create({
    data: {
      entityType: 'LOBBYIST_REPORT',
      entityId: lobbyistReport.id,
      violationType: 'FALSE_STATEMENT',
      description: 'Expense report contained inaccurate information regarding lobbying activities.',
      fineAmount: 500.00,
      status: 'UPHELD',
      issuedDate: new Date('2025-08-01'),
      isFirstTimeViolation: false,
    },
  })

  // Violation 5: Warning only (no fine)
  const violation5 = await prisma.violation.create({
    data: {
      entityType: 'EMPLOYER_REPORT',
      entityId: employerReport.id,
      violationType: 'LATE_REPORT',
      description: 'First-time late report submission. Educational letter sent instead of fine.',
      fineAmount: 0.00,
      status: 'ISSUED',
      issuedDate: new Date('2025-04-20'),
      isFirstTimeViolation: true,
    },
  })

  console.log('   ✓ Created 5 violations')

  // Create appeals
  console.log('📋 Creating appeals...')

  // Appeal 1: Pending (awaiting review)
  const appeal1 = await prisma.appeal.create({
    data: {
      violationId: violation2.id,
      reason: `I respectfully appeal this violation on the following grounds:

1. TECHNICAL DIFFICULTIES: On July 14, 2025, I attempted to submit my quarterly expense report through the online portal. However, I encountered a technical error (Error Code: 500) that prevented submission. I have screenshots documenting this error.

2. GOOD FAITH EFFORT: I made multiple attempts to submit the report on both July 14 and July 15 (the due date). After repeated failures, I contacted the County IT helpdesk on July 15 at 3:47 PM (ticket #2025-0715-047).

3. PROMPT COMPLETION: Once the technical issue was resolved, I submitted the report immediately on July 16, just one day after the deadline.

4. NO PRIOR VIOLATIONS: This is my first late submission in 3 years of quarterly reporting. My compliance history demonstrates a pattern of timely submissions.

I request that this violation be dismissed given the technical circumstances beyond my control and my documented good faith efforts to comply with the deadline.`,
      submittedDate: new Date('2025-07-25'),
      appealDeadline: new Date('2025-08-19'), // 30 days from violation
      status: 'PENDING',
    },
  })

  // Appeal 2: Scheduled for hearing
  const appeal2 = await prisma.appeal.create({
    data: {
      violationId: violation3.id,
      reason: `I am appealing this violation because I believe there was a misunderstanding about the timeline requirements:

1. AUTHORIZATION WAS PROVIDED: I submitted my initial registration on September 1, 2025, which included the authorization document from my employer (Healthcare Advocates Group).

2. DOCUMENT RECEIPT CONFIRMED: I have email confirmation from the County system showing that the authorization document was received on September 1 at 2:34 PM.

3. ADMINISTRATIVE ERROR: It appears there may have been an administrative error in processing my registration packet. The violation notice states the authorization was "not provided," but my records show it was included in the original submission.

4. COMPLIANCE INTENT: I have always intended to comply fully with all registration requirements and took every reasonable step to ensure complete documentation.

I request a hearing to present my email confirmations and submission receipts demonstrating that the authorization document was properly submitted.`,
      submittedDate: new Date('2025-09-20'),
      appealDeadline: new Date('2025-10-15'),
      status: 'SCHEDULED',
      hearingDate: new Date('2025-10-28T14:00:00'),
    },
  })

  // Appeal 3: Decided - Upheld
  const appeal3 = await prisma.appeal.create({
    data: {
      violationId: violation4.id,
      reason: `I appeal this violation because I believe the characterization as a "false statement" is incorrect:

The expense report in question accurately reflected my understanding of the lobbying activities at the time of submission. Any discrepancies were the result of unintentional errors, not deliberate misrepresentation.

Specifically:
- The meeting dates were transcribed from my calendar, which I later discovered had incorrect entries due to a calendar sync error
- The expense amounts were estimates based on typical costs for similar events
- I had no intent to deceive or provide false information

I request that this violation be reduced from "false statement" to a lesser violation category, or dismissed entirely given the unintentional nature of the errors.`,
      submittedDate: new Date('2025-08-05'),
      appealDeadline: new Date('2025-08-31'),
      status: 'DECIDED',
      hearingDate: new Date('2025-08-20T10:00:00'),
      decidedAt: new Date('2025-08-25'),
      decision: `After careful review of the evidence and the appellant's arguments, the appeal is DENIED and the violation is UPHELD.

FINDINGS:

1. SUBSTANTIAL INACCURACIES: The expense report contained multiple significant discrepancies beyond simple transcription errors. Three separate meetings were reported on dates when no meetings occurred, and expense amounts differed from receipts by more than 40%.

2. PATTERN OF ERRORS: This is not an isolated incident. The appellant's previous two quarterly reports also contained similar discrepancies, though of lesser magnitude.

3. RECKLESS DISREGARD: Even if the errors were unintentional, they demonstrate a reckless disregard for accuracy requirements. Lobbyists have a heightened duty to ensure accuracy in public filings.

4. REASONABLE VERIFICATION: The appellant had ample opportunity to verify information before submission, including cross-checking calendar entries and reviewing actual receipts rather than relying on estimates.

CONCLUSION:

While the Board accepts that the appellant may not have intentionally provided false information, the level of inaccuracy rises to the level of a violation under §3.807. The $500 fine is appropriate given the severity of the inaccuracies and the pattern of reporting issues.

The violation stands as issued. The fine must be paid within 30 days.`,
    },
  })

  // Appeal 4: Decided - Overturned
  const oldViolation = await prisma.violation.create({
    data: {
      entityType: 'LOBBYIST',
      entityId: lobbyist1.id,
      violationType: 'MISSING_REPORT',
      description: 'Q4 2024 expense report not received by January 15, 2025 deadline.',
      fineAmount: 300.00,
      status: 'OVERTURNED',
      issuedDate: new Date('2025-01-20'),
      isFirstTimeViolation: false,
    },
  })

  const appeal4 = await prisma.appeal.create({
    data: {
      violationId: oldViolation.id,
      reason: `I appeal this violation because the report was submitted on time, but appears to have been lost in processing:

1. TIMELY SUBMISSION: I submitted my Q4 2024 expense report via the online portal on January 12, 2025, three days before the deadline.

2. CONFIRMATION RECEIVED: I have a system-generated confirmation email (attached) showing successful submission at 4:23 PM on January 12.

3. TECHNICAL ISSUE: The County has acknowledged that there was a database migration issue in mid-January that resulted in some submitted reports not appearing in the admin system.

4. RESUBMISSION: Upon learning of this issue, I immediately resubmitted the report on January 25 when the system was restored.

I request that this violation be dismissed as the late receipt was due to County system issues, not any failure on my part.`,
      submittedDate: new Date('2025-01-25'),
      appealDeadline: new Date('2025-02-19'),
      status: 'DECIDED',
      hearingDate: new Date('2025-02-05T13:00:00'),
      decidedAt: new Date('2025-02-10'),
      decision: `After review of the evidence, including system logs and the appellant's submission confirmation, the appeal is GRANTED and the violation is OVERTURNED.

FINDINGS:

1. TIMELY SUBMISSION VERIFIED: System logs confirm that the appellant's Q4 2024 expense report was successfully submitted on January 12, 2025 at 4:23 PM, three days before the deadline.

2. COUNTY SYSTEM ERROR: The IT Department has confirmed that a database migration performed on January 16-17, 2025 inadvertently failed to migrate approximately 35 submitted reports to the new system.

3. APPELLANT NOT AT FAULT: The appellant took all required actions to comply with the deadline. The late availability of the report was entirely due to County system issues beyond the appellant's control.

4. GOOD FAITH COMPLIANCE: The appellant immediately resubmitted when notified of the issue, demonstrating good faith compliance.

CONCLUSION:

It would be unjust to penalize the appellant for a system error that was not their responsibility. The violation is overturned and the fine is dismissed.

The County apologizes for the inconvenience caused by the system migration issue.`,
    },
  })

  console.log('   ✓ Created 4 appeals (1 pending, 1 scheduled, 2 decided)')

  // Create audit log entries
  console.log('📝 Creating audit log entries...')

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: adminUser.id,
        ipAddress: '192.168.1.100',
      },
      {
        userId: lobbyist1User.id,
        action: 'CREATE',
        entityType: 'LobbyistExpenseReport',
        entityId: lobbyistReport.id,
        changesJson: JSON.stringify({ quarter: 'Q1', year: 2025, amount: 350.00 }),
        ipAddress: '192.168.1.101',
      },
    ],
  })
  console.log('   ✓ Created audit log entries')

  // Create contract exceptions
  console.log('📋 Creating contract exceptions...')
  await prisma.contractException.createMany({
    data: [
      {
        formerOfficialId: 'FO-2024-001',
        formerOfficialName: 'Michael Chen',
        contractDescription: 'IT consulting services for County database modernization project. Former Deputy IT Director (2020-2024) now works for TechCorp Inc.',
        justification: `Written findings per §9.230(C):

After thorough review, the Chair finds that the best interests of the County favor this contract for the following reasons:

1. SPECIALIZED EXPERTISE: Mr. Chen possesses unique technical knowledge of the County's legacy database systems that would be difficult and costly to replicate.

2. PROJECT CONTINUITY: Mr. Chen led the initial planning phase of this modernization project before leaving County service. His continued involvement ensures project continuity and reduces risk of costly delays.

3. COMPETITIVE PRICING: TechCorp's proposal was 15% below the next lowest bidder and 30% below the average of all bids received.

4. NO UNDUE INFLUENCE: While Mr. Chen was Deputy IT Director, he had no authority to approve contracts. The contract authorization was made by the Board after his departure.

5. PUBLIC INTEREST: The database modernization project is critical for improving County services to residents. Delays would negatively impact service delivery.

Based on these findings, the Chair concludes that granting this exception serves the County's best interests and does not violate the spirit of §9.230.`,
        approvedBy: 'County Chair Jessica Vega Pederson',
        approvedDate: new Date('2024-06-15'),
        publiclyPostedDate: new Date('2024-06-20'),
      },
      {
        formerOfficialId: 'FO-2023-042',
        formerOfficialName: 'Robert Martinez',
        contractDescription: 'Urban planning consulting for the Transit-Oriented Development Zone project. Former Senior Planner (2018-2023).',
        justification: `Written findings per §9.230(C):

The Chair finds that Mr. Martinez's influence on this contract was minimal for the following reasons:

1. LIMITED ROLE: As Senior Planner, Mr. Martinez was not involved in contract authorization or vendor selection decisions. These decisions were made at the Director level and above.

2. DIFFERENT PROJECT SCOPE: While Mr. Martinez worked on preliminary TOD studies, the current contract scope was expanded significantly after his departure to include additional neighborhoods not contemplated during his tenure.

3. ARMS-LENGTH PROCESS: The RFP was issued 8 months after Mr. Martinez left County employment. He had no involvement in drafting the RFP or evaluating proposals.

4. POLICY COMPLIANT: Mr. Martinez did not participate in any discussions or decisions related to this contract while employed by the County.

Based on these findings, the Chair concludes that Mr. Martinez's influence on contract authorization was minimal and granting this exception is appropriate.`,
        approvedBy: 'County Chair Jessica Vega Pederson',
        approvedDate: new Date('2024-03-10'),
        publiclyPostedDate: new Date('2024-03-15'),
      },
      {
        formerOfficialId: 'FO-2024-013',
        formerOfficialName: 'Dr. Amanda Foster',
        contractDescription: 'Public health consulting services for maternal health outreach program. Former Health Department Program Manager (2021-2024).',
        justification: `Written findings per §9.230(C):

The Chair finds that the best interests of the County favor this contract for the following reasons:

1. CRITICAL NEED: Maternal mortality rates in Multnomah County have increased by 18% over the past two years. This program addresses a critical public health emergency.

2. ESTABLISHED RELATIONSHIPS: Dr. Foster developed strong partnerships with community health organizations that are essential to the program's success. Her continued involvement leverages these existing relationships.

3. COMPETITIVE ADVANTAGE: Dr. Foster's proposal included commitments from 12 community partners who specifically requested her involvement. No other bidder could demonstrate this level of community support.

4. LIMITED FINANCIAL BENEFIT: The contract value ($45,000) is below the threshold that would typically raise concerns about financial self-dealing.

5. TIME SENSITIVITY: The grant funding for this program expires in 90 days. Delays in contractor selection would result in loss of federal funds.

The Chair concludes that granting this exception serves the County's best interests and advances critical public health objectives.`,
        approvedBy: 'County Chair Jessica Vega Pederson',
        approvedDate: new Date('2024-08-22'),
        publiclyPostedDate: new Date('2024-08-25'),
      },
    ],
  })
  console.log('   ✓ Created 3 contract exceptions')

  // Create hour logs (show 10-hour threshold scenarios)
  console.log('⏱️  Creating hour logs...')
  await prisma.hourLog.createMany({
    data: [
      // Lobbyist1 logs - showing progression toward 10-hour threshold
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-10-01'),
        hours: 2.5,
        description: 'Prepared briefing materials for county commissioners on IT modernization proposal',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-10-08'),
        hours: 3.0,
        description: 'Attended board meeting and provided testimony on broadband expansion',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-10-15'),
        hours: 4.5,
        description: 'Met with IT department staff to discuss procurement timeline and requirements',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-10-22'),
        hours: 5.0,
        description: 'Drafted policy recommendations and coordinated with county legal counsel',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-11-05'),
        hours: 6.0,
        description: 'Organized stakeholder roundtable with commissioners and technology vendors',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist1.id,
        activityDate: new Date('2025-11-12'),
        hours: 4.5,
        description: 'Follow-up meetings with budget committee on funding allocation',
        quarter: Quarter.Q4,
        year: 2025,
      },
      // Total: 25.5 hours (exceeds 10-hour threshold, triggers registration requirement)

      // Lobbyist2 logs - regular quarterly tracking
      {
        lobbyistId: lobbyist2.id,
        activityDate: new Date('2025-10-10'),
        hours: 4.0,
        description: 'Healthcare policy briefing with county health department leadership',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist2.id,
        activityDate: new Date('2025-10-18'),
        hours: 5.5,
        description: 'Testified at public hearing on Medicaid expansion and met with commissioners',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist2.id,
        activityDate: new Date('2025-11-01'),
        hours: 3.5,
        description: 'Research and preparation of mental health services white paper for board review',
        quarter: Quarter.Q4,
        year: 2025,
      },
      {
        lobbyistId: lobbyist2.id,
        activityDate: new Date('2025-11-20'),
        hours: 5.0,
        description: 'Coalition building meetings with healthcare stakeholders and county staff',
        quarter: Quarter.Q4,
        year: 2025,
      },
      // Total: 18.0 hours (exceeds 10-hour threshold)
    ],
  })
  console.log('   ✓ Created hour logs (2 lobbyists, 10 entries, demonstrating 10-hour threshold)')

  console.log('')
  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 TEST ACCOUNTS CREATED:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('🔑 ADMIN:')
  console.log('   Email:    admin@multnomah.gov')
  console.log('   Password: Demo2025!Admin')
  console.log('')
  console.log('🎯 LOBBYIST #1:')
  console.log('   Email:    john.doe@lobbying.com')
  console.log('   Password: lobbyist123')
  console.log('')
  console.log('🎯 LOBBYIST #2:')
  console.log('   Email:    jane.smith@advocacy.com')
  console.log('   Password: lobbyist123')
  console.log('')
  console.log('🏢 EMPLOYER #1:')
  console.log('   Email:    contact@techcorp.com')
  console.log('   Password: employer123')
  console.log('')
  console.log('🏢 EMPLOYER #2:')
  console.log('   Email:    contact@greenenergy.org')
  console.log('   Password: employer123')
  console.log('')
  console.log('🏛️  BOARD MEMBER #1:')
  console.log('   Email:    commissioner@multnomah.gov')
  console.log('   Password: board123')
  console.log('')
  console.log('🏛️  BOARD MEMBER #2:')
  console.log('   Email:    commissioner.chen@multnomah.gov')
  console.log('   Password: board123')
  console.log('')
  console.log('👥 PUBLIC USER:')
  console.log('   Email:    public@example.com')
  console.log('   Password: public123')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 Visit http://localhost:3000/auth/signin to test!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
