import { describe, expect, it } from 'vitest';
import { getMonthRange, isDateStringInMonth, aggregateLogs, capitalize } from './monthlyRecap';
import type { DailyLog } from '../types/logs';

describe('capitalize', () => {
  it('capitalizes only the first character', () => {
    expect(capitalize('julho de 2026')).toBe('Julho de 2026');
  });

  it('handles an empty string without throwing', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('getMonthRange', () => {
  const now = new Date(2026, 6, 7); // July 7, 2026 (local time)

  it('returns the current month bounds when offset is 0', () => {
    const range = getMonthRange(0, now);
    expect(range.year).toBe(2026);
    expect(range.month).toBe(6); // July, zero-indexed
    expect(range.monthStart.getDate()).toBe(1);
    expect(range.monthStart.getHours()).toBe(0);
    expect(range.daysInMonth).toBe(31);
    expect(range.monthEnd.getDate()).toBe(31);
    expect(range.monthEnd.getHours()).toBe(23);
  });

  it('navigates to the previous month', () => {
    const range = getMonthRange(-1, now);
    expect(range.year).toBe(2026);
    expect(range.month).toBe(5); // June
    expect(range.daysInMonth).toBe(30);
  });

  it('crosses a year boundary correctly', () => {
    const range = getMonthRange(-7, now); // July -> December (previous year)
    expect(range.year).toBe(2025);
    expect(range.month).toBe(11); // December
  });

  it('produces a capitalized pt-BR month label', () => {
    const range = getMonthRange(0, now);
    expect(range.monthLabel).toMatch(/^Julho de 2026/);
  });
});

describe('isDateStringInMonth', () => {
  it('matches a date within the given month/year', () => {
    expect(isDateStringInMonth('2026-07-15', 2026, 6)).toBe(true);
  });

  it('does not match a date outside the given month', () => {
    expect(isDateStringInMonth('2026-05-01', 2026, 6)).toBe(false);
  });

  it('does not match a date in the same month but a different year', () => {
    expect(isDateStringInMonth('2025-07-15', 2026, 6)).toBe(false);
  });

  it('correctly handles the first day of the month (no off-by-one from UTC parsing)', () => {
    expect(isDateStringInMonth('2026-07-01', 2026, 6)).toBe(true);
  });

  it('correctly handles the last day of the month', () => {
    expect(isDateStringInMonth('2026-07-31', 2026, 6)).toBe(true);
  });
});

function makeLog(overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: 'l1',
    childId: 'c1',
    logType: 'mood',
    occurredAt: '2026-07-03T10:00:00.000Z',
    data: { level: 4 },
    notes: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('aggregateLogs', () => {
  it('returns empty aggregates for no logs', () => {
    const result = aggregateLogs([]);
    expect(result.countsByType).toEqual({});
    expect(result.moodByDay).toEqual([]);
    expect(result.moodAverage).toBeNull();
  });

  it('counts logs per type', () => {
    const logs = [
      makeLog({ id: 'l1', logType: 'mood' }),
      makeLog({ id: 'l2', logType: 'mood' }),
      makeLog({ id: 'l3', logType: 'sleep', data: { quality: 2 } }),
    ];
    const result = aggregateLogs(logs);
    expect(result.countsByType).toEqual({ mood: 2, sleep: 1 });
  });

  it('averages mood levels within the same day', () => {
    const logs = [
      makeLog({ id: 'l1', occurredAt: '2026-07-03T08:00:00.000Z', data: { level: 4 } }),
      makeLog({ id: 'l2', occurredAt: '2026-07-03T18:00:00.000Z', data: { level: 2 } }),
    ];
    const result = aggregateLogs(logs);
    expect(result.moodByDay).toEqual([{ day: 3, average: 3 }]);
  });

  it('computes the overall mood average across all days, not an average of daily averages', () => {
    // Day 3: two entries (4, 2) -> daily avg 3. Day 10: one entry (5).
    // A naive "average of daily averages" would give (3 + 5) / 2 = 4.
    // The correct overall average across all 3 individual entries is (4+2+5)/3 = 3.666...
    const logs = [
      makeLog({ id: 'l1', occurredAt: '2026-07-03T08:00:00.000Z', data: { level: 4 } }),
      makeLog({ id: 'l2', occurredAt: '2026-07-03T18:00:00.000Z', data: { level: 2 } }),
      makeLog({ id: 'l3', occurredAt: '2026-07-10T08:00:00.000Z', data: { level: 5 } }),
    ];
    const result = aggregateLogs(logs);
    expect(result.moodAverage).toBeCloseTo(11 / 3, 5);
  });

  it('sorts moodByDay ascending by day of month', () => {
    const logs = [
      makeLog({ id: 'l1', occurredAt: '2026-07-20T08:00:00.000Z', data: { level: 3 } }),
      makeLog({ id: 'l2', occurredAt: '2026-07-05T08:00:00.000Z', data: { level: 5 } }),
    ];
    const result = aggregateLogs(logs);
    expect(result.moodByDay.map((d) => d.day)).toEqual([5, 20]);
  });

  it('ignores non-mood logs when computing mood aggregates', () => {
    const logs = [makeLog({ id: 'l1', logType: 'sleep', data: { quality: 1 } })];
    const result = aggregateLogs(logs);
    expect(result.moodByDay).toEqual([]);
    expect(result.moodAverage).toBeNull();
  });
});
