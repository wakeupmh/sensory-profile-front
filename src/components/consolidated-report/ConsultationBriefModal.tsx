import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Box, Flex } from '@radix-ui/themes';
import { CheckIcon, CopyIcon, FileTextIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { consultationBriefApi, AIRateLimitError } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { ConsultationBrief } from '../../types/consultationBrief';
import { colors, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import { AI_RATE_LIMIT_PER_HOUR } from '../../types/aiSummaries';

interface ConsultationBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName?: string;
}

const PERIOD_OPTIONS = [30, 60, 90];

function useCountdown(retryAt: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!retryAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [retryAt]);
  if (!retryAt) return 0;
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}

function buildPlainText(brief: ConsultationBrief, t: TFunction, childName?: string): string {
  const lines = [
    childName ? t('cConsolidated.brief.titleWithName', { name: childName }) : t('cConsolidated.brief.title'),
    '',
    t('cConsolidated.brief.whatChanged').toUpperCase(),
    brief.whatChanged || '—',
    '',
    t('cConsolidated.brief.currentTreatments').toUpperCase(),
    brief.currentTreatments || '—',
    '',
    t('cConsolidated.brief.questions').toUpperCase(),
    ...(brief.suggestedQuestions.length > 0 ? brief.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`) : ['—']),
  ];
  return lines.join('\n');
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const ConsultationBriefModal: React.FC<ConsultationBriefModalProps> = ({ isOpen, onClose, childId, childName }) => {
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const [periodDays, setPeriodDays] = useState(60);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<ConsultationBrief | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const retrySeconds = useCountdown(retryAt);

  useEffect(() => {
    if (retryAt && retrySeconds === 0) setRetryAt(null);
  }, [retryAt, retrySeconds]);

  useEffect(() => {
    if (!isOpen) {
      setBrief(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      const { brief: result } = await consultationBriefApi.generate(token, { childId, periodDays });
      setBrief(result);
    } catch (err) {
      if (err instanceof AIRateLimitError) {
        if (err.info.retryAfterSeconds) {
          setRetryAt(Date.now() + err.info.retryAfterSeconds * 1000);
        } else {
          setError(t('cConsolidated.brief.rateLimit', { limit: AI_RATE_LIMIT_PER_HOUR }));
        }
      } else {
        setError(t('cConsolidated.brief.genError'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(buildPlainText(brief, t, childName));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t('cConsolidated.brief.copyError'));
    }
  };

  const handlePrint = () => {
    const styleId = 'consultation-brief-print-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body * { visibility: hidden !important; }
          #consultation-brief-print, #consultation-brief-print * { visibility: visible !important; }
          #consultation-brief-print {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    window.print();
  };

  return (
    <GumroadModal
      open={isOpen}
      onClose={onClose}
      title={t('cConsolidated.brief.modalTitle')}
      variant="center"
      maxWidth="560px"
    >
        {!brief && (
          <>
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.75, marginBottom: spacing.md }}>
              {t('cConsolidated.brief.intro')}
            </GumroadText>

            <Flex align="center" gap="2" wrap="wrap" mb="4">
              <GumroadText level="caption" as="span" style={{ color: colors['ink-muted'] }}>{t('cConsolidated.brief.period')}</GumroadText>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={periodDays === opt}
                  onClick={() => setPeriodDays(opt)}
                  style={{
                    padding: '4px 14px',
                    border: `2px solid ${colors.ink}`,
                    borderRadius: radii.pill,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: periodDays === opt ? colors.ink : colors.canvas,
                    color: periodDays === opt ? colors.canvas : colors.ink,
                  }}
                >
                  {t('cConsolidated.summary.days', { count: opt })}
                </button>
              ))}
            </Flex>

            {error && (
              <GumroadText level="body-sm" as="p" role="alert" style={{ color: colors.error, marginBottom: spacing.sm }}>
                {error}
              </GumroadText>
            )}
            {retryAt && (
              <GumroadText level="body-sm" as="p" role="status" style={{ color: colors.ink, opacity: 0.75, marginBottom: spacing.sm }}>
                {t('cConsolidated.brief.tooMany', { seconds: retrySeconds })}
              </GumroadText>
            )}

            <GumroadButton variant="primary" size="md" onClick={handleGenerate} disabled={retrySeconds > 0} loading={generating}>
              {generating ? t('cConsolidated.summary.generating') : retrySeconds > 0 ? t('cConsolidated.summary.tryIn', { seconds: retrySeconds }) : t('cConsolidated.brief.generate')}
            </GumroadButton>
          </>
        )}

        {brief && (
          <>
            {error && (
              <GumroadText level="body-sm" as="p" role="alert" style={{ color: colors.error, marginBottom: spacing.sm }}>
                {error}
              </GumroadText>
            )}
            <Flex gap="2" mb="4" wrap="wrap">
              <GumroadButton variant="secondary" size="sm" onClick={handlePrint}>
                <FileTextIcon aria-hidden="true" /> {t('cConsolidated.brief.print')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />} <span role="status">{copied ? t('cConsolidated.brief.copied') : t('cConsolidated.brief.copy')}</span>
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => setBrief(null)}>
                {t('cConsolidated.brief.regenerate')}
              </GumroadButton>
            </Flex>

            <Box
              id="consultation-brief-print"
              style={{
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.md,
                padding: spacing.lg,
                backgroundColor: colors.surface,
                fontFamily: "'Space Mono', ui-monospace, monospace",
              }}
            >
              <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.md, fontFamily: 'inherit' }}>
                {childName ? t('cConsolidated.brief.titleWithName', { name: childName }) : t('cConsolidated.brief.title')}
              </GumroadHeading>

              <Box style={{ marginBottom: spacing.md }}>
                <div style={sectionTitleStyle}>{t('cConsolidated.brief.whatChanged')}</div>
                <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {brief.whatChanged || '—'}
                </GumroadText>
              </Box>

              <Box style={{ marginBottom: spacing.md }}>
                <div style={sectionTitleStyle}>{t('cConsolidated.brief.currentTreatments')}</div>
                <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {brief.currentTreatments || '—'}
                </GumroadText>
              </Box>

              <Box>
                <div style={sectionTitleStyle}>{t('cConsolidated.brief.questions')}</div>
                {brief.suggestedQuestions.length > 0 ? (
                  <ol style={{ margin: 0, paddingLeft: '20px', fontFamily: 'inherit' }}>
                    {brief.suggestedQuestions.map((q, i) => (
                      <li key={i} style={{ marginBottom: '4px', fontSize: '14px' }}>{q}</li>
                    ))}
                  </ol>
                ) : (
                  <GumroadText level="body-sm" as="p" style={{ fontFamily: 'inherit' }}>—</GumroadText>
                )}
              </Box>
            </Box>

            <Flex align="center" gap="2" mt="3" style={{ color: colors['ink-muted'] }}>
              <InfoCircledIcon aria-hidden="true" />
              <GumroadText level="caption" as="span">
                {t('cConsolidated.brief.disclaimer')}
              </GumroadText>
            </Flex>
          </>
        )}
    </GumroadModal>
  );
};

export default ConsultationBriefModal;
