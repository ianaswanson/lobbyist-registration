"use client"

import { useState } from "react"

export default function AdminNotificationsPage() {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testName, setTestName] = useState("Test User")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const sendTestReminder = async () => {
    setSending(true)
    setResult(null)

    try {
      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("📧 Test deadline reminder sent to:", testEmail)
      setResult(`✅ Test deadline reminder sent to ${testEmail}. Check browser console for details.`)
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`)
    } finally {
      setSending(false)
    }
  }

  const sendTestOverdue = async () => {
    setSending(true)
    setResult(null)

    try {
      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("📧 Test overdue notice sent to:", testEmail)
      setResult(`✅ Test overdue notice sent to ${testEmail}. Check browser console for details.`)
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`)
    } finally {
      setSending(false)
    }
  }

  const sendTestApproval = async () => {
    setSending(true)
    setResult(null)

    try {
      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("📧 Test approval notification sent to:", testEmail)
      setResult(`✅ Test approval notification sent to ${testEmail}. Check browser console for details.`)
    } catch (error) {
      setResult(`❌ Failed to send: ${error}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold">
                Lobbyist Registration System
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Email Notifications
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and test automated email notifications
              </p>
            </div>
            <a
              href="/admin/compliance"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="rounded-lg border bg-white p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Automated Notification Schedule
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">
                Deadline Reminders
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Sent automatically 14 days, 7 days, 1 day, and on the day of quarterly report deadlines
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Recipients: All active lobbyists and employers
              </p>
            </div>

            <div className="border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-900">Overdue Notices</h3>
              <p className="text-sm text-red-700 mt-1">
                Sent daily to lobbyists/employers with overdue reports
              </p>
              <p className="text-xs text-red-600 mt-2">
                Recipients: Those with reports past the quarterly deadline
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">
                Registration Approvals
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Sent immediately when admin approves a lobbyist registration
              </p>
              <p className="text-xs text-green-600 mt-2">
                Trigger: Manual approval action
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-lg border bg-white p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Quarterly Deadlines
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-semibold">Q1 2025 Reports</span>
                <span className="ml-3 text-sm text-gray-600">
                  Due: April 15, 2025
                </span>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                12 days remaining
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-semibold">Q2 2025 Reports</span>
                <span className="ml-3 text-sm text-gray-600">
                  Due: July 15, 2025
                </span>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                104 days remaining
              </span>
            </div>
          </div>
        </div>

        {/* Test Notifications */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Email Notifications
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Send test emails to verify templates and delivery. Emails are logged
            to the browser console in prototype mode.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="testEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Test Email Address
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="testName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Test Recipient Name
              </label>
              <input
                type="text"
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Test User"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={sendTestReminder}
              disabled={sending}
              className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {sending ? "Sending..." : "Send Test Deadline Reminder"}
            </button>
            <button
              onClick={sendTestOverdue}
              disabled={sending}
              className="rounded-md bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
            >
              {sending ? "Sending..." : "Send Test Overdue Notice"}
            </button>
            <button
              onClick={sendTestApproval}
              disabled={sending}
              className="rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
            >
              {sending ? "Sending..." : "Send Test Approval"}
            </button>
          </div>

          {result && (
            <div
              className={`mt-6 rounded-md p-4 ${
                result.startsWith("✅")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result}
            </div>
          )}

          <div className="mt-6 rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> In prototype mode, emails are logged to the
              browser console instead of being sent. In production, integrate with
              an email service like SendGrid, AWS SES, or similar.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
