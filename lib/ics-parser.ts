/**
 * ICS/iCal Parser Utility
 * Parses .ics calendar files into CalendarEntry objects
 */

export interface ICSEvent {
  summary: string // Event title
  dtstart: string // Start date/time
  dtend?: string // End date/time (optional)
  description?: string // Event description
  location?: string // Event location
  attendees?: string[] // List of attendees
}

export interface ParsedICSResult {
  events: ICSEvent[]
  errors: string[]
}

/**
 * Parse ICS/iCal file content
 * Supports basic VEVENT parsing for calendar entries
 */
export function parseICSFile(content: string): ParsedICSResult {
  const events: ICSEvent[] = []
  const errors: string[] = []

  try {
    // Split into lines and clean up
    const lines = content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // Find all VEVENT blocks
    let inEvent = false
    let currentEvent: Partial<ICSEvent> = {}
    let currentProperty = ""
    let currentValue = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle line continuation (lines starting with space or tab)
      if (line.startsWith(" ") || line.startsWith("\t")) {
        currentValue += line.substring(1)
        continue
      }

      // Process previous property if we have one
      if (currentProperty && inEvent) {
        processProperty(currentEvent, currentProperty, currentValue)
        currentProperty = ""
        currentValue = ""
      }

      // Check for event boundaries
      if (line === "BEGIN:VEVENT") {
        inEvent = true
        currentEvent = {}
      } else if (line === "END:VEVENT") {
        inEvent = false

        // Validate and add event
        if (currentEvent.summary && currentEvent.dtstart) {
          events.push(currentEvent as ICSEvent)
        } else {
          errors.push(`Skipped event without required fields (summary or dtstart)`)
        }

        currentEvent = {}
      } else if (inEvent && line.includes(":")) {
        // Parse property:value
        const colonIndex = line.indexOf(":")
        currentProperty = line.substring(0, colonIndex)
        currentValue = line.substring(colonIndex + 1)
      }
    }

    // Process last property if needed
    if (currentProperty && inEvent) {
      processProperty(currentEvent, currentProperty, currentValue)
    }

  } catch (error) {
    errors.push(`Failed to parse ICS file: ${error}`)
  }

  return { events, errors }
}

function processProperty(event: Partial<ICSEvent>, property: string, value: string) {
  // Remove parameters (e.g., "DTSTART;VALUE=DATE" becomes "DTSTART")
  const propName = property.split(";")[0]

  switch (propName) {
    case "SUMMARY":
      event.summary = decodeICSValue(value)
      break

    case "DTSTART":
      event.dtstart = parseICSDateTime(value)
      break

    case "DTEND":
      event.dtend = parseICSDateTime(value)
      break

    case "DESCRIPTION":
      event.description = decodeICSValue(value)
      break

    case "LOCATION":
      event.location = decodeICSValue(value)
      break

    case "ATTENDEE":
      // Extract attendee name from mailto: or CN parameter
      const attendeeName = extractAttendeeName(value)
      if (attendeeName) {
        if (!event.attendees) event.attendees = []
        event.attendees.push(attendeeName)
      }
      break
  }
}

/**
 * Parse ICS date/time format to ISO string
 * Handles: YYYYMMDD, YYYYMMDDTHHMMSS, YYYYMMDDTHHMMSSZ
 */
function parseICSDateTime(value: string): string {
  // Remove any timezone identifier
  value = value.replace(/Z$/, "").replace(/T/, "")

  if (value.length >= 8) {
    const year = value.substring(0, 4)
    const month = value.substring(4, 6)
    const day = value.substring(6, 8)

    let time = "00:00"
    if (value.length >= 12) {
      const hour = value.substring(8, 10)
      const minute = value.substring(10, 12)
      time = `${hour}:${minute}`
    }

    return `${year}-${month}-${day}T${time}`
  }

  return value
}

/**
 * Decode ICS escaped characters
 */
function decodeICSValue(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
}

/**
 * Extract attendee name from ATTENDEE property
 * Example: "CN=John Doe:mailto:john@example.com" => "John Doe"
 */
function extractAttendeeName(value: string): string | null {
  // Try to extract CN (Common Name) parameter
  const cnMatch = value.match(/CN=([^:;]+)/)
  if (cnMatch) {
    return decodeICSValue(cnMatch[1].trim())
  }

  // Fall back to email address
  const emailMatch = value.match(/mailto:([^@]+)@/)
  if (emailMatch) {
    return emailMatch[1].replace(/[._]/g, " ").trim()
  }

  return null
}
