"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Gavel, Calendar, CheckCircle, XCircle, Clock, FileText } from "lucide-react"

const violationTypeLabels: Record<string, string> = {
  LATE_REGISTRATION: "Late Registration",
  LATE_REPORT: "Late Report",
  MISSING_REPORT: "Missing Report",
  FALSE_STATEMENT: "False Statement",
  PROHIBITED_CONDUCT: "Prohibited Conduct",
  MISSING_AUTHORIZATION: "Missing Authorization",
  OTHER: "Other",
}

const appealStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  DECIDED: "bg-gray-100 text-gray-800",
}

export function AppealsClient() {
  const [appeals, setAppeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null)
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false)
  const [decisionText, setDecisionText] = useState("")
  const [decisionOutcome, setDecisionOutcome] = useState<"UPHELD" | "OVERTURNED" | null>(null)
  const [hearingDate, setHearingDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAppeals()
  }, [])

  const fetchAppeals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/appeals")
      if (response.ok) {
        const data = await response.json()
        setAppeals(data)
      }
    } catch (error) {
      console.error("Error fetching appeals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleHearing = async (appealId: string) => {
    if (!hearingDate) {
      alert("Please select a hearing date")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/appeals/${appealId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "SCHEDULED",
          hearingDate,
        }),
      })

      if (response.ok) {
        alert("Hearing scheduled successfully!")
        setHearingDate("")
        setReviewDialogOpen(false)
        fetchAppeals()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to schedule hearing"}`)
      }
    } catch (error) {
      console.error("Error scheduling hearing:", error)
      alert("Error scheduling hearing. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecideAppeal = async () => {
    if (!selectedAppeal || !decisionOutcome || !decisionText.trim()) {
      alert("Please provide both outcome and decision text")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/appeals/${selectedAppeal.id}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outcome: decisionOutcome,
          decision: decisionText,
        }),
      })

      if (response.ok) {
        alert(`Appeal ${decisionOutcome.toLowerCase()} successfully!`)
        setDecisionDialogOpen(false)
        setDecisionText("")
        setDecisionOutcome(null)
        fetchAppeals()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to decide appeal"}`)
      }
    } catch (error) {
      console.error("Error deciding appeal:", error)
      alert("Error deciding appeal. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const openReviewDialog = (appeal: any) => {
    setSelectedAppeal(appeal)
    setReviewDialogOpen(true)
  }

  const openDecisionDialog = (appeal: any) => {
    setSelectedAppeal(appeal)
    setDecisionText("")
    setDecisionOutcome(null)
    setDecisionDialogOpen(true)
  }

  const filterAppealsByStatus = (status: string) => {
    if (status === "all") return appeals
    return appeals.filter((a) => a.status === status)
  }

  const getDaysUntilDeadline = (appealDeadline: string) => {
    const deadline = new Date(appealDeadline)
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getDaysSinceSubmission = (submittedDate: string) => {
    const submitted = new Date(submittedDate)
    const now = new Date()
    const diff = now.getTime() - submitted.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading appeals...</div>
      </div>
    )
  }

  const pendingCount = appeals.filter((a) => a.status === "PENDING").length
  const scheduledCount = appeals.filter((a) => a.status === "SCHEDULED").length
  const decidedCount = appeals.filter((a) => a.status === "DECIDED").length

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Appeals Review
        </h1>
        <p className="text-muted-foreground">
          Review and decide on violation appeals per §3.809 (30-day appeal window)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hearings Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground">Upcoming hearings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decided</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decidedCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appeals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appeals.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Appeals Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Appeal Records</CardTitle>
          <CardDescription>
            Review submitted appeals and make decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="PENDING" className="w-full">
            <TabsList>
              <TabsTrigger value="PENDING">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="SCHEDULED">Scheduled ({scheduledCount})</TabsTrigger>
              <TabsTrigger value="DECIDED">Decided ({decidedCount})</TabsTrigger>
              <TabsTrigger value="all">All Appeals</TabsTrigger>
            </TabsList>

            {["PENDING", "SCHEDULED", "DECIDED", "all"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Violation</TableHead>
                      <TableHead>Fine Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Days Pending</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterAppealsByStatus(tab).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No appeals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filterAppealsByStatus(tab).map((appeal) => {
                        const daysPending = getDaysSinceSubmission(appeal.submittedDate)
                        const daysUntilDeadline = getDaysUntilDeadline(appeal.appealDeadline)
                        const isUrgent = daysPending > 20

                        return (
                          <TableRow key={appeal.id} className={isUrgent ? "bg-red-50" : ""}>
                            <TableCell className="text-sm">
                              {new Date(appeal.submittedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {violationTypeLabels[appeal.violation.violationType]}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {appeal.violation.entityType}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">${appeal.violation.fineAmount}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={appealStatusColors[appeal.status]}>
                                {appeal.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>{new Date(appeal.appealDeadline).toLocaleDateString()}</div>
                              <div className={`text-xs ${daysUntilDeadline <= 7 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : "Expired"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={isUrgent ? "text-red-600 font-semibold" : ""}>
                                {daysPending} days
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReviewDialog(appeal)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              {appeal.status !== "DECIDED" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => openDecisionDialog(appeal)}
                                >
                                  <Gavel className="h-4 w-4 mr-1" />
                                  Decide
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Appeal Details</DialogTitle>
            <DialogDescription>
              Review the appeal and violation details
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4 py-4">
              {/* Violation Info */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Violation Details</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>Type:</strong> {violationTypeLabels[selectedAppeal.violation.violationType]}</div>
                    <div><strong>Fine:</strong> ${selectedAppeal.violation.fineAmount}</div>
                    <div><strong>Issued:</strong> {new Date(selectedAppeal.violation.issuedDate).toLocaleDateString()}</div>
                    <div><strong>Description:</strong> {selectedAppeal.violation.description}</div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Appeal Reason */}
              <div>
                <Label className="text-sm font-semibold">Appellant's Reason</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm">
                  {selectedAppeal.reason}
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p>{new Date(selectedAppeal.submittedDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {getDaysSinceSubmission(selectedAppeal.submittedDate)} days ago
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deadline</Label>
                  <p>{new Date(selectedAppeal.appealDeadline).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {getDaysUntilDeadline(selectedAppeal.appealDeadline)} days remaining
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={appealStatusColors[selectedAppeal.status]}>
                    {selectedAppeal.status}
                  </Badge>
                </div>
              </div>

              {/* Schedule Hearing */}
              {selectedAppeal.status === "PENDING" && (
                <div className="space-y-2">
                  <Label htmlFor="hearing-date">Schedule Hearing (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hearing-date"
                      type="datetime-local"
                      value={hearingDate}
                      onChange={(e) => setHearingDate(e.target.value)}
                    />
                    <Button
                      onClick={() => handleScheduleHearing(selectedAppeal.id)}
                      disabled={submitting || !hearingDate}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              )}

              {/* Hearing Date Display */}
              {selectedAppeal.hearingDate && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Hearing Scheduled</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    {new Date(selectedAppeal.hearingDate).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}

              {/* Decision Display */}
              {selectedAppeal.status === "DECIDED" && (
                <Alert>
                  <Gavel className="h-4 w-4" />
                  <AlertTitle>Decision</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <div className="font-semibold mb-2">
                        Decided: {new Date(selectedAppeal.decidedAt).toLocaleDateString()}
                      </div>
                      <div>{selectedAppeal.decision}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Decide Appeal</DialogTitle>
            <DialogDescription>
              Make a final decision on this appeal. This action updates the violation status.
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4 py-4">
              {/* Quick Summary */}
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                <strong>Violation:</strong> {violationTypeLabels[selectedAppeal.violation.violationType]} -
                ${selectedAppeal.violation.fineAmount} fine
              </div>

              {/* Outcome Selection */}
              <div className="space-y-3">
                <Label>Decision Outcome *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDecisionOutcome("UPHELD")}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      decisionOutcome === "UPHELD"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">Uphold Fine</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The violation stands. Fine remains in effect.
                    </p>
                  </button>

                  <button
                    onClick={() => setDecisionOutcome("OVERTURNED")}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      decisionOutcome === "OVERTURNED"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Overturn Fine</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The violation is dismissed. Fine is removed.
                    </p>
                  </button>
                </div>
              </div>

              {/* Decision Text */}
              <div className="space-y-2">
                <Label htmlFor="decision-text">Decision Explanation *</Label>
                <Textarea
                  id="decision-text"
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder="Provide a clear explanation of your decision, including any reasoning or findings..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This will be communicated to the appellant and recorded in the violation record.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDecideAppeal}
              disabled={submitting || !decisionOutcome || decisionText.trim().length < 20}
              className={decisionOutcome === "UPHELD" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {submitting ? "Submitting..." : `${decisionOutcome || "Decide"} Appeal`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
