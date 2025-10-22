"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Building2,
  Search,
  FileCheck,
  TrendingUp,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface PublicNavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const PUBLIC_DATA_ITEMS: NavItem[] = [
  {
    label: "Search Registry",
    href: "/search",
    icon: Search,
    description: "Search lobbyist records",
  },
  {
    label: "Board Member Calendars",
    href: "/board-calendars",
    icon: Calendar,
    description: "View board member calendars and receipts",
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
];

export function PublicNavigation({ user }: PublicNavigationProps) {
  const pathname = usePathname();
  const [isPublicDataOpen, setIsPublicDataOpen] = useState(false);
  const publicDataRef = useRef<HTMLDivElement>(null);

  const publicDataItems = PUBLIC_DATA_ITEMS.filter((item) => {
    if (item.href === "/analytics" && !FEATURE_FLAGS.ANALYTICS_DASHBOARD) {
      return false;
    }
    if (
      item.href === "/contract-exceptions" &&
      !FEATURE_FLAGS.CONTRACT_EXCEPTIONS
    ) {
      return false;
    }
    return true;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        publicDataRef.current &&
        !publicDataRef.current.contains(event.target as Node)
      ) {
        setIsPublicDataOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and nav items */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold transition-colors hover:text-blue-600"
            >
              <Building2 className="h-6 w-6" />
              <span className="hidden sm:inline">Lobbyist Registry</span>
              <span className="sm:hidden">Registry</span>
            </Link>

            {/* Public Data Dropdown */}
            <div className="hidden items-center space-x-1 md:flex">
              <div ref={publicDataRef} className="relative">
                <button
                  onClick={() => setIsPublicDataOpen(!isPublicDataOpen)}
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Search className="h-4 w-4" />
                  <span>Public Data</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isPublicDataOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isPublicDataOpen && (
                  <div className="ring-opacity-5 absolute left-0 z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black">
                    <div className="py-1">
                      {publicDataItems.map((item) => {
                        const Icon = item.icon;
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
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
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
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                {/* User is not authenticated - show sign in link */}
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
