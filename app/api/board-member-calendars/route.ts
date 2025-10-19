import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/board-member-calendars
 * Public API to fetch board member calendars and lobbying receipts
 * Filters to only show data within 1-year retention period (§3.001 requirement)
 */
export async function GET() {
  try {
    // Calculate 1-year retention cutoff date
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

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
    })

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
    }))

    return NextResponse.json({
      boardMembers: formattedData,
      retentionPeriod: "1 year",
      cutoffDate: oneYearAgo.toISOString(),
      count: formattedData.length,
    })
  } catch (error) {
    console.error("Error fetching board member calendars:", error)
    return NextResponse.json(
      { error: "Failed to fetch board member data" },
      { status: 500 }
    )
  }
}
