"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp, Users, Building2, DollarSign, Info, BarChart3 } from "lucide-react"

interface AnalyticsData {
  summary: {
    totalLobbyists: number
    totalEmployers: number
    totalLobbyistSpending: number
    totalEmployerSpending: number
    totalSpending: number
    reportCount: number
  }
  quarterlyTrends: Array<{
    quarter: string
    year: number
    lobbyistSpending: number
    employerSpending: number
    totalSpending: number
    reportCount: number
  }>
  topLobbyists: Array<{ name: string; total: number }>
  topEmployers: Array<{ name: string; total: number }>
  topOfficials: Array<{ name: string; total: number }>
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics")

      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatQuarter = (quarter: string, year: number) => {
    return `${quarter} ${year}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No analytics data available</div>
      </div>
    )
  }

  const maxQuarterlySpending = Math.max(
    ...data.quarterlyTrends.map((q) => q.totalSpending),
    1
  )

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Lobbying Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Public transparency dashboard showing lobbying spending trends and statistics
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">About This Data</AlertTitle>
        <AlertDescription className="text-blue-700">
          This dashboard aggregates data from submitted quarterly expense reports.
          All spending amounts represent food, entertainment, and lobbying expenses as
          required by the Government Accountability Ordinance.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.totalSpending)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {data.summary.reportCount} reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Lobbyists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalLobbyists}</div>
            <p className="text-xs text-muted-foreground">Active registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalEmployers}</div>
            <p className="text-xs text-muted-foreground">Total employers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Report</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.totalSpending / data.summary.reportCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Per quarterly report</p>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Trends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quarterly Spending Trends</CardTitle>
          <CardDescription>
            Total lobbying expenditures by quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.quarterlyTrends.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No quarterly data available yet
            </div>
          ) : (
            <div className="space-y-4">
              {data.quarterlyTrends.map((quarter) => {
                const percentage = (quarter.totalSpending / maxQuarterlySpending) * 100
                return (
                  <div key={`${quarter.year}-${quarter.quarter}`} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {formatQuarter(quarter.quarter, quarter.year)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(quarter.totalSpending)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && `${quarter.reportCount} reports`}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Lobbyist: {formatCurrency(quarter.lobbyistSpending)}</span>
                      <span>Employer: {formatCurrency(quarter.employerSpending)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Spenders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Top Lobbyists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Lobbyists
            </CardTitle>
            <CardDescription>By total spending</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topLobbyists.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {data.topLobbyists.map((lobbyist, index) => (
                  <div key={lobbyist.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {lobbyist.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(lobbyist.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Employers
            </CardTitle>
            <CardDescription>By total spending</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topEmployers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {data.topEmployers.map((employer, index) => (
                  <div key={employer.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {employer.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(employer.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Officials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Lobbied Officials
            </CardTitle>
            <CardDescription>By total expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topOfficials.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {data.topOfficials.map((official, index) => (
                  <div key={official.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {official.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(official.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>Distribution by report type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Lobbyist Expenses</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(data.summary.totalLobbyistSpending)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-blue-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                  style={{
                    width: `${(data.summary.totalLobbyistSpending / data.summary.totalSpending) * 100}%`,
                  }}
                >
                  {((data.summary.totalLobbyistSpending / data.summary.totalSpending) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Employer Expenses</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(data.summary.totalEmployerSpending)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-purple-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                  style={{
                    width: `${(data.summary.totalEmployerSpending / data.summary.totalSpending) * 100}%`,
                  }}
                >
                  {((data.summary.totalEmployerSpending / data.summary.totalSpending) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
