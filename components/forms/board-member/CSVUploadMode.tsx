"use client"

import { GenericCSVUpload, CSVParseResult, ColumnConfig } from "@/components/bulk-import"
import type { CalendarEntry } from "./BoardMemberCalendarForm"

interface CSVUploadModeProps {
  onAdd: (entries: CalendarEntry[]) => void
}

const columns: ColumnConfig<CalendarEntry>[] = [
  { key: "eventTitle", label: "Event" },
  { key: "eventDate", label: "Date" },
  { key: "eventTime", label: "Time" },
  {
    key: "participants",
    label: "Participants",
    render: (value: string) => value.substring(0, 40) + (value.length > 40 ? "..." : "")
  },
]

function parseCalendarCSV(text: string): CSVParseResult<CalendarEntry> {
  const lines = text.trim().split("\n")

  if (lines.length < 2) {
    return {
      data: [],
      errors: ["CSV file must contain at least a header row and one data row"]
    }
  }

  // Skip header row
  const dataLines = lines.slice(1)
  const parsed: CalendarEntry[] = []
  const parseErrors: string[] = []

  dataLines.forEach((line, index) => {
    // Handle CSV with quoted fields that may contain commas
    const parts = parseCSVLine(line)

    if (parts.length < 4) {
      parseErrors.push(`Row ${index + 2}: Expected 4 columns (Event Title, Date, Time, Participants), got ${parts.length}`)
      return
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(parts[1].trim())) {
      parseErrors.push(`Row ${index + 2}: Invalid date format "${parts[1].trim()}". Expected YYYY-MM-DD`)
      return
    }

    // Validate time format (HH:MM)
    const timePattern = /^\d{2}:\d{2}$/
    if (!timePattern.test(parts[2].trim())) {
      parseErrors.push(`Row ${index + 2}: Invalid time format "${parts[2].trim()}". Expected HH:MM`)
      return
    }

    parsed.push({
      id: crypto.randomUUID(),
      eventTitle: parts[0].trim(),
      eventDate: parts[1].trim(),
      eventTime: parts[2].trim(),
      participants: parts[3].trim(),
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

export function CSVUploadMode({ onAdd }: CSVUploadModeProps) {
  return (
    <GenericCSVUpload<CalendarEntry>
      templateUrl="/csv-templates/board-member-calendar-template.csv"
      templateName="board-member-calendar-template.csv"
      columns={columns}
      parseCSV={parseCalendarCSV}
      onImport={onAdd}
      entityName="Calendar Entries"
      description="Best for: 10+ calendar events. Upload a CSV file with your quarterly meetings and events."
      colorScheme="blue"
    />
  )
}
