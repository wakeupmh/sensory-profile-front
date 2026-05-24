import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { milestoneApi, communicationLogApi, childApi } from '../services/api';
import type { ChildData } from '../services/api';
import type {
  DevelopmentalMilestone,
  CommunicationLogSummary,
} from '../types/development';
import {
  MILESTONE_STATUS_LABELS,
  COMMUNICATION_ENTRY_TYPE_LABELS,
} from '../types/development';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, shadows, radii, fonts } from '../theme/tokens';
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
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [milestones, setMilestones] = useState<DevelopmentalMilestone[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLogSummary[]>([]);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestonesPanelOpen, setMilestonesPanelOpen] = useState(false);
  const [commLogsPanelOpen, setCommLogsPanelOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const childIdParam = selectedChildId || undefined;
      const [milestonesData, logsData, childList] = await Promise.all([
        milestoneApi.list(token, { childId: childIdParam }),
        communicationLogApi.list(token, { childId: childIdParam, limit: 20, page: 1 }),
        childApi.list(token),
      ]);
      setMilestones(milestonesData);
      setCommLogs(logsData.data ?? logsData);
      setChildren(childList);
      setError(null);
    } catch {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAll();
    }
  }, [fetchAll, isLoaded, session]);

  const effectiveChildId = selectedChildId || (children.length > 0 ? children[0].id : '');

  const previewItemStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    padding: `${spacing.xs} 0`,
    borderBottom: `1px solid rgba(10,10,26,0.1)`,
  };

  const emptyStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    opacity: 0.5,
    fontStyle: 'italic',
  };

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
      {children.length > 0 && (
        <Box mb="4">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{
              height: '44px',
              padding: '0 12px',
              backgroundColor: colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              fontFamily: fonts.display,
              fontSize: '14px',
              fontWeight: 500,
              color: colors.ink,
              cursor: 'pointer',
              boxShadow: shadows['card-sm'],
              minWidth: '200px',
            }}
          >
            <option value="">Todas as crianças</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Box>
      )}

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
