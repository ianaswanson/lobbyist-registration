/**
 * User Administration Audit Trail Utilities
 * Tracks all user management actions for government compliance
 */

import { prisma } from "./db";

export type UserAuditAction =
  | "CREATED"
  | "UPDATED"
  | "DEACTIVATED"
  | "ACTIVATED"
  | "SUSPENDED"
  | "PASSWORD_RESET"
  | "ROLE_CHANGED";

interface AuditLogOptions {
  userId: string; // User being modified
  adminId: string; // Admin making the change
  action: UserAuditAction;
  changes?: Record<string, { old: unknown; new: unknown }>; // What changed
  ipAddress?: string; // Where change was made from
}

/**
 * Create an audit log entry for user administration actions
 */
export async function createUserAuditLog(options: AuditLogOptions) {
  const { userId, adminId, action, changes, ipAddress } = options;

  return await prisma.userAuditLog.create({
    data: {
      userId,
      adminId,
      action,
      changes: changes || null,
      ipAddress: ipAddress || null,
    },
  });
}

/**
 * Get audit log history for a specific user
 */
export async function getUserAuditHistory(userId: string) {
  return await prisma.userAuditLog.findMany({
    where: { userId },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Extract IP address from Next.js request headers
 */
export function getIpAddress(request: Request): string | undefined {
  const headers = request.headers;

  // Try various common headers for IP address
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback to undefined if no IP found
  return undefined;
}
