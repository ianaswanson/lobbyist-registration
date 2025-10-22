"use client";

import { GenericICSUpload, ICSMapConfig } from "@/components/bulk-import";
import type { ICSEvent } from "@/lib/ics-parser";
import type { CalendarEntry } from "./BoardMemberCalendarForm";

interface ICSUploadModeProps {
  onAdd: (entries: CalendarEntry[]) => void;
}

const mapConfig: ICSMapConfig<CalendarEntry> = {
  mapEvent: (event: ICSEvent): CalendarEntry | null => {
    if (!event.summary || !event.dtstart) {
      return null;
    }

    // Parse the ISO datetime string (format: YYYY-MM-DDTHH:MM)
    const [datePart, timePart] = event.dtstart.split("T");

    // Format participants from attendees
    const participants = event.attendees?.join(", ") || "";

    return {
      id: crypto.randomUUID(),
      eventTitle: event.summary,
      eventDate: datePart, // YYYY-MM-DD
      eventTime: timePart || "00:00", // HH:MM
      participants: participants,
    };
  },
};

function renderPreview(entry: CalendarEntry, index: number) {
  return (
    <div
      key={entry.id}
      className="rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {entry.eventTitle}
      </div>
      <div className="mt-1 text-gray-600 dark:text-gray-400">
        {entry.eventDate} at {entry.eventTime}
      </div>
      {entry.participants && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Participants: {entry.participants}
        </div>
      )}
    </div>
  );
}

export function ICSUploadMode({ onAdd }: ICSUploadModeProps) {
  return (
    <GenericICSUpload<CalendarEntry>
      mapConfig={mapConfig}
      onImport={onAdd}
      entityName="Calendar Entries"
      description="Best for: Importing events from Outlook, Google Calendar, Apple Calendar, or any ICS/iCal file. Upload your calendar file to automatically import all meetings and events."
      renderPreview={renderPreview}
      colorScheme="purple"
    />
  );
}
