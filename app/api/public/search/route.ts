import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("searchTerm") || "";
    const entityType = searchParams.get("entityType") || "all";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");

    let lobbyists = [];
    let employers = [];

    // Fetch lobbyists if requested
    if (entityType === "all" || entityType === "lobbyists") {
      // Build where clause for lobbyists
      const lobbyistWhere: any = {
        status: "APPROVED", // Only show approved lobbyists publicly
      };

      // Add search term filter
      if (searchTerm) {
        lobbyistWhere.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          {
            LobbyistEmployer: {
              some: {
                OR: [
                  {
                    Employer: {
                      name: { contains: searchTerm, mode: "insensitive" },
                    },
                  },
                  { subjectsOfInterest: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            },
          },
        ];
      }

      // Add date range filter
      if (dateFrom) {
        lobbyistWhere.registrationDate = {
          ...lobbyistWhere.registrationDate,
          gte: new Date(dateFrom),
        };
      }
      if (dateTo) {
        lobbyistWhere.registrationDate = {
          ...lobbyistWhere.registrationDate,
          lte: new Date(dateTo),
        };
      }

      const lobbyistRecords = await prisma.lobbyist.findMany({
        where: lobbyistWhere,
        select: {
          id: true,
          name: true,
          email: true,
          registrationDate: true,
          LobbyistEmployer: {
            where: { endDate: null }, // Only active employments
            select: {
              subjectsOfInterest: true,
              Employer: {
                select: {
                  name: true,
                },
              },
            },
            take: 1, // Get primary employer for display
          },
          LobbyistExpenseReport: {
            where: {
              status: {
                in: ["APPROVED", "SUBMITTED"],
              },
            },
            select: {
              totalFoodEntertainment: true,
            },
          },
        },
        orderBy: {
          registrationDate: "desc",
        },
      });

      // Calculate total expenses and format data
      lobbyists = lobbyistRecords
        .map((lobbyist) => {
          const totalExpenses = lobbyist.LobbyistExpenseReport.reduce(
            (sum, report) => sum + report.totalFoodEntertainment,
            0
          );

          return {
            id: lobbyist.id,
            name: lobbyist.name,
            email: lobbyist.email,
            employer:
              lobbyist.LobbyistEmployer[0]?.Employer.name || "No employer listed",
            subjects:
              lobbyist.LobbyistEmployer[0]?.subjectsOfInterest || "No subjects listed",
            registrationDate: lobbyist.registrationDate.toISOString(),
            totalExpenses,
          };
        })
        // Filter by expense amount if specified
        .filter((lobbyist) => {
          if (minAmount && lobbyist.totalExpenses < parseFloat(minAmount)) {
            return false;
          }
          if (maxAmount && lobbyist.totalExpenses > parseFloat(maxAmount)) {
            return false;
          }
          return true;
        });
    }

    // Fetch employers if requested
    if (entityType === "all" || entityType === "employers") {
      // Build where clause for employers
      const employerWhere: any = {};

      // Add search term filter
      if (searchTerm) {
        employerWhere.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          {
            businessDescription: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ];
      }

      const employerRecords = await prisma.employer.findMany({
        where: employerWhere,
        select: {
          id: true,
          name: true,
          email: true,
          businessDescription: true,
          LobbyistEmployer: {
            where: { endDate: null }, // Only active employments
            select: {
              id: true,
            },
          },
          EmployerExpenseReport: {
            where: {
              status: {
                in: ["APPROVED", "SUBMITTED"],
              },
            },
            select: {
              totalLobbyingSpend: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Calculate total expenses and format data
      employers = employerRecords
        .map((employer) => {
          const totalExpenses = employer.EmployerExpenseReport.reduce(
            (sum, report) => sum + report.totalLobbyingSpend,
            0
          );

          return {
            id: employer.id,
            name: employer.name,
            email: employer.email,
            businessDescription: employer.businessDescription || "",
            lobbyistCount: employer.LobbyistEmployer.length,
            totalExpenses,
          };
        })
        // Filter by expense amount if specified
        .filter((employer) => {
          if (minAmount && employer.totalExpenses < parseFloat(minAmount)) {
            return false;
          }
          if (maxAmount && employer.totalExpenses > parseFloat(maxAmount)) {
            return false;
          }
          return true;
        });
    }

    return NextResponse.json({
      lobbyists,
      employers,
    });
  } catch (error) {
    console.error("Error searching public data:", error);
    return NextResponse.json(
      { error: "Failed to search data" },
      { status: 500 }
    );
  }
}
