"use client";

import { useEffect, useState } from "react";
import { Calendar, DollarSign, User, MapPin, Clock } from "lucide-react";

interface CalendarEntry {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string | null;
  participants: string;
  quarter: string;
  year: number;
}

interface LobbyingReceipt {
  id: string;
  lobbyistName: string;
  lobbyistEmail: string;
  amount: number;
  date: string;
  payee: string;
  purpose: string;
  quarter: string;
  year: number;
}

interface BoardMember {
  id: string;
  name: string;
  district: string | null;
  termStart: string;
  termEnd: string | null;
  calendarEntries: CalendarEntry[];
  lobbyingReceipts: LobbyingReceipt[];
  totalReceipts: number;
  totalReceiptAmount: number;
}

interface ApiResponse {
  boardMembers: BoardMember[];
  retentionPeriod: string;
  cutoffDate: string;
  count: number;
}

export function BoardCalendarsClient() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/board-member-calendars")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        // Select first member by default
        if (data.boardMembers.length > 0) {
          setSelectedMember(data.boardMembers[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading board member data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">
          <strong>Error:</strong> {error}
        </p>
      </div>
    );
  }

  if (!data || data.boardMembers.length === 0) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          No board member data available at this time.
        </p>
      </div>
    );
  }

  const currentMember = data.boardMembers.find((m) => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Board Member Selector */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Select Board Member
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.boardMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedMember === member.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  {member.district && (
                    <p className="mt-1 flex items-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-3 w-3" />
                      {member.district}
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-blue-100 p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{member.calendarEntries.length} events</span>
                <span>{member.totalReceipts} receipts</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Member Details */}
      {currentMember && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Calendar Events
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {currentMember.calendarEntries.length}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Lobbying Receipts
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {currentMember.totalReceipts}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ${currentMember.totalReceiptAmount.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Calendar Entries */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Quarterly Calendar Events
            </h3>
            {currentMember.calendarEntries.length === 0 ? (
              <p className="text-sm text-gray-600">
                No calendar events in the past year.
              </p>
            ) : (
              <div className="space-y-4">
                {currentMember.calendarEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {entry.eventTitle}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {new Date(entry.eventDate).toLocaleDateString()}
                            {entry.eventTime && (
                              <span className="ml-2 flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                {entry.eventTime}
                              </span>
                            )}
                          </p>
                          {entry.participants && (
                            <p className="flex items-start">
                              <User className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                              <span>{entry.participants}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="ml-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {entry.quarter} {entry.year}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lobbying Receipts */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Lobbying Receipts (Over $50)
            </h3>
            {currentMember.lobbyingReceipts.length === 0 ? (
              <p className="text-sm text-gray-600">
                No lobbying receipts in the past year.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Lobbyist
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Payee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Quarter
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentMember.lobbyingReceipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900">
                          {new Date(receipt.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {receipt.lobbyistName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {receipt.lobbyistEmail}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {receipt.payee}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {receipt.purpose}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                          ${receipt.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm whitespace-nowrap text-gray-600">
                          {receipt.quarter} {receipt.year}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap text-gray-900">
                        ${currentMember.totalReceiptAmount.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Retention Period Notice */}
      <div className="rounded-md bg-gray-100 p-4 text-sm text-gray-700">
        <p>
          <strong>Data Retention:</strong> Displaying records from the past{" "}
          {data.retentionPeriod} (since{" "}
          {new Date(data.cutoffDate).toLocaleDateString()}) as required by
          ordinance §3.001.
        </p>
      </div>
    </div>
  );
}
