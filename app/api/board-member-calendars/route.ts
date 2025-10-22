import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/board-member-calendars
 * Public API to fetch board member calendars and lobbying receipts
 * Filters to only show data within 1-year retention period (§3.001 requirement)
 */
export async function GET() {
  try {
    // Calculate 1-year retention cutoff date
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Fetch all active board members with their calendars and receipts
    const boardMembers = await prisma.boardMember.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        calendarEntries: {
          where: {
            // Only include entries from the last year
            eventDate: {
              gte: oneYearAgo,
            },
          },
          orderBy: {
            eventDate: "desc",
          },
        },
        lobbyingReceipts: {
          where: {
            // Only include receipts from the last year
            date: {
              gte: oneYearAgo,
            },
          },
          include: {
            lobbyist: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format the response
    const formattedData = boardMembers.map((member) => ({
      id: member.id,
      name: member.name,
      district: member.district,
      termStart: member.termStart,
      termEnd: member.termEnd,
      calendarEntries: member.calendarEntries.map((entry) => ({
        id: entry.id,
        eventTitle: entry.eventTitle,
        eventDate: entry.eventDate,
        eventTime: entry.eventTime,
        participants: entry.participantsList,
        quarter: entry.quarter,
        year: entry.year,
      })),
      lobbyingReceipts: member.lobbyingReceipts.map((receipt) => ({
        id: receipt.id,
        lobbyistName: receipt.lobbyist.name,
        lobbyistEmail: receipt.lobbyist.email,
        amount: receipt.amount,
        date: receipt.date,
        payee: receipt.payee,
        purpose: receipt.purpose,
        quarter: receipt.quarter,
        year: receipt.year,
      })),
      totalReceipts: member.lobbyingReceipts.length,
      totalReceiptAmount: member.lobbyingReceipts.reduce(
        (sum, r) => sum + r.amount,
        0
      ),
    }));

    return NextResponse.json({
      boardMembers: formattedData,
      retentionPeriod: "1 year",
      cutoffDate: oneYearAgo.toISOString(),
      count: formattedData.length,
    });
  } catch (error) {
    console.error("Error fetching board member calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch board member data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/board-member-calendars
 * Submit board member quarterly calendar and lobbying receipts
 * Body:
 *   - quarter: Quarter (Q1, Q2, Q3, Q4)
 *   - year: number
 *   - calendarEntries: Array of calendar events
 *   - receipts: Array of lobbying receipts
 *   - isDraft: boolean (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "BOARD_MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get board member record for this user
    const boardMember = await prisma.boardMember.findUnique({
      where: { userId: session.user.id },
    });

    if (!boardMember) {
      return NextResponse.json(
        { error: "Board member profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      quarter,
      year,
      calendarEntries = [],
      receipts = [],
      isDraft = false,
    } = body;

    // Validate required fields
    if (!quarter || !year) {
      return NextResponse.json(
        { error: "Missing required fields: quarter, year" },
        { status: 400 }
      );
    }

    // Delete existing entries for this quarter/year
    await prisma.boardCalendarEntry.deleteMany({
      where: {
        boardMemberId: boardMember.id,
        quarter,
        year,
      },
    });

    await prisma.boardLobbyingReceipt.deleteMany({
      where: {
        boardMemberId: boardMember.id,
        quarter,
        year,
      },
    });

    // Create new calendar entries
    const createdCalendarEntries = await Promise.all(
      calendarEntries.map((entry: any) =>
        prisma.boardCalendarEntry.create({
          data: {
            boardMemberId: boardMember.id,
            eventTitle: entry.eventTitle,
            eventDate: new Date(entry.eventDate),
            eventTime: entry.eventTime,
            participantsList: entry.participants,
            quarter,
            year,
          },
        })
      )
    );

    // Create new lobbying receipts
    // Need to find lobbyist by name for linking
    const createdReceipts = await Promise.all(
      receipts.map(async (receipt: any) => {
        // Find lobbyist by name (case-insensitive)
        const lobbyist = await prisma.lobbyist.findFirst({
          where: {
            name: {
              equals: receipt.lobbyistName,
              mode: "insensitive",
            },
          },
        });

        if (!lobbyist) {
          console.warn(`Lobbyist not found: ${receipt.lobbyistName}`);
          // Still create the receipt, but without lobbyist link
        }

        return prisma.boardLobbyingReceipt.create({
          data: {
            boardMemberId: boardMember.id,
            lobbyistId: lobbyist?.id || null,
            lobbyistName: receipt.lobbyistName, // Store name even if lobbyist not found
            amount: receipt.amount,
            date: new Date(receipt.date),
            payee: receipt.payee,
            purpose: receipt.purpose,
            quarter,
            year,
          },
        });
      })
    );

    const totalReceiptAmount = receipts.reduce(
      (sum: number, r: any) => sum + r.amount,
      0
    );

    // TODO: Send email notification to admin about submission
    // TODO: If not draft, trigger public posting

    return NextResponse.json(
      {
        message: isDraft
          ? `Draft saved successfully! Quarter: ${quarter} ${year}`
          : `Calendar and receipts submitted successfully! Quarter: ${quarter} ${year}. Data will be publicly posted.`,
        calendarEntriesCount: createdCalendarEntries.length,
        receiptsCount: createdReceipts.length,
        totalReceiptAmount,
        quarter,
        year,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating board member calendar:", error);
    return NextResponse.json(
      { error: "Failed to submit calendar and receipts" },
      { status: 500 }
    );
  }
}
