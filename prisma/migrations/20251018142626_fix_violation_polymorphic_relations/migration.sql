-- RedefineTables
CREATE TABLE "new_Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fineAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedDate" TIMESTAMP,
    "isFirstTimeViolation" BOOLEAN NOT NULL DEFAULT false,
    "resolutionNotes" TEXT,
    "resolutionDate" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);
INSERT INTO "new_Violation" ("createdAt", "description", "entityId", "entityType", "fineAmount", "id", "isFirstTimeViolation", "issuedDate", "resolutionDate", "resolutionNotes", "status", "updatedAt", "violationType") SELECT "createdAt", "description", "entityId", "entityType", "fineAmount", "id", "isFirstTimeViolation", "issuedDate", "resolutionDate", "resolutionNotes", "status", "updatedAt", "violationType" FROM "Violation";
DROP TABLE "Violation";
ALTER TABLE "new_Violation" RENAME TO "Violation";
CREATE INDEX "Violation_entityType_entityId_idx" ON "Violation"("entityType", "entityId");
CREATE INDEX "Violation_status_idx" ON "Violation"("status");
CREATE INDEX "Violation_issuedDate_idx" ON "Violation"("issuedDate");
