-- RemoveExpenseLineItemForeignKeys
-- Recreate ExpenseLineItem table without foreign key constraints
-- This is needed because the table has a polymorphic relationship (reportId can point to either LobbyistExpenseReport or EmployerExpenseReport)
-- SQLite doesn't support having multiple foreign keys on the same column

PRAGMA foreign_keys=OFF;

-- Create new table without foreign keys
CREATE TABLE "ExpenseLineItem_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "payee" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "isEstimate" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data from old table
INSERT INTO "ExpenseLineItem_new" SELECT * FROM "ExpenseLineItem";

-- Drop old table
DROP TABLE "ExpenseLineItem";

-- Rename new table
ALTER TABLE "ExpenseLineItem_new" RENAME TO "ExpenseLineItem";

-- Recreate indexes
CREATE INDEX "ExpenseLineItem_reportId_idx" ON "ExpenseLineItem"("reportId");
CREATE INDEX "ExpenseLineItem_officialName_idx" ON "ExpenseLineItem"("officialName");
CREATE INDEX "ExpenseLineItem_date_idx" ON "ExpenseLineItem"("date");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
