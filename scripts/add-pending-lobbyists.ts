import { PrismaClient, RegistrationStatus } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding pending lobbyist registrations...')

  // Get existing employers
  const employers = await prisma.employer.findMany({
    take: 3
  })

  if (employers.length < 3) {
    throw new Error('Need at least 3 employers in database')
  }

  const hashedPassword = await hashPassword('test123')

  // Create 3 pending lobbyists
  const pendingLobbyists = [
    {
      email: 'sarah.johnson@lobbying.com',
      name: 'Sarah Johnson',
      phone: '503-555-1234',
      address: '789 SW Capitol St, Portland, OR 97205',
      employer: employers[0],
      hours: 12,
      subjects: 'Technology policy, Digital infrastructure'
    },
    {
      email: 'robert.williams@advocacy.org',
      name: 'Robert Williams',
      phone: '503-555-5678',
      address: '321 NE Advocacy Lane, Portland, OR 97232',
      employer: employers[1],
      hours: 15,
      subjects: 'Healthcare access, Public health funding'
    },
    {
      email: 'maria.garcia@publicaffairs.com',
      name: 'Maria Garcia',
      phone: '503-555-9012',
      address: '654 SE Public Way, Portland, OR 97214',
      employer: employers[2],
      hours: 20,
      subjects: 'Housing policy, Community development'
    }
  ]

  for (const data of pendingLobbyists) {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: 'LOBBYIST',
        password: hashedPassword
      }
    })

    // Create lobbyist
    const lobbyist = await prisma.lobbyist.create({
      data: {
        userId: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: RegistrationStatus.PENDING,
        hoursCurrentQuarter: data.hours,
        registrationDate: new Date()
      }
    })

    // Link to employer
    await prisma.lobbyistEmployer.create({
      data: {
        lobbyistId: lobbyist.id,
        employerId: data.employer.id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        subjectsOfInterest: data.subjects
      }
    })

    console.log(`✅ Created pending lobbyist: ${data.name}`)
  }

  console.log('\n✨ Successfully added 3 pending lobbyist registrations!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
