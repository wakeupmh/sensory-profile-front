import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const create = vi.fn();
const uploadAudio = vi.fn();
const startTranscription = vi.fn();
const get = vi.fn();

vi.mock('../services/api', () => ({
  voiceNoteApi: {
    create: (...a: unknown[]) => create(...a),
    uploadAudio: (...a: unknown[]) => uploadAudio(...a),
    startTranscription: (...a: unknown[]) => startTranscription(...a),
    get: (...a: unknown[]) => get(...a),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 'token' }),
}));

const recorderStop = vi.fn();
const recorderCancel = vi.fn();
vi.mock('./useAudioRecorder', async () => {
  const actual = await vi.importActual<typeof import('./useAudioRecorder')>('./useAudioRecorder');
  return {
    ...actual,
    isAudioRecordingSupported: () => true,
    useAudioRecorder: () => ({
      isRecording: false,
      seconds: 3,
      error: null,
      start: vi.fn().mockResolvedValue(undefined),
      stop: recorderStop,
      cancel: recorderCancel,
    }),
  };
});

const { useVoiceDictation } = await import('./useVoiceDictation');

const RECORDING = { blob: new Blob(['x']), mimeType: 'audio/webm', durationSeconds: 3 };

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue({ note: { id: 'v1' }, uploadUrl: 'https://s3.example/put' });
  uploadAudio.mockResolvedValue(undefined);
  startTranscription.mockResolvedValue({ id: 'v1', status: 'transcribing' });
  recorderStop.mockResolvedValue(RECORDING);
});

afterEach(() => vi.useRealTimers());

describe('useVoiceDictation', () => {
  it('uploads before starting the job — the job reads the object from S3', async () => {
    const order: string[] = [];
    uploadAudio.mockImplementation(async () => { order.push('upload'); });
    startTranscription.mockImplementation(async () => { order.push('start'); return { id: 'v1' }; });
    get.mockResolvedValue({ id: 'v1', status: 'ready', transcript: 'texto ditado', error: null });

    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });
    await waitFor(() => expect(onText).toHaveBeenCalled());

    expect(order).toEqual(['upload', 'start']);
    expect(uploadAudio).toHaveBeenCalledWith('https://s3.example/put', RECORDING.blob, 'audio/webm');
  });

  it('hands the finished transcript to the caller', async () => {
    get.mockResolvedValue({ id: 'v1', status: 'ready', transcript: 'acordou tres vezes', error: null });
    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });
    await waitFor(() => expect(onText).toHaveBeenCalledWith('acordou tres vezes'));
    await waitFor(() => expect(result.current.state).toBe('idle'));
  });

  it('keeps polling while the job is still running', async () => {
    get
      .mockResolvedValueOnce({ id: 'v1', status: 'transcribing', transcript: null, error: null })
      .mockResolvedValueOnce({ id: 'v1', status: 'transcribing', transcript: null, error: null })
      .mockResolvedValue({ id: 'v1', status: 'ready', transcript: 'pronto', error: null });

    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });
    await waitFor(() => expect(onText).toHaveBeenCalledWith('pronto'), { timeout: 15000 });
    expect(get.mock.calls.length).toBeGreaterThanOrEqual(3);
  }, 20000);

  it('surfaces the backend failure instead of writing nothing and going quiet', async () => {
    get.mockResolvedValue({ id: 'v1', status: 'failed', transcript: null, error: 'áudio mudo' });
    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });
    await waitFor(() => expect(result.current.error).toBe('áudio mudo'));
    expect(onText).not.toHaveBeenCalled();
  });

  it('reports a network failure rather than hanging on "transcrevendo"', async () => {
    create.mockRejectedValue(new Error('offline'));
    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });
    await waitFor(() => expect(result.current.state).toBe('idle'));
    expect(result.current.error).toMatch(/conexão/i);
  });

  it('does not write into a field that is already gone', async () => {
    get.mockResolvedValue({ id: 'v1', status: 'ready', transcript: 'tarde demais', error: null });
    const onText = vi.fn();
    const { result, unmount } = renderHook(() => useVoiceDictation(onText));

    const pending = act(async () => { await result.current.stop(); });
    unmount();
    await pending;
    await new Promise((r) => setTimeout(r, 2500));

    expect(onText).not.toHaveBeenCalled();
  }, 10000);

  it('does nothing when the recorder captured no audio', async () => {
    recorderStop.mockResolvedValue(null);
    const onText = vi.fn();
    const { result } = renderHook(() => useVoiceDictation(onText));

    await act(async () => { await result.current.stop(); });

    expect(create).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/Nada foi gravado/);
  });
});
