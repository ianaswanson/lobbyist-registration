"use client";

import { useState } from "react";
import { parseICSFile, type ICSEvent } from "@/lib/ics-parser";

export interface ICSParseResult<T> {
  data: T[];
  errors: string[];
}

export interface ICSMapConfig<T> {
  mapEvent: (event: ICSEvent) => T | null;
}

interface GenericICSUploadProps<T> {
  mapConfig: ICSMapConfig<T>;
  onImport: (items: T[]) => void;
  entityName: string;
  description?: string;
  renderPreview?: (item: T, index: number) => React.ReactNode;
  colorScheme?: "blue" | "green" | "purple" | "orange";
}

export function GenericICSUpload<T>({
  mapConfig,
  onImport,
  entityName,
  description = "Upload an ICS/iCal calendar file to import events.",
  renderPreview,
  colorScheme = "purple",
}: GenericICSUploadProps<T>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<T[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const colorClasses = {
    blue: {
      border: "border-blue-300 dark:border-blue-700",
      bg: "bg-primary/10 dark:bg-blue-900/20",
      text: "text-primary dark:text-blue-300",
      button: "bg-primary hover:bg-primary",
      badge: "bg-primary/20 text-primary dark:bg-blue-900 dark:text-blue-200",
    },
    green: {
      border: "border-green-300 dark:border-green-700",
      bg: "bg-success/10 dark:bg-green-900/20",
      text: "text-success dark:text-green-300",
      button: "bg-success hover:bg-success",
      badge:
        "bg-success/20 text-success-foreground dark:bg-green-900 dark:text-green-200",
    },
    purple: {
      border: "border-primary/30 dark:border-primary/50",
      bg: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary/80 dark:text-primary/70",
      button: "bg-primary hover:bg-primary/90",
      badge:
        "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary/90",
    },
    orange: {
      border: "border-orange-300 dark:border-orange-700",
      bg: "bg-primary/10 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      button: "bg-orange-600 hover:bg-orange-700",
      badge:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
  };

  const colors = colorClasses[colorScheme];

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setParsedData([]);
    setParseErrors([]);

    try {
      const text = await file.text();
      const { events, errors } = parseICSFile(text);

      // Map ICS events to target type
      const mapped: T[] = [];
      const mappingErrors: string[] = [...errors];

      events.forEach((event, index) => {
        try {
          const mappedItem = mapConfig.mapEvent(event);
          if (mappedItem) {
            mapped.push(mappedItem);
          } else {
            mappingErrors.push(
              `Event ${index + 1}: Could not map event "${event.summary}"`
            );
          }
        } catch (error) {
          mappingErrors.push(`Event ${index + 1}: Mapping error - ${error}`);
        }
      });

      setParsedData(mapped);
      setParseErrors(mappingErrors);
    } catch (error) {
      setParseErrors([`Failed to read file: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleImport() {
    if (parsedData.length > 0) {
      onImport(parsedData);
      // Reset state
      setSelectedFile(null);
      setParsedData([]);
      setParseErrors([]);
    }
  }

  function handleCancel() {
    setSelectedFile(null);
    setParsedData([]);
    setParseErrors([]);
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {/* File Upload */}
      <div
        className={`rounded-lg border-2 border-dashed p-6 ${colors.border} ${colors.bg}`}
      >
        <div className="flex flex-col items-center gap-4">
          <svg
            className={`h-12 w-12 ${colors.text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <div className="text-center">
            <label
              htmlFor="ics-upload"
              className={`cursor-pointer font-medium ${colors.text} hover:underline`}
            >
              Choose ICS/iCal file
            </label>
            <input
              id="ics-upload"
              type="file"
              accept=".ics,.ical"
              onChange={handleFileSelect}
              className="sr-only"
              aria-describedby="ics-upload-instructions"
            />
            <p
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
              id="ics-upload-instructions"
            >
              Supports .ics and .ical calendar files
            </p>
          </div>

          {selectedFile && (
            <div className={`rounded-full px-3 py-1 text-sm ${colors.badge}`}>
              {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="py-4 text-center">
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
            role="status"
            aria-label="Loading"
          >
            <span className="sr-only">Processing...</span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Parsing calendar file...
          </p>
        </div>
      )}

      {/* Errors */}
      {parseErrors.length > 0 && (
        <div
          className="rounded-lg border border-red-200 bg-destructive/10 p-4 dark:border-red-800 dark:bg-red-900/20"
          role="alert"
        >
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-200">
            Parsing Issues
          </h3>
          <ul className="space-y-1 text-sm text-destructive dark:text-red-300">
            {parseErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {parsedData.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Preview ({parsedData.length}{" "}
              {parsedData.length === 1 ? "event" : "events"})
            </h3>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {renderPreview ? (
              parsedData.map((item, index) => renderPreview(item, index))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {parsedData.length} item{parsedData.length !== 1 ? "s" : ""}{" "}
                ready to import
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleImport}
              className={`flex-1 ${colors.button} rounded-lg px-4 py-2 text-white transition-all hover:shadow-md`}
            >
              Import {parsedData.length}{" "}
              {parsedData.length === 1 ? "Event" : "Events"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
