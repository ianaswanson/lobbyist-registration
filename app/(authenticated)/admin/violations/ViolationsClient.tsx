"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Plus,
  Eye,
  FileText,
  DollarSign,
  Gavel,
  Loader2,
  User,
  Building2,
  Landmark,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EntitySearch } from "@/components/admin/EntitySearch";

const violationTypeLabels = {
  LATE_REGISTRATION: "Late Registration",
  LATE_REPORT: "Late Report",
  MISSING_REPORT: "Missing Report",
  FALSE_STATEMENT: "False Statement",
  PROHIBITED_CONDUCT: "Prohibited Conduct",
  MISSING_AUTHORIZATION: "Missing Authorization",
  OTHER: "Other",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ISSUED: "bg-destructive/20 text-red-800",
  APPEALED: "bg-purple-100 text-purple-800",
  UPHELD: "bg-destructive/20 text-red-800",
  OVERTURNED: "bg-success/20 text-success-foreground",
  PAID: "bg-success/20 text-success-foreground",
  WAIVED: "bg-primary/20 text-primary",
};

export function ViolationsClient() {
  const searchParams = useSearchParams();
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [violations, setViolations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [relatedReportContext, setRelatedReportContext] = useState<any>(null);
  const [loadingReportContext, setLoadingReportContext] = useState(false);

  // Form state for new violation
  const [newViolation, setNewViolation] = useState({
    entityType: "",
    entityId: "",
    violationType: "",
    description: "",
    fineAmount: "",
    sendEducationalLetter: false,
    sourceAlertId: "",
  });

  // Get icon based on entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "LOBBYIST":
        return <User className="h-4 w-4 text-blue-600" />;
      case "EMPLOYER":
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case "BOARD_MEMBER":
        return <Landmark className="h-4 w-4 text-green-600" />;
      case "LOBBYIST_REPORT":
      case "EMPLOYER_REPORT":
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get human-readable entity type label
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "LOBBYIST":
        return "Lobbyist";
      case "EMPLOYER":
        return "Employer";
      case "BOARD_MEMBER":
        return "Board Member";
      case "LOBBYIST_REPORT":
        return "Lobbyist Report";
      case "EMPLOYER_REPORT":
        return "Employer Report";
      default:
        return type;
    }
  };

  // Pre-fill form from URL params (from alert)
  useEffect(() => {
    const alertId = searchParams.get("alertId");
    const alertType = searchParams.get("alertType");
    const alertMessage = searchParams.get("alertMessage");
    const reportId = searchParams.get("reportId");
    const userId = searchParams.get("userId");

    if (alertId && alertType) {
      // Map alert type to violation type and entity type
      let violationType = "";
      let entityType = "";
      let suggestedFine = "";
      let description = alertMessage || "";

      if (alertType === "OVERDUE_REPORT") {
        violationType = "MISSING_REPORT";
        entityType = reportId ? "LOBBYIST_REPORT" : "LOBBYIST";
        suggestedFine = "100"; // Typical fine for late reports
        if (!description.includes("Report")) {
          description = `Quarterly report not submitted by deadline. ${description}`;
        }
      } else if (alertType === "MISSING_FIELDS") {
        violationType = "LATE_REPORT"; // Incomplete is similar to late
        entityType = reportId ? "LOBBYIST_REPORT" : "LOBBYIST";
        suggestedFine = "50"; // Lower fine for incomplete data
      } else if (alertType === "UNUSUAL_SPENDING") {
        violationType = "OTHER";
        entityType = reportId ? "LOBBYIST_REPORT" : "LOBBYIST";
        suggestedFine = "0"; // Typically starts as review/warning
        if (!description.includes("Unusual")) {
          description = `Unusual spending pattern detected. ${description}`;
        }
      }

      setNewViolation({
        entityType,
        entityId: reportId || userId || "",
        violationType,
        description,
        fineAmount: suggestedFine,
        sendEducationalLetter: suggestedFine === "0",
        sourceAlertId: alertId,
      });

      // Open the dialog automatically
      setIsIssueDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch report context when a report entity is selected
  useEffect(() => {
    const isReportEntity =
      newViolation.entityType === "LOBBYIST_REPORT" ||
      newViolation.entityType === "EMPLOYER_REPORT";

    if (isReportEntity && newViolation.entityId) {
      fetchReportContext(newViolation.entityType, newViolation.entityId);
    } else {
      setRelatedReportContext(null);
    }
  }, [newViolation.entityType, newViolation.entityId]);

  const fetchReportContext = async (entityType: string, reportId: string) => {
    setLoadingReportContext(true);
    try {
      const endpoint =
        entityType === "LOBBYIST_REPORT"
          ? `/api/reports/lobbyist/${reportId}`
          : `/api/reports/employer/${reportId}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const report = await response.json();
        setRelatedReportContext({
          quarter: report.quarter,
          year: report.year,
          dueDate: new Date(report.dueDate),
          status: report.status,
          submittedAt: report.submittedAt
            ? new Date(report.submittedAt)
            : null,
          entityName:
            entityType === "LOBBYIST_REPORT"
              ? report.lobbyist?.name
              : report.employer?.name,
        });
      }
    } catch (error) {
      console.error("Error fetching report context:", error);
    } finally {
      setLoadingReportContext(false);
    }
  };

  // Fetch violations and summary on mount
  useEffect(() => {
    fetchViolations();
    fetchSummary();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch("/api/violations");
      if (response.ok) {
        const data = await response.json();
        setViolations(data);
      }
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/violations/summary");
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleIssueViolation = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/violations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType: newViolation.entityType,
          entityId: newViolation.entityId,
          violationType: newViolation.violationType,
          description: newViolation.description,
          fineAmount: newViolation.fineAmount
            ? parseFloat(newViolation.fineAmount)
            : 0,
          sendEducationalLetter: newViolation.sendEducationalLetter,
          sourceAlertId: newViolation.sourceAlertId || undefined,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Violation issued successfully!" });
        setIsIssueDialogOpen(false);
        setNewViolation({
          entityType: "",
          entityId: "",
          violationType: "",
          description: "",
          fineAmount: "",
          sendEducationalLetter: false,
          sourceAlertId: "",
        });
        // Refresh data
        fetchViolations();
        fetchSummary();

        // Clear URL params and navigate to clean violations page
        if (newViolation.sourceAlertId) {
          window.history.replaceState({}, "", "/admin/violations");
        }

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to issue violation",
        });
      }
    } catch (error) {
      console.error("Error issuing violation:", error);
      setMessage({
        type: "error",
        text: "Error issuing violation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (violation: any) => {
    setSelectedViolation(violation);
    setIsDetailsDialogOpen(true);
  };

  const filterViolationsByStatus = (status: string) => {
    if (status === "all") return violations;
    return violations.filter((v) => v.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading violations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Violation Tracking & Enforcement
          </h1>
          <p className="text-muted-foreground">
            Monitor compliance violations, issue fines, and track appeals per
            §3.808
          </p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert
          className={`mb-6 ${
            message.type === "success"
              ? "border-success/30 bg-success/10"
              : "border-red-200 bg-destructive/10"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 ${
              message.type === "success" ? "text-success" : "text-destructive"
            }`}
          />
          <AlertTitle
            className={
              message.type === "success" ? "text-success-foreground" : "text-red-800"
            }
          >
            {message.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription
            className={
              message.type === "success" ? "text-success" : "text-destructive"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8 flex justify-end">
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Issue Violation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Issue New Violation</DialogTitle>
              <DialogDescription>
                Record a violation and optionally issue a fine (up to $500) or
                send an educational letter.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entity-search">Who is this violation for?</Label>
                <EntitySearch
                  value={
                    newViolation.entityType && newViolation.entityId
                      ? {
                          entityType: newViolation.entityType,
                          entityId: newViolation.entityId,
                        }
                      : undefined
                  }
                  onChange={(selected) =>
                    setNewViolation({
                      ...newViolation,
                      entityType: selected.entityType,
                      entityId: selected.entityId,
                    })
                  }
                  placeholder="Search for a person or report..."
                />
                <p className="text-xs text-muted-foreground">
                  Search by name, email, or report details
                </p>
              </div>

              {/* Report Context Display */}
              {loadingReportContext && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Loading Report Details...</AlertTitle>
                </Alert>
              )}

              {relatedReportContext && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Report Context</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 text-sm mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <strong>Entity:</strong> {relatedReportContext.entityName}
                        </div>
                        <div>
                          <strong>Period:</strong> {relatedReportContext.quarter}{" "}
                          {relatedReportContext.year}
                        </div>
                        <div>
                          <strong>Due Date:</strong>{" "}
                          {relatedReportContext.dueDate.toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          <Badge variant="outline" className="ml-1">
                            {relatedReportContext.status}
                          </Badge>
                        </div>
                        {relatedReportContext.submittedAt && (
                          <div className="col-span-2">
                            <strong>Submitted:</strong>{" "}
                            {relatedReportContext.submittedAt.toLocaleDateString()}
                          </div>
                        )}
                        {!relatedReportContext.submittedAt &&
                          relatedReportContext.status === "OVERDUE" && (
                            <div className="col-span-2 text-destructive">
                              <strong>Days Overdue:</strong>{" "}
                              {Math.floor(
                                (new Date().getTime() -
                                  relatedReportContext.dueDate.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days
                            </div>
                          )}
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <a
                          href={`/admin/reports/${newViolation.entityId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          View Full Report <Eye className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="violation-type">Violation Type</Label>
                <Select
                  value={newViolation.violationType}
                  onValueChange={(value) =>
                    setNewViolation({ ...newViolation, violationType: value })
                  }
                >
                  <SelectTrigger id="violation-type">
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LATE_REGISTRATION">
                      Late Registration (more than 3 days)
                    </SelectItem>
                    <SelectItem value="LATE_REPORT">
                      Late Report Submission
                    </SelectItem>
                    <SelectItem value="MISSING_REPORT">
                      Missing Report
                    </SelectItem>
                    <SelectItem value="FALSE_STATEMENT">
                      False Statement
                    </SelectItem>
                    <SelectItem value="PROHIBITED_CONDUCT">
                      Prohibited Conduct
                    </SelectItem>
                    <SelectItem value="MISSING_AUTHORIZATION">
                      Missing Authorization
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newViolation.description}
                  onChange={(e) =>
                    setNewViolation({
                      ...newViolation,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the violation in detail..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fine-amount">Fine Amount (up to $500)</Label>

                {/* Quick-select buttons based on violation type */}
                {newViolation.violationType && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <p className="text-xs text-muted-foreground w-full mb-1">
                      Suggested amounts for {violationTypeLabels[newViolation.violationType as keyof typeof violationTypeLabels]}:
                    </p>
                    {newViolation.violationType === "LATE_REPORT" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "50" })
                          }
                        >
                          $50 (Minor delay)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "100" })
                          }
                        >
                          $100 (Standard)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "200" })
                          }
                        >
                          $200 (Repeated)
                        </Button>
                      </>
                    )}
                    {newViolation.violationType === "MISSING_REPORT" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "100" })
                          }
                        >
                          $100 (First offense)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "250" })
                          }
                        >
                          $250 (Repeated)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "500" })
                          }
                        >
                          $500 (Maximum)
                        </Button>
                      </>
                    )}
                    {newViolation.violationType === "LATE_REGISTRATION" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "150" })
                          }
                        >
                          $150 (1-5 days late)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "300" })
                          }
                        >
                          $300 (6-14 days)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "500" })
                          }
                        >
                          $500 (15+ days)
                        </Button>
                      </>
                    )}
                    {newViolation.violationType === "FALSE_STATEMENT" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "250" })
                          }
                        >
                          $250 (Minor error)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "500" })
                          }
                        >
                          $500 (Intentional)
                        </Button>
                      </>
                    )}
                    {(newViolation.violationType === "PROHIBITED_CONDUCT" ||
                      newViolation.violationType === "MISSING_AUTHORIZATION") && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "200" })
                          }
                        >
                          $200 (First offense)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "350" })
                          }
                        >
                          $350 (Repeated)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "500" })
                          }
                        >
                          $500 (Serious)
                        </Button>
                      </>
                    )}
                    {newViolation.violationType === "OTHER" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "0" })
                          }
                        >
                          $0 (Warning only)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "100" })
                          }
                        >
                          $100 (Minor)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewViolation({ ...newViolation, fineAmount: "250" })
                          }
                        >
                          $250 (Moderate)
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    id="fine-amount"
                    type="number"
                    min="0"
                    max="500"
                    step="25"
                    value={newViolation.fineAmount}
                    onChange={(e) =>
                      setNewViolation({
                        ...newViolation,
                        fineAmount: e.target.value,
                      })
                    }
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Leave at $0 to issue warning/educational letter only. Per §3.808, fines may not exceed $500.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="educational-letter"
                  checked={newViolation.sendEducationalLetter}
                  onChange={(e) =>
                    setNewViolation({
                      ...newViolation,
                      sendEducationalLetter: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="educational-letter"
                  className="cursor-pointer text-sm font-normal"
                >
                  Send educational letter instead of fine (first-time
                  violations)
                </Label>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ordinance Compliance</AlertTitle>
                <AlertDescription>
                  Per §3.808, fines may not exceed $500. Initial implementation
                  supports educational letters for first-time violations.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsIssueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleIssueViolation}
                disabled={
                  isSubmitting ||
                  !newViolation.entityType ||
                  !newViolation.violationType ||
                  !newViolation.description
                }
              >
                {isSubmitting ? "Issuing..." : "Issue Violation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Violations
            </CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalViolations || 0}
            </div>
            <p className="text-muted-foreground text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Violations
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.activeViolations || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              ${summary?.totalFines || 0} total fines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Appeals
            </CardTitle>
            <Gavel className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.pendingAppeals || 0}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fines Collected
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.paidFines || 0}</div>
            <p className="text-muted-foreground text-xs">
              Average: ${summary?.averageFine || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violations Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Records</CardTitle>
          <CardDescription>
            Track and manage all compliance violations and enforcement actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Violations</TabsTrigger>
              <TabsTrigger value="ISSUED">Active Fines</TabsTrigger>
              <TabsTrigger value="APPEALED">Under Appeal</TabsTrigger>
              <TabsTrigger value="WAIVED">Waived</TabsTrigger>
              <TabsTrigger value="PAID">Paid</TabsTrigger>
            </TabsList>

            {["all", "ISSUED", "APPEALED", "WAIVED", "PAID"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Fine Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterViolationsByStatus(tab).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-muted-foreground py-8 text-center"
                        >
                          No violations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filterViolationsByStatus(tab).map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEntityIcon(violation.entityType)}
                              <div>
                                <div className="font-medium">
                                  {violation.entityName || "Unknown Entity"}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {getEntityTypeLabel(violation.entityType)}
                                  {violation.entityEmail && (
                                    <span> • {violation.entityEmail}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {
                                violationTypeLabels[
                                  violation.violationType as keyof typeof violationTypeLabels
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {violation.description}
                          </TableCell>
                          <TableCell>
                            {violation.fineAmount > 0 ? (
                              <span className="font-semibold">
                                ${violation.fineAmount}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                $0 (Warning)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColors[
                                  violation.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {violation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {violation.issuedDate
                              ? new Date(
                                  violation.issuedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(violation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Violation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Violation Details</DialogTitle>
            <DialogDescription>
              Full violation record and enforcement history
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Entity
                  </Label>
                  <p className="font-medium">{selectedViolation.entityType}</p>
                  <p className="text-muted-foreground text-sm">
                    ID: {selectedViolation.entityId}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Violation Type
                  </Label>
                  <p className="font-medium">
                    {
                      violationTypeLabels[
                        selectedViolation.violationType as keyof typeof violationTypeLabels
                      ]
                    }
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">
                  Description
                </Label>
                <p className="mt-1">{selectedViolation.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Fine Amount
                  </Label>
                  <p className="text-lg font-semibold">
                    ${selectedViolation.fineAmount}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Status
                  </Label>
                  <Badge
                    className={`mt-1 ${statusColors[selectedViolation.status as keyof typeof statusColors]}`}
                  >
                    {selectedViolation.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Issued Date
                  </Label>
                  <p>
                    {selectedViolation.issuedDate
                      ? new Date(
                          selectedViolation.issuedDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedViolation.appeals &&
                selectedViolation.appeals.length > 0 && (
                  <Alert>
                    <Gavel className="h-4 w-4" />
                    <AlertTitle>Appeal Active</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          This violation has {selectedViolation.appeals.length}{" "}
                          appeal(s).
                        </p>
                        {selectedViolation.appeals.map((appeal: any) => (
                          <div
                            key={appeal.id}
                            className="mt-2 border-t pt-2 text-sm"
                          >
                            <div>
                              <strong>Status:</strong> {appeal.status}
                            </div>
                            <div>
                              <strong>Submitted:</strong>{" "}
                              {new Date(
                                appeal.submittedDate
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Deadline:</strong>{" "}
                              {new Date(
                                appeal.appealDeadline
                              ).toLocaleDateString()}
                            </div>
                            {appeal.decision && (
                              <div className="mt-2">
                                <strong>Decision:</strong> {appeal.decision}
                              </div>
                            )}
                          </div>
                        ))}
                        <a
                          href="/admin/appeals"
                          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                        >
                          View in Appeals Dashboard →
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

              {selectedViolation.isFirstTimeViolation && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>First-Time Violation</AlertTitle>
                  <AlertDescription>
                    Educational letter sent instead of fine
                  </AlertDescription>
                </Alert>
              )}

              {selectedViolation.resolutionNotes && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Resolution Notes</AlertTitle>
                  <AlertDescription>
                    {selectedViolation.resolutionNotes}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
