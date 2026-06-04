import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
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

interface MilestonesPanelProps {
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

const MilestonesPanel: React.FC<MilestonesPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
  getToken,
}) => {
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const deletingMilestone = milestones.find((m) => m.id === deletingId);

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Marcos do Desenvolvimento
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
                Adicionar Marco
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard color="salmon" padding="md" style={{ marginBottom: '16px' }}>
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
      </div>
    </div>
  );
};

export default MilestonesPanel;
