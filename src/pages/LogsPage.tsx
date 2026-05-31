import { useState, useEffect, useCallback } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon, InfoCircledIcon, PlusIcon } from '@radix-ui/react-icons';
import { logApi } from '../services/api';
import type { CreateLogPayload, DailyLog, LogType } from '../types/logs';
import { useAuthContext } from '../context/AuthContext';
import { useDomainPage } from '../hooks/useDomainPage';
import { ChildSelector } from '../components/domain/ChildSelector';
import { FilterPill } from '../components/domain/FilterPill';
import { colors, spacing, shadows } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickLogSheet from '../components/logs/QuickLogSheet';

type BadgeColor = 'salmon' | 'yellow' | 'lavender' | 'mint' | 'cyan';

const LOG_TYPE_COLORS: Record<LogType, BadgeColor> = {
  abc: 'salmon',
  mood: 'yellow',
  sleep: 'lavender',
  food: 'mint',
  toileting: 'cyan',
};

const LOG_TYPE_LABELS: Record<LogType, string> = {
  abc: 'ABC',
  mood: 'Humor',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Banheiro',
};

type FilterType = 'all' | LogType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'abc', label: 'ABC' },
  { value: 'mood', label: 'Humor' },
  { value: 'sleep', label: 'Sono' },
  { value: 'food', label: 'Alimentação' },
  { value: 'toileting', label: 'Banheiro' },
];

function formatOccurredAt(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LogsPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const params = {
        ...(selectedChildId ? { childId: selectedChildId } : {}),
        ...(filter !== 'all' ? { logType: filter } : {}),
      };
      const result = await logApi.getLogs(token, params);
      setLogs(result.data);
      setError(null);
    } catch {
      setError('Erro ao carregar registros. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId, filter, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchLogs();
    }
  }, [fetchLogs, isLoaded, session]);

  const handleCreateLog = async (payload: CreateLogPayload) => {
    const token = await getTokenRef.current();
    await logApi.createLog(token, payload);
    await fetchLogs();
  };

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Registros Diários
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Acompanhe comportamentos, humor, sono e mais
          </GumroadText>
        </Box>
      </Flex>

      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChange={setSelectedChildId}
      />

      <Flex align="center" gap="2" mb="5" wrap="wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={filter === value}
            label={label}
            onClick={() => setFilter(value)}
          />
        ))}
      </Flex>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando registros..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : logs.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhum registro encontrado
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Registre comportamentos, humor, sono e alimentação
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={() => setSheetOpen(true)}>
              <PlusIcon />
              Registrar agora
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {logs.map((log) => (
            <GumroadCard key={log.id} color="white" shadow="md" padding="md">
              <Flex justify="between" align="start" gap="2">
                <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                  <GumroadText
                    level="body-sm"
                    as="p"
                    style={{ opacity: 0.6, fontSize: '12px' }}
                  >
                    {formatOccurredAt(log.occurredAt)}
                  </GumroadText>
                  {log.notes && (
                    <GumroadText
                      level="body-sm"
                      as="p"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.notes.length > 80 ? log.notes.slice(0, 80) + '…' : log.notes}
                    </GumroadText>
                  )}
                </Flex>
                <GumroadBadge color={LOG_TYPE_COLORS[log.logType]}>
                  {LOG_TYPE_LABELS[log.logType]}
                </GumroadBadge>
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}

      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Novo registro"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          backgroundColor: colors['brand-cyan'],
          color: colors.ink,
          border: `2px solid ${colors.ink}`,
          boxShadow: shadows.card,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontSize: '28px',
          lineHeight: 1,
          fontWeight: 700,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0px #0A0A1A';
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
        }}
      >
        +
      </button>

      <QuickLogSheet
        isOpen={sheetOpen && !!effectiveChildId}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCreateLog}
        childId={effectiveChildId}
      />
    </Box>
  );
}
