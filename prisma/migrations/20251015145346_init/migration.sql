-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PUBLIC',
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lobbyist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "hoursCurrentQuarter" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lobbyist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LobbyistEmployer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lobbyistId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "authorizationDocumentUrl" TEXT,
    "authorizationDate" DATETIME,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "subjectsOfInterest" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LobbyistEmployer_lobbyistId_fkey" FOREIGN KEY ("lobbyistId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LobbyistEmployer_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LobbyistExpenseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lobbyistId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalFoodEntertainment" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LobbyistExpenseReport_lobbyistId_fkey" FOREIGN KEY ("lobbyistId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseLineItem" (
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

-- CreateTable
CREATE TABLE "EmployerExpenseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalLobbyingSpend" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployerExpenseReport_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployerLobbyistPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerReportId" TEXT NOT NULL,
    "lobbyistId" TEXT NOT NULL,
    "amountPaid" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployerLobbyistPayment_employerReportId_fkey" FOREIGN KEY ("employerReportId") REFERENCES "EmployerExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployerLobbyistPayment_lobbyistId_fkey" FOREIGN KEY ("lobbyistId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT,
    "termStart" DATETIME NOT NULL,
    "termEnd" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardCalendarEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardMemberId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "eventTime" TEXT,
    "participantsList" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardCalendarEntry_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "BoardMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardLobbyingReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardMemberId" TEXT NOT NULL,
    "lobbyistId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "payee" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardLobbyingReceipt_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "BoardMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BoardLobbyingReceipt_lobbyistId_fkey" FOREIGN KEY ("lobbyistId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fineAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Lobbyist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Employer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "LobbyistExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "EmployerExpenseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "violationId" TEXT NOT NULL,
    "submittedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appealDeadline" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "hearingDate" DATETIME,
    "decision" TEXT,
    "decidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appeal_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formerOfficialId" TEXT NOT NULL,
    "formerOfficialName" TEXT NOT NULL,
    "contractDescription" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedDate" DATETIME NOT NULL,
    "publiclyPostedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changesJson" TEXT,
    "ipAddress" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Lobbyist_userId_key" ON "Lobbyist"("userId");

-- CreateIndex
CREATE INDEX "Lobbyist_status_idx" ON "Lobbyist"("status");

-- CreateIndex
CREATE INDEX "Lobbyist_email_idx" ON "Lobbyist"("email");

-- CreateIndex
CREATE INDEX "Lobbyist_registrationDate_idx" ON "Lobbyist"("registrationDate");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_userId_key" ON "Employer"("userId");

-- CreateIndex
CREATE INDEX "Employer_email_idx" ON "Employer"("email");

-- CreateIndex
CREATE INDEX "Employer_name_idx" ON "Employer"("name");

-- CreateIndex
CREATE INDEX "LobbyistEmployer_lobbyistId_idx" ON "LobbyistEmployer"("lobbyistId");

-- CreateIndex
CREATE INDEX "LobbyistEmployer_employerId_idx" ON "LobbyistEmployer"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "LobbyistEmployer_lobbyistId_employerId_startDate_key" ON "LobbyistEmployer"("lobbyistId", "employerId", "startDate");

-- CreateIndex
CREATE INDEX "LobbyistExpenseReport_status_idx" ON "LobbyistExpenseReport"("status");

-- CreateIndex
CREATE INDEX "LobbyistExpenseReport_dueDate_idx" ON "LobbyistExpenseReport"("dueDate");

-- CreateIndex
CREATE INDEX "LobbyistExpenseReport_lobbyistId_year_idx" ON "LobbyistExpenseReport"("lobbyistId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "LobbyistExpenseReport_lobbyistId_quarter_year_key" ON "LobbyistExpenseReport"("lobbyistId", "quarter", "year");

-- CreateIndex
CREATE INDEX "ExpenseLineItem_reportId_idx" ON "ExpenseLineItem"("reportId");

-- CreateIndex
CREATE INDEX "ExpenseLineItem_officialName_idx" ON "ExpenseLineItem"("officialName");

-- CreateIndex
CREATE INDEX "ExpenseLineItem_date_idx" ON "ExpenseLineItem"("date");

-- CreateIndex
CREATE INDEX "EmployerExpenseReport_status_idx" ON "EmployerExpenseReport"("status");

-- CreateIndex
CREATE INDEX "EmployerExpenseReport_dueDate_idx" ON "EmployerExpenseReport"("dueDate");

-- CreateIndex
CREATE INDEX "EmployerExpenseReport_employerId_year_idx" ON "EmployerExpenseReport"("employerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerExpenseReport_employerId_quarter_year_key" ON "EmployerExpenseReport"("employerId", "quarter", "year");

-- CreateIndex
CREATE INDEX "EmployerLobbyistPayment_employerReportId_idx" ON "EmployerLobbyistPayment"("employerReportId");

-- CreateIndex
CREATE INDEX "EmployerLobbyistPayment_lobbyistId_idx" ON "EmployerLobbyistPayment"("lobbyistId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerLobbyistPayment_employerReportId_lobbyistId_key" ON "EmployerLobbyistPayment"("employerReportId", "lobbyistId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_userId_key" ON "BoardMember"("userId");

-- CreateIndex
CREATE INDEX "BoardMember_isActive_idx" ON "BoardMember"("isActive");

-- CreateIndex
CREATE INDEX "BoardCalendarEntry_boardMemberId_idx" ON "BoardCalendarEntry"("boardMemberId");

-- CreateIndex
CREATE INDEX "BoardCalendarEntry_eventDate_idx" ON "BoardCalendarEntry"("eventDate");

-- CreateIndex
CREATE INDEX "BoardCalendarEntry_quarter_year_idx" ON "BoardCalendarEntry"("quarter", "year");

-- CreateIndex
CREATE INDEX "BoardLobbyingReceipt_boardMemberId_idx" ON "BoardLobbyingReceipt"("boardMemberId");

-- CreateIndex
CREATE INDEX "BoardLobbyingReceipt_lobbyistId_idx" ON "BoardLobbyingReceipt"("lobbyistId");

-- CreateIndex
CREATE INDEX "BoardLobbyingReceipt_quarter_year_idx" ON "BoardLobbyingReceipt"("quarter", "year");

-- CreateIndex
CREATE INDEX "Violation_entityType_entityId_idx" ON "Violation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Violation_status_idx" ON "Violation"("status");

-- CreateIndex
CREATE INDEX "Violation_issuedDate_idx" ON "Violation"("issuedDate");

-- CreateIndex
CREATE INDEX "Appeal_violationId_idx" ON "Appeal"("violationId");

-- CreateIndex
CREATE INDEX "Appeal_status_idx" ON "Appeal"("status");

-- CreateIndex
CREATE INDEX "Appeal_hearingDate_idx" ON "Appeal"("hearingDate");

-- CreateIndex
CREATE INDEX "ContractException_formerOfficialId_idx" ON "ContractException"("formerOfficialId");

-- CreateIndex
CREATE INDEX "ContractException_approvedDate_idx" ON "ContractException"("approvedDate");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
