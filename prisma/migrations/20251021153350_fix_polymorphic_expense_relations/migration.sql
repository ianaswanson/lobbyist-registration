-- RedefineTables
CREATE TABLE "new_ExpenseLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "payee" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "isEstimate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);
INSERT INTO "new_ExpenseLineItem" ("amount", "createdAt", "date", "id", "isEstimate", "officialName", "payee", "purpose", "reportId", "reportType", "updatedAt") SELECT "amount", "createdAt", "date", "id", "isEstimate", "officialName", "payee", "purpose", "reportId", "reportType", "updatedAt" FROM "ExpenseLineItem";
DROP TABLE "ExpenseLineItem";
ALTER TABLE "new_ExpenseLineItem" RENAME TO "ExpenseLineItem";
CREATE INDEX "ExpenseLineItem_reportId_idx" ON "ExpenseLineItem"("reportId");
CREATE INDEX "ExpenseLineItem_officialName_idx" ON "ExpenseLineItem"("officialName");
CREATE INDEX "ExpenseLineItem_date_idx" ON "ExpenseLineItem"("date");
