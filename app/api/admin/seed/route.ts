import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * POST /api/admin/seed
 * Seed the database with test users
 * SECURITY: Only available in development mode
 */
export async function POST() {
  // SECURITY: Prevent seed endpoint from running in production
  // Allow in dev environment even when NODE_ENV=production
  if (process.env.NODE_ENV === "production" && process.env.ENVIRONMENT !== "dev") {
    return NextResponse.json(
      { error: "Seed endpoint is disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Check if users already exist
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      return NextResponse.json({
        message: "Database already seeded",
        userCount: existingUsers,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create users
    const users = await prisma.user.createMany({
      data: [
        {
          email: "admin@multnomah.gov",
          name: "County Administrator",
          password: hashedPassword,
          role: "ADMIN",
        },
        {
          email: "commissioner@multnomah.gov",
          name: "Commissioner Williams",
          password: hashedPassword,
          role: "BOARD_MEMBER",
        },
        {
          email: "john.doe@lobbying.com",
          name: "John Doe",
          password: hashedPassword,
          role: "LOBBYIST",
        },
        {
          email: "jane.smith@advocacy.com",
          name: "Jane Smith",
          password: hashedPassword,
          role: "LOBBYIST",
        },
        {
          email: "contact@techcorp.com",
          name: "Sarah Johnson",
          password: hashedPassword,
          role: "EMPLOYER",
        },
        {
          email: "public@example.com",
          name: "Public User",
          password: hashedPassword,
          role: "PUBLIC",
        },
      ],
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      usersCreated: users.count,
    }, { status: 201 });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed
 * Check seed status
 * SECURITY: Only available in development mode
 */
export async function GET() {
  // SECURITY: Prevent seed endpoint from running in production
  // Allow in dev environment even when NODE_ENV=production
  if (process.env.NODE_ENV === "production" && process.env.ENVIRONMENT !== "dev") {
    return NextResponse.json(
      { error: "Seed endpoint is disabled in production" },
      { status: 403 }
    );
  }

  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      seeded: userCount > 0,
      userCount,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check seed status" },
      { status: 500 }
    );
  }
}
