import { useCallback, useEffect, useRef, useState } from 'react';
import { voiceNoteApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { isAudioRecordingSupported, useAudioRecorder } from './useAudioRecorder';

export type DictationState = 'idle' | 'recording' | 'sending' | 'transcribing';

const POLL_INTERVAL_MS = 2000;
/**
 * Um ditado é uma frase, não um relato: passado disso algo travou, e é melhor
 * dizer isso do que deixar o botão girando para sempre.
 */
const POLL_TIMEOUT_MS = 90_000;

export interface UseVoiceDictation {
  isSupported: boolean;
  state: DictationState;
  /** Segundos gravados; só significativo enquanto `state === 'recording'`. */
  seconds: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  cancel: () => void;
}

/**
 * "Falar em vez de digitar" para qualquer campo de texto: grava, envia,
 * transcreve no servidor e entrega o texto em `onText`.
 *
 * Transcreve no backend (AWS Transcribe) e não pela Web Speech API do
 * navegador — que no Chrome envia o áudio para servidores do Google, um
 * terceiro que não está na nossa política de privacidade. O custo é não haver
 * texto parcial ao vivo: o texto chega de uma vez, alguns segundos depois de
 * parar. Por isso o campo continua editável o tempo todo, e o texto é
 * acrescentado ao que já estava lá em vez de substituí-lo.
 */
export function useVoiceDictation(onText: (text: string) => void): UseVoiceDictation {
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const recorder = useAudioRecorder();
  const [state, setState] = useState<DictationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const abandoned = useRef(false);

  // Um ditado abandonado (folha fechada, componente desmontado) não deve
  // despejar texto num campo que já não existe nem manter o polling vivo.
  useEffect(() => {
    abandoned.current = false;
    return () => {
      abandoned.current = true;
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    await recorder.start();
    setState('recording');
  }, [recorder]);

  const cancel = useCallback(() => {
    abandoned.current = true;
    recorder.cancel();
    setState('idle');
  }, [recorder]);

  const stop = useCallback(async () => {
    const recording = await recorder.stop();
    if (!recording) {
      setState('idle');
      setError('Nada foi gravado.');
      return;
    }

    setState('sending');
    try {
      const token = await getTokenRef.current();
      const { note, uploadUrl } = await voiceNoteApi.create(token, recording.mimeType);
      await voiceNoteApi.uploadAudio(uploadUrl, recording.blob, recording.mimeType);
      await voiceNoteApi.startTranscription(token, note.id);

      setState('transcribing');
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      for (;;) {
        if (abandoned.current) return;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (abandoned.current) return;

        const current = await voiceNoteApi.get(await getTokenRef.current(), note.id);
        if (current.status === 'ready' && current.transcript) {
          onTextRef.current(current.transcript);
          setState('idle');
          return;
        }
        if (current.status === 'failed') {
          setState('idle');
          setError(current.error ?? 'Não foi possível transcrever o áudio.');
          return;
        }
        if (Date.now() > deadline) {
          setState('idle');
          setError('A transcrição demorou demais. Tente novamente.');
          return;
        }
      }
    } catch {
      setState('idle');
      setError('Não foi possível transcrever o áudio. Verifique a conexão.');
    }
  }, [recorder]);

  return {
    isSupported: isAudioRecordingSupported(),
    state,
    seconds: recorder.seconds,
    error: error ?? recorder.error,
    start,
    stop,
    cancel,
  };
}
