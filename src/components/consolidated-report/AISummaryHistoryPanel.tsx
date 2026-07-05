import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

interface Props {
  childId: string;
}

const PERIOD_OPTIONS = [
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: '180 dias', value: 180 },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
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
      setError('Erro ao carregar o histórico de resumos.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

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
          setGenError(`Limite de ${AI_RATE_LIMIT_PER_HOUR} gerações por hora atingido. Tente novamente mais tarde.`);
        }
      } else {
        setGenError('Erro ao gerar resumo com IA. Tente novamente.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const quotaLabel = useMemo(() => {
    if (retryAt) return null;
    if (!rateLimit || rateLimit.remaining === null) return null;
    return `${rateLimit.remaining} de ${rateLimit.limit} gerações restantes nesta hora`;
  }, [rateLimit, retryAt]);

  return (
    <Box>
      <Flex justify="between" align="center" mb="2" wrap="wrap" gap="3">
        <GumroadHeading level="title-lg" as="h2">Resumos de IA</GumroadHeading>
        <Flex gap="2" wrap="wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodDays(opt.value)}
              style={{
                padding: '4px 14px',
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.pill,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: periodDays === opt.value ? colors.ink : colors.canvas,
                color: periodDays === opt.value ? colors.canvas : colors.ink,
                boxShadow: periodDays === opt.value ? 'none' : shadows['card-sm'],
              }}
            >
              {opt.label}
            </button>
          ))}
        </Flex>
      </Flex>

      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.sm }}>
        Resumo em português, gerado por IA a partir dos dados registrados no sistema — útil para compartilhar com a equipe terapêutica.
      </GumroadText>

      <Flex align="center" gap="3" wrap="wrap" mb="4">
        <GumroadButton variant="primary" size="md" onClick={handleGenerate} disabled={generating || retrySeconds > 0}>
          <MagicWandIcon />
          {generating ? 'Gerando...' : retrySeconds > 0 ? `Tente em ${retrySeconds}s` : 'Gerar novo resumo'}
        </GumroadButton>
        {quotaLabel && (
          <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>{quotaLabel}</GumroadText>
        )}
      </Flex>

      {genError && (
        <GumroadCard color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-sm" as="p">{genError}</GumroadText>
        </GumroadCard>
      )}
      {retryAt && !genError && (
        <GumroadCard color="yellow" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-sm" as="p">
            Limite de {AI_RATE_LIMIT_PER_HOUR} gerações por hora atingido. Tente novamente em {retrySeconds}s.
          </GumroadText>
        </GumroadCard>
      )}

      {loading ? (
        <LoadingSpinner size="medium" text="Carregando histórico..." />
      ) : error ? (
        <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'] }}>{error}</GumroadText>
      ) : summaries.length === 0 ? (
        <GumroadCard color="cream" shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.65 }}>
            Nenhum resumo gerado ainda. Clique em "Gerar novo resumo" para começar.
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
                onClick={() => setExpandedId(expanded ? null : s.id)}
              >
                <Flex justify="between" align="center" gap="2" wrap="wrap" mb="2">
                  <GumroadHeading level="title-sm" as="h3">{formatDate(s.createdAt)}</GumroadHeading>
                  <GumroadText level="caption" as="span" style={{ opacity: 0.5, fontFamily: 'monospace' }}>
                    {s.model} · {s.periodDays}d
                  </GumroadText>
                </Flex>
                <GumroadText level="body-md" as="p" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {expanded ? s.summary : preview}
                </GumroadText>
                {s.summary.length > 220 && (
                  <GumroadText level="caption" as="p" style={{ marginTop: spacing.xs, opacity: 0.6, fontWeight: 700 }}>
                    {expanded ? 'Recolher ▲' : 'Ler mais ▼'}
                  </GumroadText>
                )}
              </GumroadCard>
            );
          })}
        </Flex>
      )}

      <Flex align="center" gap="2" mt="4" style={{ opacity: 0.7 }}>
        <InfoCircledIcon />
        <GumroadText level="caption" as="span">
          Gerado por IA a partir dos seus dados — pode conter imprecisões e não substitui avaliação profissional.
        </GumroadText>
      </Flex>
    </Box>
  );
};

export default AISummaryHistoryPanel;
