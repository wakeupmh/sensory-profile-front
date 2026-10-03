import type { TFunction } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InfoCircledIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { behaviorInsightsApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { BehaviorInsights, BehaviorTopItem } from '../../types/behaviorInsights';
import { colors, spacing, radii } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadBadge from '../design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import LoadingSpinner from '../LoadingSpinner';
import { ErrorState } from '../domain/ErrorState';
import SimpleBarChart, { type BarDatum } from './SimpleBarChart';

interface BehaviorInsightsPanelProps {
  childId: string;
}

const PERIOD_OPTIONS = [7, 30, 90];

const INTENSITY_COLORS: Record<number, 'mint' | 'cyan' | 'yellow' | 'peach' | 'salmon'> = {
  1: 'mint',
  2: 'cyan',
  3: 'yellow',
  4: 'peach',
  5: 'salmon',
};

function buildWeekdayData(byWeekday: Record<string, number>, t: TFunction): BarDatum[] {
  return [0, 1, 2, 3, 4, 5, 6].map((idx) => ({
    label: t(`cInsights.weekday.${idx}`),
    value: byWeekday[String(idx)] ?? 0,
  }));
}

function buildHourData(byHour: Record<string, number>, t: TFunction): BarDatum[] {
  return Array.from({ length: 24 }, (_, h) => ({
    label: t('cInsights.hourShort', { hour: h }),
    value: byHour[String(h)] ?? 0,
  }));
}

function formatOccurredAt(iso: string, lang: string): string {
  return new Date(iso).toLocaleString(lang, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TopChips: React.FC<{ items: BehaviorTopItem[] }> = ({ items }) => {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.5, fontStyle: 'italic' }}>
        {t('cInsights.notEnoughData')}
      </GumroadText>
    );
  }
  return (
    <Flex gap="2" wrap="wrap">
      {items.slice(0, 5).map((item, idx) => (
        <GumroadBadge key={`${item.value}-${idx}`} color="lavender">
          {item.value} · {item.count}
        </GumroadBadge>
      ))}
    </Flex>
  );
};

