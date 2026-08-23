import { useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { Cross2Icon, ExclamationTriangleIcon, StopIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import {
  formatDuration,
  isAudioRecordingSupported,
  useAudioRecorder,
  MAX_RECORDING_SECONDS,
} from '../../hooks/useAudioRecorder';
import type { AudioRecording } from '../../hooks/useAudioRecorder';

interface DailyReportRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  /** Recebe a gravação já finalizada; faz upload, dispara a transcrição e resolve. */
  onFinish: (recording: AudioRecording) => Promise<void>;
  reportDate: string;
}

/** Abaixo disso quase nunca há relato de verdade — geralmente um toque sem querer. */
const MIN_USEFUL_SECONDS = 3;

export default function DailyReportRecorder({
  isOpen,
  onClose,
  onFinish,
  reportDate,
}: DailyReportRecorderProps) {
  const { isRecording, seconds, error, start, stop, cancel } = useAudioRecorder();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const supported = isAudioRecordingSupported();

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      setSubmitError(null);
      return;
    }
    previousFocus.current?.focus();
  }, [isOpen]);

  // Fechar a folha (Esc, botão, navegação) tem que soltar o microfone, senão
  // o indicador de gravação do navegador fica aceso numa tela que já saiu.
  useEffect(() => {
    if (!isOpen) cancel();
  }, [isOpen, cancel]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const handleStop = async () => {
    const recording = await stop();
    if (!recording) {
      setSubmitError('Nada foi gravado. Tente novamente.');
      return;
    }
    if (recording.durationSeconds < MIN_USEFUL_SECONDS) {
      setSubmitError('A gravação ficou curta demais. Conte um pouco mais sobre o dia.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onFinish(recording);
      onClose();
    } catch {
      setSubmitError('Não foi possível enviar a gravação. Verifique a conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_RECORDING_SECONDS - seconds;

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Gravar relato do dia"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 26, 0.5)',
        zIndex: zIndex.modal,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={() => !submitting && onClose()}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors['surface-cream'],
          border: `2px solid ${colors.ink}`,
          borderBottom: 'none',
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          boxShadow: shadows.card,
          width: '100%',
          maxWidth: '520px',
          padding: spacing.lg,
        }}
      >
        <Flex justify="between" align="center" mb="4">
          <GumroadHeading level="title-md" as="h2">
            Relato do dia
          </GumroadHeading>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer' }}
          >
            <Cross2Icon width={20} height={20} />
          </button>
        </Flex>

        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          {new Date(`${reportDate}T12:00:00`).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
          {' — '}
          conte como foi o dia. A gravação vira um relatório com registros sugeridos que você confirma depois.
        </GumroadText>

        {!supported ? (
          <Flex align="center" gap="2" style={{ color: colors.ink }}>
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="p">
              Este navegador não permite gravar áudio. Tente pelo Chrome, Firefox ou Safari atualizados.
            </GumroadText>
          </Flex>
        ) : (
          <Flex direction="column" align="center" gap="4">
            <Box
              aria-live="polite"
              style={{
                fontSize: '40px',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: isRecording ? colors['brand-salmon'] : colors.ink,
              }}
            >
              {formatDuration(seconds)}
            </Box>

            {isRecording && remaining <= 60 && (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                A gravação para automaticamente em {formatDuration(remaining)}.
              </GumroadText>
            )}

            {submitting ? (
              <GumroadText level="body-md" as="p">Enviando a gravação…</GumroadText>
            ) : isRecording ? (
              <GumroadButton variant="primary" size="lg" onClick={handleStop}>
                <StopIcon />
                Parar e enviar
              </GumroadButton>
            ) : (
              <GumroadButton variant="primary" size="lg" onClick={start}>
                Começar a gravar
              </GumroadButton>
            )}

            {(error || submitError) && (
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon />
                <GumroadText level="body-sm" as="p">{error ?? submitError}</GumroadText>
              </Flex>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
