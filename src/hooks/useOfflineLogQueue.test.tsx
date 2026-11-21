import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const createLog = vi.fn();
vi.mock('../services/api', () => ({ logApi: { createLog: (...a: unknown[]) => createLog(...a) } }));
let userId = 'user-a';
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 'token', session: { user: { id: userId } } }),
}));

import { useOfflineLogQueue } from './useOfflineLogQueue';
import { queueLog, getQueuedLogs } from '../services/offlineLogQueue';
import { setDelegateChildId } from '../services/delegateChild';

beforeEach(() => {
  localStorage.clear();
  createLog.mockReset();
  userId = 'user-a';
  setDelegateChildId(null);
});

const payload = (childId: string) =>
  ({ childId, logType: 'mood', occurredAt: '2026-11-21T10:00:00.000Z', data: {} }) as never;
const httpError = (status: number) => Object.assign(new Error(String(status)), { request: {}, response: { status } });

describe('useOfflineLogQueue', () => {
  it('dois disparos simultâneos (montagem + evento online) não duplicam o registro', async () => {
    queueLog({ childId: 'c1', logType: 'mood', occurredAt: new Date().toISOString(), data: {} } as never);
    let release!: () => void;
    createLog.mockImplementation(() => new Promise<void>((r) => { release = r; }));

    renderHook(() => useOfflineLogQueue());
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });
    await act(async () => {
      release();
      await Promise.resolve();
    });
    expect(createLog).toHaveBeenCalledTimes(1);
    expect(getQueuedLogs()).toHaveLength(0);
  });

  it('o registro de outra conta neste aparelho não é enviado nem trava a fila', async () => {
    userId = 'user-a';
    const a = renderHook(() => useOfflineLogQueue());
    act(() => { a.result.current.enqueue(payload('child-of-a')); });
    a.unmount();

    userId = 'user-b';
    const b = renderHook(() => useOfflineLogQueue());
    act(() => { b.result.current.enqueue(payload('child-of-b')); });
    createLog.mockResolvedValue(undefined);
    await act(async () => { await b.result.current.flush(); });

    expect(createLog).toHaveBeenCalledTimes(1);
    expect(createLog).toHaveBeenCalledWith('token', expect.objectContaining({ childId: 'child-of-b' }));
    // O de A espera A voltar.
    expect(getQueuedLogs().map((e) => e.payload.childId)).toEqual(['child-of-a']);
  });

  it('registro feito no modo cuidador só sai no mesmo modo', async () => {
    setDelegateChildId('delegated-child');
    const h = renderHook(() => useOfflineLogQueue());
    act(() => { h.result.current.enqueue(payload('delegated-child')); });

    setDelegateChildId(null);
    createLog.mockResolvedValue(undefined);
    await act(async () => { await h.result.current.flush(); });
    expect(createLog).not.toHaveBeenCalled();

    setDelegateChildId('delegated-child');
    await act(async () => { await h.result.current.flush(); });
    expect(createLog).toHaveBeenCalledTimes(1);
    expect(getQueuedLogs()).toHaveLength(0);
  });

  it('recusa definitiva do servidor descarta só aquele registro, avisa, e a fila segue', async () => {
    const onRejected = vi.fn();
    const h = renderHook(() => useOfflineLogQueue({ onRejected }));
    act(() => {
      h.result.current.enqueue(payload('gone'));
      h.result.current.enqueue(payload('ok'));
    });
    createLog.mockRejectedValueOnce(httpError(404)).mockResolvedValueOnce(undefined);
    await act(async () => { await h.result.current.flush(); });

    expect(createLog).toHaveBeenCalledTimes(2);
    expect(getQueuedLogs()).toHaveLength(0);
    expect(onRejected).toHaveBeenCalledWith(1);
  });

  it('falha de rede ou 5xx para e guarda tudo para depois', async () => {
    const h = renderHook(() => useOfflineLogQueue());
    act(() => {
      h.result.current.enqueue(payload('x'));
      h.result.current.enqueue(payload('y'));
    });
    createLog.mockRejectedValueOnce(httpError(503));
    await act(async () => { await h.result.current.flush(); });
    expect(createLog).toHaveBeenCalledTimes(1);
    expect(getQueuedLogs()).toHaveLength(2);
  });
});
