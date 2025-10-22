/**
 * CSV Export Utility
 * Functions for exporting data to CSV format
 */

export interface LobbyistExportData {
  name: string;
  email: string;
  employer: string;
  subjects: string;
  registrationDate: string;
  totalExpenses: number;
}

export interface EmployerExportData {
  name: string;
  email: string;
  businessDescription: string;
  lobbyistCount: number;
  totalExpenses: number;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  // Create header row
  const headerRow = headers.map((h) => h.label).join(",");

  // Create data rows
  const dataRows = data.map((item) => {
    return headers
      .map((h) => {
        const value = item[h.key];
        // Escape values that contain commas, quotes, or newlines
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Export lobbyists to CSV
 */
export function exportLobbyistsToCSV(lobbyists: LobbyistExportData[]): string {
  const headers: { key: keyof LobbyistExportData; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "employer", label: "Employer" },
    { key: "subjects", label: "Subjects" },
    { key: "registrationDate", label: "Registration Date" },
    { key: "totalExpenses", label: "Total Expenses" },
  ];

  return arrayToCSV(lobbyists, headers);
}

/**
 * Export employers to CSV
 */
export function exportEmployersToCSV(employers: EmployerExportData[]): string {
  const headers: { key: keyof EmployerExportData; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "businessDescription", label: "Business Description" },
    { key: "lobbyistCount", label: "Number of Lobbyists" },
    { key: "totalExpenses", label: "Total Expenses" },
  ];

  return arrayToCSV(employers, headers);
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export combined lobbyists and employers to CSV
 */
export function exportAllToCSV(
  lobbyists: LobbyistExportData[],
  employers: EmployerExportData[]
): string {
  let csv = "# LOBBYISTS\n";
  csv += exportLobbyistsToCSV(lobbyists);
  csv += "\n\n# EMPLOYERS\n";
  csv += exportEmployersToCSV(employers);
  return csv;
}
