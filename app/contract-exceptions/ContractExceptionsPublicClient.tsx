"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCheck, Eye, Info } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ContractException {
  id: string;
  formerOfficialId: string;
  formerOfficialName: string;
  contractDescription: string;
  justification: string;
  approvedBy: string;
  approvedDate: string;
  publiclyPostedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ContractExceptionsPublicClient() {
  const [exceptions, setExceptions] = useState<ContractException[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedException, setSelectedException] =
    useState<ContractException | null>(null);

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      // Public API only returns publicly posted exceptions
      const response = await fetch("/api/contract-exceptions");

      if (response.ok) {
        const data = await response.json();
        setExceptions(data);
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openViewDialog = (exception: ContractException) => {
    setSelectedException(exception);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading contract exceptions...</div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Contract Exceptions Registry
        </h1>
        <p className="text-muted-foreground">
          Public record of exceptions to §9.230(C) 1-year cooling-off period
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">
          About Contract Exceptions
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          <p className="mb-2">
            Multnomah County ordinance §9.230(C) prohibits the County from
            contracting with former officials who influenced contract
            authorization during or within 1 year after County service.
          </p>
          <p>
            The County Chair may grant exceptions with written findings showing
            either: (1) best interests of the County favor the contract, or (2)
            the person's influence was minimal. All exceptions must be publicly
            posted.
          </p>
        </AlertDescription>
      </Alert>

      {/* Exceptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Publicly Posted Exceptions
          </CardTitle>
          <CardDescription>
            {exceptions.length} exception{exceptions.length !== 1 ? "s" : ""}{" "}
            granted and publicly posted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exceptions.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <FileCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p>No contract exceptions have been publicly posted</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Former Official</TableHead>
                  <TableHead>Contract Description</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell>
                      <div className="font-medium">
                        {exception.formerOfficialName}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="line-clamp-2">
                        {exception.contractDescription}
                      </div>
                    </TableCell>
                    <TableCell>{exception.approvedBy}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(exception.approvedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exception.publiclyPostedDate
                        ? new Date(
                            exception.publiclyPostedDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(exception)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* How to Request Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Requesting an Exception
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            If you are a former County official seeking to contract with the
            County within the 1-year cooling-off period, you must request an
            exception through the County Chair.
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              Requirements for Exception:
            </h4>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Written request explaining the circumstances</li>
              <li>
                Demonstration that either: (a) the contract serves the County's
                best interests, or (b) your influence on the contract was
                minimal
              </li>
              <li>Chair review and written findings</li>
              <li>Public posting of the exception if granted</li>
            </ul>
          </div>

          <Alert>
            <AlertTitle>Contact Information</AlertTitle>
            <AlertDescription>
              To request an exception, contact the Office of the County Chair
              at:{" "}
              <a
                href="mailto:chair@multco.us"
                className="underline hover:text-blue-600"
              >
                chair@multco.us
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contract Exception Details</DialogTitle>
          </DialogHeader>

          {selectedException && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Former Official</Label>
                <p className="text-lg font-medium">
                  {selectedException.formerOfficialName}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Contract Description
                </Label>
                <p className="mt-1">{selectedException.contractDescription}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Justification & Findings
                </Label>
                <div className="mt-1 rounded-md border bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap">
                    {selectedException.justification}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Approved By</Label>
                  <p className="font-medium">{selectedException.approvedBy}</p>
                  <p className="text-muted-foreground text-sm">County Chair</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Approval Date</Label>
                  <p>
                    {new Date(
                      selectedException.approvedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedException.publiclyPostedDate && (
                <div>
                  <Label className="text-muted-foreground">
                    Publicly Posted Date
                  </Label>
                  <p>
                    {new Date(
                      selectedException.publiclyPostedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              <Alert className="border-blue-200 bg-blue-50">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Public Record</AlertTitle>
                <AlertDescription className="text-blue-700">
                  This exception has been publicly posted in compliance with
                  §9.230(C) of the Multnomah County Code.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
