import { describe, expect, it } from 'vitest';
import type { ErrorEvent } from '@sentry/react';
import { scrubEvent, scrubUrl } from './errorTracking';

describe('scrubEvent', () => {
  it('drops the user, the request and form input, and strips query strings and share tokens', () => {
    const event = {
      type: undefined,
      user: { id: 'u1', email: 'mae@example.com' },
      request: { url: 'https://app/children/1?token=abc', headers: { Authorization: 'Bearer x' } },
      extra: { form: { diagnosis: 'TEA' } },
      breadcrumbs: [
        { category: 'navigation', data: { from: '/invite/accept?token=secret', to: '/anamnese/shared/tok123' } },
        { category: 'xhr', data: { url: 'https://api/x?childId=9#h', method: 'GET' } },
        { category: 'ui.input', message: 'input[name=notes]' },
      ],
    } as unknown as ErrorEvent;

    const out = scrubEvent(event);

    expect(out.user).toBeUndefined();
    expect(out.request).toBeUndefined();
    expect(out.extra).toBeUndefined();
    expect(out.breadcrumbs).toEqual([
      { category: 'navigation', data: { from: '/invite/accept', to: '/anamnese/shared/:token' }, message: undefined },
      { category: 'xhr', data: { url: 'https://api/x', method: 'GET' }, message: undefined },
    ]);
  });

  it('leaves a plain path alone', () => {
    expect(scrubUrl('/children/42/ficha')).toBe('/children/42/ficha');
  });
});
