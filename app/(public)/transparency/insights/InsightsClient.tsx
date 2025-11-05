"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export function InsightsClient() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all");
  const [quarter, setQuarter] = useState("all");
  const [entityType, setEntityType] = useState("all");

  useEffect(() => {
    fetchInsights();
  }, [year, quarter, entityType]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/insights?year=${year}&quarter=${quarter}&entityType=${entityType}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    let csvContent = "Multnomah County Lobbying Insights\n\n";
    csvContent += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csvContent += `Filters: Year=${year}, Quarter=${quarter}, Entity Type=${entityType}\n\n`;

    // Registration Summary
    csvContent += "REGISTRATION SUMMARY\n";
    csvContent += `Total Lobbyists,${data.registrationSummary.total}\n`;
    csvContent += `Active Lobbyists,${data.registrationSummary.active}\n`;
    csvContent += `Inactive Lobbyists,${data.registrationSummary.inactive}\n`;
    csvContent += `Pending Registrations,${data.registrationSummary.pending}\n`;
    csvContent += `Registration Trend,${data.registrationSummary.trend}%\n\n`;

    // Spending Analysis
    csvContent += "SPENDING ANALYSIS\n";
    csvContent += `Total Expenses,$${data.spendingAnalysis.totalExpenses.toLocaleString()}\n`;
    csvContent += `Average Expense,$${data.spendingAnalysis.averageExpense.toLocaleString()}\n`;
    csvContent += `Total Expense Items,${data.spendingAnalysis.expenseCount}\n`;
    csvContent += `Average Per Lobbyist,$${data.spendingAnalysis.avgPerLobbyist.toLocaleString()}\n\n`;

    // Top Employers
    csvContent += "TOP 10 EMPLOYERS BY SPENDING\n";
    csvContent += "Rank,Employer Name,Total Spending\n";
    data.spendingAnalysis.topEmployers.forEach((employer, index) => {
      csvContent += `${index + 1},"${employer.name}",$${employer.total.toLocaleString()}\n`;
    });
    csvContent += "\n";

    // Top Lobbyists
    csvContent += "TOP 10 LOBBYISTS BY EXPENSES\n";
    csvContent += "Rank,Lobbyist Name,Total Expenses\n";
    data.spendingAnalysis.topLobbyists.forEach((lobbyist, index) => {
      csvContent += `${index + 1},"${lobbyist.name}",$${lobbyist.total.toLocaleString()}\n`;
    });
    csvContent += "\n";

    // Compliance Metrics
    csvContent += "COMPLIANCE METRICS\n";
    csvContent += `On-Time Submissions,${data.complianceMetrics.onTimeSubmissions}\n`;
    csvContent += `Late Submissions,${data.complianceMetrics.lateSubmissions}\n`;
    csvContent += `On-Time Rate,${data.complianceMetrics.onTimeRate}%\n`;
    csvContent += `Total Violations,${data.complianceMetrics.totalViolations}\n\n`;

    // Quarterly Breakdown
    csvContent += "QUARTERLY BREAKDOWN\n";
    csvContent += "Quarter,Total Expenses,Number of Reports\n";
    data.quarterlyBreakdown.forEach((q) => {
      csvContent += `${q.quarter},$${q.expenses.toLocaleString()},${q.reports}\n`;
    });

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lobbying-insights-${year}-${quarter}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="year" className="text-sm font-medium">
              Year:
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="quarter" className="text-sm font-medium">
              Quarter:
            </label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger id="quarter" className="w-[120px]">
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
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="entityType" className="text-sm font-medium">
              Entity:
            </label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger id="entityType" className="w-[140px]">
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

        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Registration Summary */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Registration Summary
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            title="Total Lobbyists"
            value={data.registrationSummary.total}
            subtitle="Registered in period"
            trend={data.registrationSummary.trend}
            icon={Users}
          />
          <InsightCard
            title="Active Lobbyists"
            value={data.registrationSummary.active}
            subtitle="Currently approved"
            icon={Users}
          />
          <InsightCard
            title="Inactive Lobbyists"
            value={data.registrationSummary.inactive}
            subtitle="No longer active"
            icon={Users}
          />
          <InsightCard
            title="Pending Registrations"
            value={data.registrationSummary.pending}
            subtitle="Awaiting review"
            icon={FileText}
          />
        </div>
      </div>

      {/* Spending Analysis */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Spending Analysis
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            title="Total Expenses"
            value={data.spendingAnalysis.totalExpenses}
            subtitle="All reported expenses"
            icon={DollarSign}
            formatter={(v) => `$${v.toLocaleString()}`}
          />
          <InsightCard
            title="Average Expense"
            value={data.spendingAnalysis.averageExpense}
            subtitle="Per expense item"
            icon={TrendingUp}
            formatter={(v) => `$${v.toLocaleString()}`}
          />
          <InsightCard
            title="Total Expense Items"
            value={data.spendingAnalysis.expenseCount}
            subtitle="Number of line items"
            icon={FileText}
          />
          <InsightCard
            title="Average Per Lobbyist"
            value={data.spendingAnalysis.avgPerLobbyist}
            subtitle="Total expenses / lobbyists"
            icon={DollarSign}
            formatter={(v) => `$${v.toLocaleString()}`}
          />
        </div>

        {/* Top Spenders Tables */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Top Employers */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Top 10 Employers</h3>
            {data.spendingAnalysis.topEmployers.length > 0 ? (
              <div className="space-y-2">
                {data.spendingAnalysis.topEmployers.map((employer, index) => (
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
                ))}
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
            {data.spendingAnalysis.topLobbyists.length > 0 ? (
              <div className="space-y-2">
                {data.spendingAnalysis.topLobbyists.map((lobbyist, index) => (
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No expense data available for selected period
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Compliance Metrics
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            title="On-Time Rate"
            value={`${data.complianceMetrics.onTimeRate}%`}
            subtitle="Reports submitted on time"
            icon={TrendingUp}
          />
          <InsightCard
            title="On-Time Submissions"
            value={data.complianceMetrics.onTimeSubmissions}
            subtitle="Submitted before deadline"
            icon={FileText}
          />
          <InsightCard
            title="Late Submissions"
            value={data.complianceMetrics.lateSubmissions}
            subtitle="Submitted after deadline"
            icon={AlertTriangle}
          />
          <InsightCard
            title="Total Violations"
            value={data.complianceMetrics.totalViolations}
            subtitle="Violations issued"
            icon={AlertTriangle}
          />
        </div>
      </div>

      {/* Entity Counts */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Entity Counts
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            title="Total Employers"
            value={data.entityCounts.employers}
            subtitle="Registered organizations"
            icon={Building2}
          />
          <InsightCard
            title="Active Board Members"
            value={data.entityCounts.activeBoardMembers}
            subtitle="Currently serving"
            icon={Users}
          />
          <InsightCard
            title="Calendar Entries"
            value={data.entityCounts.calendarEntries}
            subtitle="Board member events"
            icon={Calendar}
          />
          <InsightCard
            title="Total Reports"
            value={data.entityCounts.totalReports}
            subtitle="Expense reports filed"
            icon={FileText}
          />
        </div>
      </div>

      {/* Quarterly Breakdown */}
      {data.quarterlyBreakdown.length > 0 && (
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
                {data.quarterlyBreakdown.map((q) => (
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
        <p className="font-medium">About These Insights</p>
        <p className="mt-1">
          All metrics are calculated in real-time from submitted reports and
          registrations. Data reflects the selected time period and entity type
          filters. Generated at {new Date(data.generatedAt).toLocaleString()}.
        </p>
      </div>
    </div>
  );
}
