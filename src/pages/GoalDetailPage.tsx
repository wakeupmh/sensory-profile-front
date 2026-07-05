import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { goalApi, goalProgressApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import type { Goal, GoalProgressEntry, GoalProgressSummary, CreateGoalPayload, UpdateGoalPayload, CreateGoalProgressPayload } from '../types/goals';
import { GOAL_DOMAIN_LABELS, GOAL_STATUS_LABELS, GOAL_STATUS_COLORS } from '../types/goals';
import { spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import GoalProgressBar from '../components/goals/GoalProgressBar';
import GoalProgressChart from '../components/goals/GoalProgressChart';
import GoalProgressForm from '../components/goals/GoalProgressForm';
import GoalFormPanel from '../components/goals/GoalFormPanel';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [entries, setEntries] = useState<GoalProgressEntry[]>([]);
  const [summary, setSummary] = useState<GoalProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressFormOpen, setProgressFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [g, e, s] = await Promise.all([
        goalApi.get(token, id),
        goalProgressApi.list(token, id),
        goalProgressApi.summary(token, id).catch(() => null),
      ]);
      setGoal(g);
      setEntries(e);
      setSummary(s);
    } catch {
      setError('Erro ao carregar a meta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddProgress = async (payload: CreateGoalProgressPayload) => {
    if (!id) return;
    const token = await getToken();
    await goalProgressApi.create(token, id, payload);
    await fetchAll();
  };

  const handleEditGoal = async (payload: CreateGoalPayload | UpdateGoalPayload) => {
    if (!id) return;
    const token = await getToken();
    await goalApi.update(token, id, payload as UpdateGoalPayload);
    setEditOpen(false);
    await fetchAll();
  };

  const handleDeleteGoal = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await goalApi.delete(token, id);
      navigate('/goals');
    } catch {
      setError('Erro ao excluir a meta. Tente novamente.');
      setDeleting(false);
    }
  };

  const isAchieved = goal?.status === 'achieved';

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/goals')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando meta..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : goal ? (
        <>
          {isAchieved && (
            <GumroadCard color="mint" shadow="md" padding="md" style={{ marginBottom: spacing.lg, textAlign: 'center' }}>
              <GumroadText level="body-lg" as="p" style={{ fontWeight: 700 }}>
                🎉 Meta alcançada! Reconheça esse progresso.
              </GumroadText>
            </GumroadCard>
          )}

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <Flex justify="between" align="start" gap="3" wrap="wrap" mb="3">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs, wordBreak: 'break-word' }}>
                  {goal.title}
                </GumroadHeading>
                <Flex gap="2" wrap="wrap">
                  <GumroadBadge color="lavender">{GOAL_DOMAIN_LABELS[goal.domain]}</GumroadBadge>
                  <GumroadBadge color={GOAL_STATUS_COLORS[goal.status]}>{GOAL_STATUS_LABELS[goal.status]}</GumroadBadge>
                </Flex>
              </Box>
              <Flex gap="2">
                <GumroadButton variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil1Icon /> Editar
                </GumroadButton>
                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <GumroadButton variant="danger" size="sm">
                      <TrashIcon /> Excluir
                    </GumroadButton>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content size="2">
                    <AlertDialog.Title>Excluir Meta</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                      Tem certeza que deseja excluir esta meta e seu histórico de progresso? Esta ação não pode ser desfeita.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <AlertDialog.Cancel>
                        <GumroadButton variant="secondary" size="sm">Cancelar</GumroadButton>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <GumroadButton variant="danger" size="sm" disabled={deleting} onClick={handleDeleteGoal}>
                          {deleting ? 'Excluindo...' : 'Excluir'}
                        </GumroadButton>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              </Flex>
            </Flex>

            {goal.criteria && (
              <Box style={{ marginBottom: spacing.sm }}>
                <GumroadText level="caption-uppercase" as="p" style={{ opacity: 0.6, marginBottom: '4px' }}>Critério</GumroadText>
                <GumroadText level="body-sm" as="p">{goal.criteria}</GumroadText>
              </Box>
            )}
            {goal.description && (
              <Box style={{ marginBottom: spacing.md }}>
                <GumroadText level="body-sm" as="p" style={{ opacity: 0.8 }}>{goal.description}</GumroadText>
              </Box>
            )}

            <GoalProgressBar
              baseline={goal.baseline}
              target={goal.target}
              current={summary?.lastValue ?? goal.baseline}
              unit={goal.unit}
              height={28}
            />
            {summary && (
              <GumroadText level="body-sm" as="p" style={{ marginTop: spacing.xs, opacity: 0.75 }}>
                Último registro: {summary.lastValue ?? '—'}{goal.unit ? ` ${goal.unit}` : ''}
                {summary.delta !== null && ` (${summary.delta >= 0 ? '+' : ''}${summary.delta} desde o baseline)`}
              </GumroadText>
            )}
          </GumroadCard>

          <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
              <GumroadHeading level="title-md" as="h2">Histórico de progresso</GumroadHeading>
              <GumroadButton variant="primary" size="sm" onClick={() => setProgressFormOpen(true)}>
                <PlusIcon /> Registrar progresso
              </GumroadButton>
            </Flex>
            <GoalProgressChart entries={entries} baseline={goal.baseline} target={goal.target} />
          </GumroadCard>

          <Box>
            <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.sm }}>Registros</GumroadHeading>
            {entries.length === 0 ? (
              <GumroadCard color="white" shadow="sm" padding="md">
                <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                  Nenhum registro de progresso ainda
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="2">
                {[...entries]
                  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                  .map((entry) => (
                    <GumroadCard key={entry.id} color="white" shadow="sm" padding="md">
                      <Flex justify="between" align="center" gap="3" wrap="wrap">
                        <Box>
                          <GumroadText level="body-sm" as="p" style={{ fontWeight: 600 }}>
                            {entry.value}{goal.unit ? ` ${goal.unit}` : ''}
                          </GumroadText>
                          <GumroadText level="caption" as="p" style={{ opacity: 0.6 }}>
                            {formatDate(entry.occurredAt)}
                          </GumroadText>
                          {entry.notes && (
                            <GumroadText level="body-sm" as="p" style={{ opacity: 0.75, marginTop: '4px' }}>
                              {entry.notes}
                            </GumroadText>
                          )}
                        </Box>
                        {entry.therapySessionId && <GumroadBadge color="cyan">Sessão vinculada</GumroadBadge>}
                      </Flex>
                    </GumroadCard>
                  ))}
              </Flex>
            )}
          </Box>

          <GoalProgressForm
            isOpen={progressFormOpen}
            onClose={() => setProgressFormOpen(false)}
            childId={goal.childId}
            unit={goal.unit}
            onSubmit={handleAddProgress}
          />

          <GoalFormPanel
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            childId={goal.childId}
            goal={goal}
            onSubmit={handleEditGoal}
          />
        </>
      ) : null}
    </Box>
  );
}
