"use client"

import { GenericBulkPaste, BulkParseResult, ColumnConfig } from "@/components/bulk-import"
import type { ExpenseLineItem } from "./LobbyistExpenseReportForm"

interface BulkPasteModeProps {
  onAdd: (expenses: ExpenseLineItem[]) => void
}

const columns: ColumnConfig<ExpenseLineItem>[] = [
  { key: "officialName", label: "Official Name" },
  { key: "date", label: "Date (YYYY-MM-DD)" },
  { key: "payee", label: "Payee" },
  { key: "purpose", label: "Purpose" },
  { key: "amount", label: "Amount" },
  { key: "isEstimate", label: "Is Estimate (TRUE/FALSE)" },
]

function parseExpensePaste(text: string): BulkParseResult<ExpenseLineItem> {
  const lines = text.trim().split("\n")

  if (lines.length === 0) {
    return {
      data: [],
      errors: ["No data to parse"]
    }
  }

  const parsed: ExpenseLineItem[] = []
  const parseErrors: string[] = []

  lines.forEach((line, index) => {
    // Tab-separated or comma-separated
    const parts = line.includes("\t") ? line.split("\t") : line.split(",")

    if (parts.length < 5) {
      parseErrors.push(`Row ${index + 1}: Expected at least 5 columns, got ${parts.length}`)
      return
    }

    const amount = parseFloat(parts[4])
    if (isNaN(amount)) {
      parseErrors.push(`Row ${index + 1}: Invalid amount "${parts[4]}"`)
      return
    }

    parsed.push({
      id: crypto.randomUUID(),
      officialName: parts[0].trim(),
      date: parts[1].trim(),
      payee: parts[2].trim(),
      purpose: parts[3].trim(),
      amount: amount,
      isEstimate: parts[5]?.trim().toUpperCase() === "TRUE",
    })
  })

  return {
    data: parsed,
    errors: parseErrors
  }
}

export function BulkPasteMode({ onAdd }: BulkPasteModeProps) {
  return (
    <GenericBulkPaste<ExpenseLineItem>
      columns={columns}
      parseData={parseExpensePaste}
      onImport={onAdd}
      entityName="Expense Items"
      description="Best for: 5-10 expense items. Copy from Excel or other spreadsheet applications."
      formatInstructions="Paste data with columns separated by tabs or commas in this order:"
      exampleText="Commissioner Williams, 2025-01-15, Portland City Grill, Lunch meeting, 125.00, FALSE"
    />
  )
}
