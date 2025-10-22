"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import {
  Building2,
  FileText,
  Clock,
  DollarSign,
  Scale,
  Briefcase,
  Calendar,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Gavel,
  FileCheck,
  Search,
  TrendingUp,
  Target,
  Menu,
  X,
  Home,
  Bell,
  LogOut,
  ChevronDown,
  Clipboard,
  Settings,
} from "lucide-react";

interface NavigationProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: UserRole | null;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Role-specific "My Work" navigation items
const MY_WORK_ITEMS: Record<UserRole, NavItem[]> = {
  LOBBYIST: [
    {
      label: "My Reports",
      href: "/reports/lobbyist",
      icon: DollarSign,
      description: "View and manage expense reports",
    },
    {
      label: "My Violations",
      href: "/my-violations",
      icon: AlertTriangle,
      description: "View violations and appeals",
    },
  ],
  EMPLOYER: [
    {
      label: "Expense Reports",
      href: "/reports/employer",
      icon: Briefcase,
      description: "View and manage employer reports",
    },
    {
      label: "My Violations",
      href: "/my-violations",
      icon: AlertTriangle,
      description: "View violations and appeals",
    },
  ],
  BOARD_MEMBER: [
    {
      label: "Calendar & Receipts",
      href: "/board-member/calendar",
      icon: Calendar,
      description: "Post calendar and receipts",
    },
    {
      label: "My Submissions",
      href: "/reports/board-member",
      icon: FileText,
      description: "View submission history",
    },
  ],
  ADMIN: [],
  PUBLIC: [],
};

// Public data navigation items (available to everyone)
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

// Admin navigation sections
const ADMIN_SECTIONS: NavSection[] = [
  {
    label: "Review & Approval",
    items: [
      {
        label: "Review Registrations",
        href: "/admin/review/registrations",
        icon: CheckCircle,
      },
      {
        label: "Review Reports",
        href: "/admin/review/reports",
        icon: Clipboard,
      },
    ],
  },
  {
    label: "Enforcement",
    items: [
      {
        label: "Compliance Dashboard",
        href: "/admin/compliance",
        icon: BarChart3,
      },
      {
        label: "Violations & Fines",
        href: "/admin/violations",
        icon: AlertTriangle,
      },
      {
        label: "Appeals",
        href: "/admin/appeals",
        icon: Gavel,
      },
    ],
  },
  {
    label: "Special Cases",
    items: [
      {
        label: "Contract Exceptions",
        href: "/admin/contract-exceptions",
        icon: FileCheck,
      },
      ...(FEATURE_FLAGS.EMAIL_NOTIFICATIONS
        ? [
            {
              label: "Notifications",
              href: "/admin/notifications",
              icon: Bell,
            },
          ]
        : []),
    ],
  },
];

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMyWorkOpen, setIsMyWorkOpen] = useState(false);
  const [isPublicDataOpen, setIsPublicDataOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for click outside detection
  const myWorkRef = useRef<HTMLDivElement>(null);
  const publicDataRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get role-specific My Work items
  const myWorkItems = user.role ? MY_WORK_ITEMS[user.role] : [];

  // Filter public data items by feature flags
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        myWorkRef.current &&
        !myWorkRef.current.contains(event.target as Node)
      ) {
        setIsMyWorkOpen(false);
      }
      if (
        publicDataRef.current &&
        !publicDataRef.current.contains(event.target as Node)
      ) {
        setIsPublicDataOpen(false);
      }
      if (
        adminRef.current &&
        !adminRef.current.contains(event.target as Node)
      ) {
        setIsAdminOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const getRoleDisplay = () => {
    return user.role?.replace("_", " ") || "USER";
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo and nav items */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-xl font-bold transition-colors hover:text-blue-600"
              >
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="hidden sm:inline">Lobbyist Registry</span>
                <span className="sm:hidden">Registry</span>
              </Link>

              {/* Desktop Navigation - Grouped Dropdowns */}
              <div className="hidden items-center space-x-1 md:flex">
                {/* My Work Dropdown (role-specific) - for non-admins */}
                {myWorkItems.length > 0 && (
                  <div ref={myWorkRef} className="relative">
                    <button
                      onClick={() => {
                        setIsMyWorkOpen(!isMyWorkOpen);
                        setIsPublicDataOpen(false);
                        setIsAdminOpen(false);
                      }}
                      className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Clipboard className="h-4 w-4" />
                      <span>My Work</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isMyWorkOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isMyWorkOpen && (
                      <div className="ring-opacity-5 absolute left-0 z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black">
                        <div className="py-1">
                          {myWorkItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMyWorkOpen(false)}
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
                )}

                {/* Admin Dropdown (admin only) - shown FIRST for admins */}
                {user.role === "ADMIN" && (
                  <div ref={adminRef} className="relative">
                    <button
                      onClick={() => {
                        setIsAdminOpen(!isAdminOpen);
                        setIsMyWorkOpen(false);
                        setIsPublicDataOpen(false);
                      }}
                      className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isAdminOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isAdminOpen && (
                      <div className="ring-opacity-5 absolute left-0 z-50 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black">
                        <div className="py-1">
                          {ADMIN_SECTIONS.map((section, sectionIndex) => (
                            <div key={section.label}>
                              {sectionIndex > 0 && (
                                <div className="my-1 border-t" />
                              )}
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                {section.label}
                              </div>
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsAdminOpen(false)}
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Public Data Dropdown (everyone) - shown AFTER role-specific menus */}
                <div ref={publicDataRef} className="relative">
                  <button
                    onClick={() => {
                      setIsPublicDataOpen(!isPublicDataOpen);
                      setIsMyWorkOpen(false);
                      setIsAdminOpen(false);
                    }}
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

            {/* Right side - Mobile menu button and User menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Role badge */}
              <span className="hidden rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 sm:inline-flex">
                {getRoleDisplay()}
              </span>

              {/* User menu dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="hidden sm:inline">
                    {user.name || user.email}
                  </span>
                  <span className="sm:hidden">
                    <Home className="h-5 w-5" />
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="ring-opacity-5 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black">
                    <div className="py-1">
                      {/* User info */}
                      <div className="border-b px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>

                      {/* Update Registration (lobbyists only) */}
                      {user.role === "LOBBYIST" && (
                        <Link
                          href="/register/lobbyist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Update Registration</span>
                        </Link>
                      )}

                      <div className="border-t">
                        <button
                          onClick={() => {
                            window.location.href = "/auth/signout";
                          }}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="bg-opacity-50 fixed inset-0 bg-black"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-full overflow-y-auto bg-white shadow-xl">
            <div className="p-4">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <span className="text-lg font-bold">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md p-2 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* My Work Section */}
              {myWorkItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    My Work
                  </h3>
                  {myWorkItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rounded-md px-4 py-3 transition-colors ${
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Public Data Section */}
              <div className="mb-6">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Public Data
                </h3>
                {publicDataItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 rounded-md px-4 py-3 transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Admin Section */}
              {user.role === "ADMIN" && (
                <div>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Admin
                  </h3>
                  {ADMIN_SECTIONS.map((section) => (
                    <div key={section.label} className="mb-4">
                      <h4 className="px-4 py-2 text-xs font-medium text-gray-400">
                        {section.label}
                      </h4>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 rounded-md px-4 py-3 transition-colors ${
                              isActive(item.href)
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
