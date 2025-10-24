/**
 * API Route: User Administration
 * GET  /api/admin/users - List all users with search/filter/pagination
 * POST /api/admin/users - Create new user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateSecurePassword } from "@/lib/password-utils";
import { createUserAuditLog, getIpAddress } from "@/lib/user-audit";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * GET /api/admin/users
 * List all users with optional search, filtering, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as UserStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 3. Build where clause for filtering
    const where: any = {};

    // Search by email or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && Object.values(UserRole).includes(role)) {
      where.role = role;
    }

    // Filter by status
    if (status && Object.values(UserStatus).includes(status)) {
      where.status = status;
    }

    // 4. Fetch users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // 5. Return paginated response
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { email, name, role } = body;

    // 3. Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, role" },
        { status: 400 }
      );
    }

    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 5. Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // 6. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 7. Generate secure temporary password
    const tempPassword = generateSecurePassword(16);
    const hashedPassword = await hashPassword(tempPassword);

    // 8. Create user with default status ACTIVE and passwordResetRequired true
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        passwordResetRequired: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordResetRequired: true,
        createdAt: true,
      },
    });

    // 9. Create audit log entry
    await createUserAuditLog({
      userId: user.id,
      adminId: session.user.id,
      action: "CREATED",
      changes: {
        email: { old: null, new: user.email },
        name: { old: null, new: user.name },
        role: { old: null, new: user.role },
        status: { old: null, new: user.status },
      },
      ipAddress: getIpAddress(request),
    });

    // 10. Log to console (console.log email approach for MVP)
    console.log("📧 WELCOME EMAIL:");
    console.log(`To: ${user.email} (${user.name})`);
    console.log(`Subject: Welcome to Lobbyist Registration System`);
    console.log(`Body:`);
    console.log(`  Hello ${user.name},`);
    console.log(``);
    console.log(
      `  Your account has been created in the Multnomah County Lobbyist Registration System.`
    );
    console.log(``);
    console.log(`  Account Details:`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Role: ${user.role}`);
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

    // 11. Return created user and temporary password
    // Note: In production, this would trigger an email instead of returning password
    return NextResponse.json(
      {
        user,
        tempPassword, // Only for console.log email approach
        message: "User created successfully. Temporary password generated.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
