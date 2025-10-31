"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManualEntryMode } from "./ManualEntryMode";
import { CSVUploadMode } from "./CSVUploadMode";
import { BulkPasteMode } from "./BulkPasteMode";
import FileUpload, { UploadedFile } from "@/components/FileUpload";

export type ExpenseLineItem = {
  id: string;
  officialName: string;
  date: string;
  payee: string;
  purpose: string;
  amount: number;
  isEstimate: boolean;
};

type InputMode = "manual" | "csv" | "paste";

interface LobbyistExpenseReportFormProps {
  userId: string;
  initialQuarter?: string;
  initialYear?: number;
}

export function LobbyistExpenseReportForm({
  userId,
  initialQuarter,
  initialYear,
}: LobbyistExpenseReportFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("manual");
  const [expenses, setExpenses] = useState<ExpenseLineItem[]>([]);
  const [quarter, setQuarter] = useState(initialQuarter || "Q1");
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch existing report data when quarter or year changes
  useEffect(() => {
    async function fetchExistingReport() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/reports/lobbyist?quarter=${quarter}&year=${year}`
        );

        if (response.ok) {
          const data = await response.json();

          // Check if we have reports for this quarter/year
          if (data.reports && data.reports.length > 0) {
            const report = data.reports[0]; // Get the first (and should be only) report

            // Transform line items to match our ExpenseLineItem type
            if (report.lineItems && report.lineItems.length > 0) {
              const transformedExpenses = report.lineItems.map((item: any) => ({
                id: item.id,
                officialName: item.officialName,
                date: new Date(item.date).toISOString().split("T")[0], // Format as YYYY-MM-DD
                payee: item.payee,
                purpose: item.purpose,
                amount: item.amount,
                isEstimate: item.isEstimate,
              }));

              setExpenses(transformedExpenses);
              setHasUnsavedChanges(false); // Data is loaded from DB, no unsaved changes
            } else {
              // No line items for this report
              setExpenses([]);
              setHasUnsavedChanges(false);
            }
          } else {
            // No report found for this quarter/year - start fresh
            setExpenses([]);
            setHasUnsavedChanges(false);
          }
        } else {
          // API error - start fresh
          console.error("Failed to load existing report");
          setExpenses([]);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error("Error fetching existing report:", error);
        setExpenses([]);
        setHasUnsavedChanges(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExistingReport();
  }, [quarter, year]);

  // Warn before leaving page with unsaved changes (page refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Warn before client-side navigation (clicking Next.js Links)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      // Find the closest anchor tag (Next.js Link renders as <a>)
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]");

      if (anchor) {
        const href = anchor.getAttribute("href");
        const currentPath = window.location.pathname;

        // Check if it's navigating to a different page
        if (href && href !== currentPath && !href.startsWith("#")) {
          const confirmed = window.confirm(
            "You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
          );

          if (!confirmed) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        }
      }
    };

    // Use capture phase to intercept before Next.js Link handler
    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [hasUnsavedChanges]);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAddExpenses = (newExpenses: ExpenseLineItem[]) => {
    setExpenses([...expenses, ...newExpenses]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
    setHasUnsavedChanges(true);
  };

  const submitReport = async (isDraft: boolean) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reports/lobbyist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quarter,
          year,
          expenses,
          isDraft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save report");
      }

      // Show success message
      setMessage({
        type: "success",
        text: data.message,
      });

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);

      // If submitting final report (not draft), redirect to reports list after brief delay
      if (!isDraft) {
        setTimeout(() => {
          router.push("/reports/lobbyist");
        }, 1500);
      } else {
        // For drafts, just clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    submitReport(true);
  };

  const handleSubmit = async () => {
    submitReport(false);
  };

  return (
    <div className="space-y-6">
      {/* Loading Indicator */}
      {isLoading && (
        <div
          className="rounded-md border border-blue-200 bg-blue-50 p-4"
          data-testid="loading-indicator"
        >
          <div className="flex items-center">
            <svg
              className="h-5 w-5 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-3 text-sm font-medium text-blue-800">
              Loading existing report data...
            </span>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-yellow-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-yellow-800">
                You have unsaved changes
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Click "Save as Draft" or "Submit Report" to save your work. If
                you leave this page, your changes will be lost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div
          data-testid={
            message.type === "success" ? "success-message" : "error-message"
          }
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage(null)}
                className="hover:bg-opacity-10 inline-flex rounded-md p-1.5 hover:bg-black focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quarter and Year Selection */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Reporting Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quarter"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Quarter
            </label>
            <select
              id="quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Q1">Q1 (Jan-Mar) - Due April 15</option>
              <option value="Q2">Q2 (Apr-Jun) - Due July 15</option>
              <option value="Q3">Q3 (Jul-Sep) - Due October 15</option>
              <option value="Q4">Q4 (Oct-Dec) - Due January 15</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="year"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Input Method Selector */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Add Expenses
        </h3>

        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-gray-700">
            Choose Input Method:
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setMode("csv")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "csv"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              CSV Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "paste"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bulk Paste
            </button>
          </div>
        </div>

        {/* Mode-specific content */}
        {mode === "manual" && <ManualEntryMode onAdd={handleAddExpenses} />}
        {mode === "csv" && <CSVUploadMode onAdd={handleAddExpenses} />}
        {mode === "paste" && <BulkPasteMode onAdd={handleAddExpenses} />}
      </div>

      {/* Expenses List */}
      {expenses.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Expense Items ({expenses.length})
            </h3>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Official Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Payee
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Purpose
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-900">
                      {expense.officialName}
                      {expense.isEstimate && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Est.)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {expense.date}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {expense.payee}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {expense.purpose}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-right text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only itemize expenses over $50 paid to or
              for any public official. Total includes all food, refreshments,
              and entertainment expenses related to lobbying activities.
            </p>
          </div>
        </div>
      )}

      {/* Supporting Documents */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Supporting Documents (Optional)
        </h3>
        <FileUpload
          label="Upload Receipts or ORS 244.100 Notices"
          description="Upload receipts, invoices, or copies of any ORS 244.100 notices filed. These documents help support your expense report."
          accept=".pdf,.jpg,.jpeg,.png"
          maxSizeMB={10}
          maxFiles={10}
          value={uploadedDocuments}
          onChange={setUploadedDocuments}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSubmitting || expenses.length === 0}
          data-testid="save-draft-button"
          className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save as Draft</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || expenses.length === 0}
          data-testid="submit-report-button"
          className="flex items-center space-x-2 rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Report</span>
          )}
        </button>
      </div>
    </div>
  );
}
