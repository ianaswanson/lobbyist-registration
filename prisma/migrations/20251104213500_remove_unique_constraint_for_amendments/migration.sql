-- Remove unique constraint on (lobbyistId, quarter, year) to allow amendments
-- Amendments will have the same lobbyist, quarter, and year as the original report

ALTER TABLE "LobbyistExpenseReport" DROP CONSTRAINT IF EXISTS "LobbyistExpenseReport_lobbyistId_quarter_year_key";

ALTER TABLE "EmployerExpenseReport" DROP CONSTRAINT IF EXISTS "EmployerExpenseReport_employerId_quarter_year_key";
