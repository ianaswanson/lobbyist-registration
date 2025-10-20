-- AlterTable
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "reviewNotes" TEXT;
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "reviewedBy" TEXT;

-- AlterTable
ALTER TABLE "Lobbyist" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Lobbyist" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "Lobbyist" ADD COLUMN "reviewedBy" TEXT;

-- AlterTable
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "reviewNotes" TEXT;
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "reviewedBy" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExpenseLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "payee" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "isEstimate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpenseLineItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LobbyistExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpenseLineItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "EmployerExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExpenseLineItem" ("amount", "createdAt", "date", "id", "isEstimate", "officialName", "payee", "purpose", "reportId", "reportType", "updatedAt") SELECT "amount", "createdAt", "date", "id", "isEstimate", "officialName", "payee", "purpose", "reportId", "reportType", "updatedAt" FROM "ExpenseLineItem";
DROP TABLE "ExpenseLineItem";
ALTER TABLE "new_ExpenseLineItem" RENAME TO "ExpenseLineItem";
CREATE INDEX "ExpenseLineItem_reportId_idx" ON "ExpenseLineItem"("reportId");
CREATE INDEX "ExpenseLineItem_officialName_idx" ON "ExpenseLineItem"("officialName");
CREATE INDEX "ExpenseLineItem_date_idx" ON "ExpenseLineItem"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
