import { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { InfoCircledIcon, PlusIcon, UpdateIcon } from '@radix-ui/react-icons';
import { logApi } from '../services/api';
import { LOG_TYPE_LABELS, LOG_TYPES } from '../types/logs';
import type { CreateLogPayload, DailyLog, LogType } from '../types/logs';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { useOfflineLogQueue } from '../hooks/useOfflineLogQueue';
import { queueLog, isNetworkError } from '../services/offlineLogQueue';
import { useToast } from '../context/ToastContext';
import { ChildSelector } from '../components/domain/ChildSelector';
import { FilterPill } from '../components/domain/FilterPill';
import { ErrorState } from '../components/domain/ErrorState';
import { colors, spacing, shadows } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import QuickLogSheet from '../components/logs/QuickLogSheet';
import { LogsListSkeleton } from '../components/skeletons/PageSkeletons';

type BadgeColor = 'salmon' | 'yellow' | 'lavender' | 'mint' | 'cyan';

const LOG_TYPE_COLORS: Record<LogType, BadgeColor> = {
  abc: 'salmon',
  mood: 'yellow',
  sleep: 'lavender',
  food: 'mint',
  toileting: 'cyan',
};

type FilterType = 'all' | LogType;

// Derivado da tabela canônica: um tipo novo em LOG_TYPES aparece no filtro
// sozinho, em vez de compilar limpo e sumir da tela.
const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...LOG_TYPES.map((value) => ({ value, label: LOG_TYPE_LABELS[value] })),
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
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();
  const { queuedCount, syncing, flush } = useOfflineLogQueue();
  const toast = useToast();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, loading, error, reload: fetchLogs, setData } = useDomainResource(
    async (token) => {
      const params = {
        ...(selectedChildId ? { childId: selectedChildId } : {}),
        ...(filter !== 'all' ? { logType: filter } : {}),
      };
      const result = await logApi.getLogs(token, params);
      return result.data;
    },
    [selectedChildId, filter],
    { errorMessage: 'Erro ao carregar registros. Por favor, tente novamente.' },
  );

  const logs = data ?? [];
  // Atualização otimista de um registro já na tela, sem rebuscar a lista.
  const setLogs = (update: (previous: DailyLog[]) => DailyLog[]) =>
    setData((previous) => update(previous ?? []));

  // Registros pendentes acabaram de sincronizar — atualiza a lista para
  // mostrá-los sem exigir um refresh manual.
  const previousQueuedCount = useRef(queuedCount);
  useEffect(() => {
    if (previousQueuedCount.current > queuedCount) {
      fetchLogs();
    }
    previousQueuedCount.current = queuedCount;
  }, [queuedCount, fetchLogs]);

  const handleCreateLog = async (payload: CreateLogPayload, photo?: File | null) => {
    const token = await getTokenRef.current();
    try {
      const log = await logApi.createLog(token, payload);
      if (photo) {
        try {
          const { uploadUrl } = await logApi.requestAttachmentUpload(token, log.id, {
            mimeType: photo.type || 'image/jpeg',
            sizeBytes: photo.size,
          });
          await logApi.uploadAttachmentToPresignedUrl(uploadUrl, photo);
        } catch {
          toast.info('Registro salvo, mas não foi possível anexar a foto. Tente novamente pelo registro.');
        }
      }
      await fetchLogs();
    } catch (err) {
      // Sem conexão: guarda localmente em vez de perder o registro. Não
      // relança o erro — para o usuário, o registro "foi salvo" (fica
      // pendente de sincronização, não bloqueia o fluxo). A foto não entra
      // na fila offline — precisa do id do registro, que só existe depois
      // de sincronizar.
      if (isNetworkError(err)) {
        queueLog(payload);
        toast.info(
          photo
            ? 'Sem conexão — registro salvo no aparelho (a foto não foi anexada; adicione-a depois de reconectar)'
            : 'Sem conexão — registro salvo no aparelho e será enviado ao reconectar',
        );
        return;
      }
      throw err;
    }
  };

  const handleDeleteAttachment = async (logId: string, attachmentId: string) => {
    const token = await getTokenRef.current();
    try {
      await logApi.deleteAttachment(token, logId, attachmentId);
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, attachments: (log.attachments ?? []).filter((a) => a.id !== attachmentId) }
            : log,
        ),
      );
    } catch {
      toast.error('Não foi possível remover a foto. Tente novamente.');
    }
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

      {queuedCount > 0 && (
        <GumroadCard color="yellow" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <GumroadText level="body-sm" as="p">
              {queuedCount === 1
                ? '1 registro pendente de sincronização'
                : `${queuedCount} registros pendentes de sincronização`}
            </GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={flush} disabled={syncing}>
              <UpdateIcon />
              {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      )}

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
        <LogsListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : children.length > 0 && logs.length === 0 ? (
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
                  {log.attachments && log.attachments.length > 0 && (
                    <Flex gap="2" wrap="wrap" mt="1">
                      {log.attachments.map((att) => (
                        <Box key={att.id} style={{ position: 'relative' }}>
                          <a href={att.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={att.url}
                              alt="Foto do registro"
                              style={{
                                width: '56px',
                                height: '56px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: `2px solid ${colors.ink}`,
                                display: 'block',
                              }}
                            />
                          </a>
                          <button
                            onClick={() => handleDeleteAttachment(log.id, att.id)}
                            aria-label="Remover foto"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '9999px',
                              border: `1.5px solid ${colors.ink}`,
                              backgroundColor: colors['brand-salmon'],
                              cursor: 'pointer',
                              fontSize: '11px',
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            ×
                          </button>
                        </Box>
                      ))}
                    </Flex>
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
