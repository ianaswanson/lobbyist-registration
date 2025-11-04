"use client";

import { AlertType, AlertSeverity } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Info, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface AlertCardProps {
  alert: {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    createdAt: Date;
    relatedReportId?: string | null;
    relatedUserId?: string | null;
  };
  onReview: (id: string) => Promise<void>;
}

export function AlertCard({ alert, onReview }: AlertCardProps) {
  const router = useRouter();

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "MEDIUM":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "LOW":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: AlertType) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Determine if this alert type can lead to a violation
  const isActionableAlert = (type: AlertType) => {
    return ["OVERDUE_REPORT", "MISSING_FIELDS", "UNUSUAL_SPENDING"].includes(
      type
    );
  };

  const handleIssueViolation = () => {
    // Navigate to violations page with alert context as URL params
    const params = new URLSearchParams({
      alertId: alert.id,
      alertType: alert.type,
      alertMessage: alert.message,
      ...(alert.relatedReportId && { reportId: alert.relatedReportId }),
      ...(alert.relatedUserId && { userId: alert.relatedUserId }),
    });
    router.push(`/admin/violations?${params.toString()}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <CardTitle className="text-base font-medium">
                {getTypeLabel(alert.type)}
              </CardTitle>
              <CardDescription className="text-sm">
                {new Date(alert.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {isActionableAlert(alert.type) && (
            <Button
              size="sm"
              variant="default"
              onClick={handleIssueViolation}
              className="gap-2"
            >
              <Gavel className="h-4 w-4" />
              Issue Violation
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(alert.id)}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Reviewed
          </Button>
          {alert.relatedReportId && (
            <Button size="sm" variant="ghost" asChild>
              <a href={`/admin/reports/${alert.relatedReportId}`}>
                View Report
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
