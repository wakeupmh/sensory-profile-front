import { describe, expect, it } from 'vitest';
import { calculateAgeYears, parseLocalDate } from './date';

describe('parseLocalDate', () => {
  it('reads a civil date as local midnight, not UTC midnight', () => {
    // `new Date('2020-08-24')` seria 23/08 em UTC-3.
    const parsed = parseLocalDate('2020-08-24');
    expect(parsed.getFullYear()).toBe(2020);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(24);
  });

  it('tolerates a full timestamp by taking its date part', () => {
    expect(parseLocalDate('2020-08-24T18:30:00Z').getDate()).toBe(24);
  });
});

describe('calculateAgeYears', () => {
  it('does not age the child a year early on the eve of their birthday', () => {
    // O caso que divergia entre telas: véspera do aniversário.
    expect(calculateAgeYears('2020-08-24', new Date(2026, 7, 23, 12))).toBe(5);
    expect(calculateAgeYears('2020-08-24', new Date(2026, 7, 24, 12))).toBe(6);
  });

  it('handles a birthday earlier in the year', () => {
    expect(calculateAgeYears('2019-01-15', new Date(2026, 7, 23, 12))).toBe(7);
  });

  it('handles a birthday later in the year', () => {
    expect(calculateAgeYears('2019-12-31', new Date(2026, 7, 23, 12))).toBe(6);
  });
});
