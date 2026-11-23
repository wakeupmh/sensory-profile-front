import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import '../i18n';

const signOut = vi.fn().mockResolvedValue(undefined);
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ signOut, session: { user: { id: 'u1' } } }),
}));

import { useSignOut } from './useSignOut';
import { queueLog } from '../services/offlineLogQueue';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

beforeEach(() => {
  localStorage.clear();
  signOut.mockClear();
});

describe('useSignOut', () => {
  it('sem registros pendentes, sai direto', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const { result } = renderHook(() => useSignOut(), { wrapper });
    await act(() => result.current());
    expect(confirm).not.toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it('com registros não enviados, pergunta, e cancelar mantém a sessão', async () => {
    queueLog({ childId: 'c', logType: 'mood', occurredAt: '2026-11-23T10:00:00Z', data: { level: 3 } } as never, { userId: 'u1', delegateChildId: null });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => useSignOut(), { wrapper });
    await act(() => result.current());
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('1 registro'));
    expect(signOut).not.toHaveBeenCalled();
  });
});
