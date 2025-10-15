"use client"

import { useState } from "react"
import { ManualEntryMode } from "./ManualEntryMode"
import { CSVUploadMode } from "./CSVUploadMode"
import { BulkPasteMode } from "./BulkPasteMode"
import FileUpload, { UploadedFile } from "@/components/FileUpload"

export type ExpenseLineItem = {
  id: string
  officialName: string
  date: string
  payee: string
  purpose: string
  amount: number
  isEstimate: boolean
}

type InputMode = "manual" | "csv" | "paste"

interface LobbyistExpenseReportFormProps {
  userId: string
}

export function LobbyistExpenseReportForm({
  userId,
}: LobbyistExpenseReportFormProps) {
  const [mode, setMode] = useState<InputMode>("manual")
  const [expenses, setExpenses] = useState<ExpenseLineItem[]>([])
  const [quarter, setQuarter] = useState("Q1")
  const [year, setYear] = useState(new Date().getFullYear())
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([])

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const handleAddExpenses = (newExpenses: ExpenseLineItem[]) => {
    setExpenses([...expenses, ...newExpenses])
  }

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id))
  }

  const handleSubmit = async () => {
    // TODO: Submit to API
    console.log("Submitting expense report:", {
      quarter,
      year,
      totalAmount,
      expenses,
    })
    alert(`Expense report submitted!\nQuarter: ${quarter} ${year}\nTotal: $${totalAmount.toFixed(2)}\nExpenses: ${expenses.length}`)
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

      {/* Input Method Selector */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Expenses
        </h3>

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
          <div className="flex items-center justify-between mb-4">
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

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={expenses.length === 0}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit Report
        </button>
      </div>
    </div>
  )
}
