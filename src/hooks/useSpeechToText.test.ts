import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

type Listener = (event: unknown) => void;

class FakeSpeechRecognition extends EventTarget {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: Listener | null = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;
  started = false;

  start(): void {
    this.started = true;
  }

  stop(): void {
    this.started = false;
    this.onend?.();
  }
}

function makeResultEvent(entries: { transcript: string; isFinal: boolean }[], resultIndex = 0) {
  return {
    resultIndex,
    results: entries.map((e) => ({ isFinal: e.isFinal, 0: { transcript: e.transcript }, length: 1 })),
  };
}

const originalSpeechRecognition = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;

afterEach(() => {
  (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = originalSpeechRecognition;
  vi.resetModules();
});

describe('isSpeechRecognitionSupported (module-level feature detection)', () => {
  it('is true when window.SpeechRecognition exists', async () => {
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeSpeechRecognition;
    vi.resetModules();
    const { isSpeechRecognitionSupported } = await import('./useSpeechToText');
    expect(isSpeechRecognitionSupported).toBe(true);
  });

  it('is false when neither SpeechRecognition nor webkitSpeechRecognition exists', async () => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    vi.resetModules();
    const { isSpeechRecognitionSupported } = await import('./useSpeechToText');
    expect(isSpeechRecognitionSupported).toBe(false);
  });
});

describe('useSpeechToText', () => {
  let instances: FakeSpeechRecognition[] = [];

  beforeEach(() => {
    instances = [];
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = class extends FakeSpeechRecognition {
      constructor() {
        super();
        instances.push(this);
      }
    };
  });

  it('start() sets isListening true and stop() sets it back to false', async () => {
    vi.resetModules();
    const { useSpeechToText } = await import('./useSpeechToText');
    const { result } = renderHook(() => useSpeechToText(() => {}));

    expect(result.current.isListening).toBe(false);

    act(() => result.current.start());
    expect(result.current.isListening).toBe(true);

    act(() => result.current.stop());
    expect(result.current.isListening).toBe(false);
  });

  it('calls onFinalResult only for final results, trimmed', async () => {
    vi.resetModules();
    const { useSpeechToText } = await import('./useSpeechToText');
    const onFinalResult = vi.fn();
    const { result } = renderHook(() => useSpeechToText(onFinalResult));

    act(() => result.current.start());
    const instance = instances[0];

    act(() => {
      instance.onresult?.(
        makeResultEvent([
          { transcript: '  crianca chorou  ', isFinal: true },
          { transcript: 'ainda falando', isFinal: false },
        ]),
      );
    });

    expect(onFinalResult).toHaveBeenCalledTimes(1);
    expect(onFinalResult).toHaveBeenCalledWith('crianca chorou');
  });

  it('exposes interim (non-final) text separately without calling onFinalResult', async () => {
    vi.resetModules();
    const { useSpeechToText } = await import('./useSpeechToText');
    const onFinalResult = vi.fn();
    const { result } = renderHook(() => useSpeechToText(onFinalResult));

    act(() => result.current.start());
    const instance = instances[0];

    act(() => {
      instance.onresult?.(makeResultEvent([{ transcript: 'ainda falando', isFinal: false }]));
    });

    expect(result.current.interimText).toBe('ainda falando');
    expect(onFinalResult).not.toHaveBeenCalled();
  });

  it('accumulates final results across multiple onresult events (matches append-to-notes usage)', async () => {
    vi.resetModules();
    const { useSpeechToText } = await import('./useSpeechToText');
    const calls: string[] = [];
    const { result } = renderHook(() => useSpeechToText((text) => calls.push(text)));

    act(() => result.current.start());
    const instance = instances[0];

    act(() => instance.onresult?.(makeResultEvent([{ transcript: 'primeira frase', isFinal: true }])));
    act(() => instance.onresult?.(makeResultEvent([{ transcript: 'segunda frase', isFinal: true }])));

    expect(calls).toEqual(['primeira frase', 'segunda frase']);
  });

  it('resets isListening and interimText when recognition ends', async () => {
    vi.resetModules();
    const { useSpeechToText } = await import('./useSpeechToText');
    const { result } = renderHook(() => useSpeechToText(() => {}));

    act(() => result.current.start());
    const instance = instances[0];
    act(() => instance.onresult?.(makeResultEvent([{ transcript: 'falando', isFinal: false }])));
    expect(result.current.interimText).toBe('falando');

    act(() => instance.onend?.());
    expect(result.current.isListening).toBe(false);
    expect(result.current.interimText).toBe('');
  });
});
