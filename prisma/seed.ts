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
      password: await hashPassword('admin123'),
    },
  })
  console.log('   ✓ Admin user created: admin@multnomah.gov / admin123')

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

  const publicUser = await prisma.user.create({
    data: {
      email: 'public@example.com',
      name: 'Public User',
      role: UserRole.PUBLIC,
      password: await hashPassword('public123'),
    },
  })
  console.log('   ✓ Public user created: public@example.com / public123')

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
  console.log('   ✓ Created 2 employer profiles')

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

  // Create board member
  console.log('🏛️  Creating board member...')

  const boardMember = await prisma.boardMember.create({
    data: {
      userId: boardMemberUser.id,
      name: 'Commissioner Williams',
      district: 'District 3',
      termStart: new Date('2023-01-01'),
      isActive: true,
    },
  })
  console.log('   ✓ Created board member')

  // Create quarterly expense reports
  console.log('📊 Creating quarterly expense reports...')

  const lobbyistReport = await prisma.lobbyistExpenseReport.create({
    data: {
      lobbyistId: lobbyist1.id,
      quarter: Quarter.Q1,
      year: 2025,
      totalFoodEntertainment: 350.00,
      status: ReportStatus.SUBMITTED,
      submittedAt: new Date('2025-04-10'),
      dueDate: new Date('2025-04-15'),
    },
  })

  const employerReport = await prisma.employerExpenseReport.create({
    data: {
      employerId: employer1.id,
      quarter: Quarter.Q1,
      year: 2025,
      totalLobbyingSpend: 15000.00,
      status: ReportStatus.SUBMITTED,
      submittedAt: new Date('2025-04-12'),
      dueDate: new Date('2025-04-15'),
    },
  })

  // Add lobbyist payments
  await prisma.employerLobbyistPayment.create({
    data: {
      employerReportId: employerReport.id,
      lobbyistId: lobbyist1.id,
      amountPaid: 15000.00,
    },
  })
  console.log('   ✓ Created expense reports')

  // Create board calendar entries
  console.log('📅 Creating board calendar entries...')

  await prisma.boardCalendarEntry.createMany({
    data: [
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
    ],
  })
  console.log('   ✓ Created board calendar entries')

  // Create board lobbying receipts
  console.log('💰 Creating board lobbying receipts...')

  await prisma.boardLobbyingReceipt.create({
    data: {
      boardMemberId: boardMember.id,
      lobbyistId: lobbyist1.id,
      amount: 125.00,
      date: new Date('2025-02-15'),
      payee: 'Portland City Grill',
      purpose: 'Lunch meeting to discuss technology infrastructure',
      quarter: Quarter.Q1,
      year: 2025,
    },
  })
  console.log('   ✓ Created board lobbying receipt')

  // Skip violation for now due to schema complexity
  console.log('⚠️  Skipping violations (complex foreign keys)')

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

  console.log('')
  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 TEST ACCOUNTS CREATED:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('🔑 ADMIN:')
  console.log('   Email:    admin@multnomah.gov')
  console.log('   Password: admin123')
  console.log('')
  console.log('🎯 LOBBYIST #1:')
  console.log('   Email:    john.doe@lobbying.com')
  console.log('   Password: lobbyist123')
  console.log('')
  console.log('🎯 LOBBYIST #2:')
  console.log('   Email:    jane.smith@advocacy.com')
  console.log('   Password: lobbyist123')
  console.log('')
  console.log('🏢 EMPLOYER:')
  console.log('   Email:    contact@techcorp.com')
  console.log('   Password: employer123')
  console.log('')
  console.log('🏛️  BOARD MEMBER:')
  console.log('   Email:    commissioner@multnomah.gov')
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
