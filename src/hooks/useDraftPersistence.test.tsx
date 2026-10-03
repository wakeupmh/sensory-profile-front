import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const deleteDraft = vi.fn().mockResolvedValue(undefined);
const getDraft = vi.fn().mockRejectedValue(new Error('offline'));
vi.mock('../services/api', () => ({
  draftApi: { deleteDraft: (...a: unknown[]) => deleteDraft(...a), getDraft: (...a: unknown[]) => getDraft(...a), saveDraft: vi.fn() },
}));
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 'token', session: { user: { id: 'u1' } } }),
}));

import { useDraftPersistence } from './useDraftPersistence';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
});
afterEach(() => vi.restoreAllMocks());

describe('useDraftPersistence com localStorage indisponível', () => {
  it('clearDraft não lança (a anamnese já foi criada neste ponto)', async () => {
    const { result } = renderHook(() =>
      useDraftPersistence({ formType: 'anamnese', formData: {}, currentStep: 0, enabled: true }),
    );
    await expect(result.current.clearDraft()).resolves.toBeUndefined();
  });

  it('loadDraft devolve null em vez de lançar', async () => {
    const { result } = renderHook(() =>
      useDraftPersistence({ formType: 'anamnese', formData: {}, currentStep: 0, enabled: true }),
    );
    await expect(result.current.loadDraft()).resolves.toBeNull();
  });
});
