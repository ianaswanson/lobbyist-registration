/**
 * API Route: Individual User Operations
 * GET    /api/admin/users/[id] - Get user details
 * PATCH  /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Deactivate user (soft delete)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserAuditLog, getIpAddress } from "@/lib/user-audit";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * GET /api/admin/users/[id]
 * Get user details by ID
 */
export async function GET(
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

    // 3. Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordResetRequired: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password hash
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return user details
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user details (name, role, status)
 * Note: Email cannot be changed (immutable)
 */
export async function PATCH(
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
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Parse request body
    const body = await request.json();
    const { name, role, status } = body;

    // 4. Validate fields if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (status && !Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 5. Self-protection: Can't modify yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account through admin API" },
        { status: 403 }
      );
    }

    // 6. Self-protection: Can't deactivate last admin
    if (status === UserStatus.INACTIVE && existingUser.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: UserStatus.ACTIVE,
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot deactivate the last active admin" },
          { status: 403 }
        );
      }
    }

    // 7. Build update data and track changes
    const updateData: any = {};
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (name !== undefined && name !== existingUser.name) {
      updateData.name = name;
      changes.name = { old: existingUser.name, new: name };
    }

    if (role !== undefined && role !== existingUser.role) {
      updateData.role = role;
      changes.role = { old: existingUser.role, new: role };
    }

    if (status !== undefined && status !== existingUser.status) {
      updateData.status = status;
      changes.status = { old: existingUser.status, new: status };
    }

    // 8. Check if there are any changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes detected" },
        { status: 200 }
      );
    }

    // 9. Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordResetRequired: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 10. Determine audit action
    let auditAction: "UPDATED" | "DEACTIVATED" | "ACTIVATED" | "SUSPENDED" | "ROLE_CHANGED" = "UPDATED";
    if (changes.status) {
      if (changes.status.new === UserStatus.INACTIVE) {
        auditAction = "DEACTIVATED";
      } else if (changes.status.new === UserStatus.ACTIVE && changes.status.old === UserStatus.INACTIVE) {
        auditAction = "ACTIVATED";
      } else if (changes.status.new === UserStatus.SUSPENDED) {
        auditAction = "SUSPENDED";
      }
    } else if (changes.role) {
      auditAction = "ROLE_CHANGED";
    }

    // 11. Create audit log entry
    await createUserAuditLog({
      userId: id,
      adminId: session.user.id,
      action: auditAction,
      changes,
      ipAddress: getIpAddress(request),
    });

    // 12. Return updated user
    return NextResponse.json({
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete (deactivate) a user
 */
export async function DELETE(
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
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Self-protection: Can't delete yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 403 }
      );
    }

    // 5. Self-protection: Can't delete last admin
    if (existingUser.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: UserStatus.ACTIVE,
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot deactivate the last active admin" },
          { status: 403 }
        );
      }
    }

    // 6. Soft delete: Set status to INACTIVE
    const user = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    // 7. Create audit log entry
    await createUserAuditLog({
      userId: id,
      adminId: session.user.id,
      action: "DEACTIVATED",
      changes: {
        status: { old: existingUser.status, new: UserStatus.INACTIVE },
      },
      ipAddress: getIpAddress(request),
    });

    // 8. Return success
    return NextResponse.json({
      user,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
