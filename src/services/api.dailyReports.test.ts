import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Coverage for `dailyReportApi.updateTranscript` (Defect 1 — correção da
 * transcrição): garante que a chamada bate no endpoint certo com o verbo
 * certo, e que o envelope `{success, data, timestamp}` do backend é
 * desembrulhado corretamente (mesma armadilha coberta em api.logs.test.ts).
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

const { dailyReportApi } = await import('./api');

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPatch.mockReset();
});

const ENVELOPE = (data: unknown) => ({ data: { success: true, data, timestamp: '2026-08-25T00:00:00.000Z' } });

describe('dailyReportApi.updateTranscript', () => {
  it('PATCHes /api/daily-reports/:id with the corrected transcript', async () => {
    mockPatch.mockResolvedValue(
      ENVELOPE({
        id: 'r1',
        childId: 'c1',
        reportDate: '2026-08-20',
        status: 'ready',
        transcript: 'texto corrigido',
        structured: { summary: 'novo resumo', suggestedLogs: [] },
        error: null,
        hasAudio: true,
        audioExpiresAt: null,
        createdAt: '',
        updatedAt: '',
      }),
    );

    const result = await dailyReportApi.updateTranscript('token', 'r1', 'texto corrigido');

    expect(mockPatch).toHaveBeenCalledWith(
      '/api/daily-reports/r1',
      { transcript: 'texto corrigido' },
      expect.anything(),
    );
    // Desembrulha response.data.data, não o envelope inteiro.
    expect(result.id).toBe('r1');
    expect(result.transcript).toBe('texto corrigido');
    expect(result.structured).toEqual({ summary: 'novo resumo', suggestedLogs: [] });
  });

  it('surfaces structured: null when the backend could not re-run the AI structuring', async () => {
    mockPatch.mockResolvedValue(
      ENVELOPE({
        id: 'r1',
        childId: 'c1',
        reportDate: '2026-08-20',
        status: 'ready',
        transcript: 'texto corrigido',
        structured: null,
        error: null,
        hasAudio: true,
        audioExpiresAt: null,
        createdAt: '',
        updatedAt: '',
      }),
    );

    const result = await dailyReportApi.updateTranscript('token', 'r1', 'texto corrigido');

    expect(result.structured).toBeNull();
  });
});
