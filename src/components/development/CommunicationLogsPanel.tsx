import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
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

interface CommunicationLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
  getToken: () => Promise<string | null>;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: zIndex.modal,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
};

const sheetStyle: React.CSSProperties = {
  backgroundColor: colors.canvas,
  border: `2px solid ${colors.ink}`,
  borderBottom: 'none',
  borderRadius: `${radii.xl} ${radii.xl} 0 0`,
  boxShadow: shadows['card-hover'],
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: spacing.xl,
  paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
};

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await communicationLogApi.remove(token, deletingId);
      await fetchLogs();
      onMutate?.();
      setDeletingId(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const deletingLog = logs.find((l) => l.id === deletingId);

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Registros de Comunicação
          </span>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              backgroundColor: colors.canvas,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cross2Icon />
          </button>
        </Flex>

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

            {logs.length === 0 ? (
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
      </div>
    </div>
  );
};

export default CommunicationLogsPanel;
