"use client";

import { useState } from "react";
import Link from "next/link";
import {
  exportLobbyistsToCSV,
  exportEmployersToCSV,
  exportAllToCSV,
  downloadCSV,
  type LobbyistExportData,
  type EmployerExportData,
} from "@/lib/csv-export";
import { PublicNavigation } from "@/components/PublicNavigation";

interface SearchClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

interface SearchFilters {
  searchTerm: string;
  entityType: "all" | "lobbyists" | "employers";
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  showAdvanced: boolean;
}

interface Lobbyist {
  id: string;
  name: string;
  email: string;
  employer: string;
  subjects: string;
  registrationDate: string;
  totalExpenses: number;
}

interface Employer {
  id: string;
  name: string;
  email: string;
  businessDescription: string;
  lobbyistCount: number;
  totalExpenses: number;
}

export function SearchClient({ user }: SearchClientProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    entityType: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    showAdvanced: false,
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lobbyists, setLobbyists] = useState<Lobbyist[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);

      const response = await fetch(`/api/public/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setLobbyists(data.lobbyists || []);
      setEmployers(data.employers || []);
    } catch (error) {
      console.error("Search error:", error);
      setLobbyists([]);
      setEmployers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      searchTerm: "",
      entityType: "all",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
      showAdvanced: false,
    });
    setHasSearched(false);
    setLobbyists([]);
    setEmployers([]);
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];

    if (filters.entityType === "lobbyists") {
      const csv = exportLobbyistsToCSV(lobbyists as any);
      downloadCSV(csv, `lobbyists-export-${timestamp}.csv`);
    } else if (filters.entityType === "employers") {
      const csv = exportEmployersToCSV(employers as any);
      downloadCSV(csv, `employers-export-${timestamp}.csv`);
    } else {
      // Export all
      const csv = exportAllToCSV(lobbyists as any, employers as any);
      downloadCSV(csv, `lobbying-data-export-${timestamp}.csv`);
    }
  };

  const showLobbyists =
    filters.entityType === "all" || filters.entityType === "lobbyists";
  const showEmployers =
    filters.entityType === "all" || filters.entityType === "employers";

  const filteredLobbyists = showLobbyists ? lobbyists : [];
  const filteredEmployers = showEmployers ? employers : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Search Lobbyist Registry
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Search registered lobbyists, employers, and lobbying activities in
            Multnomah County
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {/* Basic Search */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="searchTerm"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Search
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  placeholder="Search by name, employer, or subject..."
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Search In:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="all"
                      checked={filters.entityType === "all"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          entityType: e.target.value as any,
                        })
                      }
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      All Results
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="lobbyists"
                      checked={filters.entityType === "lobbyists"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          entityType: e.target.value as any,
                        })
                      }
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Lobbyists Only
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="employers"
                      checked={filters.entityType === "employers"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          entityType: e.target.value as any,
                        })
                      }
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Employers Only
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mt-4 border-t pt-4">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    showAdvanced: !filters.showAdvanced,
                  })
                }
                className="flex items-center text-sm font-medium text-primary hover:text-primary"
              >
                {filters.showAdvanced ? "Hide" : "Show"} Advanced Filters
                <svg
                  className={`ml-2 h-4 w-4 transition-transform ${
                    filters.showAdvanced ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Advanced Filters */}
            {filters.showAdvanced && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="dateFrom"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Date From
                    </label>
                    <input
                      type="date"
                      id="dateFrom"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dateTo"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Date To
                    </label>
                    <input
                      type="date"
                      id="dateTo"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="minAmount"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Min Expense Amount
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="minAmount"
                        min="0"
                        step="0.01"
                        value={filters.minAmount}
                        onChange={(e) =>
                          setFilters({ ...filters, minAmount: e.target.value })
                        }
                        className="block w-full rounded-md border border-gray-300 py-2 pr-3 pl-7 focus:border-primary focus:ring-primary focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="maxAmount"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Max Expense Amount
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="maxAmount"
                        min="0"
                        step="0.01"
                        value={filters.maxAmount}
                        onChange={(e) =>
                          setFilters({ ...filters, maxAmount: e.target.value })
                        }
                        className="block w-full rounded-md border border-gray-300 py-2 pr-3 pl-7 focus:border-primary focus:ring-primary focus:outline-none"
                        placeholder="10000.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-8 space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                Found{" "}
                <strong>
                  {(showLobbyists ? filteredLobbyists.length : 0) +
                    (showEmployers ? filteredEmployers.length : 0)}
                </strong>{" "}
                results
              </p>
              {((showLobbyists && filteredLobbyists.length > 0) ||
                (showEmployers && filteredEmployers.length > 0)) && (
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 rounded-md bg-success px-4 py-2 text-sm text-white hover:bg-success"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export to CSV</span>
                </button>
              )}
            </div>

            {/* Lobbyist Results */}
            {showLobbyists && filteredLobbyists.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Registered Lobbyists ({filteredLobbyists.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {filteredLobbyists.map((lobbyist) => (
                    <div
                      key={lobbyist.id}
                      className="p-6 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lobbyist.name}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Employer:</strong> {lobbyist.employer}
                            </p>
                            <p>
                              <strong>Subjects:</strong> {lobbyist.subjects}
                            </p>
                            <p>
                              <strong>Registered:</strong>{" "}
                              {new Date(
                                lobbyist.registrationDate
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Total Expenses:</strong> $
                              {lobbyist.totalExpenses.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/lobbyist/${lobbyist.id}`}
                          className="ml-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employer Results */}
            {showEmployers && filteredEmployers.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Employers ({filteredEmployers.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {filteredEmployers.map((employer) => (
                    <div
                      key={employer.id}
                      className="p-6 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {employer.name}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>{employer.businessDescription}</p>
                            <p>
                              <strong>Registered Lobbyists:</strong>{" "}
                              {employer.lobbyistCount}
                            </p>
                            <p>
                              <strong>Total Expenses:</strong> $
                              {employer.totalExpenses.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          disabled
                          className="ml-4 cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-sm text-gray-500"
                          title="Detail view coming soon"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {((showLobbyists && filteredLobbyists.length === 0) ||
              (showEmployers && filteredEmployers.length === 0)) &&
              !(showLobbyists && filteredLobbyists.length > 0) &&
              !(showEmployers && filteredEmployers.length > 0) && (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No results found
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Information */}
        {!hasSearched && (
          <div className="mt-8 rounded-lg border border-blue-200 bg-primary/10 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">
              About This Database
            </h3>
            <p className="mb-3 text-sm text-primary">
              This public database contains information about registered
              lobbyists, their employers, and lobbying expenditures in Multnomah
              County as required by ordinance.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-primary">
              <li>Search by lobbyist name, employer, or subject matter</li>
              <li>View expense reports and lobbying activities</li>
              <li>Filter by date range and expense amounts</li>
              <li>All data is updated quarterly</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
