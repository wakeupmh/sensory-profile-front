import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { InfoCircledIcon, MagicWandIcon } from '@radix-ui/react-icons';
import { aiSummaryApi, AIRateLimitError } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { AISummaryRecord, AIRateLimitInfo } from '../../types/aiSummaries';
import { AI_RATE_LIMIT_PER_HOUR } from '../../types/aiSummaries';
import { colors, spacing, radii, shadows } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import LoadingSpinner from '../LoadingSpinner';
import { ErrorState } from '../domain/ErrorState';

interface Props {
  childId: string;
}

const PERIOD_OPTIONS = [30, 90, 180];

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' });
}

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

const AISummaryHistoryPanel: React.FC<Props> = ({ childId }) => {
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const [summaries, setSummaries] = useState<AISummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(90);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<AIRateLimitInfo | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const retrySeconds = useCountdown(retryAt);

  useEffect(() => {
    if (retryAt && retrySeconds === 0) setRetryAt(null);
  }, [retryAt, retrySeconds]);

  const fetchHistory = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const list = await aiSummaryApi.list(token, childId);
      setSummaries([...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError(t('cConsolidated.summary.loadError'));
    } finally {
      setLoading(false);
    }
  }, [childId, getToken, t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const token = await getToken();
      const { record, rateLimit: rl } = await aiSummaryApi.generate(token, { childId, periodDays });
      setSummaries((prev) => [record, ...prev]);
      setRateLimit(rl);
      setExpandedId(record.id);
    } catch (err) {
      if (err instanceof AIRateLimitError) {
        setRateLimit(err.info);
        if (err.info.retryAfterSeconds) {
          setRetryAt(Date.now() + err.info.retryAfterSeconds * 1000);
          setGenError(null);
        } else {
          setGenError(t('cConsolidated.summary.rateLimit', { limit: AI_RATE_LIMIT_PER_HOUR }));
        }
      } else {
        setGenError(t('cConsolidated.summary.genError'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const quotaLabel = useMemo(() => {
    if (retryAt) return null;
    if (!rateLimit || rateLimit.remaining === null) return null;
    return t('cConsolidated.summary.quota', { remaining: rateLimit.remaining, limit: rateLimit.limit });
  }, [rateLimit, retryAt, t]);

  return (
    <Box>
      <Flex justify="between" align="center" mb="2" wrap="wrap" gap="3">
        <GumroadHeading level="title-lg" as="h2">{t('cConsolidated.summary.title')}</GumroadHeading>
        <Flex gap="2" wrap="wrap">
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
                boxShadow: periodDays === opt ? 'none' : shadows['card-sm'],
              }}
            >
              {t('cConsolidated.summary.days', { count: opt })}
            </button>
          ))}
        </Flex>
      </Flex>

      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.sm }}>
        {t('cConsolidated.summary.intro')}
      </GumroadText>

      <Flex align="center" gap="3" wrap="wrap" mb="4">
        <GumroadButton variant="primary" size="md" onClick={handleGenerate} disabled={retrySeconds > 0} loading={generating}>
          <MagicWandIcon aria-hidden="true" />
          {generating ? t('cConsolidated.summary.generating') : retrySeconds > 0 ? t('cConsolidated.summary.tryIn', { seconds: retrySeconds }) : t('cConsolidated.summary.generate')}
        </GumroadButton>
        {quotaLabel && (
          <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>{quotaLabel}</GumroadText>
        )}
      </Flex>

      {genError && (
        <GumroadCard color="salmon" shadow="sm" padding="md" role="alert" style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-sm" as="p">{genError}</GumroadText>
        </GumroadCard>
      )}
      {retryAt && !genError && (
        <GumroadCard color="yellow" shadow="sm" padding="md" role="status" style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-sm" as="p">
            {t('cConsolidated.summary.rateLimitRetry', { limit: AI_RATE_LIMIT_PER_HOUR, seconds: retrySeconds })}
          </GumroadText>
        </GumroadCard>
      )}

      {loading ? (
        <LoadingSpinner size="medium" text={t('cConsolidated.summary.loading')} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : summaries.length === 0 ? (
        <GumroadCard color="cream" shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.65 }}>
            {t('cConsolidated.summary.empty', { action: t('cConsolidated.summary.generate') })}
          </GumroadText>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {summaries.map((s) => {
            const expanded = expandedId === s.id;
            const preview = s.summary.length > 220 ? `${s.summary.slice(0, 220)}…` : s.summary;
            return (
              <GumroadCard
                key={s.id}
                color="white"
                shadow="md"
                padding="lg"
              >
                <Flex justify="between" align="center" gap="2" wrap="wrap" mb="2">
                  <GumroadHeading level="title-sm" as="h3">{formatDate(s.createdAt, i18n.language)}</GumroadHeading>
                  <GumroadText level="caption" as="span" style={{ opacity: 0.5, fontFamily: 'monospace' }}>
                    {s.model} · {s.periodDays}d
                  </GumroadText>
                </Flex>
                <GumroadText level="body-md" as="p" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {expanded ? s.summary : preview}
                </GumroadText>
                {s.summary.length > 220 && (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                    style={{
                      marginTop: spacing.xs,
                      padding: '4px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0.75,
                      fontWeight: 700,
                      fontSize: '12px',
                      color: colors.ink,
                      fontFamily: 'inherit',
                    }}
                  >
                    {expanded ? t('cConsolidated.summary.collapse') : t('cConsolidated.summary.readMore')}
                  </button>
                )}
              </GumroadCard>
            );
          })}
        </Flex>
      )}

      <Flex align="center" gap="2" mt="4" style={{ opacity: 0.7 }}>
        <InfoCircledIcon aria-hidden="true" />
        <GumroadText level="caption" as="span">
          {t('cConsolidated.summary.disclaimer')}
        </GumroadText>
      </Flex>
    </Box>
  );
};

export default AISummaryHistoryPanel;
