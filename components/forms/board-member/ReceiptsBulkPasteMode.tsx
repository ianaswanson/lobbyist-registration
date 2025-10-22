"use client";

import {
  GenericBulkPaste,
  BulkParseResult,
  ColumnConfig,
} from "@/components/bulk-import";
import type { LobbyingReceipt } from "./BoardMemberCalendarForm";

interface ReceiptsBulkPasteModeProps {
  onAdd: (receipts: LobbyingReceipt[]) => void;
}

const columns: ColumnConfig<LobbyingReceipt>[] = [
  { key: "lobbyistName", label: "Lobbyist Name" },
  { key: "date", label: "Date (YYYY-MM-DD)" },
  { key: "payee", label: "Payee" },
  { key: "purpose", label: "Purpose" },
  { key: "amount", label: "Amount" },
];

function parseReceiptsPaste(text: string): BulkParseResult<LobbyingReceipt> {
  const lines = text.trim().split("\n");

  if (lines.length === 0) {
    return {
      data: [],
      errors: ["No data to parse"],
    };
  }

  const parsed: LobbyingReceipt[] = [];
  const parseErrors: string[] = [];

  lines.forEach((line, index) => {
    // Tab-separated or comma-separated
    const parts = line.includes("\t") ? line.split("\t") : line.split(",");

    if (parts.length < 5) {
      parseErrors.push(
        `Row ${index + 1}: Expected at least 5 columns, got ${parts.length}`
      );
      return;
    }

    const amount = parseFloat(parts[4].trim());
    if (isNaN(amount)) {
      parseErrors.push(`Row ${index + 1}: Invalid amount "${parts[4]}"`);
      return;
    }

    parsed.push({
      id: crypto.randomUUID(),
      lobbyistName: parts[0].trim(),
      date: parts[1].trim(),
      payee: parts[2].trim(),
      purpose: parts[3].trim(),
      amount: amount,
    });
  });

  return {
    data: parsed,
    errors: parseErrors,
  };
}

export function ReceiptsBulkPasteMode({ onAdd }: ReceiptsBulkPasteModeProps) {
  return (
    <GenericBulkPaste<LobbyingReceipt>
      columns={columns}
      parseData={parseReceiptsPaste}
      onImport={onAdd}
      entityName="Lobbying Receipts"
      description="Best for: 5-10 receipts. Copy from Excel or other spreadsheet applications."
      formatInstructions="Paste data with columns separated by tabs or commas in this order:"
      exampleText="Jane Smith, 2025-01-15, Portland City Grill, Lunch meeting to discuss housing policy, 125.00"
      colorScheme="purple"
    />
  );
}
