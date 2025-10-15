"use client"

import { GenericCSVUpload, CSVParseResult, ColumnConfig } from "@/components/bulk-import"
import type { LobbyingReceipt } from "./BoardMemberCalendarForm"

interface ReceiptsCSVUploadModeProps {
  onAdd: (receipts: LobbyingReceipt[]) => void
}

const columns: ColumnConfig<LobbyingReceipt>[] = [
  { key: "lobbyistName", label: "Lobbyist" },
  { key: "date", label: "Date" },
  { key: "payee", label: "Payee" },
  {
    key: "purpose",
    label: "Purpose",
    render: (value: string) => value.substring(0, 40) + (value.length > 40 ? "..." : "")
  },
  {
    key: "amount",
    label: "Amount",
    render: (value: number) => `$${value.toFixed(2)}`
  },
]

function parseReceiptsCSV(text: string): CSVParseResult<LobbyingReceipt> {
  const lines = text.trim().split("\n")

  if (lines.length < 2) {
    return {
      data: [],
      errors: ["CSV file must contain at least a header row and one data row"]
    }
  }

  // Skip header row
  const dataLines = lines.slice(1)
  const parsed: LobbyingReceipt[] = []
  const parseErrors: string[] = []

  dataLines.forEach((line, index) => {
    // Handle CSV with quoted fields that may contain commas
    const parts = parseCSVLine(line)

    if (parts.length < 5) {
      parseErrors.push(`Row ${index + 2}: Expected 5 columns (Lobbyist Name, Date, Payee, Purpose, Amount), got ${parts.length}`)
      return
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(parts[1].trim())) {
      parseErrors.push(`Row ${index + 2}: Invalid date format "${parts[1].trim()}". Expected YYYY-MM-DD`)
      return
    }

    // Validate amount
    const amount = parseFloat(parts[4].trim())
    if (isNaN(amount)) {
      parseErrors.push(`Row ${index + 2}: Invalid amount "${parts[4].trim()}"`)
      return
    }

    parsed.push({
      id: crypto.randomUUID(),
      lobbyistName: parts[0].trim(),
      date: parts[1].trim(),
      payee: parts[2].trim(),
      purpose: parts[3].trim(),
      amount: amount,
    })
  })

  return {
    data: parsed,
    errors: parseErrors
  }
}

// Helper function to parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function ReceiptsCSVUploadMode({ onAdd }: ReceiptsCSVUploadModeProps) {
  return (
    <GenericCSVUpload<LobbyingReceipt>
      templateUrl="/csv-templates/board-member-receipts-template.csv"
      templateName="board-member-receipts-template.csv"
      columns={columns}
      parseCSV={parseReceiptsCSV}
      onImport={onAdd}
      entityName="Lobbying Receipts"
      description="Best for: 10+ receipts. Upload a CSV file with lobbying receipts from the quarter."
      colorScheme="purple"
    />
  )
}
