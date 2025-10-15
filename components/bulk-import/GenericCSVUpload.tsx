"use client"

import { useState } from "react"

export interface ColumnConfig<T> {
  key: keyof T
  label: string
  render?: (value: any) => string
}

export interface CSVParseResult<T> {
  data: T[]
  errors: string[]
}

interface GenericCSVUploadProps<T> {
  templateUrl: string
  templateName: string
  columns: ColumnConfig<T>[]
  parseCSV: (text: string) => CSVParseResult<T>
  onImport: (items: T[]) => void
  entityName: string // e.g., "Expense Items", "Calendar Entries", "Receipts"
  description?: string
  colorScheme?: "blue" | "green" | "purple" | "orange"
}

export function GenericCSVUpload<T>({
  templateUrl,
  templateName,
  columns,
  parseCSV,
  onImport,
  entityName,
  description,
  colorScheme = "blue",
}: GenericCSVUploadProps<T>) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<T[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const colors = {
    blue: {
      template: "border-blue-200 bg-blue-50 text-blue-900 text-blue-700 bg-blue-600 hover:bg-blue-700",
      upload: "border-blue-200 bg-blue-50 text-blue-900 text-blue-700 file:bg-blue-600 hover:file:bg-blue-700",
      preview: "border-green-200 bg-green-50 text-green-900 bg-green-600 hover:bg-green-700",
    },
    green: {
      template: "border-green-200 bg-green-50 text-green-900 text-green-700 bg-green-600 hover:bg-green-700",
      upload: "border-green-200 bg-green-50 text-green-900 text-green-700 file:bg-green-600 hover:file:bg-green-700",
      preview: "border-yellow-200 bg-yellow-50 text-yellow-900 bg-yellow-600 hover:bg-yellow-700",
    },
    purple: {
      template: "border-purple-200 bg-purple-50 text-purple-900 text-purple-700 bg-purple-600 hover:bg-purple-700",
      upload: "border-purple-200 bg-purple-50 text-purple-900 text-purple-700 file:bg-purple-600 hover:file:bg-purple-700",
      preview: "border-green-200 bg-green-50 text-green-900 bg-green-600 hover:bg-green-700",
    },
    orange: {
      template: "border-orange-200 bg-orange-50 text-orange-900 text-orange-700 bg-orange-600 hover:bg-orange-700",
      upload: "border-orange-200 bg-orange-50 text-orange-900 text-orange-700 file:bg-orange-600 hover:file:bg-orange-700",
      preview: "border-green-200 bg-green-50 text-green-900 bg-green-600 hover:bg-green-700",
    },
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setErrors([])
    setPreview([])

    // Parse CSV
    const text = await selectedFile.text()
    const result = parseCSV(text)

    setErrors(result.errors)
    setPreview(result.data)
  }

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview)
      setFile(null)
      setPreview([])
      setErrors([])
      // Reset file input
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {description && (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <p>{description}</p>
        </div>
      )}

      {/* Step 1: Download Template */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-green-900 mb-1">
              Step 1: Download CSV Template
            </h4>
            <p className="text-sm text-green-700">
              Use this template to ensure correct formatting
            </p>
          </div>
          <a
            href={templateUrl}
            download={templateName}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download Template
          </a>
        </div>
      </div>

      {/* Step 2: Upload CSV */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-900 mb-3">
          Step 2: Upload Your CSV File
        </h4>
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:rounded-md file:border-0
            file:bg-blue-600 file:px-4
            file:py-2 file:text-sm
            file:font-semibold file:text-white
            hover:file:bg-blue-700"
          aria-label={`Upload ${entityName} CSV file`}
        />
        {file && (
          <p className="mt-2 text-sm text-blue-700">
            ✓ File selected: {file.name}
          </p>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4" role="alert">
          <h4 className="font-semibold text-red-900 mb-2">
            Errors Found in CSV:
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">
            Step 3: Preview & Import ({preview.length} items)
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
            className="w-full rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Import {preview.length} {entityName}
          </button>
        </div>
      )}
    </div>
  )
}
