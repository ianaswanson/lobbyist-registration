"use client";

import { useState } from "react";
import type { ColumnConfig } from "./GenericCSVUpload";

export interface BulkParseResult<T> {
  data: T[];
  errors: string[];
}

interface GenericBulkPasteProps<T> {
  columns: ColumnConfig<T>[];
  parseData: (text: string) => BulkParseResult<T>;
  onImport: (items: T[]) => void;
  entityName: string; // e.g., "Expense Items", "Calendar Entries", "Receipts"
  description?: string;
  formatInstructions: string;
  exampleText: string;
  colorScheme?: "blue" | "green" | "purple" | "orange";
}

export function GenericBulkPaste<T>({
  columns,
  parseData,
  onImport,
  entityName,
  description,
  formatInstructions,
  exampleText,
  colorScheme = "purple",
}: GenericBulkPasteProps<T>) {
  const [textData, setTextData] = useState("");
  const [preview, setPreview] = useState<T[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleParse = () => {
    setErrors([]);
    const result = parseData(textData);

    setErrors(result.errors);
    setPreview(result.data);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setTextData("");
      setPreview([]);
      setErrors([]);
    }
  };

  return (
    <div className="space-y-4">
      {description && (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <p>{description}</p>
        </div>
      )}

      <div className="rounded-lg border-2 border-primary/30 bg-primary/10 p-4">
        <h4 className="mb-2 font-semibold text-primary">
          Format Instructions:
        </h4>
        <p className="mb-2 text-sm text-primary/80">{formatInstructions}</p>
        <code className="block rounded bg-primary/20 p-2 text-xs whitespace-pre-wrap text-primary">
          {columns.map((col) => col.label).join(", ")}
        </code>
        <p className="mt-2 text-xs text-primary">Example: {exampleText}</p>
      </div>

      {/* Paste Area */}
      <div>
        <label
          htmlFor="bulkPaste"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Paste Your Data:
        </label>
        <textarea
          id="bulkPaste"
          rows={8}
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary focus:ring-primary focus:outline-none"
          placeholder={exampleText}
          aria-describedby="paste-instructions"
        />
      </div>

      <button
        onClick={handleParse}
        disabled={!textData.trim()}
        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:bg-gray-300"
      >
        Parse Data
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          className="rounded-lg border-2 border-red-200 bg-destructive/10 p-4"
          role="alert"
        >
          <h4 className="mb-2 font-semibold text-red-900">Errors:</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-lg border-2 border-success/30 bg-success/10 p-4">
          <h4 className="mb-3 font-semibold text-green-900">
            Preview ({preview.length} items):
          </h4>

          <div className="mb-4 max-h-60 overflow-y-auto rounded border bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-2 py-2">
                        {col.render
                          ? col.render(item[col.key])
                          : String(item[col.key] || "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            className="w-full rounded-md bg-success px-4 py-2 text-white hover:bg-success focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
          >
            Import {preview.length} {entityName}
          </button>
        </div>
      )}
    </div>
  );
}
