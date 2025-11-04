"use client";

import { useEffect, useState } from "react";
import { AlertType, AlertSeverity } from "@prisma/client";
import { AlertCard } from "./AlertCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  createdAt: Date;
  relatedReportId?: string | null;
  relatedUserId?: string | null;
}

interface AlertCounts {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const response = await fetch(`/api/admin/alerts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAlerts(data.alerts);
        setCounts(data.counts);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch alerts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/admin/alerts/generate", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Alerts Generated",
          description: data.message,
        });
        await fetchAlerts(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate alerts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate alerts",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const reviewAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${id}/review`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Alert Reviewed",
          description: "Alert has been marked as reviewed",
        });
        await fetchAlerts(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to review alert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Active</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{counts.high}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-muted-foreground">Medium Priority</p>
          <p className="text-2xl font-bold text-orange-600">{counts.medium}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-muted-foreground">Low Priority</p>
          <p className="text-2xl font-bold text-blue-600">{counts.low}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="UNUSUAL_SPENDING">Unusual Spending</SelectItem>
              <SelectItem value="DUPLICATE_ENTRY">Duplicate Entry</SelectItem>
              <SelectItem value="OVERDUE_REPORT">Overdue Report</SelectItem>
              <SelectItem value="MISSING_FIELDS">Missing Fields</SelectItem>
              <SelectItem value="ROUND_NUMBER_PATTERN">
                Round Numbers
              </SelectItem>
              <SelectItem value="FIRST_TIME_FILER">First Time Filer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchAlerts}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={generateAlerts}
            variant="default"
            size="sm"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Run Compliance Check"
            )}
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-muted-foreground">
            No active alerts. Click "Run Compliance Check" to scan for issues.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onReview={reviewAlert} />
          ))}
        </div>
      )}
    </div>
  );
}
