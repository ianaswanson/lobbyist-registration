"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle, Plus, Eye, FileText, DollarSign, Gavel } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  ISSUED: "bg-red-100 text-red-800",
  APPEALED: "bg-purple-100 text-purple-800",
  UPHELD: "bg-red-100 text-red-800",
  OVERTURNED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  WAIVED: "bg-blue-100 text-blue-800",
};

export function ViolationsClient() {
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [violations, setViolations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new violation
  const [newViolation, setNewViolation] = useState({
    entityType: "",
    entityId: "",
    violationType: "",
    description: "",
    fineAmount: "",
    sendEducationalLetter: false,
  });

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
          fineAmount: newViolation.fineAmount ? parseFloat(newViolation.fineAmount) : 0,
          sendEducationalLetter: newViolation.sendEducationalLetter,
        }),
      });

      if (response.ok) {
        alert("Violation issued successfully!");
        setIsIssueDialogOpen(false);
        setNewViolation({
          entityType: "",
          entityId: "",
          violationType: "",
          description: "",
          fineAmount: "",
          sendEducationalLetter: false,
        });
        // Refresh data
        fetchViolations();
        fetchSummary();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to issue violation"}`);
      }
    } catch (error) {
      console.error("Error issuing violation:", error);
      alert("Error issuing violation. Please try again.");
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading violations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Violation Tracking & Enforcement
          </h1>
          <p className="text-muted-foreground">
            Monitor compliance violations, issue fines, and track appeals per §3.808
          </p>
        </div>

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
                Record a violation and optionally issue a fine (up to $500) or send an educational letter.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select
                    value={newViolation.entityType}
                    onValueChange={(value) =>
                      setNewViolation({ ...newViolation, entityType: value })
                    }
                  >
                    <SelectTrigger id="entity-type">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOBBYIST">Lobbyist</SelectItem>
                      <SelectItem value="EMPLOYER">Employer</SelectItem>
                      <SelectItem value="LOBBYIST_REPORT">Lobbyist Report</SelectItem>
                      <SelectItem value="EMPLOYER_REPORT">Employer Report</SelectItem>
                      <SelectItem value="BOARD_MEMBER">Board Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity-id">Entity / Report ID</Label>
                  <Input
                    id="entity-id"
                    value={newViolation.entityId}
                    onChange={(e) =>
                      setNewViolation({ ...newViolation, entityId: e.target.value })
                    }
                    placeholder="Enter entity ID"
                  />
                </div>
              </div>

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
                    <SelectItem value="LATE_REGISTRATION">Late Registration (more than 3 days)</SelectItem>
                    <SelectItem value="LATE_REPORT">Late Report Submission</SelectItem>
                    <SelectItem value="MISSING_REPORT">Missing Report</SelectItem>
                    <SelectItem value="FALSE_STATEMENT">False Statement</SelectItem>
                    <SelectItem value="PROHIBITED_CONDUCT">Prohibited Conduct</SelectItem>
                    <SelectItem value="MISSING_AUTHORIZATION">Missing Authorization</SelectItem>
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
                    setNewViolation({ ...newViolation, description: e.target.value })
                  }
                  placeholder="Describe the violation in detail..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fine-amount">Fine Amount (up to $500)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                      setNewViolation({ ...newViolation, fineAmount: e.target.value })
                    }
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave at $0 to issue warning/educational letter only
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
                <Label htmlFor="educational-letter" className="text-sm font-normal cursor-pointer">
                  Send educational letter instead of fine (first-time violations)
                </Label>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ordinance Compliance</AlertTitle>
                <AlertDescription>
                  Per §3.808, fines may not exceed $500. Initial implementation supports educational
                  letters for first-time violations.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
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
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalViolations || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.activeViolations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ${summary?.totalFines || 0} total fines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.pendingAppeals || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fines Collected</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.paidFines || 0}
            </div>
            <p className="text-xs text-muted-foreground">Average: ${summary?.averageFine || 0}</p>
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
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No violations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filterViolationsByStatus(tab).map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{violation.entityType}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {violation.entityId.substring(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {violationTypeLabels[violation.violationType as keyof typeof violationTypeLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {violation.description}
                          </TableCell>
                          <TableCell>
                            {violation.fineAmount > 0 ? (
                              <span className="font-semibold">${violation.fineAmount}</span>
                            ) : (
                              <span className="text-muted-foreground">$0 (Warning)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={statusColors[violation.status as keyof typeof statusColors]}
                            >
                              {violation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {violation.issuedDate ? new Date(violation.issuedDate).toLocaleDateString() : 'N/A'}
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
                  <Label className="text-sm text-muted-foreground">Entity</Label>
                  <p className="font-medium">{selectedViolation.entityType}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedViolation.entityId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Violation Type</Label>
                  <p className="font-medium">
                    {violationTypeLabels[selectedViolation.violationType as keyof typeof violationTypeLabels]}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedViolation.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Fine Amount</Label>
                  <p className="font-semibold text-lg">
                    ${selectedViolation.fineAmount}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${statusColors[selectedViolation.status as keyof typeof statusColors]}`}>
                    {selectedViolation.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Issued Date</Label>
                  <p>{selectedViolation.issuedDate ? new Date(selectedViolation.issuedDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {selectedViolation.appeals && selectedViolation.appeals.length > 0 && (
                <Alert>
                  <Gavel className="h-4 w-4" />
                  <AlertTitle>Appeal Active</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>This violation has {selectedViolation.appeals.length} appeal(s).</p>
                      {selectedViolation.appeals.map((appeal: any) => (
                        <div key={appeal.id} className="text-sm border-t pt-2 mt-2">
                          <div><strong>Status:</strong> {appeal.status}</div>
                          <div><strong>Submitted:</strong> {new Date(appeal.submittedDate).toLocaleDateString()}</div>
                          <div><strong>Deadline:</strong> {new Date(appeal.appealDeadline).toLocaleDateString()}</div>
                          {appeal.decision && (
                            <div className="mt-2">
                              <strong>Decision:</strong> {appeal.decision}
                            </div>
                          )}
                        </div>
                      ))}
                      <a
                        href="/admin/appeals"
                        className="text-blue-600 hover:underline text-sm font-medium inline-block mt-2"
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
                  <AlertDescription>Educational letter sent instead of fine</AlertDescription>
                </Alert>
              )}

              {selectedViolation.resolutionNotes && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Resolution Notes</AlertTitle>
                  <AlertDescription>{selectedViolation.resolutionNotes}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
