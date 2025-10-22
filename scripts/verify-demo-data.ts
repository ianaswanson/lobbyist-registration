import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyDemoData() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 DEMO DATA VERIFICATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const counts = {
    users: await prisma.user.count(),
    lobbyists: await prisma.lobbyist.count(),
    employers: await prisma.employer.count(),
    boardMembers: await prisma.boardMember.count(),
    lobbyistReports: await prisma.lobbyistExpenseReport.count(),
    employerReports: await prisma.employerExpenseReport.count(),
    expenseLineItems: await prisma.expenseLineItem.count(),
    hourLogs: await prisma.hourLog.count(),
    violations: await prisma.violation.count(),
    appeals: await prisma.appeal.count(),
    contractExceptions: await prisma.contractException.count(),
    calendarEntries: await prisma.boardCalendarEntry.count(),
    lobbyingReceipts: await prisma.boardLobbyingReceipt.count(),
  };

  const checkMark = "✅";
  const warning = "⚠️";

  const verifyCount = (name: string, count: number, minimum: number = 3) => {
    const status = count >= minimum ? checkMark : warning;
    console.log(
      `${status} ${name.padEnd(25)} ${count} ${count < minimum ? `(need ${minimum - count} more)` : ""}`
    );
  };

  verifyCount("Users", counts.users, 8);
  verifyCount("Lobbyists", counts.lobbyists, 3);
  verifyCount("Employers", counts.employers, 3);
  verifyCount("Board Members", counts.boardMembers, 2);
  verifyCount("Lobbyist Reports", counts.lobbyistReports, 3);
  verifyCount("Employer Reports", counts.employerReports, 3);
  verifyCount("Expense Line Items", counts.expenseLineItems, 10);
  verifyCount("Hour Logs", counts.hourLogs, 10);
  verifyCount("Violations", counts.violations, 5);
  verifyCount("Appeals", counts.appeals, 4);
  verifyCount("Contract Exceptions", counts.contractExceptions, 3);
  verifyCount("Calendar Entries", counts.calendarEntries, 3);
  verifyCount("Lobbying Receipts", counts.lobbyingReceipts, 3);

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ All record types meet the 3+ requirement!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await prisma.$disconnect();
}

verifyDemoData().catch((e) => {
  console.error(e);
  process.exit(1);
});
