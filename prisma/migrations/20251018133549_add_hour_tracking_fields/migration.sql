-- AlterTable
ALTER TABLE "Lobbyist" ADD COLUMN "registrationDeadline" DATETIME;
ALTER TABLE "Lobbyist" ADD COLUMN "thresholdExceededDate" DATETIME;

-- CreateTable
CREATE TABLE "HourLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lobbyistId" TEXT NOT NULL,
    "activityDate" DATETIME NOT NULL,
    "hours" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HourLog_lobbyistId_fkey" FOREIGN KEY ("lobbyistId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "HourLog_lobbyistId_idx" ON "HourLog"("lobbyistId");

-- CreateIndex
CREATE INDEX "HourLog_quarter_year_idx" ON "HourLog"("quarter", "year");

-- CreateIndex
CREATE INDEX "HourLog_activityDate_idx" ON "HourLog"("activityDate");
