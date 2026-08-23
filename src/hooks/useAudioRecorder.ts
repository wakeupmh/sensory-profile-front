import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Formatos na ordem de preferência. `audio/webm;codecs=opus` é o que
 * Chrome/Firefox produzem e é bem comprimido; Safari só grava `audio/mp4`.
 * O backend aceita os dois (ver dailyReportValidation).
 */
const PREFERRED_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];

/** Corte de segurança: o relato é de um dia, não um podcast. */
export const MAX_RECORDING_SECONDS = 10 * 60;

export function isAudioRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

function pickMimeType(): string {
  const supported = PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  // Sem nenhum suportado, deixa o navegador escolher: o `mimeType` real é
  // lido do MediaRecorder depois de iniciar, então ainda enviamos a verdade.
  return supported ?? '';
}

export interface AudioRecording {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
}

export interface UseAudioRecorder {
  isRecording: boolean;
  seconds: number;
  error: string | null;
  start: () => Promise<void>;
  /** Encerra e devolve a gravação, ou null se nada foi capturado. */
  stop: () => Promise<AudioRecording | null>;
  cancel: () => void;
}

export function useAudioRecorder(): UseAudioRecorder {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  // Resolver de um `stop()` em andamento, e a gravação já finalizada quando
  // ninguém estava esperando (o caso do corte automático em MAX_RECORDING_SECONDS).
  const pendingStopRef = useRef<((r: AudioRecording | null) => void) | null>(null);
  const finalizedRef = useRef<AudioRecording | null>(null);

  // Soltar o stream é o que apaga o indicador de microfone do navegador. Se
  // isso vazar, o usuário vê "gravando" numa aba que já saiu da tela.
  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => releaseStream, [releaseStream]);

  const start = useCallback(async () => {
    setError(null);
    if (!isAudioRecordingSupported()) {
      setError('Este navegador não permite gravar áudio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      // Atribuído aqui, e não dentro de `stop()`: o corte automático abaixo
      // chama `recorder.stop()` diretamente, e com o handler instalado só no
      // caminho do botão o microfone ficava aberto para sempre justamente
      // quando o limite de segurança disparava.
      recorder.onstop = () => {
        // O mimeType real do recorder, não o que pedimos: quando o navegador
        // ignora a preferência, o backend precisa saber o que de fato chegou.
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const recording: AudioRecording | null =
          blob.size > 0 ? { blob, mimeType, durationSeconds: secondsRef.current } : null;
        chunksRef.current = [];
        releaseStream();
        setIsRecording(false);

        const resolve = pendingStopRef.current;
        pendingStopRef.current = null;
        // Sem ninguém esperando, a gravação fica guardada para o `stop()`
        // seguinte — o corte automático não pode descartar o que foi falado.
        if (resolve) resolve(recording);
        else finalizedRef.current = recording;
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_RECORDING_SECONDS && recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, 1000);
    } catch (e) {
      releaseStream();
      setError(
        e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
          ? 'Permissão de microfone negada. Libere o acesso nas configurações do navegador.'
          : 'Não foi possível acessar o microfone.',
      );
    }
  }, [releaseStream]);

  const stop = useCallback((): Promise<AudioRecording | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      // Já parado: ou nunca gravou, ou o corte automático finalizou antes.
      const finalized = finalizedRef.current;
      finalizedRef.current = null;
      releaseStream();
      setIsRecording(false);
      return Promise.resolve(finalized);
    }
    return new Promise((resolve) => {
      pendingStopRef.current = resolve;
      recorder.stop();
    });
  }, [releaseStream]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    finalizedRef.current = null;
    pendingStopRef.current = null;
    secondsRef.current = 0;
    setSeconds(0);
    releaseStream();
    setIsRecording(false);
  }, [releaseStream]);

  return { isRecording, seconds, error, start, stop, cancel };
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
