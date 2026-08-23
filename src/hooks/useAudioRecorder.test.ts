import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { formatDuration, isAudioRecordingSupported, useAudioRecorder } from './useAudioRecorder';

class FakeMediaRecorder {
  static supported: string[] = ['audio/webm;codecs=opus'];
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = (type: string) => FakeMediaRecorder.supported.includes(type);

  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(_stream: MediaStream, readonly options?: { mimeType?: string }) {
    FakeMediaRecorder.instances.push(this);
  }

  get mimeType(): string {
    return this.options?.mimeType ?? '';
  }

  start(): void {
    this.state = 'recording';
  }

  /** Emite um chunk como o navegador faria antes de parar. */
  emit(bytes: number): void {
    this.ondataavailable?.({ data: new Blob([new Uint8Array(bytes)]) });
  }

  stop(): void {
    this.state = 'inactive';
    this.onstop?.();
  }
}

const trackStop = vi.fn();

function installMediaStack() {
  (window as unknown as { MediaRecorder: unknown }).MediaRecorder = FakeMediaRecorder;
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream),
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  trackStop.mockClear();
  FakeMediaRecorder.instances = [];
  FakeMediaRecorder.supported = ['audio/webm;codecs=opus'];
  installMediaStack();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('isAudioRecordingSupported', () => {
  it('is false when the browser has no MediaRecorder', () => {
    delete (window as unknown as { MediaRecorder?: unknown }).MediaRecorder;
    expect(isAudioRecordingSupported()).toBe(false);
  });

  it('is true once MediaRecorder and getUserMedia are both available', () => {
    expect(isAudioRecordingSupported()).toBe(true);
  });
});

describe('useAudioRecorder', () => {
  it('records, counts the elapsed seconds and returns the captured blob', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isRecording).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.seconds).toBe(3);

    FakeMediaRecorder.instances[0].emit(128);

    let recording: Awaited<ReturnType<typeof result.current.stop>> = null;
    await act(async () => {
      recording = await result.current.stop();
    });

    expect(recording).not.toBeNull();
    expect(recording!.durationSeconds).toBe(3);
    expect(recording!.blob.size).toBe(128);
    expect(result.current.isRecording).toBe(false);
  });

  it('reports the mime type the recorder actually used, not the one requested', async () => {
    // Safari: só aceita audio/mp4, então a primeira preferência não vale.
    FakeMediaRecorder.supported = ['audio/mp4'];
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    FakeMediaRecorder.instances[0].emit(64);

    let recording: Awaited<ReturnType<typeof result.current.stop>> = null;
    await act(async () => {
      recording = await result.current.stop();
    });

    expect(recording!.mimeType).toBe('audio/mp4');
  });

  it('releases the microphone when the recording stops', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    FakeMediaRecorder.instances[0].emit(64);
    await act(async () => {
      await result.current.stop();
    });

    // Sem isso o indicador de gravação do navegador fica aceso para sempre.
    expect(trackStop).toHaveBeenCalled();
  });

  it('releases the microphone when the recording is cancelled', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    act(() => result.current.cancel());

    expect(trackStop).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
    expect(result.current.seconds).toBe(0);
  });

  it('returns null instead of an empty blob when nothing was captured', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });

    let recording: Awaited<ReturnType<typeof result.current.stop>> = null;
    await act(async () => {
      recording = await result.current.stop();
    });

    expect(recording).toBeNull();
  });

  it('surfaces a denied microphone permission as an actionable message', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('no', 'NotAllowedError')) },
    });
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toMatch(/microfone/i);
  });

  it('stops itself at the maximum length instead of recording forever', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(FakeMediaRecorder.instances[0].state).toBe('inactive');
  });
});

describe('formatDuration', () => {
  it('formats as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9)).toBe('0:09');
    expect(formatDuration(75)).toBe('1:15');
    expect(formatDuration(600)).toBe('10:00');
  });
});
