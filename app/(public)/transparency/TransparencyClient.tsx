"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsightCard } from "@/components/insights/InsightCard";
import {
  Download,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  AlertTriangle,
  Calendar,
  Building2,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuarterlyExpensesChart } from "@/components/analytics/QuarterlyExpensesChart";
import { TopEmployersChart } from "@/components/analytics/TopEmployersChart";
import { RegistrationGrowthChart } from "@/components/analytics/RegistrationGrowthChart";
import { ComplianceRateChart } from "@/components/analytics/ComplianceRateChart";
import { PublicNavigation } from "@/components/PublicNavigation";

interface TransparencyClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

interface AnalyticsData {
  summary: {
    totalLobbyists: number;
    totalEmployers: number;
    totalReports: number;
    totalExpenses: number;
  };
  quarterlyExpenses: Array<{ quarter: string; total: number }>;
  topEmployers: Array<{ name: string; total: number }>;
  registrationGrowth: Array<{ month: string; count: number }>;
  compliance: {
    onTime: number;
    late: number;
    rate: number;
  };
  generatedAt: string;
}

interface InsightsData {
  filters: {
    year: string;
    quarter: string;
    entityType: string;
  };
  registrationSummary: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    trend: number;
  };
  spendingAnalysis: {
    totalExpenses: number;
    averageExpense: number;
    expenseCount: number;
    avgPerLobbyist: number;
    topEmployers: Array<{ name: string; total: number }>;
    topLobbyists: Array<{ name: string; total: number }>;
  };
  complianceMetrics: {
    onTimeSubmissions: number;
    lateSubmissions: number;
    onTimeRate: number;
    totalViolations: number;
    totalReports: number;
  };
  quarterlyBreakdown: Array<{
    quarter: string;
    expenses: number;
    reports: number;
  }>;
  entityCounts: {
    employers: number;
    activeBoardMembers: number;
    calendarEntries: number;
    totalReports: number;
  };
  generatedAt: string;
}

