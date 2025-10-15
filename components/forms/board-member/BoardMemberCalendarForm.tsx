"use client"

import { useState } from "react"
import { ICSUploadMode } from "./ICSUploadMode"
import { CSVUploadMode } from "./CSVUploadMode"
import { ReceiptsCSVUploadMode } from "./ReceiptsCSVUploadMode"
import { ReceiptsBulkPasteMode } from "./ReceiptsBulkPasteMode"

export interface CalendarEntry {
  id: string
  eventTitle: string
  eventDate: string
  eventTime: string
  participants: string
}

export interface LobbyingReceipt {
  id: string
  lobbyistName: string
  date: string
  payee: string
  purpose: string
  amount: number
}

interface BoardMemberCalendarFormProps {
  userId: string
}

export function BoardMemberCalendarForm({
  userId,
}: BoardMemberCalendarFormProps) {
  const [quarter, setQuarter] = useState("Q1")
  const [year, setYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState<"calendar" | "receipts">("calendar")
  const [calendarInputMode, setCalendarInputMode] = useState<"manual" | "csv" | "ics">("manual")
  const [receiptsInputMode, setReceiptsInputMode] = useState<"manual" | "csv" | "paste">("manual")

  // Calendar state
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([])
  const [newCalendarEntry, setNewCalendarEntry] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    participants: "",
  })

  // Receipts state
  const [receipts, setReceipts] = useState<LobbyingReceipt[]>([])
  const [newReceipt, setNewReceipt] = useState({
    lobbyistName: "",
    date: "",
    payee: "",
    purpose: "",
    amount: "",
  })

  const totalReceiptAmount = receipts.reduce((sum, r) => sum + r.amount, 0)

  const handleAddCalendarEntry = (e: React.FormEvent) => {
    e.preventDefault()

    const entry: CalendarEntry = {
      id: crypto.randomUUID(),
      eventTitle: newCalendarEntry.eventTitle,
      eventDate: newCalendarEntry.eventDate,
      eventTime: newCalendarEntry.eventTime,
      participants: newCalendarEntry.participants,
    }

    setCalendarEntries([...calendarEntries, entry])

    // Reset form
    setNewCalendarEntry({
      eventTitle: "",
      eventDate: "",
      eventTime: "",
      participants: "",
    })
  }

  const handleRemoveCalendarEntry = (id: string) => {
    setCalendarEntries(calendarEntries.filter((entry) => entry.id !== id))
  }

  const handleBulkAddCalendarEntries = (entries: CalendarEntry[]) => {
    setCalendarEntries([...calendarEntries, ...entries])
  }

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault()

    const receipt: LobbyingReceipt = {
      id: crypto.randomUUID(),
      lobbyistName: newReceipt.lobbyistName,
      date: newReceipt.date,
      payee: newReceipt.payee,
      purpose: newReceipt.purpose,
      amount: parseFloat(newReceipt.amount),
    }

    setReceipts([...receipts, receipt])

    // Reset form
    setNewReceipt({
      lobbyistName: "",
      date: "",
      payee: "",
      purpose: "",
      amount: "",
    })
  }

  const handleRemoveReceipt = (id: string) => {
    setReceipts(receipts.filter((r) => r.id !== id))
  }

  const handleBulkAddReceipts = (newReceipts: LobbyingReceipt[]) => {
    setReceipts([...receipts, ...newReceipts])
  }

  const handleSaveDraft = () => {
    console.log("Saving draft board member data:", {
      quarter,
      year,
      calendarEntries,
      receipts,
      totalReceiptAmount,
    })
    alert(`Draft saved! (API integration pending)\nQuarter: ${quarter} ${year}\nCalendar Entries: ${calendarEntries.length}\nLobbying Receipts: ${receipts.length}\nTotal Receipt Amount: $${totalReceiptAmount.toFixed(2)}`)
  }

  const handleSubmit = async () => {
    // TODO: Submit to API
    console.log("Submitting board member data:", {
      quarter,
      year,
      calendarEntries,
      receipts,
      totalReceiptAmount,
    })
    alert(
      `Board member data submitted! (API integration pending)\nQuarter: ${quarter} ${year}\nCalendar Entries: ${calendarEntries.length}\nLobbying Receipts: ${receipts.length}\nTotal Receipt Amount: $${totalReceiptAmount.toFixed(2)}`
    )
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

      {/* Tab Navigation */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b">
          <div className="flex space-x-0">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "calendar"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Quarterly Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("receipts")}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "receipts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Lobbying Receipts
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quarterly Calendar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Post your quarterly calendar showing meetings, events, and
                  participants. This must be posted within 15 days after the
                  quarter ends.
                </p>
              </div>

              {/* Input Mode Selector */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCalendarInputMode("manual")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    calendarInputMode === "manual"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarInputMode("csv")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    calendarInputMode === "csv"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  CSV Upload
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarInputMode("ics")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    calendarInputMode === "ics"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  ICS/iCal Import
                </button>
              </div>

              {/* CSV Upload Mode */}
              {calendarInputMode === "csv" && (
                <CSVUploadMode onAdd={handleBulkAddCalendarEntries} />
              )}

              {/* ICS Upload Mode */}
              {calendarInputMode === "ics" && (
                <ICSUploadMode onAdd={handleBulkAddCalendarEntries} />
              )}

              {/* Manual Entry Form */}
              {calendarInputMode === "manual" && (
                <form onSubmit={handleAddCalendarEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="eventTitle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Event Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="eventTitle"
                      required
                      value={newCalendarEntry.eventTitle}
                      onChange={(e) =>
                        setNewCalendarEntry({
                          ...newCalendarEntry,
                          eventTitle: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Budget Planning Meeting"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="eventDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      required
                      value={newCalendarEntry.eventDate}
                      onChange={(e) =>
                        setNewCalendarEntry({
                          ...newCalendarEntry,
                          eventDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="eventTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      id="eventTime"
                      required
                      value={newCalendarEntry.eventTime}
                      onChange={(e) =>
                        setNewCalendarEntry({
                          ...newCalendarEntry,
                          eventTime: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="participants"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Primary Participants{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="participants"
                      required
                      value={newCalendarEntry.participants}
                      onChange={(e) =>
                        setNewCalendarEntry({
                          ...newCalendarEntry,
                          participants: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="County staff, community members"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Add Calendar Entry
                  </button>
                </div>
              </form>
              )}

              {/* Calendar Entries List */}
              {calendarEntries.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Event
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Time
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Participants
                        </th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {calendarEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {entry.eventTitle}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(entry.eventDate).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {entry.eventTime}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {entry.participants}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                            <button
                              onClick={() =>
                                handleRemoveCalendarEntry(entry.id)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 rounded-md bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                      <strong>{calendarEntries.length}</strong> calendar{" "}
                      {calendarEntries.length === 1 ? "entry" : "entries"} will
                      be posted publicly for at least 1 year.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "receipts" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Lobbying Receipts
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Report all food, refreshments, and entertainment received from
                  lobbyists during this quarter. Itemize any lobbyist who spent
                  more than $50 on you.
                </p>
              </div>

              {/* Input Mode Selector */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setReceiptsInputMode("manual")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    receiptsInputMode === "manual"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptsInputMode("paste")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    receiptsInputMode === "paste"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Bulk Paste
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptsInputMode("csv")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    receiptsInputMode === "csv"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  CSV Upload
                </button>
              </div>

              {/* Bulk Paste Mode */}
              {receiptsInputMode === "paste" && (
                <ReceiptsBulkPasteMode onAdd={handleBulkAddReceipts} />
              )}

              {/* CSV Upload Mode */}
              {receiptsInputMode === "csv" && (
                <ReceiptsCSVUploadMode onAdd={handleBulkAddReceipts} />
              )}

              {/* Manual Entry Form */}
              {receiptsInputMode === "manual" && (
                <form onSubmit={handleAddReceipt} className="space-y-4">
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
                      value={newReceipt.lobbyistName}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          lobbyistName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="receiptDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="receiptDate"
                      required
                      value={newReceipt.date}
                      onChange={(e) =>
                        setNewReceipt({ ...newReceipt, date: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="payee"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payee <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="payee"
                    required
                    value={newReceipt.payee}
                    onChange={(e) =>
                      setNewReceipt({ ...newReceipt, payee: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Restaurant or vendor name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="purpose"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Purpose <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="purpose"
                    required
                    rows={2}
                    value={newReceipt.purpose}
                    onChange={(e) =>
                      setNewReceipt({ ...newReceipt, purpose: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Lunch meeting to discuss..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Amount <span className="text-red-600">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        required
                        min="0"
                        step="0.01"
                        value={newReceipt.amount}
                        onChange={(e) =>
                          setNewReceipt({
                            ...newReceipt,
                            amount: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="125.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  >
                    Add Receipt
                  </button>
                </div>
              </form>
              )}

              {/* Receipts List */}
              {receipts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Lobbyist
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
                      {receipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {receipt.lobbyistName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(receipt.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {receipt.payee}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {receipt.purpose}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            ${receipt.amount.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                            <button
                              onClick={() => handleRemoveReceipt(receipt.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 rounded-md bg-purple-50 p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-900">
                      Total Receipts:
                    </span>
                    <span className="text-lg font-bold text-purple-900">
                      ${totalReceiptAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {(calendarEntries.length > 0 || receipts.length > 0) && (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Submit & Post Publicly
          </button>
        </div>
      )}

      {/* Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          Important Information:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-inside list-disc">
          <li>
            Quarterly calendar must be posted within 15 days after quarter ends
          </li>
          <li>All data will be publicly posted for at least 1 year</li>
          <li>
            Lobbying receipts must include all food, refreshments, and
            entertainment from lobbyists
          </li>
          <li>
            Itemize any lobbyist who spent more than $50 on you during the
            quarter
          </li>
        </ul>
      </div>
    </div>
  )
}
