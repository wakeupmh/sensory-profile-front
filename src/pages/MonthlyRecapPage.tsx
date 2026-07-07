import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { logApi, milestoneApi, goalApi, goalProgressApi } from '../services/api';
import type { DailyLog, LogType } from '../types/logs';
import { useAuthContext } from '../context/AuthContext';
import { useDomainPage } from '../hooks/useDomainPage';
import { ChildSelector } from '../components/domain/ChildSelector';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import MoodTrendChart from '../components/recap/MoodTrendChart';
import type { Goal } from '../types/goals';
import type { DevelopmentalMilestone } from '../types/development';
import { MILESTONE_CATEGORY_LABELS } from '../types/development';
import { getMonthRange, isDateStringInMonth, aggregateLogs } from '../utils/monthlyRecap';

const LOG_TYPE_LABELS: Record<LogType, string> = {
  abc: 'ABC',
  mood: 'Humor',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Banheiro',
};

interface GoalWithMonthProgress {
  goal: Goal;
  entriesInMonth: number;
}

export default function MonthlyRecapPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [milestonesAchieved, setMilestonesAchieved] = useState<DevelopmentalMilestone[]>([]);
  const [goalsProgress, setGoalsProgress] = useState<GoalWithMonthProgress[]>([]);

  const { monthStart, monthEnd, monthLabel, year, month, daysInMonth } = useMemo(
    () => getMonthRange(monthOffset),
    [monthOffset],
  );

  const fetchRecap = useCallback(async () => {
    if (!effectiveChildId) {
      setLogs([]);
      setMilestonesAchieved([]);
      setGoalsProgress([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const [logsResult, allMilestones, activeGoals] = await Promise.all([
        logApi.getLogs(token, {
          childId: effectiveChildId,
          from: monthStart.toISOString(),
          to: monthEnd.toISOString(),
          limit: 1000,
        }),
        milestoneApi.list(token, { childId: effectiveChildId }),
        goalApi.list(token, { childId: effectiveChildId, status: 'active' }),
      ]);

      const withProgress = await Promise.all(
        activeGoals.map(async (goal) => {
          const entries = await goalProgressApi.list(token, goal.id);
          const entriesInMonth = entries.filter((e) => {
            const t = new Date(e.occurredAt).getTime();
            return t >= monthStart.getTime() && t <= monthEnd.getTime();
          }).length;
          return { goal, entriesInMonth };
        }),
      );

      setLogs(logsResult.data);
      setMilestonesAchieved(
        allMilestones.filter((m) => m.achievedDate && isDateStringInMonth(m.achievedDate, year, month)),
      );
      setGoalsProgress(withProgress);
    } catch {
      setError('Erro ao carregar o resumo do mês. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [effectiveChildId, monthStart, monthEnd, year, month, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) fetchRecap();
  }, [fetchRecap, isLoaded, session]);

  const { countsByType, moodByDay, moodAverage } = useMemo(() => aggregateLogs(logs), [logs]);

  const totalLogs = logs.length;
  const goalsWithProgress = goalsProgress.filter((g) => g.entriesInMonth > 0);
  const hasAnyActivity = totalLogs > 0 || milestonesAchieved.length > 0 || goalsProgress.length > 0;

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Resumo do mês
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Uma visão geral da atividade registrada, mês a mês
        </GumroadText>
      </Box>

      <ChildSelector children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      <Flex align="center" justify="center" gap="3" mb="5">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          aria-label="Mês anterior"
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
        <GumroadText level="body-md" as="span" style={{ minWidth: '180px', textAlign: 'center', fontWeight: 700 }}>
          {monthLabel}
        </GumroadText>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
          disabled={monthOffset >= 0}
          aria-label="Próximo mês"
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

      {!effectiveChildId ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
            Selecione uma criança para ver o resumo do mês
          </GumroadText>
        </GumroadCard>
      ) : loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text="Carregando resumo..." /></Flex>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : !hasAnyActivity ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={36} height={36} />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              Nenhuma atividade registrada em {monthLabel.toLowerCase()}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              Registros diários
            </GumroadHeading>
            <GumroadText level="body-md" as="p" style={{ fontWeight: 700, marginBottom: spacing.sm }}>
              {totalLogs} {totalLogs === 1 ? 'registro' : 'registros'} no mês
            </GumroadText>
            <Flex gap="2" wrap="wrap">
              {(Object.entries(countsByType) as [LogType, number][]).map(([type, count]) => (
                <GumroadBadge key={type} color="cyan">
                  {LOG_TYPE_LABELS[type]}: {count}
                </GumroadBadge>
              ))}
            </Flex>
          </GumroadCard>

          {moodByDay.length > 0 && (
            <GumroadCard color="white" shadow="md" padding="lg">
              <Flex align="center" justify="between" mb="2">
                <GumroadHeading level="title-md" as="h2">Humor</GumroadHeading>
                {moodAverage !== null && (
                  <GumroadText level="body-sm" as="span" style={{ fontWeight: 700 }}>
                    Média: {moodAverage.toFixed(1)}/5
                  </GumroadText>
                )}
              </Flex>
              <MoodTrendChart data={moodByDay} daysInMonth={daysInMonth} />
            </GumroadCard>
          )}

          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              Marcos alcançados
            </GumroadHeading>
            {milestonesAchieved.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                Nenhum marco alcançado neste mês
              </GumroadText>
            ) : (
              <Flex direction="column" gap="2">
                {milestonesAchieved.map((m) => (
                  <Flex key={m.id} align="center" gap="2" wrap="wrap">
                    <GumroadText level="body-sm" as="span" style={{ fontWeight: 600 }}>{m.title}</GumroadText>
                    <GumroadBadge color="mint">{MILESTONE_CATEGORY_LABELS[m.category]}</GumroadBadge>
                  </Flex>
                ))}
              </Flex>
            )}
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg">
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>
              Progresso em metas
            </GumroadHeading>
            {goalsProgress.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                Nenhuma meta ativa
              </GumroadText>
            ) : (
              <>
                <GumroadText level="body-sm" as="p" style={{ marginBottom: spacing.sm }}>
                  {goalsWithProgress.length} de {goalsProgress.length}{' '}
                  {goalsProgress.length === 1 ? 'meta ativa teve' : 'metas ativas tiveram'} progresso registrado
                </GumroadText>
                <Flex direction="column" gap="2">
                  {goalsWithProgress.map(({ goal, entriesInMonth }) => (
                    <Flex key={goal.id} align="center" justify="between" gap="2">
                      <GumroadText level="body-sm" as="span">{goal.title}</GumroadText>
                      <GumroadBadge color="lavender">
                        {entriesInMonth} {entriesInMonth === 1 ? 'registro' : 'registros'}
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
