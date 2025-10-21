"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ManualEntryMode } from "./ManualEntryMode"
import { CSVUploadMode } from "./CSVUploadMode"
import { BulkPasteMode } from "./BulkPasteMode"
import FileUpload, { UploadedFile } from "@/components/FileUpload"
import type { ExpenseLineItem } from "./LobbyistExpenseReportForm"

type InputMode = "manual" | "csv" | "paste"

interface LobbyistPayment {
  id: string
  lobbyistName: string
  amountPaid: number
}

interface EmployerExpenseReportFormProps {
  userId: string
  initialQuarter?: string
  initialYear?: number
}

export function EmployerExpenseReportForm({
  userId,
  initialQuarter,
  initialYear,
}: EmployerExpenseReportFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<InputMode>("manual")
  const [expenses, setExpenses] = useState<ExpenseLineItem[]>([])
  const [lobbyistPayments, setLobbyistPayments] = useState<LobbyistPayment[]>([])
  const [quarter, setQuarter] = useState(initialQuarter || "Q1")
  const [year, setYear] = useState(initialYear || new Date().getFullYear())
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // New lobbyist payment form state
  const [newPayment, setNewPayment] = useState({
    lobbyistName: "",
    amountPaid: "",
  })

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalPayments = lobbyistPayments.reduce((sum, pay) => sum + pay.amountPaid, 0)
  const grandTotal = totalExpenses + totalPayments

  // Load existing report data when quarter/year changes
  useEffect(() => {
    async function fetchExistingReport() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/reports/employer?quarter=${quarter}&year=${year}`)

        if (response.ok) {
          const data = await response.json()

          // Check if we have reports for this quarter/year
          if (data.reports && data.reports.length > 0) {
            const report = data.reports[0] // Get the first (and should be only) report

            // Transform line items to match our ExpenseLineItem type
            if (report.lineItems && report.lineItems.length > 0) {
              const transformedExpenses = report.lineItems.map((item: any) => ({
                id: item.id,
                officialName: item.officialName,
                date: new Date(item.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
                payee: item.payee,
                purpose: item.purpose,
                amount: item.amount,
                isEstimate: item.isEstimate,
              }))

              setExpenses(transformedExpenses)
            } else {
              setExpenses([])
            }

            // Transform lobbyist payments
            if (report.lobbyistPayments && report.lobbyistPayments.length > 0) {
              const transformedPayments = report.lobbyistPayments.map((payment: any) => ({
                id: payment.id,
                lobbyistName: payment.lobbyist.name,
                amountPaid: payment.amountPaid,
              }))

              setLobbyistPayments(transformedPayments)
            } else {
              setLobbyistPayments([])
            }

            setHasUnsavedChanges(false) // Data is loaded from DB, no unsaved changes
          } else {
            // No report found for this quarter/year - start fresh
            setExpenses([])
            setLobbyistPayments([])
            setHasUnsavedChanges(false)
          }
        } else {
          // API error - start fresh
          console.error('Failed to load existing report')
          setExpenses([])
          setLobbyistPayments([])
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        console.error('Error fetching existing report:', error)
        setExpenses([])
        setLobbyistPayments([])
        setHasUnsavedChanges(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExistingReport()
  }, [quarter, year])

  // Warn before leaving page with unsaved changes (page refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Warn before client-side navigation (clicking Next.js Links)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a[href]')

      if (anchor) {
        const href = anchor.getAttribute('href')
        const currentPath = window.location.pathname

        if (href && href !== currentPath && !href.startsWith('#')) {
          const confirmed = window.confirm(
            'You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.'
          )

          if (!confirmed) {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
          }
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [hasUnsavedChanges])

  const handleAddExpenses = (newExpenses: ExpenseLineItem[]) => {
    setExpenses([...expenses, ...newExpenses])
    setHasUnsavedChanges(true)
  }

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id))
    setHasUnsavedChanges(true)
  }

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()

    const payment: LobbyistPayment = {
      id: crypto.randomUUID(),
      lobbyistName: newPayment.lobbyistName,
      amountPaid: parseFloat(newPayment.amountPaid),
    }

    setLobbyistPayments([...lobbyistPayments, payment])
    setHasUnsavedChanges(true)

    // Reset form
    setNewPayment({
      lobbyistName: "",
      amountPaid: "",
    })
  }

  const handleRemovePayment = (id: string) => {
    setLobbyistPayments(lobbyistPayments.filter((pay) => pay.id !== id))
    setHasUnsavedChanges(true)
  }

  const submitReport = async (isDraft: boolean) => {
    try {
      setIsLoading(true)
      setMessage(null)

      const response = await fetch("/api/reports/employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quarter,
          year,
          expenses,
          lobbyistPayments,
          isDraft,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report")
      }

      setMessage({
        type: "success",
        text: isDraft
          ? `Draft saved successfully! Quarter: ${quarter} ${year}`
          : `Report submitted successfully! Quarter: ${quarter} ${year}`,
      })

      // Clear unsaved changes flag since we just saved
      setHasUnsavedChanges(false)

      // If submitting final report (not draft), redirect to reports list after brief delay
      if (!isDraft) {
        setTimeout(() => {
          router.push('/reports/employer')
        }, 1500)
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit report",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = () => {
    submitReport(true)
  }

  const handleSubmit = () => {
    submitReport(false)
  }

  return (
    <div className="space-y-6">
      {/* Quarter and Year Selection */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reporting Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quarter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quarter
            </label>
            <select
              id="quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lobbyist Payments Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payments to Registered Lobbyists
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Report all payments made to registered lobbyists for lobbying services
          during this quarter.
        </p>

        {/* Add Payment Form */}
        <form onSubmit={handleAddPayment} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lobbyistName"
                className="block text-sm font-medium text-gray-700"
              >
                Lobbyist Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="lobbyistName"
                required
                value={newPayment.lobbyistName}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, lobbyistName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label
                htmlFor="amountPaid"
                className="block text-sm font-medium text-gray-700"
              >
                Amount Paid <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="amountPaid"
                  required
                  min="0"
                  step="0.01"
                  value={newPayment.amountPaid}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, amountPaid: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="5000.00"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Lobbyist Payment
            </button>
          </div>
        </form>

        {/* Payments List */}
        {lobbyistPayments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Lobbyist Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount Paid
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {lobbyistPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {payment.lobbyistName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      ${payment.amountPaid.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-md bg-blue-50 p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                Total Lobbyist Payments:
              </span>
              <span className="text-lg font-bold text-blue-900">
                ${totalPayments.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lobbying Expenses Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lobbying Expenses (Food, Refreshments, Entertainment)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Itemize expenses over $50 paid to or for any public official.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Input Method:
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
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
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
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
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Items ({expenses.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Official Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payee
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Purpose
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {expense.officialName}
                      {expense.isEstimate && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Est.)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {expense.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {expense.payee}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {expense.purpose}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
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

          <div className="mt-4 rounded-md bg-purple-50 p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-purple-900">
              Total Expenses:
            </span>
            <span className="text-lg font-bold text-purple-900">
              ${totalExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Grand Total Summary */}
      {(lobbyistPayments.length > 0 || expenses.length > 0) && (
        <div className="rounded-lg border-2 border-gray-900 bg-gray-50 p-6 shadow-md">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Total Lobbyist Payments:</span>
              <span className="font-medium text-gray-900">
                ${totalPayments.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Total Lobbying Expenses:</span>
              <span className="font-medium text-gray-900">
                ${totalExpenses.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Grand Total:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Total includes all payments to registered
              lobbyists and itemized expenses over $50 paid to or for any public
              official for food, refreshments, and entertainment.
            </p>
          </div>
        </div>
      )}

      {/* Supporting Documents */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-yellow-800">
                You have unsaved changes
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Click "Save as Draft" or "Submit Report" to save your work. If you leave this page, your changes will be lost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || (lobbyistPayments.length === 0 && expenses.length === 0)}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
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
          )}
          <span>{isLoading ? "Submitting..." : "Submit Report"}</span>
        </button>
      </div>
    </div>
  )
}
