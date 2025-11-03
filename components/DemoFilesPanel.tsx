"use client";

import { useState } from "react";

interface DemoFile {
  name: string;
  description: string;
  path?: string;
  bulkData?: string;
  icon: string;
  type: "csv" | "ics" | "bulk-paste";
}

interface DemoFilesPanelProps {
  /** Which page this panel is being used on */
  page: "board-calendar" | "lobbyist-expenses" | "employer-expenses";
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
    {
      name: "Bulk Paste Data",
      description: "Tab-delimited data ready to copy and paste",
      bulkData:
        "Commissioner Williams\t2025-01-15\tPortland City Grill\tLunch meeting to discuss technology infrastructure\t125.00\n" +
        "Board Members\t2025-02-10\tOffice Supply Co\tConference materials and refreshments\t85.50\n" +
        "Commissioner Williams\t2025-03-05\tJake's Famous Crawfish\tDinner discussion about budget priorities\t175.00\n" +
        "Board Members\t2025-03-20\tPrintShop Pro\tResearch report printing and distribution\t45.00",
      icon: "📋",
      type: "bulk-paste",
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
    {
      name: "Bulk Paste Data",
      description: "Tab-delimited data ready to copy and paste",
      bulkData:
        "John Doe\t15000.00\tQuarterly retainer for lobbying services related to technology policy and government IT contracts\n" +
        "Jane Smith\t12500.00\tQuarterly retainer for healthcare policy advocacy and Medicaid expansion efforts",
      icon: "📋",
      type: "bulk-paste",
    },
  ],
};

export function DemoFilesPanel({ page }: DemoFilesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const files = FILE_CONFIGS[page] || [];

  const handleCopyBulkData = async (bulkData: string, index: number) => {
    try {
      await navigator.clipboard.writeText(bulkData);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      console.log("Copied bulk paste data to clipboard");
    } catch (err) {
      console.error("Failed to copy bulk data:", err);
    }
  };

  if (!isVisible || files.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-xs font-bold text-white shadow-lg hover:bg-gray-700"
          aria-label="Dismiss demo files panel"
        >
          ×
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="absolute bottom-full left-1/2 mb-2 w-96 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
            <div className="bg-success px-4 py-3 text-white">
              <h3 className="text-sm font-semibold">Demo Sample Files</h3>
              <p className="mt-1 text-xs text-green-100">
                Download these files to test upload/import features
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {files.map((file, index) => {
                const isBulkPaste = file.type === "bulk-paste";
                const isCopied = copiedIndex === index;

                const content = (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {file.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {file.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            file.type === "csv"
                              ? "bg-primary/20 text-primary"
                              : file.type === "bulk-paste"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {file.type === "bulk-paste"
                            ? "PASTE"
                            : file.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {file.description}
                      </div>
                    </div>
                    {isBulkPaste ? (
                      <div className="flex flex-shrink-0 items-center gap-1">
                        {isCopied ? (
                          <span className="text-xs font-medium text-success">
                            Copied!
                          </span>
                        ) : null}
                        <svg
                          className="h-5 w-5 text-success"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    )}
                  </div>
                );

                return isBulkPaste ? (
                  <button
                    key={`bulk-${index}`}
                    onClick={() =>
                      handleCopyBulkData(file.bulkData || "", index)
                    }
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    {content}
                  </button>
                ) : (
                  <a
                    key={file.path}
                    href={file.path}
                    download
                    className="block border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50"
                    onClick={() => {
                      console.log(`Downloaded: ${file.name}`);
                    }}
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Download CSV files or copy bulk paste
                data to clipboard, then use CSV Upload or Bulk Paste to import.
              </p>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-full bg-success px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-success focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
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
          <span className="rounded-full bg-success px-2 py-0.5 text-xs text-white">
            {files.length}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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
    </div>
  );
}
