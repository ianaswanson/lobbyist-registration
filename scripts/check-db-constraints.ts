import { prisma } from '../lib/db';

async function checkConstraints() {
  console.log('\n=== DATABASE CONSTRAINT ANALYSIS ===\n');

  // Check actual database constraints
  const constraints = await prisma.$queryRaw<any[]>`
    SELECT
        c.conname AS constraint_name,
        c.contype AS constraint_type,
        t.relname AS table_name,
        pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname IN ('LobbyistExpenseReport', 'EmployerExpenseReport')
      AND c.contype IN ('u', 'p')
    ORDER BY t.relname, c.conname;
  `;

  console.log('Current Database Constraints:');
  console.table(constraints);

  // Check for reports with same lobbyist/quarter/year
  console.log('\n=== DUPLICATE LOBBYIST REPORTS (same lobbyist/quarter/year) ===\n');
  const lobbyistDupes = await prisma.$queryRaw<any[]>`
    SELECT
        "lobbyistId",
        "quarter",
        "year",
        COUNT(*) as count,
        array_agg("id") as report_ids,
        array_agg("status") as statuses,
        array_agg("originalReportId") as original_ids
    FROM "LobbyistExpenseReport"
    GROUP BY "lobbyistId", "quarter", "year"
    HAVING COUNT(*) > 1
    ORDER BY "year" DESC, "quarter" DESC;
  `;

  if (lobbyistDupes.length === 0) {
    console.log('✅ No duplicate lobbyist reports found');
  } else {
    console.log('⚠️  Found duplicate lobbyist reports:');
    console.table(lobbyistDupes);
  }

  // Check for reports with same employer/quarter/year
  console.log('\n=== DUPLICATE EMPLOYER REPORTS (same employer/quarter/year) ===\n');
  const employerDupes = await prisma.$queryRaw<any[]>`
    SELECT
        "employerId",
        "quarter",
        "year",
        COUNT(*) as count,
        array_agg("id") as report_ids,
        array_agg("status") as statuses,
        array_agg("originalReportId") as original_ids
    FROM "EmployerExpenseReport"
    GROUP BY "employerId", "quarter", "year"
    HAVING COUNT(*) > 1
    ORDER BY "year" DESC, "quarter" DESC;
  `;

  if (employerDupes.length === 0) {
    console.log('✅ No duplicate employer reports found');
  } else {
    console.log('⚠️  Found duplicate employer reports:');
    console.table(employerDupes);
  }

  // Check amendment chain integrity
  console.log('\n=== AMENDMENT CHAIN INTEGRITY ===\n');

  const brokenChains = await prisma.$queryRaw<any[]>`
    SELECT
        l.id,
        l."lobbyistId",
        l.quarter,
        l.year,
        l.status,
        l."originalReportId",
        l."amendedByReportId",
        orig.id as orig_exists,
        amend.id as amend_exists
    FROM "LobbyistExpenseReport" l
    LEFT JOIN "LobbyistExpenseReport" orig ON l."originalReportId" = orig.id
    LEFT JOIN "LobbyistExpenseReport" amend ON l."amendedByReportId" = amend.id
    WHERE (l."originalReportId" IS NOT NULL AND orig.id IS NULL)
       OR (l."amendedByReportId" IS NOT NULL AND amend.id IS NULL);
  `;

  if (brokenChains.length === 0) {
    console.log('✅ All amendment chains are valid');
  } else {
    console.log('❌ Found broken amendment chains:');
    console.table(brokenChains);
  }

  await prisma.$disconnect();
}

checkConstraints().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
