import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Quarter } from "@prisma/client"

export async function GET() {
  try {
    // Get all submitted expense reports
    const lobbyistReports = await prisma.lobbyistExpenseReport.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "LATE", "REVIEWED"],
        },
      },
      include: {
        lobbyist: true,
        lineItems: true,
      },
      orderBy: {
        year: "desc",
      },
    })

    const employerReports = await prisma.employerExpenseReport.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "LATE", "REVIEWED"],
        },
      },
      include: {
        employer: true,
        lineItems: true,
        lobbyistPayments: {
          include: {
            lobbyist: true,
          },
        },
      },
      orderBy: {
        year: "desc",
      },
    })

    // Calculate quarterly totals
    const quarterlyData: Record<
      string,
      {
        quarter: Quarter
        year: number
        lobbyistSpending: number
        employerSpending: number
        totalSpending: number
        reportCount: number
      }
    > = {}

    lobbyistReports.forEach((report) => {
      const key = `${report.year}-${report.quarter}`
      if (!quarterlyData[key]) {
        quarterlyData[key] = {
          quarter: report.quarter,
          year: report.year,
          lobbyistSpending: 0,
          employerSpending: 0,
          totalSpending: 0,
          reportCount: 0,
        }
      }
      quarterlyData[key].lobbyistSpending += report.totalFoodEntertainment
      quarterlyData[key].totalSpending += report.totalFoodEntertainment
      quarterlyData[key].reportCount++
    })

    employerReports.forEach((report) => {
      const key = `${report.year}-${report.quarter}`
      if (!quarterlyData[key]) {
        quarterlyData[key] = {
          quarter: report.quarter,
          year: report.year,
          lobbyistSpending: 0,
          employerSpending: 0,
          totalSpending: 0,
          reportCount: 0,
        }
      }
      quarterlyData[key].employerSpending += report.totalLobbyingSpend
      quarterlyData[key].totalSpending += report.totalLobbyingSpend
      quarterlyData[key].reportCount++
    })

    // Convert to array and sort by year/quarter
    const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }
    const quarterlyTrends = Object.values(quarterlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return quarterOrder[a.quarter] - quarterOrder[b.quarter]
    })

    // Calculate top spenders - lobbyists
    const lobbyistSpending: Record<string, { name: string; total: number }> = {}
    lobbyistReports.forEach((report) => {
      const id = report.lobbyist.id
      if (!lobbyistSpending[id]) {
        lobbyistSpending[id] = {
          name: report.lobbyist.name,
          total: 0,
        }
      }
      lobbyistSpending[id].total += report.totalFoodEntertainment
    })

    const topLobbyists = Object.values(lobbyistSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Calculate top spenders - employers
    const employerSpending: Record<string, { name: string; total: number }> = {}
    employerReports.forEach((report) => {
      const id = report.employer.id
      if (!employerSpending[id]) {
        employerSpending[id] = {
          name: report.employer.name,
          total: 0,
        }
      }
      employerSpending[id].total += report.totalLobbyingSpend
    })

    const topEmployers = Object.values(employerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Calculate spending by official (from line items)
    const officialSpending: Record<string, number> = {}
    lobbyistReports.forEach((report) => {
      report.lineItems.forEach((item) => {
        if (!officialSpending[item.officialName]) {
          officialSpending[item.officialName] = 0
        }
        officialSpending[item.officialName] += item.amount
      })
    })

    employerReports.forEach((report) => {
      report.lineItems.forEach((item) => {
        if (!officialSpending[item.officialName]) {
          officialSpending[item.officialName] = 0
        }
        officialSpending[item.officialName] += item.amount
      })
    })

    const topOfficials = Object.entries(officialSpending)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Calculate overall totals
    const totalLobbyistSpending = lobbyistReports.reduce(
      (sum, r) => sum + r.totalFoodEntertainment,
      0
    )
    const totalEmployerSpending = employerReports.reduce(
      (sum, r) => sum + r.totalLobbyingSpend,
      0
    )

    // Get registration counts
    const totalLobbyists = await prisma.lobbyist.count({
      where: {
        status: "APPROVED",
      },
    })

    const totalEmployers = await prisma.employer.count()

    return NextResponse.json({
      summary: {
        totalLobbyists,
        totalEmployers,
        totalLobbyistSpending,
        totalEmployerSpending,
        totalSpending: totalLobbyistSpending + totalEmployerSpending,
        reportCount: lobbyistReports.length + employerReports.length,
      },
      quarterlyTrends,
      topLobbyists,
      topEmployers,
      topOfficials,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
