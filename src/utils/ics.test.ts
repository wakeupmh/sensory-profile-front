import { describe, expect, it } from 'vitest';
import { generateICS, dateOnlyFromISOString } from './ics';

describe('generateICS', () => {
  it('produces a valid VCALENDAR/VEVENT wrapper with CRLF line endings', () => {
    const ics = generateICS({ uid: 'reminder-1', title: 'Retorno médico', date: new Date(2026, 6, 15) });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT\r\n');
    expect(ics).toContain('END:VEVENT\r\n');
  });

  it('formats DTSTART as an all-day VALUE=DATE and DTEND as the following day (exclusive)', () => {
    const ics = generateICS({ uid: 'r1', title: 'Título', date: new Date(2026, 6, 15) });
    expect(ics).toContain('DTSTART;VALUE=DATE:20260715');
    expect(ics).toContain('DTEND;VALUE=DATE:20260716');
  });

  it('rolls DTEND over a month boundary correctly', () => {
    const ics = generateICS({ uid: 'r1', title: 'Título', date: new Date(2026, 6, 31) });
    expect(ics).toContain('DTSTART;VALUE=DATE:20260731');
    expect(ics).toContain('DTEND;VALUE=DATE:20260801');
  });

  it('includes the UID with a stable domain suffix', () => {
    const ics = generateICS({ uid: 'reminder-abc123', title: 'X', date: new Date(2026, 0, 1) });
    expect(ics).toContain('UID:reminder-abc123@perfilsensorial.app');
  });

  it('escapes commas, semicolons and backslashes in the title', () => {
    const ics = generateICS({ uid: 'r1', title: 'Retorno; Dr. João, às 14h \\ sala 2', date: new Date(2026, 0, 1) });
    expect(ics).toContain('SUMMARY:Retorno\\; Dr. João\\, às 14h \\\\ sala 2');
  });

  it('escapes newlines in the description as literal \\n', () => {
    const ics = generateICS({ uid: 'r1', title: 'X', description: 'Linha 1\nLinha 2', date: new Date(2026, 0, 1) });
    expect(ics).toContain('DESCRIPTION:Linha 1\\nLinha 2');
  });

  it('omits the DESCRIPTION line entirely when none is given', () => {
    const ics = generateICS({ uid: 'r1', title: 'X', date: new Date(2026, 0, 1) });
    expect(ics).not.toContain('DESCRIPTION');
  });

  it('includes a DTSTAMP in UTC basic format', () => {
    const ics = generateICS({ uid: 'r1', title: 'X', date: new Date(2026, 0, 1) });
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });
});

describe('dateOnlyFromISOString', () => {
  it('recovers the calendar date from a UTC-midnight timestamp regardless of local timezone', () => {
    // 2026-07-15T00:00:00.000Z is July 15 in UTC, but would read back as
    // July 14 in any timezone behind UTC if read with local-time getters —
    // this must always resolve to July 15.
    const d = dateOnlyFromISOString('2026-07-15T00:00:00.000Z');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // July, zero-indexed
    expect(d.getDate()).toBe(15);
  });

  it('round-trips correctly through generateICS regardless of the string time-of-day component', () => {
    const ics = generateICS({ uid: 'r1', title: 'X', date: dateOnlyFromISOString('2026-07-15T00:00:00.000Z') });
    expect(ics).toContain('DTSTART;VALUE=DATE:20260715');
  });

  it('is immune to the viewer being in a timezone behind UTC (the actual bug this guards against)', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'America/Sao_Paulo'; // UTC-3
    try {
      // Sanity check: confirm this environment really does shift the naive
      // (buggy) reading backward a day, so the assertion below is meaningful.
      const naive = new Date('2026-07-15T00:00:00.000Z');
      expect(naive.getDate()).toBe(14);

      const d = dateOnlyFromISOString('2026-07-15T00:00:00.000Z');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(6);
      expect(d.getDate()).toBe(15);
    } finally {
      process.env.TZ = originalTZ;
    }
  });
});
