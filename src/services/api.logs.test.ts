import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Regression coverage for the bug found while wiring up log photo
 * attachments: jsonResponse on the backend always nests the payload under
 * `data` (`{success, data, timestamp}`). getLogs (list) happens to survive
 * casting the raw envelope directly to PaginatedLogs because its meta
 * fields (total/page/limit) sit alongside `data` at the top level and
 * PaginatedLogs expects exactly that shape — but a single-object response
 * only has `id` etc. nested one level deeper, under `.data`. createLog/
 * getLog/updateLog used to skip that unwrap, so `log.id` (and everything
 * else) was silently `undefined` after creating a log. Nothing read that
 * return value until the attachment-upload flow needed the real id.
 */

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('axios', () => {
  const instance = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => instance),
      put: vi.fn(),
      isCancel: vi.fn(() => false),
      isAxiosError: vi.fn(() => false),
    },
  };
});

const { logApi } = await import('./api');

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPatch.mockReset();
});

const ENVELOPE = (data: unknown) => ({ data: { success: true, data, timestamp: '2026-07-07T00:00:00.000Z' } });

describe('logApi single-object envelope unwrapping', () => {
  it('createLog unwraps response.data.data — the actual created log, not the envelope', async () => {
    mockPost.mockResolvedValue(
      ENVELOPE({ id: 'log-1', childId: 'c1', logType: 'mood', occurredAt: '', data: { level: 3 }, notes: null, createdAt: '', updatedAt: '' }),
    );

    const result = await logApi.createLog('token', {
      childId: 'c1',
      logType: 'mood',
      occurredAt: '2026-07-07T10:00:00.000Z',
      data: { level: 3 },
      notes: null,
    });

    expect(result.id).toBe('log-1');
    expect(result.childId).toBe('c1');
  });

  it('getLog unwraps response.data.data', async () => {
    mockGet.mockResolvedValue(ENVELOPE({ id: 'log-2', childId: 'c1' }));
    const result = await logApi.getLog('token', 'log-2');
    expect(result.id).toBe('log-2');
  });

  it('updateLog unwraps response.data.data', async () => {
    mockPatch.mockResolvedValue(ENVELOPE({ id: 'log-3', notes: 'updated' }));
    const result = await logApi.updateLog('token', 'log-3', { notes: 'updated' });
    expect(result.id).toBe('log-3');
    expect(result.notes).toBe('updated');
  });

  it('getLogs (list) does not need unwrapping — total/page/limit sit alongside data at the top level', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, data: [{ id: 'l1' }], total: 1, page: 1, limit: 20, timestamp: '' },
    });
    const result = await logApi.getLogs('token', {});
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('l1');
    expect(result.total).toBe(1);
  });
});
