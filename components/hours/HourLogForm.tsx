"use client"

import { useState } from "react"

interface Props {
  onSuccess: () => void
}

export function HourLogForm({ onSuccess }: Props) {
  const [activityDate, setActivityDate] = useState("")
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/hours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityDate,
          hours: parseFloat(hours),
          description,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add hour log")
      }

      const data = await response.json()

      // Show success message if threshold was just exceeded
      if (data.thresholdExceeded && data.totalHours >= 10 && data.totalHours - parseFloat(hours) < 10) {
        alert("⚠️ You have exceeded 10 hours! Registration is now required within 3 working days.")
      }

      // Reset form
      setActivityDate("")
      setHours("")
      setDescription("")

      // Call success callback to refresh data
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Activity Date */}
        <div>
          <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700">
            Activity Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="activityDate"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Can't log future dates
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            When did this lobbying activity occur?
          </p>
        </div>

        {/* Hours */}
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
            Hours <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0.25"
            max="24"
            step="0.25"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., 2.5"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lobbying time only (excludes travel)
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Activity Description <span className="text-red-600">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Describe the lobbying activity (e.g., meeting with county commissioners about transportation policy)"
        />
        <p className="mt-1 text-xs text-gray-500">
          Provide a brief description of your lobbying activity
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Hours"}
        </button>
      </div>
    </form>
  )
}
