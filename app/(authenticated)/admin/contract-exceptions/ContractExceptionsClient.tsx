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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, FileCheck, Plus, Eye, Edit, Trash2, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ContractException {
  id: string
  formerOfficialId: string
  formerOfficialName: string
  contractDescription: string
  justification: string
  approvedBy: string
  approvedDate: string
  publiclyPostedDate: string | null
  createdAt: string
  updatedAt: string
}

export function ContractExceptionsClient() {
  const [exceptions, setExceptions] = useState<ContractException[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedException, setSelectedException] = useState<ContractException | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showUnposted, setShowUnposted] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    formerOfficialId: "",
    formerOfficialName: "",
    contractDescription: "",
    justification: "",
    approvedBy: "",
    approvedDate: "",
    publiclyPosted: false,
  })

  useEffect(() => {
    fetchExceptions()
  }, [showUnposted])

  const fetchExceptions = async () => {
    try {
      setLoading(true)
      const url = showUnposted
        ? "/api/contract-exceptions?includeUnposted=true"
        : "/api/contract-exceptions"
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setExceptions(data)
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditMode(false)
    setSelectedException(null)
    setFormData({
      formerOfficialId: "",
      formerOfficialName: "",
      contractDescription: "",
      justification: "",
      approvedBy: "",
      approvedDate: new Date().toISOString().split("T")[0],
      publiclyPosted: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (exception: ContractException) => {
    setEditMode(true)
    setSelectedException(exception)
    setFormData({
      formerOfficialId: exception.formerOfficialId,
      formerOfficialName: exception.formerOfficialName,
      contractDescription: exception.contractDescription,
      justification: exception.justification,
      approvedBy: exception.approvedBy,
      approvedDate: exception.approvedDate.split("T")[0],
      publiclyPosted: !!exception.publiclyPostedDate,
    })
    setDialogOpen(true)
  }

  const openViewDialog = (exception: ContractException) => {
    setSelectedException(exception)
    setViewDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (
      !formData.formerOfficialId ||
      !formData.formerOfficialName ||
      !formData.contractDescription ||
      !formData.justification ||
      !formData.approvedBy ||
      !formData.approvedDate
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const url = editMode && selectedException
        ? `/api/contract-exceptions/${selectedException.id}`
        : "/api/contract-exceptions"

      const method = editMode ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: editMode ? "Exception updated successfully!" : "Exception created successfully!",
        })
        setDialogOpen(false)
        fetchExceptions()

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to save exception" })
      }
    } catch (error) {
      console.error("Error saving exception:", error)
      setMessage({ type: "error", text: "Error saving exception. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exception? This action cannot be undone.")) {
      return
    }

    setMessage(null)
    try {
      const response = await fetch(`/api/contract-exceptions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Exception deleted successfully!" })
        fetchExceptions()

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: "error", text: "Failed to delete exception" })
      }
    } catch (error) {
      console.error("Error deleting exception:", error)
      setMessage({ type: "error", text: "Error deleting exception. Please try again." })
    }
  }

  const handleTogglePosted = async (exception: ContractException) => {
    setMessage(null)
    try {
      const response = await fetch(`/api/contract-exceptions/${exception.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publiclyPosted: !exception.publiclyPostedDate,
        }),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: exception.publiclyPostedDate
            ? "Exception removed from public posting"
            : "Exception publicly posted!",
        })
        fetchExceptions()

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error("Error toggling posted status:", error)
      setMessage({ type: "error", text: "Error updating posted status" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading contract exceptions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Contract Exception Management
        </h1>
        <p className="text-muted-foreground">
          Manage exceptions to §9.230(C) 1-year cooling-off period for former County officials
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert
          className={`mb-6 ${
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          />
          <AlertTitle
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription
            className={
              message.type === "success" ? "text-green-700" : "text-red-700"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <FileCheck className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Contract Regulation (§9.230)</AlertTitle>
        <AlertDescription className="text-blue-700">
          County cannot contract with former officials who influenced contract authorization during or
          within 1 year after County service. Chair may grant exceptions with written findings that
          must be publicly posted.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-unposted"
            checked={showUnposted}
            onCheckedChange={(checked) => setShowUnposted(checked === true)}
          />
          <label
            htmlFor="show-unposted"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show unposted exceptions
          </label>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exception
        </Button>
      </div>

      {/* Exceptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Exceptions</CardTitle>
          <CardDescription>
            {exceptions.length} exception{exceptions.length !== 1 ? "s" : ""} on record
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exceptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No contract exceptions recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Former Official</TableHead>
                  <TableHead>Contract Description</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approved Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell>
                      <div className="font-medium">{exception.formerOfficialName}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {exception.formerOfficialId}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{exception.contractDescription}</div>
                    </TableCell>
                    <TableCell>{exception.approvedBy}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(exception.approvedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {exception.publiclyPostedDate ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Posted
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Posted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(exception)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(exception)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePosted(exception)}
                        >
                          {exception.publiclyPostedDate ? (
                            <XCircle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exception.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Contract Exception" : "Create Contract Exception"}
            </DialogTitle>
            <DialogDescription>
              Grant an exception to the 1-year cooling-off period per §9.230(C)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Alert about requirements */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Legal Requirements</AlertTitle>
              <AlertDescription className="text-orange-700">
                Justification must show either: (1) Best interests of County favor the contract, OR
                (2) Person's influence was minimal. Exception must be publicly posted.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="official-id">Former Official ID *</Label>
                <Input
                  id="official-id"
                  value={formData.formerOfficialId}
                  onChange={(e) =>
                    setFormData({ ...formData, formerOfficialId: e.target.value })
                  }
                  placeholder="e.g., EMP-12345"
                  disabled={editMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="official-name">Former Official Name *</Label>
                <Input
                  id="official-name"
                  value={formData.formerOfficialName}
                  onChange={(e) =>
                    setFormData({ ...formData, formerOfficialName: e.target.value })
                  }
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-desc">Contract Description *</Label>
              <Textarea
                id="contract-desc"
                value={formData.contractDescription}
                onChange={(e) =>
                  setFormData({ ...formData, contractDescription: e.target.value })
                }
                placeholder="Describe the contract in question..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification for Exception *</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) =>
                  setFormData({ ...formData, justification: e.target.value })
                }
                placeholder="Explain why this exception is warranted. Must show best interests of County or minimal influence..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Must clearly articulate findings per §9.230(C)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="approved-by">Approved By (Chair) *</Label>
                <Input
                  id="approved-by"
                  value={formData.approvedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, approvedBy: e.target.value })
                  }
                  placeholder="Name of approving Chair"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approved-date">Approval Date *</Label>
                <Input
                  id="approved-date"
                  type="date"
                  value={formData.approvedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, approvedDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="publicly-posted"
                checked={formData.publiclyPosted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, publiclyPosted: checked === true })
                }
              />
              <label
                htmlFor="publicly-posted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as publicly posted immediately
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Saving..."
                : editMode
                  ? "Update Exception"
                  : "Create Exception"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contract Exception Details</DialogTitle>
          </DialogHeader>

          {selectedException && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Former Official</Label>
                  <p className="font-medium">{selectedException.formerOfficialName}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedException.formerOfficialId}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {selectedException.publiclyPostedDate ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Publicly Posted
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Posted
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Contract Description</Label>
                <p className="mt-1">{selectedException.contractDescription}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Justification</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedException.justification}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Approved By</Label>
                  <p className="font-medium">{selectedException.approvedBy}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Approval Date</Label>
                  <p>{new Date(selectedException.approvedDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedException.publiclyPostedDate && (
                <div>
                  <Label className="text-muted-foreground">Publicly Posted Date</Label>
                  <p>{new Date(selectedException.publiclyPostedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
