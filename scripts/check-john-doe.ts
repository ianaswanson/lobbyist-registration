import { prisma } from '../lib/db';

async function checkJohnDoe() {
  // Find John Doe's user
  const user = await prisma.user.findUnique({
    where: { email: 'john.doe@lobbying.com' },
    include: {
      Lobbyist: {
        include: {
          LobbyistExpenseReport: {
            orderBy: [{ year: 'asc' }, { quarter: 'asc' }]
          }
        }
      }
    }
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log('\n👤 USER INFO:');
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`Name: ${user.name}`);
  console.log(`Role: ${user.role}`);

  if (!user.Lobbyist) {
    console.log('\n❌ No Lobbyist record found for this user!');
    return;
  }

  console.log('\n📊 LOBBYIST RECORD:');
  console.log(`Lobbyist ID: ${user.Lobbyist.id}`);
  console.log(`Status: ${user.Lobbyist.status}`);

  console.log('\n📄 EXPENSE REPORTS:');
  if (user.Lobbyist.LobbyistExpenseReport.length === 0) {
    console.log('❌ No reports found!');
  } else {
    user.Lobbyist.LobbyistExpenseReport.forEach(r => {
      console.log(`${r.year} ${r.quarter}: $${r.totalFoodEntertainment} - ${r.status}`);
    });
  }

  await prisma.$disconnect();
}

checkJohnDoe().catch(console.error);
