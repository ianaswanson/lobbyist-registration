-- AlterTable: Add user administration columns to User table
-- CreateEnum: UserStatus
DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add status column with default value
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- AlterTable: Add passwordResetRequired column
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- AlterTable: Add lastLoginAt column
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- CreateTable: UserAuditLog for tracking user management actions
CREATE TABLE IF NOT EXISTS "UserAuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "changes" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Indexes for UserAuditLog
CREATE INDEX IF NOT EXISTS "UserAuditLog_userId_idx" ON "UserAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "UserAuditLog_adminId_idx" ON "UserAuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "UserAuditLog_createdAt_idx" ON "UserAuditLog"("createdAt");

-- CreateIndex: Index for User status
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");

-- AddForeignKey: UserAuditLog to User (userId)
DO $$ BEGIN
  ALTER TABLE "UserAuditLog" ADD CONSTRAINT "UserAuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey: UserAuditLog to User (adminId)
DO $$ BEGIN
  ALTER TABLE "UserAuditLog" ADD CONSTRAINT "UserAuditLog_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
