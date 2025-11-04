"use client";

import Link from "next/link";
import { AmendmentDialog } from "@/components/AmendmentDialog";
import { AlertCircle, FileText } from "lucide-react";

interface AmendmentInfo {
  id: string;
  amendmentReason: string | null;
  submittedAt: Date | null;
  status: string;
}

interface ReportAmendmentSectionProps {
  reportId: string;
  reportType: "lobbyist" | "employer";
  status: string;
  quarter: string;
  year: number;
  originalReport?: AmendmentInfo | null;
  amendedByReport?: AmendmentInfo | null;
  amendmentReason?: string | null;
  canAmend: boolean; // Whether the current user can amend this report
}

export function ReportAmendmentSection({
  reportId,
  reportType,
  status,
  quarter,
  year,
  originalReport,
  amendedByReport,
  amendmentReason,
  canAmend,
}: ReportAmendmentSectionProps) {
  // Determine if this report can be amended
  const amendableStatuses = ["SUBMITTED", "LATE", "APPROVED"];
  const isAmendable = amendableStatuses.includes(status) && !amendedByReport && canAmend;

  return (
    <div className="space-y-4">
      {/* Amendment Button */}
      {isAmendable && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Need to make changes?
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                You can submit an amended version of this report. The original
                will be preserved for transparency.
              </p>
            </div>
            <div className="ml-4">
              <AmendmentDialog
                reportId={reportId}
                reportType={reportType}
                quarter={quarter}
                year={year}
              />
            </div>
          </div>
        </div>
      )}

      {/* This is an amendment (points back to original) */}
      {originalReport && amendmentReason && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-3 h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-purple-900">
                This is an Amended Report
              </h3>
              <p className="mt-1 text-sm text-purple-700">
                <strong>Reason for amendment:</strong> {amendmentReason}
              </p>
              <Link
                href={`/reports/${reportType}/${originalReport.id}`}
                className="mt-2 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                <FileText className="mr-1 h-4 w-4" />
                View Original Report
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* This report was amended (points to new version) */}
      {amendedByReport && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-3 h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-900">
                This Report Has Been Amended
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                A newer version of this report has been submitted.
                {amendedByReport.amendmentReason && (
                  <>
                    <br />
                    <strong>Reason:</strong> {amendedByReport.amendmentReason}
                  </>
                )}
              </p>
              <Link
                href={`/reports/${reportType}/${amendedByReport.id}`}
                className="mt-2 inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-800"
              >
                <FileText className="mr-1 h-4 w-4" />
                View Amended Report ({amendedByReport.status})
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
