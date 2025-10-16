"use client"

import { useState } from "react"

interface DemoFile {
  name: string
  description: string
  path: string
  icon: string
  type: "csv" | "ics"
}

interface DemoFilesPanelProps {
  /** Which page this panel is being used on */
  page: "board-calendar" | "lobbyist-expenses" | "employer-expenses"
}

const FILE_CONFIGS: Record<string, DemoFile[]> = {
  "board-calendar": [
    {
      name: "Calendar Events (CSV)",
      description: "Sample quarterly calendar with 3 events",
      path: "/demo-files/board-calendar-sample.csv",
      icon: "📅",
      type: "csv",
    },
    {
      name: "Calendar Events (ICS)",
      description: "iCalendar format for importing into calendar apps",
      path: "/demo-files/board-calendar-sample.ics",
      icon: "📆",
      type: "ics",
    },
    {
      name: "Lobbying Receipts (CSV)",
      description: "Sample lobbying receipts from lobbyists",
      path: "/demo-files/lobbying-receipts-sample.csv",
      icon: "🧾",
      type: "csv",
    },
  ],
  "lobbyist-expenses": [
    {
      name: "Lobbyist Expenses (CSV)",
      description: "Sample quarterly expense report with 4 line items",
      path: "/demo-files/lobbyist-expenses-sample.csv",
      icon: "💰",
      type: "csv",
    },
  ],
  "employer-expenses": [
    {
      name: "Employer Expenses (CSV)",
      description: "Sample employer payments to lobbyists",
      path: "/demo-files/employer-expenses-sample.csv",
      icon: "💼",
      type: "csv",
    },
  ],
}

export function DemoFilesPanel({ page }: DemoFilesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const files = FILE_CONFIGS[page] || []

  if (!isVisible || files.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center text-xs font-bold shadow-lg z-10"
          aria-label="Dismiss demo files panel"
        >
          ×
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-green-600 px-4 py-3 text-white">
              <h3 className="font-semibold text-sm">Demo Sample Files</h3>
              <p className="text-xs text-green-100 mt-1">Download these files to test upload/import features</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {files.map((file) => (
                <a
                  key={file.path}
                  href={file.path}
                  download
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => {
                    // Optional: Track downloads
                    console.log(`Downloaded: ${file.name}`)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">{file.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{file.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          file.type === "csv"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {file.description}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-green-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Download a sample file, then use the CSV Upload or Bulk Paste feature to import the data.
              </p>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          aria-label={isExpanded ? "Collapse demo files" : "Show demo files"}
          aria-expanded={isExpanded}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>Demo Files</span>
          <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
            {files.length}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
