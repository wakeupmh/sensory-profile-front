import { describe, expect, it } from 'vitest';
import { getExpiryStatus, getDocumentKind, formatFileSize } from './documents';

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS).toISOString();

describe('getExpiryStatus', () => {
  it('returns "none" when there is no expiry date', () => {
    expect(getExpiryStatus(null)).toBe('none');
    expect(getExpiryStatus(undefined)).toBe('none');
  });

  it('returns "expired" for a date in the past', () => {
    expect(getExpiryStatus(iso(-5))).toBe('expired');
  });

  it('returns "expiring-soon" for a date within the warning window', () => {
    expect(getExpiryStatus(iso(10))).toBe('expiring-soon');
  });

  it('returns "valid" for a date far in the future', () => {
    expect(getExpiryStatus(iso(200))).toBe('valid');
  });

  it('respects a custom warning window', () => {
    expect(getExpiryStatus(iso(10), 5)).toBe('valid');
    expect(getExpiryStatus(iso(3), 5)).toBe('expiring-soon');
  });

  it('treats the boundary day as expiring-soon, not valid', () => {
    expect(getExpiryStatus(iso(30), 30)).toBe('expiring-soon');
  });
});

describe('getDocumentKind', () => {
  it('classifies known mime type prefixes', () => {
    expect(getDocumentKind('application/pdf')).toBe('pdf');
    expect(getDocumentKind('image/png')).toBe('image');
    expect(getDocumentKind('video/mp4')).toBe('video');
  });

  it('falls back to "other" for unrecognized types', () => {
    expect(getDocumentKind('application/zip')).toBe('other');
    expect(getDocumentKind('')).toBe('other');
  });
});

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes at the expected boundaries', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
