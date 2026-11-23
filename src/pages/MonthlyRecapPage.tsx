import { useState, useMemo } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { logApi, milestoneApi, goalApi, goalProgressApi } from '../services/api';
import type { DailyLog, LogType } from '../types/logs';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { ChildSelector } from '../components/domain/ChildSelector';
import { NoChildrenPage } from '../components/domain/NoChildrenPrompt';
import { ErrorState } from '../components/domain/ErrorState';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import MoodTrendChart from '../components/recap/MoodTrendChart';
import type { Goal } from '../types/goals';
import { getMonthRange, isDateStringInMonth, aggregateLogs, capitalize } from '../utils/monthlyRecap';

interface GoalWithMonthProgress {
  goal: Goal;
  entriesInMonth: number;
}

// Identidade estável: `aggregateLogs` é memoizado sobre `logs`.
const NO_LOGS: DailyLog[] = [];

export default function MonthlyRecapPage() {
  const { t, i18n } = useTranslation();
  const { children, childrenLoaded, childrenError, selectedChildId, setSelectedChildId, effectiveChildId } = useDomainPage();

  const [monthOffset, setMonthOffset] = useState(0);

  const { monthStart, monthEnd, year, month, daysInMonth } = useMemo(
    () => getMonthRange(monthOffset),
    [monthOffset],
  );
  // O rótulo segue o idioma ativo (getMonthRange fixa pt-BR)
  const monthLabel = capitalize(
    new Date(year, month, 1).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' }),
  );

  // Guarda contra resposta fora de ordem: trocar de criança ou de mês rápido
  // não deixa a busca anterior, que chega depois, ocupar a tela.
  const { data, loading, error, reload: fetchRecap } = useDomainResource(
    async (token) => {
      const childId = effectiveChildId!;
      const [logsResult, allMilestones, activeGoals] = await Promise.all([
        logApi.getLogs(token, {
          childId,
          from: monthStart.toISOString(),
          to: monthEnd.toISOString(),
          limit: 1000,
        }),
        milestoneApi.list(token, { childId }),
        goalApi.list(token, { childId, status: 'active' }),
      ]);

      const goalsProgress: GoalWithMonthProgress[] = await Promise.all(
        activeGoals.map(async (goal) => {
          const entries = await goalProgressApi.list(token, goal.id);
          const entriesInMonth = entries.filter((e) => {
            const ts = new Date(e.recordedAt).getTime();
            return ts >= monthStart.getTime() && ts <= monthEnd.getTime();
          }).length;
          return { goal, entriesInMonth };
        }),
      );

      return {
        logs: logsResult.data,
        milestonesAchieved: allMilestones.filter(
          (m) => m.achievedDate && isDateStringInMonth(m.achievedDate, year, month),
        ),
        goalsProgress,
      };
    },
    [effectiveChildId, monthOffset],
    { errorMessage: t('p2Recap.loadError'), enabled: !!effectiveChildId },
  );
  const logs = data?.logs ?? NO_LOGS;
  const milestonesAchieved = data?.milestonesAchieved ?? [];
  const goalsProgress = data?.goalsProgress ?? [];

  const { countsByType, moodByDay, moodAverage } = useMemo(() => aggregateLogs(logs), [logs]);

  const totalLogs = logs.length;
  const goalsWithProgress = goalsProgress.filter((g) => g.entriesInMonth > 0);
  const hasAnyActivity = totalLogs > 0 || milestonesAchieved.length > 0 || goalsProgress.length > 0;


  if (childrenLoaded && !childrenError && children.length === 0) {
    return <NoChildrenPage title={t('p2Recap.title')} subtitle={t('p2Recap.subtitle')} />;
  }
  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          {t('p2Recap.title')}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('p2Recap.subtitle')}
        </GumroadText>
      </Box>

      <ChildSelector children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} emptyLabel={t('p2Common.allChildren')} />

      <Flex align="center" justify="center" gap="3" mb="5">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          aria-label={t('p2Recap.prevMonth')}
          className="press-in"
          style={{
            width: '36px',
            height: '36px',
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeftIcon />
        </button>
        <GumroadText level="body-md" as="span" aria-live="polite" style={{ minWidth: '180px', textAlign: 'center', fontWeight: 700 }}>
          {monthLabel}
        </GumroadText>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
          disabled={monthOffset >= 0}
          aria-label={t('p2Recap.nextMonth')}
          className="press-in"
          style={{
            width: '36px',
            height: '36px',
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            backgroundColor: monthOffset >= 0 ? colors['surface-cream'] : colors.surface,
            cursor: monthOffset >= 0 ? 'default' : 'pointer',
            opacity: monthOffset >= 0 ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRightIcon />
        </button>
      </Flex>

      {children.length === 0 ? null : !effectiveChildId ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
            {t('p2Recap.selectChild')}
          </GumroadText>
        </GumroadCard>
      ) : loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text={t('p2Recap.loading')} /></Flex>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecap} />
      ) : !hasAnyActivity ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={36} height={36} />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              {t('p2Recap.noActivity', { month: monthLabel.toLowerCase() })}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              {t('p2Recap.dailyLogs')}
            </GumroadHeading>
            <GumroadText level="body-md" as="p" style={{ fontWeight: 700, marginBottom: spacing.sm }}>
              {t('p2Recap.logCount', { count: totalLogs })}
            </GumroadText>
            <Flex gap="2" wrap="wrap">
              {(Object.entries(countsByType) as [LogType, number][]).map(([type, count]) => (
                <GumroadBadge key={type} color="cyan">
                  {t(`p2Logs.types.${type}`)}: {count}
                </GumroadBadge>
              ))}
            </Flex>
          </GumroadCard>

          {moodByDay.length > 0 && (
            <GumroadCard color="white" shadow="md" padding="lg">
              <Flex align="center" justify="between" mb="2">
                <GumroadHeading level="title-md" as="h2">{t('p2Recap.mood')}</GumroadHeading>
                {moodAverage !== null && (
                  <GumroadText level="body-sm" as="span" style={{ fontWeight: 700 }}>
                    {t('p2Recap.average', { value: moodAverage.toFixed(1) })}
                  </GumroadText>
                )}
              </Flex>
              <MoodTrendChart data={moodByDay} daysInMonth={daysInMonth} />
            </GumroadCard>
          )}

          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              {t('p2Recap.milestones')}
            </GumroadHeading>
            {milestonesAchieved.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                {t('p2Recap.noMilestones')}
              </GumroadText>
            ) : (
              <Flex direction="column" gap="2">
                {milestonesAchieved.map((m) => (
                  <Flex key={m.id} align="center" gap="2" wrap="wrap">
                    <GumroadText level="body-sm" as="span" style={{ fontWeight: 600 }}>{m.title}</GumroadText>
                    <GumroadBadge color="mint">{t(`p2Recap.cat.${m.category}`)}</GumroadBadge>
                  </Flex>
                ))}
              </Flex>
            )}
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              {t('p2Recap.goals')}
            </GumroadHeading>
            {goalsProgress.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                {t('p2Recap.noGoals')}
              </GumroadText>
            ) : (
              <>
                <GumroadText level="body-sm" as="p" style={{ marginBottom: spacing.sm }}>
                  {t('p2Recap.goalsSummary', { done: goalsWithProgress.length, count: goalsProgress.length })}
                </GumroadText>
                <Flex direction="column" gap="2">
                  {goalsWithProgress.map(({ goal, entriesInMonth }) => (
                    <Flex key={goal.id} align="center" justify="between" gap="2">
                      <GumroadText level="body-sm" as="span">{goal.title}</GumroadText>
                      <GumroadBadge color="lavender">
                        {t('p2Recap.entries', { count: entriesInMonth })}
                      </GumroadBadge>
                    </Flex>
                  ))}
                </Flex>
              </>
            )}
          </GumroadCard>
        </Flex>
      )}
    </Box>
  );
}
