"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuarterlyExpensesChart } from "@/components/analytics/QuarterlyExpensesChart";
import { TopEmployersChart } from "@/components/analytics/TopEmployersChart";
import { RegistrationGrowthChart } from "@/components/analytics/RegistrationGrowthChart";
import { ComplianceRateChart } from "@/components/analytics/ComplianceRateChart";
import { Download, TrendingUp, Users, FileText, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  quarterlyExpenses: Array<{ quarter: string; total: number }>;
  topEmployers: Array<{ name: string; total: number }>;
  registrationGrowth: Array<{ month: string; count: number }>;
  compliance: { onTime: number; late: number; rate: number };
  summary: {
    totalLobbyists: number;
    totalEmployers: number;
    totalReports: number;
    totalExpenses: number;
    timeRange: string;
  };
  generatedAt: string;
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all_time");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/analytics?timeRange=${timeRange}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    // Prepare CSV data
    let csvContent = "Multnomah County Lobbying Analytics\n\n";
    csvContent += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csvContent += `Time Range: ${timeRange.replace("_", " ").toUpperCase()}\n\n`;

    // Summary statistics
    csvContent += "SUMMARY STATISTICS\n";
    csvContent += `Total Lobbyists,${data.summary.totalLobbyists}\n`;
    csvContent += `Total Employers,${data.summary.totalEmployers}\n`;
    csvContent += `Total Reports,${data.summary.totalReports}\n`;
    csvContent += `Total Expenses,$${data.summary.totalExpenses.toLocaleString()}\n\n`;

    // Quarterly expenses
    csvContent += "QUARTERLY EXPENSES\n";
    csvContent += "Quarter,Total Expenses\n";
    data.quarterlyExpenses.forEach((item) => {
      csvContent += `${item.quarter},$${item.total}\n`;
    });
    csvContent += "\n";

    // Top employers
    csvContent += "TOP EMPLOYERS BY SPENDING\n";
    csvContent += "Employer Name,Total Spending\n";
    data.topEmployers.forEach((item) => {
      csvContent += `"${item.name}",$${item.total}\n`;
    });
    csvContent += "\n";

    // Compliance
    csvContent += "COMPLIANCE RATE\n";
    csvContent += `On-Time Submissions,${data.compliance.onTime}\n`;
    csvContent += `Late Submissions,${data.compliance.late}\n`;
    csvContent += `Compliance Rate,${data.compliance.rate}%\n`;

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lobbying-analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
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
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="timeRange" className="text-sm font-medium">
            Time Range:
          </label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lobbyists
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalLobbyists}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employers
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalEmployers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalReports}
            </div>
            <p className="text-xs text-muted-foreground">Expense reports filed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.summary.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Reported lobbying expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quarterly Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Lobbying Expenses</CardTitle>
            <p className="text-sm text-gray-600">
              Total lobbying expenses by quarter over time
            </p>
          </CardHeader>
          <CardContent>
            {data.quarterlyExpenses.length > 0 ? (
              <QuarterlyExpensesChart data={data.quarterlyExpenses} />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-500">
                No data available for selected time range
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Employers by Spending</CardTitle>
            <p className="text-sm text-gray-600">
              Organizations with highest reported lobbying expenses
            </p>
          </CardHeader>
          <CardContent>
            {data.topEmployers.length > 0 ? (
              <TopEmployersChart data={data.topEmployers} />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-500">
                No data available for selected time range
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Lobbyist Registration Growth</CardTitle>
            <p className="text-sm text-gray-600">
              Cumulative growth of registered lobbyists over time
            </p>
          </CardHeader>
          <CardContent>
            {data.registrationGrowth.length > 0 ? (
              <RegistrationGrowthChart data={data.registrationGrowth} />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-500">
                No data available for selected time range
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Report Compliance Rate</CardTitle>
            <p className="text-sm text-gray-600">
              On-time vs late expense report submissions
            </p>
          </CardHeader>
          <CardContent>
            {data.compliance.onTime + data.compliance.late > 0 ? (
              <ComplianceRateChart data={data.compliance} />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-500">
                No data available for selected time range
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-gray-700">
        <p className="font-medium">About This Data</p>
        <p className="mt-1">
          Analytics are updated automatically based on submitted expense reports
          and registrations. Data reflects all approved submissions as of{" "}
          {new Date(data.generatedAt).toLocaleString()}.
        </p>
      </div>
    </div>
  );
}
