"use client";

import {
  GenericCSVUpload,
  CSVParseResult,
  ColumnConfig,
} from "@/components/bulk-import";
import type { ExpenseLineItem } from "./LobbyistExpenseReportForm";

interface CSVUploadModeProps {
  onAdd: (expenses: ExpenseLineItem[]) => void;
}

const columns: ColumnConfig<ExpenseLineItem>[] = [
  { key: "officialName", label: "Official" },
  { key: "date", label: "Date" },
  { key: "payee", label: "Payee" },
  {
    key: "purpose",
    label: "Purpose",
    render: (value: string) =>
      value.substring(0, 50) + (value.length > 50 ? "..." : ""),
  },
  {
    key: "amount",
    label: "Amount",
    render: (value: number) => `$${value.toFixed(2)}`,
  },
];

function parseExpenseCSV(text: string): CSVParseResult<ExpenseLineItem> {
  const lines = text.trim().split("\n");

  if (lines.length < 2) {
    return {
      data: [],
      errors: ["CSV file must contain at least a header row and one data row"],
    };
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const parsed: ExpenseLineItem[] = [];
  const parseErrors: string[] = [];

  dataLines.forEach((line, index) => {
    const parts = line.split(",");

    if (parts.length < 5) {
      parseErrors.push(`Row ${index + 2}: Not enough columns`);
      return;
    }

    const amount = parseFloat(parts[4]);
    if (isNaN(amount)) {
      parseErrors.push(`Row ${index + 2}: Invalid amount "${parts[4]}"`);
      return;
    }

    parsed.push({
      id: crypto.randomUUID(),
      officialName: parts[0].trim(),
      date: parts[1].trim(),
      payee: parts[2].trim(),
      purpose: parts[3].trim(),
      amount: amount,
      isEstimate: parts[5]?.trim().toUpperCase() === "TRUE",
    });
  });

  return {
    data: parsed,
    errors: parseErrors,
  };
}

export function CSVUploadMode({ onAdd }: CSVUploadModeProps) {
  return (
    <GenericCSVUpload<ExpenseLineItem>
      templateUrl="/csv-templates/lobbyist-expense-template.csv"
      templateName="lobbyist-expense-template.csv"
      columns={columns}
      parseCSV={parseExpenseCSV}
      onImport={onAdd}
      entityName="Expense Items"
      description="Best for: 10+ expense items. Save time by uploading a CSV file."
    />
  );
}
