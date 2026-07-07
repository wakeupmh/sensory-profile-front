import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const isSpeechRecognitionSupported = getSpeechRecognitionCtor() !== null;

/**
 * Ditado por voz (Web Speech API) para o campo de observações — mãos ocupadas
 * durante uma crise não é hipotético neste app. `onFinalResult` recebe cada
 * trecho já finalizado pelo reconhecedor; texto interino (ainda sendo
 * reconhecido) fica disponível em `interimText` só para preview.
 */
export function useSpeechToText(onFinalResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalResultRef.current(text.trim());
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setInterimText('');
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported: isSpeechRecognitionSupported, isListening, interimText, start, stop };
}
