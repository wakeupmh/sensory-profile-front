import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import { ErrorState } from '../domain/ErrorState';
import CommunicationLogCard from './CommunicationLogCard';
import CommunicationLogForm from './CommunicationLogForm';
import { communicationLogApi } from '../../services/api';
import type {
  CommunicationLogSummary,
  CommunicationLog,
  CreateCommunicationLogPayload,
  UpdateCommunicationLogPayload,
} from '../../types/development';
import { COMMUNICATION_ENTRY_TYPE_LABELS } from '../../types/development';
import { usePanelCrud } from '../../hooks/usePanelCrud';
import { useToast } from '../../context/ToastContext';

interface CommunicationLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
  getToken: () => Promise<string | null>;
}

function formatDateTime(iso: string, lang: string): string {
  return new Date(iso).toLocaleString(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CommunicationLogsPanel: React.FC<CommunicationLogsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
  getToken,
}) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  const fetchFn = useCallback(async () => {
    const token = await getToken();
    const result = await communicationLogApi.list(token, { childId: childId || undefined, limit: 20, page: 1 });
    return result.data ?? result;
  }, [getToken, childId]);

  const {
    items: logs,
    editingItem: editingLog,
    setEditingItem: setEditingLog,
    deletingId,
    setDeletingId,
    isLoading,
    setIsLoading,
    error,
    view,
    setView,
    fetchItems: fetchLogs,
  } = usePanelCrud<CommunicationLogSummary, CommunicationLog>({ isOpen, onClose, childId, fetchFn });

  const handleAdd = async (payload: CreateCommunicationLogPayload | UpdateCommunicationLogPayload) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await communicationLogApi.create(token, { ...(payload as CreateCommunicationLogPayload), childId });
      await fetchLogs();
      onMutate?.();
      setView('list');
      toast.success(t('cDevelopment.logAdded'));
    } catch {
      toast.error(t('cDevelopment.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateCommunicationLogPayload | UpdateCommunicationLogPayload) => {
    if (!editingLog) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await communicationLogApi.update(token, editingLog.id, payload as UpdateCommunicationLogPayload);
      await fetchLogs();
      onMutate?.();
      setView('list');
      setEditingLog(null);
      toast.success(t('cDevelopment.changesSaved'));
    } catch {
      toast.error(t('cDevelopment.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await communicationLogApi.delete(token, deletingId);
      await fetchLogs();
      onMutate?.();
      setDeletingId(null);
      toast.success(t('cDevelopment.logRemoved'));
    } catch {
      toast.error(t('cDevelopment.removeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const deletingLog = logs.find((l) => l.id === deletingId);

  return (
    <GumroadModal open={isOpen} onClose={onClose} title={t('cDevelopment.logsTitle')}>
      <>

        {view === 'list' && (
          <>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => setView('add')}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Flex align="center" gap="1">
                <PlusIcon aria-hidden="true" />
                {t('cDevelopment.addLog')}
              </Flex>
            </GumroadButton>

            {error && (
              <div style={{ marginBottom: '16px' }}>
                <ErrorState message={error} onRetry={fetchLogs} />
              </div>
            )}

            {!error && logs.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  {t('cDevelopment.noLogs')}
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {logs.map((log) =>
                  deletingId === log.id ? (
                    <GumroadCard key={log.id} color="salmon" padding="md" shadow="md" role="alert">
                      <GumroadText level="body-md">
                        {deletingLog ? t('cDevelopment.removeLogConfirm', { type: t(`cDevelopment.entryType.${deletingLog.entryType}`, { defaultValue: COMMUNICATION_ENTRY_TYPE_LABELS[deletingLog.entryType] }), date: formatDateTime(deletingLog.occurredAt, i18n.language) }) : ''}
                      </GumroadText>
                      <Flex gap="2" mt="2">
                        <GumroadButton
                          variant="primary"
                          size="sm"
                          onClick={handleConfirmDelete}
                          disabled={isLoading}
                        >
                          {isLoading ? t('cDevelopment.removing') : t('cDevelopment.confirm')}
                        </GumroadButton>
                        <GumroadButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(null)}
                        >
                          {t('cDevelopment.cancel')}
                        </GumroadButton>
                      </Flex>
                    </GumroadCard>
                  ) : (
                    <CommunicationLogCard
                      key={log.id}
                      log={log}
                      onEdit={async (l) => {
                        try {
                          const token = await getToken();
                          const full = await communicationLogApi.get(token, l.id);
                          setEditingLog(full);
                          setView('edit');
                        } catch {
                          setEditingLog(l as unknown as CommunicationLog);
                          setView('edit');
                        }
                      }}
                      onDelete={(id) => setDeletingId(id)}
                    />
                  )
                )}
              </Flex>
            )}
          </>
        )}

        {view === 'add' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              {t('cDevelopment.newLog')}
            </GumroadHeading>
            <CommunicationLogForm
              initialValues={{ childId }}
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              loading={isLoading}
            />
          </>
        )}

        {view === 'edit' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              {t('cDevelopment.editLog')}
            </GumroadHeading>
            <CommunicationLogForm
              initialValues={editingLog ?? {}}
              onSubmit={handleEdit}
              onCancel={() => setView('list')}
              loading={isLoading}
            />
          </>
        )}
      </>
    </GumroadModal>
  );
};

export default CommunicationLogsPanel;
