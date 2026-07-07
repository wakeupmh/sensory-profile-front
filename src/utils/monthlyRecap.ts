import type { DailyLog, LogType, MoodData } from '../types/logs';
import type { DayMood } from '../components/recap/MoodTrendChart';

export interface MonthRange {
  monthStart: Date;
  monthEnd: Date;
  monthLabel: string;
  year: number;
  month: number;
  daysInMonth: number;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getMonthRange(monthOffset: number, now: Date = new Date()): MonthRange {
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return {
    monthStart,
    monthEnd,
    monthLabel: capitalize(target.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })),
    year,
    month,
    daysInMonth: monthEnd.getDate(),
  };
}

/** dateStr is a YYYY-MM-DD date-only string (e.g. a milestone's achievedDate) — appending
 * T00:00:00 parses it in local time instead of UTC, avoiding an off-by-one-day mismatch
 * near month boundaries that `new Date(dateStr)` alone would produce. */
export function isDateStringInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === year && d.getMonth() === month;
}

export interface LogAggregation {
  countsByType: Partial<Record<LogType, number>>;
  moodByDay: DayMood[];
  moodAverage: number | null;
}

export function aggregateLogs(logs: DailyLog[]): LogAggregation {
  const counts: Partial<Record<LogType, number>> = {};
  const moodMap = new Map<number, number[]>();
  for (const log of logs) {
    counts[log.logType] = (counts[log.logType] ?? 0) + 1;
    if (log.logType === 'mood') {
      const day = new Date(log.occurredAt).getDate();
      const levels = moodMap.get(day) ?? [];
      levels.push((log.data as MoodData).level);
      moodMap.set(day, levels);
    }
  }
  const moodByDay: DayMood[] = Array.from(moodMap.entries())
    .map(([day, levels]) => ({ day, average: levels.reduce((a, b) => a + b, 0) / levels.length }))
    .sort((a, b) => a.day - b.day);
  const allMoodLevels = moodByDay.flatMap(({ day }) => moodMap.get(day) ?? []);
  const moodAverage = allMoodLevels.length > 0
    ? allMoodLevels.reduce((a, b) => a + b, 0) / allMoodLevels.length
    : null;
  return { countsByType: counts, moodByDay, moodAverage };
}
