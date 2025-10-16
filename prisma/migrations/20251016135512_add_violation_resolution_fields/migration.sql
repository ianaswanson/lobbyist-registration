-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fineAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedDate" DATETIME,
    "isFirstTimeViolation" BOOLEAN NOT NULL DEFAULT false,
    "resolutionNotes" TEXT,
    "resolutionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Employer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "LobbyistExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "EmployerExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Violation" ("createdAt", "description", "entityId", "entityType", "fineAmount", "id", "issuedDate", "status", "updatedAt", "violationType") SELECT "createdAt", "description", "entityId", "entityType", "fineAmount", "id", "issuedDate", "status", "updatedAt", "violationType" FROM "Violation";
DROP TABLE "Violation";
ALTER TABLE "new_Violation" RENAME TO "Violation";
CREATE INDEX "Violation_entityType_entityId_idx" ON "Violation"("entityType", "entityId");
CREATE INDEX "Violation_status_idx" ON "Violation"("status");
CREATE INDEX "Violation_issuedDate_idx" ON "Violation"("issuedDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
