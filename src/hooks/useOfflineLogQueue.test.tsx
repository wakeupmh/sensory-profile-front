import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const createLog = vi.fn();
vi.mock('../services/api', () => ({ logApi: { createLog: (...a: unknown[]) => createLog(...a) } }));
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 'token' }),
}));

import { useOfflineLogQueue } from './useOfflineLogQueue';
import { queueLog, getQueuedLogs } from '../services/offlineLogQueue';

beforeEach(() => {
  localStorage.clear();
  createLog.mockReset();
});

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
});
