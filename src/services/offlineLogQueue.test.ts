import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getQueuedLogs,
  queueLog,
  removeQueuedLog,
  subscribeToLogQueue,
  isNetworkError,
} from './offlineLogQueue';
import type { CreateLogPayload } from '../types/logs';

const PAYLOAD: CreateLogPayload = {
  childId: 'child-1',
  logType: 'mood',
  occurredAt: '2026-07-07T10:00:00.000Z',
  data: { level: 4 },
  notes: null,
};

beforeEach(() => {
  localStorage.clear();
});

describe('offlineLogQueue', () => {
  it('starts empty', () => {
    expect(getQueuedLogs()).toEqual([]);
  });

  it('queueLog appends an entry with a generated id and timestamp', () => {
    const entry = queueLog(PAYLOAD);
    expect(entry.payload).toEqual(PAYLOAD);
    expect(entry.id).toBeTruthy();
    expect(entry.queuedAt).toBeTruthy();

    const stored = getQueuedLogs();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(entry);
  });

  it('queueLog preserves insertion order across multiple entries', () => {
    const first = queueLog({ ...PAYLOAD, logType: 'mood' });
    const second = queueLog({ ...PAYLOAD, logType: 'sleep' });

    const stored = getQueuedLogs();
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe(first.id);
    expect(stored[1].id).toBe(second.id);
  });

  it('removeQueuedLog removes only the matching entry', () => {
    const first = queueLog({ ...PAYLOAD, logType: 'mood' });
    const second = queueLog({ ...PAYLOAD, logType: 'sleep' });

    removeQueuedLog(first.id);

    const stored = getQueuedLogs();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(second.id);
  });

  it('removeQueuedLog on an unknown id is a no-op', () => {
    queueLog(PAYLOAD);
    removeQueuedLog('does-not-exist');
    expect(getQueuedLogs()).toHaveLength(1);
  });

  it('getQueuedLogs tolerates corrupted localStorage content', () => {
    localStorage.setItem('offline-log-queue', 'not valid json{{{');
    expect(getQueuedLogs()).toEqual([]);
  });

  it('subscribeToLogQueue notifies on queueLog and removeQueuedLog', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToLogQueue(callback);

    const entry = queueLog(PAYLOAD);
    expect(callback).toHaveBeenCalledTimes(1);

    removeQueuedLog(entry.id);
    expect(callback).toHaveBeenCalledTimes(2);

    unsubscribe();
    queueLog(PAYLOAD);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('subscribeToLogQueue supports multiple independent subscribers', () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribeToLogQueue(a);
    const unsubB = subscribeToLogQueue(b);

    queueLog(PAYLOAD);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    unsubB();
    queueLog(PAYLOAD);
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('isNetworkError', () => {
  it('is true for an axios-shaped error with a request but no response', () => {
    expect(isNetworkError({ request: {}, response: undefined })).toBe(true);
  });

  it('is false for an axios-shaped error that has a response (e.g. 400/409)', () => {
    expect(isNetworkError({ request: {}, response: { status: 400 } })).toBe(false);
  });

  it('is false when there is no request at all', () => {
    expect(isNetworkError({ response: undefined })).toBe(false);
    expect(isNetworkError({})).toBe(false);
  });

  it('is false for non-object values', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
    expect(isNetworkError('some string error')).toBe(false);
    expect(isNetworkError(new Error('plain error'))).toBe(false);
  });
});
