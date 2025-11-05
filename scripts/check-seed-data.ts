import { prisma } from '../lib/db';

async function checkData() {
  // Check quarterly expense totals
  const reports = await prisma.lobbyistExpenseReport.findMany({
    where: { status: 'APPROVED' },
    select: {
      quarter: true,
      year: true,
      totalFoodEntertainment: true,
      Lobbyist: { select: { name: true } }
    },
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }]
  });

  console.log('\n📊 QUARTERLY EXPENSE TOTALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const byQuarter: Record<string, number> = {};
  reports.forEach(r => {
    const key = `${r.year} ${r.quarter}`;
    byQuarter[key] = (byQuarter[key] || 0) + r.totalFoodEntertainment;
    console.log(`${r.Lobbyist.name.padEnd(20)} ${key}: $${r.totalFoodEntertainment.toLocaleString()}`);
  });

  console.log('\n📈 TOTALS BY QUARTER:');
  Object.entries(byQuarter).forEach(([q, total]) => {
    console.log(`${q}: $${total.toLocaleString()}`);
  });

  // Check board calendar entries
  const calendars = await prisma.boardCalendarEntry.findMany({
    include: {
      BoardMember: { select: { name: true } }
    },
    orderBy: { eventDate: 'asc' }
  });

  console.log('\n📅 BOARD CALENDAR ENTRIES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  calendars.forEach(c => {
    console.log(`\n${c.BoardMember.name}:`);
    console.log(`  ${c.eventTitle}`);
    console.log(`  Date: ${c.eventDate.toLocaleDateString()}`);
    console.log(`  Participants: ${c.participantsList.substring(0, 70)}...`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
