import { useState, useEffect, useCallback } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon, InfoCircledIcon, PlusIcon } from '@radix-ui/react-icons';
import { goalApi, goalProgressApi } from '../services/api';
import type { Goal, GoalProgressSummary, CreateGoalPayload, GoalDomain, GoalStatus } from '../types/goals';
import { GOAL_DOMAIN_LABELS, GOAL_STATUS_LABELS } from '../types/goals';
import { useAuthContext } from '../context/AuthContext';
import { useDomainPage } from '../hooks/useDomainPage';
import { ChildSelector } from '../components/domain/ChildSelector';
import { FilterPill } from '../components/domain/FilterPill';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GoalCard from '../components/goals/GoalCard';
import GoalFormPanel from '../components/goals/GoalFormPanel';
import { GoalsListSkeleton } from '../components/skeletons/PageSkeletons';

type DomainFilter = 'all' | GoalDomain;
type StatusFilter = 'all' | GoalStatus;

export default function GoalsPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [summaries, setSummaries] = useState<Record<string, GoalProgressSummary>>({});
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const params = {
        ...(selectedChildId ? { childId: selectedChildId } : {}),
        ...(domainFilter !== 'all' ? { domain: domainFilter } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      };
      const list = await goalApi.list(token, params);
      setGoals(list);

      const summaryEntries = await Promise.all(
        list.map(async (g) => {
          try {
            const s = await goalProgressApi.summary(token, g.id);
            return [g.id, s] as const;
          } catch {
            return [g.id, undefined] as const;
          }
        }),
      );
      setSummaries(Object.fromEntries(summaryEntries.filter(([, s]) => s !== undefined)) as Record<string, GoalProgressSummary>);
    } catch {
      setError('Erro ao carregar metas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId, domainFilter, statusFilter, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) fetchGoals();
  }, [fetchGoals, isLoaded, session]);

  const handleCreate = async (payload: CreateGoalPayload) => {
    const token = await getTokenRef.current();
    await goalApi.create(token, payload);
    setPanelOpen(false);
    await fetchGoals();
  };

  return (
    <Box>
      <Flex justify="between" align={{ initial: 'start', sm: 'center' }} mb="6" gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Metas Terapêuticas
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Acompanhe o progresso das metas do PEI
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" onClick={() => effectiveChildId && setPanelOpen(true)} disabled={!effectiveChildId}>
          <PlusIcon />
          Nova Meta
        </GumroadButton>
      </Flex>

      <ChildSelector children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      <Flex align="center" gap="2" mb="3" wrap="wrap">
        <GumroadText level="body-sm" as="span" style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>Domínio:</GumroadText>
        {(['all', ...Object.keys(GOAL_DOMAIN_LABELS)] as DomainFilter[]).map((value) => (
          <FilterPill key={value} active={domainFilter === value} label={value === 'all' ? 'Todos' : GOAL_DOMAIN_LABELS[value as GoalDomain]} onClick={() => setDomainFilter(value)} />
        ))}
      </Flex>

      <Flex align="center" gap="2" mb="5" wrap="wrap">
        <GumroadText level="body-sm" as="span" style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>Status:</GumroadText>
        {(['all', ...Object.keys(GOAL_STATUS_LABELS)] as StatusFilter[]).map((value) => (
          <FilterPill key={value} active={statusFilter === value} label={value === 'all' ? 'Todos' : GOAL_STATUS_LABELS[value as GoalStatus]} onClick={() => setStatusFilter(value)} />
        ))}
      </Flex>

      {loading ? (
        <GoalsListSkeleton />
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : children.length > 0 && goals.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma meta cadastrada
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Crie a primeira meta terapêutica para acompanhar o progresso
              </GumroadText>
            </Box>
            {effectiveChildId && (
              <GumroadButton variant="primary" size="md" onClick={() => setPanelOpen(true)}>
                Criar primeira meta
              </GumroadButton>
            )}
          </Flex>
        </GumroadCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} summary={summaries[goal.id]} />
          ))}
        </div>
      )}

      <GoalFormPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} childId={effectiveChildId} onSubmit={(p) => handleCreate(p as CreateGoalPayload)} />
    </Box>
  );
}
