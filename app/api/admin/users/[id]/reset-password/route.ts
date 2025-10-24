/**
 * API Route: Reset User Password
 * POST /api/admin/users/[id]/reset-password - Reset user's password
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateSecurePassword } from "@/lib/password-utils";
import { createUserAuditLog, getIpAddress } from "@/lib/user-audit";

/**
 * POST /api/admin/users/[id]/reset-password
 * Reset a user's password and set passwordResetRequired flag
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Generate new secure temporary password
    const tempPassword = generateSecurePassword(16);
    const hashedPassword = await hashPassword(tempPassword);

    // 5. Update user password and set passwordResetRequired flag
    const user = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetRequired: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordResetRequired: true,
      },
    });

    // 6. Create audit log entry
    await createUserAuditLog({
      userId: id,
      adminId: session.user.id,
      action: "PASSWORD_RESET",
      ipAddress: getIpAddress(request),
    });

    // 7. Log to console (console.log email approach for MVP)
    console.log("📧 PASSWORD RESET EMAIL:");
    console.log(`To: ${user.email} (${user.name})`);
    console.log(`Subject: Your password has been reset`);
    console.log(`Body:`);
    console.log(`  Hello ${user.name},`);
    console.log(``);
    console.log(`  Your password has been reset by an administrator.`);
    console.log(``);
    console.log(`  Temporary Password: ${tempPassword}`);
    console.log(``);
    console.log(
      `  Please sign in at: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signin`
    );
    console.log(``);
    console.log(`  You will be required to change your password on first login.`);
    console.log(``);
    console.log(`  ---`);
    console.log(`  Multnomah County Lobbyist Registration System`);
    console.log("");

    // 8. Return success with temporary password
    // Note: In production, this would only send email, not return password
    return NextResponse.json({
      user,
      tempPassword, // Only for console.log email approach
      message:
        "Password reset successfully. Temporary password generated and logged to console.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
