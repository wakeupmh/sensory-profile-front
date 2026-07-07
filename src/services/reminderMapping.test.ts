import { describe, expect, it } from 'vitest';
import { toUpcomingReminder, type RawUpcomingReminderItem } from './api';

/**
 * Regression coverage for the bug found while verifying the document-expiry
 * derived reminder: GET /api/reminders/upcoming returns
 * {source, type, resourceType, ...}, not {origin, status} — passing the raw
 * response straight through left every reminder's origin `undefined`, so no
 * icon/label rendered and the manual-only action buttons never appeared for
 * anything (gated on `item.origin === 'manual'`).
 */

function makeRaw(overrides: Partial<RawUpcomingReminderItem> = {}): RawUpcomingReminderItem {
  return {
    source: 'derived',
    type: 'medical_followup',
    id: 'r1',
    childId: 'child-1',
    title: 'Retorno: Neurologia',
    dueAt: '2026-07-15T00:00:00.000Z',
    resourceType: 'medical_appointment',
    resourceId: 'r1',
    ...overrides,
  };
}

describe('toUpcomingReminder', () => {
  it('maps a custom (manual) reminder to origin "manual" and status "pending"', () => {
    const result = toUpcomingReminder(makeRaw({ source: 'custom', type: 'custom' }));
    expect(result.origin).toBe('manual');
    expect(result.status).toBe('pending');
  });

  it.each([
    ['medical_followup', 'medical'],
    ['education_review', 'school'],
    ['education_plan_end', 'school'],
    ['school_followup', 'school'],
    ['milestone_target', 'milestone'],
    ['medication_ending', 'medication'],
    ['document_expiring', 'document'],
  ] as const)('maps derived type "%s" to origin "%s"', (type, expectedOrigin) => {
    const result = toUpcomingReminder(makeRaw({ source: 'derived', type }));
    expect(result.origin).toBe(expectedOrigin);
  });

  it('falls back to "manual" for an unrecognized derived type rather than leaving origin undefined', () => {
    const result = toUpcomingReminder(makeRaw({ source: 'derived', type: 'some_future_backend_type' }));
    expect(result.origin).toBe('manual');
  });

  it('preserves id/childId/title/dueAt through the mapping', () => {
    const raw = makeRaw({ id: 'x1', childId: 'c9', title: 'Some title', dueAt: '2026-08-01T00:00:00.000Z' });
    const result = toUpcomingReminder(raw);
    expect(result.id).toBe('x1');
    expect(result.childId).toBe('c9');
    expect(result.title).toBe('Some title');
    expect(result.dueAt).toBe('2026-08-01T00:00:00.000Z');
  });
});
