import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon, InfoCircledIcon, PlusIcon } from '@radix-ui/react-icons';
import { logApi, childApi } from '../services/api';
import type { ChildData } from '../services/api';
import type { CreateLogPayload, DailyLog, LogType } from '../types/logs';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, shadows, radii, fonts } from '../theme/tokens';
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
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [searchParams] = useSearchParams();
  const [selectedChildId, setSelectedChildId] = useState<string>(searchParams.get('childId') || '');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const token = await getTokenRef.current();
      const list = await childApi.list(token);
      setChildren(list);
    } catch {
      // non-fatal
    }
  }, []);

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
  }, [selectedChildId, filter]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchChildren();
    }
  }, [fetchChildren, isLoaded, session]);

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

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 14px',
    borderRadius: '9999px',
    border: `2px solid ${colors.ink}`,
    background: active ? colors.ink : colors.canvas,
    color: active ? colors.canvas : colors.ink,
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    boxShadow: active ? 'none' : '2px 2px 0px #0A0A1A',
    fontFamily: fonts.display,
    whiteSpace: 'nowrap' as const,
  });

  const effectiveChildId = selectedChildId || (children.length > 0 ? children[0].id : '');

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

      <Flex align="center" gap="2" mb="5" wrap="wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={pillStyle(filter === value)}
          >
            {label}
          </button>
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
          backgroundColor: colors.ink,
          color: colors.canvas,
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
