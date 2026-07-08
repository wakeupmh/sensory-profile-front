// Minimal RFC5545 (iCalendar) generator for a single all-day event, used to
// export a reminder as an "add to calendar" .ics download. Reminders only
// ever carry a due *date* (the create form uses <input type="date">), so
// every event here is all-day — no VALARM, no recurrence, no timezone math.

export interface ICSEvent {
  uid: string;
  title: string;
  description?: string;
  /** The day the event falls on — only the date portion is used. */
  date: Date;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatICSDate(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

function formatICSDateTimeUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

// Escapes text per RFC5545 §3.3.11 (backslash, semicolon, comma, newline).
function escapeICSText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function generateICS(event: ICSEvent): string {
  const dtStart = formatICSDate(event.date);
  // DTEND for an all-day VEVENT is exclusive (the day after) per RFC5545.
  const dtEnd = formatICSDate(addDays(event.date, 1));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Perfil Sensorial//Lembretes//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.uid}@perfilsensorial.app`,
    `DTSTAMP:${formatICSDateTimeUTC(new Date())}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  // RFC5545 requires CRLF line endings.
  return lines.join('\r\n');
}

/**
 * Reminders' dueAt (manual and derived alike) is a calendar date stored as a
 * UTC-midnight timestamp (the create form sends new Date('YYYY-MM-DD').
 * toISOString(); derived items cast a Postgres DATE column to timestamptz
 * the same way). Reading it back with local-time getters would shift the
 * day by one wherever the browser's timezone is behind UTC — this recovers
 * the original calendar date regardless of the viewer's timezone.
 */
export function dateOnlyFromISOString(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
