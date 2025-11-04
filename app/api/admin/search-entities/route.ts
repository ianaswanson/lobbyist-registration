import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/admin/search-entities
 * Search for lobbyists, employers, and reports by name, email, or ID
 * Query params:
 *   - q: search query (required)
 *   - entityType: filter by specific entity type (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can search entities
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const entityTypeFilter = searchParams.get("entityType");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    // Search Lobbyists
    if (!entityTypeFilter || entityTypeFilter === "LOBBYIST") {
      const lobbyists = await prisma.lobbyist.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { id: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
        take: 10,
      });

      results.push(
        ...lobbyists.map((l) => ({
          id: l.id,
          type: "LOBBYIST" as const,
          name: l.name,
          email: l.email,
          status: l.status,
          displayText: `${l.name} (${l.email})`,
          subtitle: `Lobbyist • ${l.status}`,
        }))
      );
    }

    // Search Employers
    if (!entityTypeFilter || entityTypeFilter === "EMPLOYER") {
      const employers = await prisma.employer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { id: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 10,
      });

      results.push(
        ...employers.map((e) => ({
          id: e.id,
          type: "EMPLOYER" as const,
          name: e.name,
          email: e.email,
          displayText: `${e.name} (${e.email})`,
          subtitle: "Employer",
        }))
      );
    }

    // Search Board Members
    if (!entityTypeFilter || entityTypeFilter === "BOARD_MEMBER") {
      const boardMembers = await prisma.boardMember.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { id: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          district: true,
          isActive: true,
        },
        take: 10,
      });

      results.push(
        ...boardMembers.map((b) => ({
          id: b.id,
          type: "BOARD_MEMBER" as const,
          name: b.name,
          displayText: b.name,
          subtitle: `Board Member${b.district ? ` • District ${b.district}` : ""} • ${b.isActive ? "Active" : "Inactive"}`,
        }))
      );
    }

    // Search Lobbyist Reports (by quarter and year)
    if (!entityTypeFilter || entityTypeFilter === "LOBBYIST_REPORT") {
      const lobbyistReports = await prisma.lobbyistExpenseReport.findMany({
        where: {
          OR: [
            { id: { contains: query } },
            {
              lobbyist: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        include: {
          lobbyist: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        take: 10,
      });

      results.push(
        ...lobbyistReports.map((r) => ({
          id: r.id,
          type: "LOBBYIST_REPORT" as const,
          name: `${r.lobbyist.name} - ${r.quarter} ${r.year}`,
          displayText: `${r.lobbyist.name} - ${r.quarter} ${r.year} Report`,
          subtitle: `Lobbyist Report • ${r.status} • Due: ${new Date(r.dueDate).toLocaleDateString()}`,
          relatedEntityId: r.lobbyistId,
          relatedEntityType: "LOBBYIST",
        }))
      );
    }

    // Search Employer Reports
    if (!entityTypeFilter || entityTypeFilter === "EMPLOYER_REPORT") {
      const employerReports = await prisma.employerExpenseReport.findMany({
        where: {
          OR: [
            { id: { contains: query } },
            {
              employer: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        include: {
          employer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        take: 10,
      });

      results.push(
        ...employerReports.map((r) => ({
          id: r.id,
          type: "EMPLOYER_REPORT" as const,
          name: `${r.employer.name} - ${r.quarter} ${r.year}`,
          displayText: `${r.employer.name} - ${r.quarter} ${r.year} Report`,
          subtitle: `Employer Report • ${r.status} • Due: ${new Date(r.dueDate).toLocaleDateString()}`,
          relatedEntityId: r.employerId,
          relatedEntityType: "EMPLOYER",
        }))
      );
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact =
        a.name?.toLowerCase() === query.toLowerCase() ||
        a.email?.toLowerCase() === query.toLowerCase();
      const bExact =
        b.name?.toLowerCase() === query.toLowerCase() ||
        b.email?.toLowerCase() === query.toLowerCase();

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 total results
      count: results.length,
    });
  } catch (error) {
    console.error("Error searching entities:", error);
    return NextResponse.json(
      { error: "Failed to search entities" },
      { status: 500 }
    );
  }
}
