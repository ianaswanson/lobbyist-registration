"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserRole } from "@prisma/client"
import { useState } from "react"

interface NavigationProps {
  user: {
    name?: string | null
    email?: string | null
    role?: UserRole | null
  }
}

interface NavItem {
  label: string
  href: string
  roles: UserRole[]
  icon?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["ADMIN", "LOBBYIST", "EMPLOYER", "BOARD_MEMBER", "PUBLIC"],
    icon: "📊",
  },
  // Lobbyist items
  {
    label: "Register",
    href: "/register/lobbyist",
    roles: ["LOBBYIST"],
    icon: "📝",
  },
  {
    label: "Hour Tracking",
    href: "/hours",
    roles: ["LOBBYIST"],
    icon: "⏱️",
  },
  {
    label: "My Reports",
    href: "/reports/lobbyist",
    roles: ["LOBBYIST"],
    icon: "💰",
  },
  // Employer items
  {
    label: "Expense Reports",
    href: "/reports/employer",
    roles: ["EMPLOYER"],
    icon: "💼",
  },
  // Board Member items
  {
    label: "Calendar & Receipts",
    href: "/board-member/calendar",
    roles: ["BOARD_MEMBER"],
    icon: "📅",
  },
  // Admin items
  {
    label: "Review",
    href: "/admin/review/registrations",
    roles: ["ADMIN"],
    icon: "✅",
  },
  {
    label: "Compliance",
    href: "/admin/compliance",
    roles: ["ADMIN"],
    icon: "📋",
  },
  {
    label: "Violations",
    href: "/admin/violations",
    roles: ["ADMIN"],
    icon: "⚠️",
  },
  // Public items
  {
    label: "Search",
    href: "/search",
    roles: ["ADMIN", "LOBBYIST", "EMPLOYER", "BOARD_MEMBER", "PUBLIC"],
    icon: "🔍",
  },
  {
    label: "Exemption Checker",
    href: "/exemption-checker",
    roles: ["LOBBYIST", "EMPLOYER", "BOARD_MEMBER", "PUBLIC"],
    icon: "🎯",
  },
]

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Filter nav items based on user role
  const visibleItems = NAV_ITEMS.filter((item) =>
    user.role ? item.roles.includes(user.role) : false
  )

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left side - Logo and nav items */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-xl font-bold hover:text-blue-600 transition-colors"
            >
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">Lobbyist Registry</span>
              <span className="sm:hidden">Registry</span>
            </Link>

            {/* Nav items */}
            <div className="hidden md:flex items-center space-x-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Role badge */}
            <span className="hidden sm:inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {user.role?.replace("_", " ")}
            </span>

            {/* User menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <span className="hidden sm:inline">{user.name || user.email}</span>
                <span className="sm:hidden">👤</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      {/* User info */}
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📊 Dashboard
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin/notifications"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🔔 Notifications
                        </Link>
                      )}

                      <div className="border-t">
                        <form action="/api/auth/signout" method="POST">
                          <button
                            type="submit"
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            🚪 Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden pb-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
