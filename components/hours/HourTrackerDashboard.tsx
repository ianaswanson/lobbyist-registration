"use client"

import { useState, useEffect } from "react"
import { HourLogForm } from "./HourLogForm"
import { HourSummary } from "./HourSummary"
import { HourLogList } from "./HourLogList"
import { ThresholdAlert } from "./ThresholdAlert"

interface HourSummaryData {
  quarter: string
  year: number
  quarterStart: string
  quarterEnd: string
  daysRemaining: number
  totalHours: number
  thresholdExceeded: boolean
  hoursUntilThreshold: number
  registrationRequired: boolean
  thresholdExceededDate: string | null
  registrationDeadline: string | null
  registrationStatus: string
  recentLogs: HourLog[]
}

interface HourLog {
  id: string
  activityDate: string
  hours: number
  description: string
  quarter: string
  year: number
  createdAt: string
}

interface Props {
  userId: string
}

export function HourTrackerDashboard({ userId }: Props) {
  const [summary, setSummary] = useState<HourSummaryData | null>(null)
  const [logs, setLogs] = useState<HourLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch summary and logs in parallel
      const [summaryRes, logsRes] = await Promise.all([
        fetch("/api/hours/summary"),
        fetch("/api/hours"),
      ])

      if (!summaryRes.ok || !logsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const summaryData = await summaryRes.json()
      const logsData = await logsRes.json()

      setSummary(summaryData)
      setLogs(logsData)
    } catch (err) {
      setError("Failed to load hour tracking data. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleHourLogAdded = () => {
    // Refresh data after adding a new log
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Loading hour tracking data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Threshold Alert (if exceeded) */}
      {summary && summary.thresholdExceeded && (
        <ThresholdAlert
          thresholdExceededDate={summary.thresholdExceededDate}
          registrationDeadline={summary.registrationDeadline}
          registrationStatus={summary.registrationStatus}
        />
      )}

      {/* Summary Card */}
      {summary && <HourSummary summary={summary} />}

      {/* Add Hours Form */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Log Lobbying Hours
        </h3>
        <HourLogForm onSuccess={handleHourLogAdded} />
      </div>

      {/* Hour Log History */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activity History
        </h3>
        <HourLogList logs={logs} />
      </div>
    </div>
  )
}
