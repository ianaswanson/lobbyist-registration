-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'AMENDED';

-- AlterTable: Add amendment fields to LobbyistExpenseReport
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "amendmentReason" TEXT;
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "originalReportId" TEXT;
ALTER TABLE "LobbyistExpenseReport" ADD COLUMN "amendedByReportId" TEXT;

-- AlterTable: Add amendment fields to EmployerExpenseReport
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "amendmentReason" TEXT;
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "originalReportId" TEXT;
ALTER TABLE "EmployerExpenseReport" ADD COLUMN "amendedByReportId" TEXT;

-- CreateIndex
CREATE INDEX "LobbyistExpenseReport_originalReportId_idx" ON "LobbyistExpenseReport"("originalReportId");

-- CreateIndex
CREATE INDEX "LobbyistExpenseReport_amendedByReportId_idx" ON "LobbyistExpenseReport"("amendedByReportId");

-- CreateIndex
CREATE INDEX "EmployerExpenseReport_originalReportId_idx" ON "EmployerExpenseReport"("originalReportId");

-- CreateIndex
CREATE INDEX "EmployerExpenseReport_amendedByReportId_idx" ON "EmployerExpenseReport"("amendedByReportId");

-- AddForeignKey
ALTER TABLE "LobbyistExpenseReport" ADD CONSTRAINT "LobbyistExpenseReport_originalReportId_fkey" FOREIGN KEY ("originalReportId") REFERENCES "LobbyistExpenseReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerExpenseReport" ADD CONSTRAINT "EmployerExpenseReport_originalReportId_fkey" FOREIGN KEY ("originalReportId") REFERENCES "EmployerExpenseReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
