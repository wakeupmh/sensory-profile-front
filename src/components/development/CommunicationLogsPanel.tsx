import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
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
      toast.success('Registro adicionado');
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
      toast.success('Alterações salvas');
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
      toast.success('Registro removido');
    } finally {
      setIsLoading(false);
    }
  };

  const deletingLog = logs.find((l) => l.id === deletingId);

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Registros de Comunicação">
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
                <PlusIcon />
                Adicionar Registro
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard role="alert" color="salmon" padding="md" style={{ marginBottom: '16px' }}>
                <GumroadText level="body-md">{error}</GumroadText>
              </GumroadCard>
            )}

            {!error && logs.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum registro de comunicação
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {logs.map((log) =>
                  deletingId === log.id ? (
                    <GumroadCard key={log.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover registro de {deletingLog ? COMMUNICATION_ENTRY_TYPE_LABELS[deletingLog.entryType] : ''} em {deletingLog ? formatDateTime(deletingLog.occurredAt) : ''}?
                      </GumroadText>
                      <Flex gap="2" mt="2">
                        <GumroadButton
                          variant="primary"
                          size="sm"
                          onClick={handleConfirmDelete}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Removendo...' : 'Confirmar'}
                        </GumroadButton>
                        <GumroadButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancelar
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
              Novo Registro de Comunicação
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
              Editar Registro de Comunicação
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
