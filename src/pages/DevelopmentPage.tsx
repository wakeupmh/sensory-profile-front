import { useState, useEffect, useCallback } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { milestoneApi, communicationLogApi } from '../services/api';
import type {
  DevelopmentalMilestone,
  CommunicationLogSummary,
} from '../types/development';
import {
  MILESTONE_STATUS_LABELS,
  COMMUNICATION_ENTRY_TYPE_LABELS,
} from '../types/development';
import { useAuthContext } from '../context/AuthContext';
import { useDomainPage } from '../hooks/useDomainPage';
import { ChildSelector } from '../components/domain/ChildSelector';
import { previewItemStyle, emptyStyle } from '../components/domain/previewStyles';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import MilestonesPanel from '../components/development/MilestonesPanel';
import CommunicationLogsPanel from '../components/development/CommunicationLogsPanel';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DevelopmentPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [milestones, setMilestones] = useState<DevelopmentalMilestone[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLogSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestonesPanelOpen, setMilestonesPanelOpen] = useState(false);
  const [commLogsPanelOpen, setCommLogsPanelOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const childIdParam = selectedChildId || undefined;
      const [milestonesData, logsData] = await Promise.all([
        milestoneApi.list(token, { childId: childIdParam }),
        communicationLogApi.list(token, { childId: childIdParam, limit: 20, page: 1 }),
      ]);
      setMilestones(milestonesData);
      setCommLogs(logsData.data ?? logsData);
      setError(null);
    } catch {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAll();
    }
  }, [fetchAll, isLoaded, session]);

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Desenvolvimento
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Marcos do desenvolvimento e registros de comunicação
          </GumroadText>
        </Box>
      </Flex>

      {/* Child filter */}
      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChange={setSelectedChildId}
      />

      {/* Loading state */}
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          {/* Marcos do Desenvolvimento */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Marcos do Desenvolvimento
                </GumroadHeading>
                <GumroadBadge color="cyan">{milestones.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setMilestonesPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {milestones.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              milestones.slice(0, 3).map((m) => (
                <div key={m.id} style={previewItemStyle}>
                  {m.title}
                  {' '}
                  <span
                    style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      fontStyle: 'italic',
                    }}
                  >
                    — {MILESTONE_STATUS_LABELS[m.status]}
                  </span>
                </div>
              ))
            )}
          </GumroadCard>

          {/* Registros de Comunicação */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Registros de Comunicação
                </GumroadHeading>
                <GumroadBadge color="lavender">{commLogs.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setCommLogsPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {commLogs.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              commLogs.slice(0, 3).map((log) => (
                <div key={log.id} style={previewItemStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: '9999px',
                      backgroundColor: colors['brand-cyan'],
                      color: colors.ink,
                      fontSize: '11px',
                      fontWeight: 600,
                      marginRight: '6px',
                      border: `1px solid ${colors.ink}`,
                    }}
                  >
                    {COMMUNICATION_ENTRY_TYPE_LABELS[log.entryType]}
                  </span>
                  {formatDateTime(log.occurredAt)}
                </div>
              ))
            )}
          </GumroadCard>
        </Flex>
      )}

      {/* Panels */}
      <MilestonesPanel
        isOpen={milestonesPanelOpen}
        onClose={() => setMilestonesPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={fetchAll}
        getToken={getTokenRef.current}
      />

      <CommunicationLogsPanel
        isOpen={commLogsPanelOpen}
        onClose={() => setCommLogsPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={fetchAll}
        getToken={getTokenRef.current}
      />
    </Box>
  );
}
