import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  /**
   * O relato que já existe para esta data, se houver. Gravar de novo o
   * substitui — há um relato por criança por dia — então o usuário precisa
   * saber disso *antes* de falar, não depois de perder o anterior.
   */
  replaces?: import('../../types/dailyReports').DailyReport | null;
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
  replaces = null,
}: DailyReportRecorderProps) {
  const { t, i18n } = useTranslation();
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
      setSubmitError(t('p2Logs.report.nothing'));
      return;
    }
    if (recording.durationSeconds < MIN_USEFUL_SECONDS) {
      setSubmitError(t('p2Logs.report.tooShort'));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onFinish(recording);
      onClose();
    } catch {
      setSubmitError(t('p2Logs.report.sendError'));
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_RECORDING_SECONDS - seconds;

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label={t('p2Logs.report.dialog')}
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
            {t('p2Logs.report.title')}
          </GumroadHeading>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t('p2Logs.report.close')}
            style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer' }}
          >
            <Cross2Icon width={20} height={20} />
          </button>
        </Flex>

        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          {new Date(`${reportDate}T12:00:00`).toLocaleDateString(i18n.language, {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
          {' — '}
          {t('p2Logs.report.intro')}
        </GumroadText>

        {replaces && (
          <Box
            role="alert"
            style={{
              backgroundColor: colors['brand-yellow'],
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              padding: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <GumroadText level="body-sm" as="p">
              {replaces.status === 'ready'
                ? t('p2Logs.report.replacesReady')
                : t('p2Logs.report.replacesOther')}
            </GumroadText>
          </Box>
        )}

        {!supported ? (
          <Flex align="center" gap="2" style={{ color: colors.ink }}>
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="p">
              {t('p2Logs.report.unsupported')}
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
                {t('p2Logs.report.autoStop', { time: formatDuration(remaining) })}
              </GumroadText>
            )}

            {submitting ? (
              <GumroadText level="body-md" as="p">{t('p2Logs.report.sending')}</GumroadText>
            ) : isRecording ? (
              <GumroadButton variant="primary" size="lg" onClick={handleStop}>
                <StopIcon />
                {t('p2Logs.report.stop')}
              </GumroadButton>
            ) : (
              <GumroadButton variant="primary" size="lg" onClick={start}>
                {t('p2Logs.report.start')}
              </GumroadButton>
            )}

            {(error || submitError) && (
              <Flex align="center" gap="2" role="alert">
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
