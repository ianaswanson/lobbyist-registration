"use client"

import { useState } from "react"
import type { ColumnConfig } from "./GenericCSVUpload"

export interface BulkParseResult<T> {
  data: T[]
  errors: string[]
}

interface GenericBulkPasteProps<T> {
  columns: ColumnConfig<T>[]
  parseData: (text: string) => BulkParseResult<T>
  onImport: (items: T[]) => void
  entityName: string // e.g., "Expense Items", "Calendar Entries", "Receipts"
  description?: string
  formatInstructions: string
  exampleText: string
  colorScheme?: "blue" | "green" | "purple" | "orange"
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
  const [textData, setTextData] = useState("")
  const [preview, setPreview] = useState<T[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleParse = () => {
    setErrors([])
    const result = parseData(textData)

    setErrors(result.errors)
    setPreview(result.data)
  }

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview)
      setTextData("")
      setPreview([])
      setErrors([])
    }
  }

  return (
    <div className="space-y-4">
      {description && (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <p>{description}</p>
        </div>
      )}

      <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
        <h4 className="font-semibold text-purple-900 mb-2">
          Format Instructions:
        </h4>
        <p className="text-sm text-purple-700 mb-2">
          {formatInstructions}
        </p>
        <code className="block rounded bg-purple-100 p-2 text-xs text-purple-900 whitespace-pre-wrap">
          {columns.map(col => col.label).join(", ")}
        </code>
        <p className="mt-2 text-xs text-purple-600">
          Example: {exampleText}
        </p>
      </div>

      {/* Paste Area */}
      <div>
        <label
          htmlFor="bulkPaste"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Paste Your Data:
        </label>
        <textarea
          id="bulkPaste"
          rows={8}
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          placeholder={exampleText}
          aria-describedby="paste-instructions"
        />
      </div>

      <button
        onClick={handleParse}
        disabled={!textData.trim()}
        className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Parse Data
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4" role="alert">
          <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <h4 className="font-semibold text-green-900 mb-3">
            Preview ({preview.length} items):
          </h4>

          <div className="mb-4 max-h-60 overflow-y-auto rounded border bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500"
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
            className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Import {preview.length} {entityName}
          </button>
        </div>
      )}
    </div>
  )
}
