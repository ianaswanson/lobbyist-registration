"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText, Gavel, Calendar } from "lucide-react"

interface MyViolationsClientProps {
  userId: string
  userRole: string
}

const violationTypeLabels: Record<string, string> = {
  LATE_REGISTRATION: "Late Registration",
  LATE_REPORT: "Late Report",
  MISSING_REPORT: "Missing Report",
  FALSE_STATEMENT: "False Statement",
  PROHIBITED_CONDUCT: "Prohibited Conduct",
  MISSING_AUTHORIZATION: "Missing Authorization",
  OTHER: "Other",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ISSUED: "bg-red-100 text-red-800",
  APPEALED: "bg-purple-100 text-purple-800",
  UPHELD: "bg-red-100 text-red-800",
  OVERTURNED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  WAIVED: "bg-blue-100 text-blue-800",
}

export function MyViolationsClient({ userId, userRole }: MyViolationsClientProps) {
  const [violations, setViolations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<any>(null)
  const [appealReason, setAppealReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchViolations()
  }, [])

  const fetchViolations = async () => {
    try {
      setLoading(true)
      // Get user's entity ID
      const entityEndpoint = userRole === "LOBBYIST" ? "/api/lobbyist" : "/api/employer"
      const entityRes = await fetch(entityEndpoint)

      if (!entityRes.ok) {
        console.error("Failed to fetch entity")
        return
      }

      const entity = await entityRes.json()

      // Fetch violations for this entity
      const violationsRes = await fetch(`/api/violations?entityId=${entity.id}&entityType=${userRole}`)

      if (violationsRes.ok) {
        const data = await violationsRes.json()
        setViolations(data)
      }
    } catch (error) {
      console.error("Error fetching violations:", error)
    } finally {
      setLoading(false)
    }
  }

  const openAppealDialog = (violation: any) => {
    setSelectedViolation(violation)
    setAppealReason("")
    setAppealDialogOpen(true)
  }

  const handleSubmitAppeal = async () => {
    if (!selectedViolation || !appealReason.trim()) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/appeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          violationId: selectedViolation.id,
          reason: appealReason,
        }),
      })

      if (response.ok) {
        alert("Appeal submitted successfully!")
        setAppealDialogOpen(false)
        fetchViolations() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to submit appeal"}`)
      }
    } catch (error) {
      console.error("Error submitting appeal:", error)
      alert("Error submitting appeal. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const canAppeal = (violation: any) => {
    return violation.status === "ISSUED" && violation.fineAmount > 0
  }

  const getAppealDeadline = (issuedDate: string) => {
    const issued = new Date(issuedDate)
    const deadline = new Date(issued)
    deadline.setDate(deadline.getDate() + 30)
    return deadline
  }

  const isAppealDeadlinePassed = (issuedDate: string) => {
    return new Date() > getAppealDeadline(issuedDate)
  }

  const daysUntilDeadline = (issuedDate: string) => {
    const deadline = getAppealDeadline(issuedDate)
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading violations...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          My Violations
        </h1>
        <p className="text-muted-foreground">
          View your compliance violations and submit appeals within 30 days per §3.809
        </p>
      </div>

      {/* Summary Alert */}
      {violations.some((v) => v.status === "ISSUED" && !isAppealDeadlinePassed(v.issuedDate)) && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Action Required</AlertTitle>
          <AlertDescription className="text-orange-700">
            You have {violations.filter((v) => v.status === "ISSUED" && !isAppealDeadlinePassed(v.issuedDate)).length} violation(s)
            that can be appealed. You have 30 days from the issue date to submit an appeal.
          </AlertDescription>
        </Alert>
      )}

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Records</CardTitle>
          <CardDescription>
            Your compliance violations and enforcement history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No violations on record</p>
              <p className="text-sm mt-2">You're in full compliance!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '140px' }}>
                      Violation Type
                    </th>
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '400px' }}>
                      Description
                    </th>
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '120px' }}>
                      Fine Amount
                    </th>
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '110px' }}>
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '120px' }}>
                      Issued Date
                    </th>
                    <th className="text-left p-4 font-medium text-sm" style={{ width: '150px' }}>
                      Appeal Deadline
                    </th>
                    <th className="text-right p-4 font-medium text-sm" style={{ width: '160px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation) => {
                    const deadline = getAppealDeadline(violation.issuedDate)
                    const daysLeft = daysUntilDeadline(violation.issuedDate)
                    const deadlinePassed = isAppealDeadlinePassed(violation.issuedDate)

                    return (
                      <tr key={violation.id} className="border-b">
                        <td className="p-4 align-top">
                          <Badge variant="outline" className="whitespace-nowrap">
                            {violationTypeLabels[violation.violationType]}
                          </Badge>
                        </td>
                        <td className="p-4 align-top" style={{
                          maxWidth: '400px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}>
                          {violation.description}
                        </td>
                        <td className="p-4 align-top whitespace-nowrap">
                          {violation.fineAmount > 0 ? (
                            <span className="font-semibold">${violation.fineAmount}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">$0 (Warning)</span>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <Badge className={statusColors[violation.status] + " whitespace-nowrap"}>
                            {violation.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-top text-sm whitespace-nowrap">
                          {violation.issuedDate ? new Date(violation.issuedDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4 align-top text-sm">
                          {violation.issuedDate ? (
                            <div className="space-y-0.5">
                              <div className="whitespace-nowrap">{deadline.toLocaleDateString()}</div>
                              {canAppeal(violation) && !deadlinePassed && (
                                <div className={`text-xs whitespace-nowrap ${daysLeft <= 7 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                                  {daysLeft} days left
                                </div>
                              )}
                              {deadlinePassed && canAppeal(violation) && (
                                <div className="text-xs text-red-600 whitespace-nowrap">Expired</div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4 align-top text-right">
                          {canAppeal(violation) && !deadlinePassed ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openAppealDialog(violation)}
                              className="whitespace-nowrap"
                            >
                              <Gavel className="h-4 w-4 mr-1" />
                              Appeal
                            </Button>
                          ) : violation.status === "APPEALED" ? (
                            <Badge variant="outline" className="whitespace-nowrap">Appeal Pending</Badge>
                          ) : violation.status === "UPHELD" ? (
                            <Badge variant="outline" className="bg-red-50 whitespace-nowrap">Upheld</Badge>
                          ) : violation.status === "OVERTURNED" ? (
                            <Badge variant="outline" className="bg-green-50 whitespace-nowrap">Overturned</Badge>
                          ) : deadlinePassed && violation.status === "ISSUED" ? (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Deadline passed</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Appeals Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Your Right to Appeal (§3.809)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              You have the right to appeal any violation fine within <strong>30 days</strong> of the issue date.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">What to Include:</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Clear explanation of why you believe the violation is incorrect</li>
                <li>Any supporting documentation or evidence</li>
                <li>Mitigating circumstances if applicable</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold">What Happens Next:</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Admin will review your appeal</li>
                <li>You may be scheduled for a hearing</li>
                <li>Decision will be communicated within 30 days</li>
                <li>Fine is either upheld or overturned</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Submission Dialog */}
      <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
            <DialogDescription>
              State your reasons for appealing this violation. Be specific and provide any relevant details.
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-4">
              {/* Violation Summary */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Violation Details</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>Type:</strong> {violationTypeLabels[selectedViolation.violationType]}</div>
                    <div><strong>Fine:</strong> ${selectedViolation.fineAmount}</div>
                    <div><strong>Issued:</strong> {new Date(selectedViolation.issuedDate).toLocaleDateString()}</div>
                    <div><strong>Deadline:</strong> {getAppealDeadline(selectedViolation.issuedDate).toLocaleDateString()}
                      ({daysUntilDeadline(selectedViolation.issuedDate)} days remaining)</div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Appeal Reason */}
              <div className="space-y-2">
                <Label htmlFor="appeal-reason">Reason for Appeal *</Label>
                <Textarea
                  id="appeal-reason"
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Explain why you believe this violation should be overturned. Provide specific details and any mitigating circumstances..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters. Be clear and specific.
                </p>
              </div>

              {/* Warning about deadline */}
              {daysUntilDeadline(selectedViolation.issuedDate) <= 7 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Urgent: Deadline Approaching</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    You have only {daysUntilDeadline(selectedViolation.issuedDate)} days left to submit your appeal.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAppealDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAppeal}
              disabled={submitting || appealReason.trim().length < 50}
            >
              {submitting ? "Submitting..." : "Submit Appeal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
