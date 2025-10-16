"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface PublicNavigationProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
}

export function PublicNavigation({ user }: PublicNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left side - Logo and public nav items */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold hover:text-blue-600 transition-colors"
            >
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">Lobbyist Registry</span>
              <span className="sm:hidden">Registry</span>
            </Link>

            {/* Public nav items */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/exemption-checker"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/exemption-checker")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="mr-1.5">🎯</span>
                Exemption Checker
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/search")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="mr-1.5">🔍</span>
                Search
              </Link>
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

        {/* Mobile nav */}
        <div className="md:hidden pb-3 pt-2">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/exemption-checker"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive("/exemption-checker")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-1">🎯</span>
              Exemption Checker
            </Link>
            <Link
              href="/search"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive("/search")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-1">🔍</span>
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
