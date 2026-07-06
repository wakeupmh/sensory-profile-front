import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import MilestoneCard from './MilestoneCard';
import MilestoneForm from './MilestoneForm';
import { milestoneApi } from '../../services/api';
import type {
  DevelopmentalMilestone,
  CreateMilestonePayload,
  UpdateMilestonePayload,
} from '../../types/development';
import { MILESTONE_STATUS_LABELS } from '../../types/development';
import { usePanelCrud } from '../../hooks/usePanelCrud';
import { useToast } from '../../context/ToastContext';

interface MilestonesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
  getToken: () => Promise<string | null>;
}

const MilestonesPanel: React.FC<MilestonesPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
  getToken,
}) => {
  const toast = useToast();

  const fetchFn = useCallback(async () => {
    const token = await getToken();
    return milestoneApi.list(token, { childId: childId || undefined });
  }, [getToken, childId]);

  const {
    items: milestones,
    editingItem: editingMilestone,
    setEditingItem: setEditingMilestone,
    deletingId,
    setDeletingId,
    isLoading,
    setIsLoading,
    error,
    view,
    setView,
    fetchItems: fetchMilestones,
    startEdit,
  } = usePanelCrud<DevelopmentalMilestone>({ isOpen, onClose, childId, fetchFn });

  const handleAdd = async (payload: CreateMilestonePayload | UpdateMilestonePayload) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await milestoneApi.create(token, { ...(payload as CreateMilestonePayload), childId });
      await fetchMilestones();
      onMutate?.();
      setView('list');
      toast.success('Marco adicionado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateMilestonePayload | UpdateMilestonePayload) => {
    if (!editingMilestone) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await milestoneApi.update(token, editingMilestone.id, payload as UpdateMilestonePayload);
      await fetchMilestones();
      onMutate?.();
      setView('list');
      setEditingMilestone(null);
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
      await milestoneApi.remove(token, deletingId);
      await fetchMilestones();
      onMutate?.();
      setDeletingId(null);
      toast.success('Marco removido');
    } finally {
      setIsLoading(false);
    }
  };

  const deletingMilestone = milestones.find((m) => m.id === deletingId);

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Marcos do Desenvolvimento">
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
                Adicionar Marco
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard role="alert" color="salmon" padding="md" style={{ marginBottom: '16px' }}>
                <GumroadText level="body-md">{error}</GumroadText>
              </GumroadCard>
            )}

            {!error && milestones.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum marco cadastrado
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {milestones.map((m) =>
                  deletingId === m.id ? (
                    <GumroadCard key={m.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover "{deletingMilestone?.title}" ({MILESTONE_STATUS_LABELS[m.status]})?
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
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      onEdit={startEdit}
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
              Novo Marco
            </GumroadHeading>
            <MilestoneForm
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
              Editar Marco
            </GumroadHeading>
            <MilestoneForm
              initialValues={editingMilestone ?? {}}
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

export default MilestonesPanel;
