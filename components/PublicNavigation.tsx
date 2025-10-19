"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Building2, Search, Target, FileCheck, TrendingUp, ChevronDown } from "lucide-react"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

interface PublicNavigationProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const PUBLIC_DATA_ITEMS: NavItem[] = [
  {
    label: "Search Registry",
    href: "/search",
    icon: Search,
    description: "Search lobbyist records",
  },
  {
    label: "Analytics Dashboard",
    href: "/analytics",
    icon: TrendingUp,
    description: "View spending trends",
  },
  {
    label: "Contract Exceptions",
    href: "/contract-exceptions",
    icon: FileCheck,
    description: "View approved exceptions",
  },
  {
    label: "Exemption Checker",
    href: "/exemption-checker",
    icon: Target,
    description: "Check if you need to register",
  },
]

export function PublicNavigation({ user }: PublicNavigationProps) {
  const pathname = usePathname()
  const [isPublicDataOpen, setIsPublicDataOpen] = useState(false)
  const publicDataRef = useRef<HTMLDivElement>(null)

  const publicDataItems = PUBLIC_DATA_ITEMS.filter((item) => {
    if (item.href === "/analytics" && !FEATURE_FLAGS.ANALYTICS_DASHBOARD) {
      return false
    }
    if (item.href === "/contract-exceptions" && !FEATURE_FLAGS.CONTRACT_EXCEPTIONS) {
      return false
    }
    return true
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (publicDataRef.current && !publicDataRef.current.contains(event.target as Node)) {
        setIsPublicDataOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side - Logo and nav items */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold hover:text-blue-600 transition-colors"
            >
              <Building2 className="w-6 h-6" />
              <span className="hidden sm:inline">Lobbyist Registry</span>
              <span className="sm:hidden">Registry</span>
            </Link>

            {/* Public Data Dropdown */}
            <div className="hidden md:flex items-center space-x-1">
              <div ref={publicDataRef} className="relative">
                <button
                  onClick={() => setIsPublicDataOpen(!isPublicDataOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Public Data</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isPublicDataOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isPublicDataOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {publicDataItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsPublicDataOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                              isActive(item.href)
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Auth status */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User is authenticated - show dashboard link */}
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                {/* User is not authenticated - show sign in link */}
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}
