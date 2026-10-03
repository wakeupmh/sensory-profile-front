import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { InfoCircledIcon, PlusIcon, UpdateIcon } from '@radix-ui/react-icons';
import { logApi } from '../services/api';
import { LOG_TYPES } from '../types/logs';
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
const FILTER_VALUES: FilterType[] = ['all', ...LOG_TYPES];

function formatOccurredAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LogsPage() {
  const { t, i18n } = useTranslation();
  const { children, childrenLoaded, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();
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
    { errorMessage: t('p1Logs.errLoad') },
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
          toast.info(t('p1Logs.photoFail'));
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
            ? t('p1Logs.offlinePhoto')
            : t('p1Logs.offline'),
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
      toast.error(t('p1Logs.removePhotoFail'));
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
            {t('p1Logs.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            {t('p1Logs.subtitle')}
          </GumroadText>
        </Box>
      </Flex>

      {queuedCount > 0 && (
        <GumroadCard color="yellow" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <GumroadText level="body-sm" as="p">
              {t('p1Logs.pending', { count: queuedCount })}
            </GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={flush} disabled={syncing}>
              <UpdateIcon aria-hidden="true" />
              {syncing ? t('p1Logs.syncing') : t('p1Logs.syncNow')}
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
        {FILTER_VALUES.map((value) => (
          <FilterPill
            key={value}
            active={filter === value}
            label={value === 'all' ? t('p1Logs.all') : t(`p1Common.logType.${value}`)}
            onClick={() => setFilter(value)}
          />
        ))}
      </Flex>

      {loading ? (
        <LogsListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} retryLabel={t('p1Common.retry')} />
      ) : !childrenLoaded && children.length === 0 ? null : children.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} aria-hidden="true" />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p1Logs.noChildTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('p1Logs.noChildBody')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/children" style={{ textDecoration: 'none' }}>{t('p1Common.toChildren')}</Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : logs.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} aria-hidden="true" />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p1Logs.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('p1Logs.emptyBody')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={() => setSheetOpen(true)}>
              <PlusIcon aria-hidden="true" />
              {t('p1Logs.logNow')}
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
                    {formatOccurredAt(log.occurredAt, i18n.language)}
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
                              alt={t('p1Logs.photoAlt')}
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
                            type="button"
                            onClick={() => handleDeleteAttachment(log.id, att.id)}
                            aria-label={t('p1Common.removePhoto')}
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
                  {t(`p1Common.logType.${log.logType}`)}
                </GumroadBadge>
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}

      {effectiveChildId && (
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t('p1Logs.newLog')}
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
        <span aria-hidden="true">+</span>
      </button>
      )}

      <QuickLogSheet
        isOpen={sheetOpen && !!effectiveChildId}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCreateLog}
        childId={effectiveChildId}
      />
    </Box>
  );
}
