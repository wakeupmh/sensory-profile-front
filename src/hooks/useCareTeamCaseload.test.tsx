import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const myChildren = vi.fn();
vi.mock('../services/api', () => ({ careTeamApi: { myChildren: (...a: unknown[]) => myChildren(...a) } }));
let userId = 'u1';
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 't', isLoaded: true, session: { user: { id: userId } } }),
}));

import { useCareTeamCaseload, resetCareTeamCaseloadCache } from './useCareTeamCaseload';

beforeEach(() => {
  resetCareTeamCaseloadCache();
  myChildren.mockReset();
  userId = 'u1';
});

describe('useCareTeamCaseload', () => {
  it('não herda o cache da conta anterior ao trocar de usuário', async () => {
    myChildren.mockResolvedValueOnce([{ childId: 'c' }]);
    const first = renderHook(() => useCareTeamCaseload());
    await waitFor(() => expect(first.result.current).toBe(true));
    first.unmount();

    userId = 'u2';
    myChildren.mockResolvedValueOnce([]);
    const second = renderHook(() => useCareTeamCaseload());
    await waitFor(() => expect(myChildren).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(second.result.current).toBe(false));
  });

  it('falha de rede não fica em cache', async () => {
    myChildren.mockRejectedValueOnce(new Error('rede'));
    const a = renderHook(() => useCareTeamCaseload());
    await waitFor(() => expect(myChildren).toHaveBeenCalledTimes(1));
    a.unmount();
    myChildren.mockResolvedValueOnce([{ childId: 'c' }]);
    const b = renderHook(() => useCareTeamCaseload());
    await waitFor(() => expect(b.result.current).toBe(true));
  });
});
