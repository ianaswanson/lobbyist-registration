import { prisma } from '../lib/db';

async function checkPendingReports() {
  console.log('\n📊 ALL REPORTS BY STATUS:');
  console.log('═══════════════════════════════════════════');

  // Check all lobbyist reports
  const allReports = await prisma.lobbyistExpenseReport.findMany({
    include: {
      Lobbyist: {
        select: { name: true, status: true }
      }
    },
    orderBy: { status: 'asc' }
  });

  const byStatus: Record<string, number> = {};
  allReports.forEach(r => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    console.log(`${r.Lobbyist.name.padEnd(20)} ${r.year} ${r.quarter}: ${r.status.padEnd(10)} (Lobbyist: ${r.Lobbyist.status})`);
  });

  console.log('\n📈 REPORT COUNTS BY STATUS:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });

  // Check for SUBMITTED or PENDING reports
  const pendingReview = await prisma.lobbyistExpenseReport.findMany({
    where: {
      status: { in: ['SUBMITTED', 'PENDING'] }
    }
  });

  console.log(`\n⏳ Reports awaiting review (SUBMITTED/PENDING): ${pendingReview.length}`);

  await prisma.$disconnect();
}

checkPendingReports().catch(console.error);
