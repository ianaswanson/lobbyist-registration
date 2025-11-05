import { prisma } from '../lib/db';

async function checkCompliance() {
  // Check all reports and their status
  const lobbyistReports = await prisma.lobbyistExpenseReport.findMany({
    select: {
      id: true,
      quarter: true,
      year: true,
      status: true,
      submittedAt: true,
      dueDate: true,
      Lobbyist: { select: { name: true } }
    },
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }]
  });

  console.log('\n📊 LOBBYIST REPORT COMPLIANCE:');
  console.log('═══════════════════════════════════════════════════════════');

  let onTime = 0;
  let late = 0;

  lobbyistReports.forEach(r => {
    const status = r.submittedAt && r.dueDate && r.submittedAt > r.dueDate ? 'LATE' : 'ON-TIME';
    if (status === 'LATE') late++;
    else onTime++;

    console.log(`${r.Lobbyist.name.padEnd(20)} ${r.year} ${r.quarter}: ${r.status.padEnd(10)} - ${status}`);
    if (r.submittedAt && r.dueDate) {
      console.log(`  Submitted: ${r.submittedAt.toLocaleDateString()}, Due: ${r.dueDate.toLocaleDateString()}`);
    }
  });

  console.log('\n📈 TOTALS:');
  console.log(`On-Time: ${onTime}`);
  console.log(`Late: ${late}`);
  console.log(`Rate: ${Math.round((onTime / (onTime + late)) * 100)}%`);

  // Check employer reports too
  const employerReports = await prisma.employerExpenseReport.findMany({
    select: {
      quarter: true,
      year: true,
      status: true,
      submittedAt: true,
      dueDate: true,
      Employer: { select: { name: true } }
    }
  });

  console.log('\n📊 EMPLOYER REPORT COMPLIANCE:');
  console.log('═══════════════════════════════════════════════════════════');

  let empOnTime = 0;
  let empLate = 0;

  employerReports.forEach(r => {
    const status = r.submittedAt && r.dueDate && r.submittedAt > r.dueDate ? 'LATE' : 'ON-TIME';
    if (status === 'LATE') empLate++;
    else empOnTime++;

    console.log(`${r.Employer.name.padEnd(30)} ${r.year} ${r.quarter}: ${status}`);
  });

  console.log(`\nEmployer On-Time: ${empOnTime}, Late: ${empLate}`);

  await prisma.$disconnect();
}

checkCompliance().catch(console.error);