export function TransparencyClient({ user }: TransparencyClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Analytics filters
  const [timeRange, setTimeRange] = useState("all_time");

  // Insights filters
  const [year, setYear] = useState("all");
  const [quarter, setQuarter] = useState("all");
  const [entityType, setEntityType] = useState("all");

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Fetch insights data
  useEffect(() => {
    fetchInsights();
  }, [year, quarter, entityType]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch(
        `/api/public/analytics?timeRange=${timeRange}`
      );
      const result = await response.json();
      setAnalyticsData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch(
        `/api/public/insights?year=${year}&quarter=${quarter}&entityType=${entityType}`
      );
      const result = await response.json();
      setInsightsData(result);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const exportToCSV = () => {
    if (!analyticsData || !insightsData) return;

    let csvContent =
      "Multnomah County Lobbying Transparency Dashboard Export\\n\\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\\n`;
    csvContent += `Analytics Time Range: ${timeRange}\\n`;
    csvContent += `Insights Filters: Year=${year}, Quarter=${quarter}, Entity Type=${entityType}\\n\\n`;

    // Analytics Summary
    csvContent += "ANALYTICS OVERVIEW\\n";
    csvContent += `Total Lobbyists,${analyticsData.summary.totalLobbyists}\\n`;
    csvContent += `Total Employers,${analyticsData.summary.totalEmployers}\\n`;
    csvContent += `Total Reports,${analyticsData.summary.totalReports}\\n`;
    csvContent += `Total Expenses,$${analyticsData.summary.totalExpenses.toLocaleString()}\\n\\n`;

    // Quarterly Expenses
    csvContent += "QUARTERLY EXPENSES\\n";
    csvContent += "Quarter,Total Expenses\\n";
    analyticsData.quarterlyExpenses.forEach((q) => {
      csvContent += `${q.quarter},$${q.expenses.toLocaleString()}\\n`;
    });
    csvContent += "\\n";

    // Registration Summary
    csvContent += "REGISTRATION SUMMARY\\n";
    csvContent += `Total Lobbyists,${insightsData.registrationSummary.total}\\n`;
    csvContent += `Active Lobbyists,${insightsData.registrationSummary.active}\\n`;
    csvContent += `Inactive Lobbyists,${insightsData.registrationSummary.inactive}\\n`;
    csvContent += `Pending Registrations,${insightsData.registrationSummary.pending}\\n`;
    csvContent += `Registration Trend,${insightsData.registrationSummary.trend}%\\n\\n`;

    // Spending Analysis
    csvContent += "SPENDING ANALYSIS\\n";
    csvContent += `Total Expenses,$${insightsData.spendingAnalysis.totalExpenses.toLocaleString()}\\n`;
    csvContent += `Average Expense,$${insightsData.spendingAnalysis.averageExpense.toLocaleString()}\\n`;
    csvContent += `Total Expense Items,${insightsData.spendingAnalysis.expenseCount}\\n`;
    csvContent += `Average Per Lobbyist,$${insightsData.spendingAnalysis.avgPerLobbyist.toLocaleString()}\\n\\n`;

    // Top Employers
    csvContent += "TOP 10 EMPLOYERS BY SPENDING\\n";
    csvContent += "Rank,Employer Name,Total Spending\\n";
    insightsData.spendingAnalysis.topEmployers.forEach((employer, index) => {
      csvContent += `${index + 1},"${employer.name}",$${employer.total.toLocaleString()}\\n`;
    });
    csvContent += "\\n";

    // Top Lobbyists
    csvContent += "TOP 10 LOBBYISTS BY EXPENSES\\n";
    csvContent += "Rank,Lobbyist Name,Total Expenses\\n";
    insightsData.spendingAnalysis.topLobbyists.forEach((lobbyist, index) => {
      csvContent += `${index + 1},"${lobbyist.name}",$${lobbyist.total.toLocaleString()}\\n`;
    });
    csvContent += "\\n";

    // Compliance Metrics
    csvContent += "COMPLIANCE METRICS\\n";
    csvContent += `On-Time Submissions,${insightsData.complianceMetrics.onTimeSubmissions}\\n`;
    csvContent += `Late Submissions,${insightsData.complianceMetrics.lateSubmissions}\\n`;
    csvContent += `On-Time Rate,${insightsData.complianceMetrics.onTimeRate}%\\n`;
    csvContent += `Total Violations,${insightsData.complianceMetrics.totalViolations}\\n\\n`;

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transparency-dashboard-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show initial loading screen if data is not yet loaded
  if (!analyticsData || !insightsData) {
    return (
      <>
        <PublicNavigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Transparency Dashboard
            </h1>
            <p className="text-gray-600">
              Explore lobbying activity, spending trends, and compliance metrics in
              Multnomah County
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // If we don't have both datasets, show error
  if (!analyticsData || !insightsData) {
    return (
      <>
        <PublicNavigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Transparency Dashboard
            </h1>
            <p className="text-gray-600">
              Explore lobbying activity, spending trends, and compliance metrics in
              Multnomah County
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">Please refresh the page to try again.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicNavigation user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Transparency Dashboard
          </h1>
          <p className="text-gray-600">
            Explore lobbying activity, spending trends, and compliance metrics in
            Multnomah County
          </p>
        </div>
        <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Summary Cards */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Summary
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="Total Lobbyists"
                value={analyticsData.summary.totalLobbyists}
                subtitle="Registered overall"
                icon={Users}
              />
              <InsightCard
                title="Total Employers"
                value={analyticsData.summary.totalEmployers}
                subtitle="Organizations registered"
                icon={Building2}
              />
              <InsightCard
                title="Total Reports"
                value={analyticsData.summary.totalReports}
                subtitle="Filed to date"
                icon={FileText}
              />
              <InsightCard
                title="Total Expenses"
                value={analyticsData.summary.totalExpenses}
                subtitle="All reported expenses"
                icon={DollarSign}
                formatter={(v) => `$${v.toLocaleString()}`}
              />
            </div>
          </div>

          {/* Registration Summary with filters */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Registration Details
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="lobbyist">Lobbyists</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="Total Lobbyists"
                value={insightsData.registrationSummary.total}
                subtitle="Registered in period"
                trend={insightsData.registrationSummary.trend}
                icon={Users}
              />
              <InsightCard
                title="Active Lobbyists"
                value={insightsData.registrationSummary.active}
                subtitle="Currently approved"
                icon={Users}
              />
              <InsightCard
                title="Inactive Lobbyists"
                value={insightsData.registrationSummary.inactive}
                subtitle="No longer active"
                icon={Users}
              />
              <InsightCard
                title="Pending Registrations"
                value={insightsData.registrationSummary.pending}
                subtitle="Awaiting review"
                icon={FileText}
              />
            </div>
          </div>

          {/* Compliance Overview */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Compliance Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="On-Time Rate"
                value={`${insightsData.complianceMetrics.onTimeRate}%`}
                subtitle="Reports submitted on time"
                icon={TrendingUp}
              />
              <InsightCard
                title="On-Time Submissions"
                value={insightsData.complianceMetrics.onTimeSubmissions}
                subtitle="Submitted before deadline"
                icon={FileText}
              />
              <InsightCard
                title="Late Submissions"
                value={insightsData.complianceMetrics.lateSubmissions}
                subtitle="Submitted after deadline"
                icon={AlertTriangle}
              />
              <InsightCard
                title="Total Violations"
                value={insightsData.complianceMetrics.totalViolations}
                subtitle="Violations issued"
                icon={AlertTriangle}
              />
            </div>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Visual Analytics
            </h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingAnalytics ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                  Quarterly Lobbying Expenses
                </h3>
                <QuarterlyExpensesChart
                  data={analyticsData.quarterlyExpenses}
                />
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                  Top 10 Employers by Spending
                </h3>
                <TopEmployersChart data={analyticsData.topEmployers} />
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                  Lobbyist Registration Growth
                </h3>
                <RegistrationGrowthChart
                  data={analyticsData.registrationGrowth}
                />
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Compliance Rate</h3>
                <ComplianceRateChart data={analyticsData.compliance} />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Rankings Tab */}
        <TabsContent value="rankings" className="space-y-8">
          {/* Spending Analysis */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Spending Analysis
            </h2>
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="Total Expenses"
                value={insightsData.spendingAnalysis.totalExpenses}
                subtitle="All reported expenses"
                icon={DollarSign}
                formatter={(v) => `$${v.toLocaleString()}`}
              />
              <InsightCard
                title="Average Expense"
                value={insightsData.spendingAnalysis.averageExpense}
                subtitle="Per expense item"
                icon={TrendingUp}
                formatter={(v) => `$${v.toLocaleString()}`}
              />
              <InsightCard
                title="Total Expense Items"
                value={insightsData.spendingAnalysis.expenseCount}
                subtitle="Number of line items"
                icon={FileText}
              />
              <InsightCard
                title="Average Per Lobbyist"
                value={insightsData.spendingAnalysis.avgPerLobbyist}
                subtitle="Total expenses / lobbyists"
                icon={DollarSign}
                formatter={(v) => `$${v.toLocaleString()}`}
              />
            </div>

            {/* Top Spenders Tables */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Employers */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Top 10 Employers</h3>
                {insightsData.spendingAnalysis.topEmployers.length > 0 ? (
                  <div className="space-y-2">
                    {insightsData.spendingAnalysis.topEmployers.map(
                      (employer, index) => (
                        <div
                          key={employer.name}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{employer.name}</span>
                          </div>
                          <span className="font-medium text-blue-800">
                            ${employer.total.toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No spending data available for selected period
                  </p>
                )}
              </div>

              {/* Top Lobbyists */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                  Top 10 Lobbyists by Expenses
                </h3>
                {insightsData.spendingAnalysis.topLobbyists.length > 0 ? (
                  <div className="space-y-2">
                    {insightsData.spendingAnalysis.topLobbyists.map(
                      (lobbyist, index) => (
                        <div
                          key={lobbyist.name}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{lobbyist.name}</span>
                          </div>
                          <span className="font-medium text-blue-800">
                            ${lobbyist.total.toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No expense data available for selected period
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-8">
          {/* Entity Counts */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Entity Counts
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="Total Employers"
                value={insightsData.entityCounts.employers}
                subtitle="Registered organizations"
                icon={Building2}
              />
              <InsightCard
                title="Active Board Members"
                value={insightsData.entityCounts.activeBoardMembers}
                subtitle="Currently serving"
                icon={Users}
              />
              <InsightCard
                title="Calendar Entries"
                value={insightsData.entityCounts.calendarEntries}
                subtitle="Board member events"
                icon={Calendar}
              />
              <InsightCard
                title="Total Reports"
                value={insightsData.entityCounts.totalReports}
                subtitle="Expense reports filed"
                icon={FileText}
              />
            </div>
          </div>

          {/* Quarterly Breakdown */}
          {insightsData.quarterlyBreakdown.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Quarterly Breakdown
              </h2>
              <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Quarter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total Expenses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Number of Reports
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {insightsData.quarterlyBreakdown.map((q) => (
                      <tr key={q.quarter}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {q.quarter}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          ${q.expenses.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {q.reports}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-gray-700">
            <p className="font-medium">About This Dashboard</p>
            <p className="mt-1">
              All metrics are calculated in real-time from submitted reports and
              registrations. Data reflects selected filters and time periods.
              Last updated: {new Date().toLocaleString()}.
            </p>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </>
  );
}
