"use client"

import { useState } from "react"

interface DemoAccount {
  role: string
  name: string
  email: string
  password: string
  icon: string
  color: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "Admin",
    name: "County Administrator",
    email: "admin@multnomah.gov",
    password: "admin123",
    icon: "👤",
    color: "bg-purple-600 hover:bg-purple-700",
  },
  {
    role: "Lobbyist",
    name: "John Doe",
    email: "john.doe@lobbying.com",
    password: "lobbyist123",
    icon: "🎯",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    role: "Employer",
    name: "Sarah Johnson (TechCorp)",
    email: "contact@techcorp.com",
    password: "employer123",
    icon: "🏢",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    role: "Board Member",
    name: "Commissioner Williams",
    email: "commissioner@multnomah.gov",
    password: "board123",
    icon: "🏛️",
    color: "bg-orange-600 hover:bg-orange-700",
  },
  {
    role: "Public",
    name: "Public User",
    email: "public@example.com",
    password: "public123",
    icon: "👥",
    color: "bg-gray-600 hover:bg-gray-700",
  },
]

export function DemoCredentialsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleAutoFill = (email: string, password: string) => {
    // Fill in the form fields
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    if (emailInput && passwordInput) {
      emailInput.value = email
      passwordInput.value = password

      // Trigger change events for form validation
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

      // Optional: collapse the panel after filling
      setIsExpanded(false)

      // Focus on submit button
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
      submitButton?.focus()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center text-xs font-bold shadow-lg z-10"
          aria-label="Dismiss demo credentials panel"
        >
          ×
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-4 py-3 text-white">
              <h3 className="font-semibold text-sm">Demo Test Accounts</h3>
              <p className="text-xs text-blue-100 mt-1">Click any account to auto-fill credentials</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleAutoFill(account.email, account.password)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors focus:outline-none focus:bg-blue-50"
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">{account.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{account.role}</span>
                        <span className="text-xs text-gray-500">- {account.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 font-mono truncate">
                        {account.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Password: <span className="font-mono">{account.password}</span>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={isExpanded ? "Collapse demo credentials" : "Show demo credentials"}
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <span>Demo Accounts</span>
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
