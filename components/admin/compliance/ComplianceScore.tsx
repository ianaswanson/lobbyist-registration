"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComplianceMetrics {
  onTimeSubmissionRate: number;
  totalReportsThisQuarter: number;
  lateReports: number;
  overdueReports: number;
  activeViolations: number;
  trend: "up" | "down" | "stable";
}

export function ComplianceScore() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/compliance/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch compliance metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overall Compliance</span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className="text-center">
          <div
            className={`text-5xl font-bold ${getScoreColor(metrics.onTimeSubmissionRate)}`}
          >
            {metrics.onTimeSubmissionRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            On-Time Submission Rate
          </p>
          <Progress
            value={metrics.onTimeSubmissionRate}
            className="mt-3"
            indicatorClassName={getProgressColor(metrics.onTimeSubmissionRate)}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {metrics.totalReportsThisQuarter}
            </p>
            <p className="text-xs text-muted-foreground">Reports Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {metrics.lateReports}
            </p>
            <p className="text-xs text-muted-foreground">Late Submissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {metrics.overdueReports}
            </p>
            <p className="text-xs text-muted-foreground">Overdue Reports</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {metrics.activeViolations}
            </p>
            <p className="text-xs text-muted-foreground">Active Violations</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