const BehaviorInsightsPanel: React.FC<BehaviorInsightsPanelProps> = ({ childId }) => {
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const [days, setDays] = useState(30);
  const [insights, setInsights] = useState<BehaviorInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await behaviorInsightsApi.get(token, childId, days);
      setInsights(data);
    } catch {
      setError(t('cInsights.loadError'));
    } finally {
      setLoading(false);
    }
  }, [childId, days, getToken, t]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (!childId) return null;

  return (
    <Box>
      <Flex justify="between" align="center" mb="3" wrap="wrap" gap="3">
        <GumroadHeading level="title-lg" as="h2">
          {t('cInsights.title')}
        </GumroadHeading>
        <Flex gap="2" wrap="wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={days === opt}
              onClick={() => setDays(opt)}
              style={{
                padding: '6px 16px',
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.pill,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: days === opt ? colors.ink : 'transparent',
                color: days === opt ? colors.canvas : colors.ink,
              }}
            >
              {t('cInsights.days', { count: opt })}
            </button>
          ))}
        </Flex>
      </Flex>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text={t('cInsights.loading')} />
        </GumroadCard>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchInsights} />
      ) : !insights || insights.totalCount === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={36} height={36} aria-hidden="true" />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('cInsights.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('cInsights.emptyDesc')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to={`/logs?childId=${childId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <PlusIcon aria-hidden="true" />
                {t('cInsights.createFirst')}
              </Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          {/* Summary */}
          <GumroadCard color="white" shadow="md" padding="lg">
            <Flex justify="between" align="center" wrap="wrap" gap="4">
              <Box>
                <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: '4px' }}>
                  {t('cInsights.occurrences')}
                </GumroadText>
                <GumroadHeading level="display-sm" as="h3">
                  {insights.totalCount}
                </GumroadHeading>
              </Box>
              {insights.percentChange !== null && (
                <Flex
                  align="center"
                  gap="1"
                  style={{
                    color: insights.percentChange > 0 ? colors['brand-salmon'] : colors.success,
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {insights.percentChange > 0 ? <ArrowUpIcon aria-hidden="true" /> : <ArrowDownIcon aria-hidden="true" />}
                  {t('cInsights.vsPrevious', { percent: Math.abs(insights.percentChange).toFixed(0) })}
                </Flex>
              )}
              {insights.averageIntensity !== null && (
                <Box>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: '4px' }}>
                    {t('cInsights.avgIntensity')}
                  </GumroadText>
                  <GumroadHeading level="title-lg" as="h3">
                    {insights.averageIntensity.toFixed(1)}/5
                  </GumroadHeading>
                </Box>
              )}
            </Flex>
          </GumroadCard>

          {/* Distribution charts */}
          <Flex gap="4" wrap="wrap">
            <GumroadCard color="cream" shadow="md" padding="lg" style={{ flex: '1 1 280px' }}>
              <GumroadHeading level="title-sm" as="h3" style={{ marginBottom: spacing.md }}>
                {t('cInsights.byWeekday')}
              </GumroadHeading>
              <SimpleBarChart label={t('cInsights.byWeekday')} data={buildWeekdayData(insights.byWeekday, t)} accentColor={colors['brand-cyan']} />
            </GumroadCard>

            <GumroadCard color="cream" shadow="md" padding="lg" style={{ flex: '1 1 280px', overflowX: 'auto' }}>
              <GumroadHeading level="title-sm" as="h3" style={{ marginBottom: spacing.md }}>
                {t('cInsights.byHour')}
              </GumroadHeading>
              <Box style={{ minWidth: '480px' }}>
                <SimpleBarChart label={t('cInsights.byHour')} data={buildHourData(insights.byHour, t)} accentColor={colors['brand-yellow']} />
              </Box>
            </GumroadCard>
          </Flex>

          {/* Top lists */}
          <Flex gap="4" wrap="wrap">
            <GumroadCard color="white" shadow="md" padding="lg" style={{ flex: '1 1 280px' }}>
              <GumroadHeading level="title-sm" as="h3" style={{ marginBottom: spacing.sm }}>
                {t('cInsights.topAntecedents')}
              </GumroadHeading>
              <TopChips items={insights.topAntecedents} />
            </GumroadCard>
            <GumroadCard color="white" shadow="md" padding="lg" style={{ flex: '1 1 280px' }}>
              <GumroadHeading level="title-sm" as="h3" style={{ marginBottom: spacing.sm }}>
                {t('cInsights.topBehaviors')}
              </GumroadHeading>
              <TopChips items={insights.topBehaviors} />
            </GumroadCard>
          </Flex>

          {/* Recent timeline */}
          <Box>
            <GumroadHeading level="title-sm" as="h3" style={{ marginBottom: spacing.sm }}>
              {t('cInsights.recent')}
            </GumroadHeading>
            <Flex direction="column" gap="2">
              {insights.recent.slice(0, 10).map((occ) => (
                <GumroadCard key={occ.id} color="white" shadow="sm" padding="md">
                  <Flex justify="between" align="start" gap="3" wrap="wrap">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, marginBottom: '4px' }}>
                        {formatOccurredAt(occ.occurredAt, i18n.language)}
                      </GumroadText>
                      <GumroadText level="body-sm" as="p">
                        <strong>{t('cInsights.antecedent')}:</strong> {occ.antecedent}
                      </GumroadText>
                      <GumroadText level="body-sm" as="p">
                        <strong>{t('cInsights.behavior')}:</strong> {occ.behavior}
                      </GumroadText>
                      <GumroadText level="body-sm" as="p">
                        <strong>{t('cInsights.consequence')}:</strong> {occ.consequence}
                      </GumroadText>
                    </Box>
                    {occ.intensity !== null && (
                      <GumroadBadge color={INTENSITY_COLORS[occ.intensity] ?? 'cream'}>
                        {t('cInsights.intensity', { value: occ.intensity })}
                      </GumroadBadge>
                    )}
                  </Flex>
                </GumroadCard>
              ))}
            </Flex>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default BehaviorInsightsPanel;
