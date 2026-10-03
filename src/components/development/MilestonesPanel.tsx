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
  const { t } = useTranslation();
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
      toast.success(t('cDevelopment.milestoneAdded'));
    } catch {
      toast.error(t('cDevelopment.saveError'));
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
      await milestoneApi.delete(token, deletingId);
      await fetchMilestones();
      onMutate?.();
      setDeletingId(null);
      toast.success(t('cDevelopment.milestoneRemoved'));
    } catch {
      toast.error(t('cDevelopment.removeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const deletingMilestone = milestones.find((m) => m.id === deletingId);

  return (
    <GumroadModal open={isOpen} onClose={onClose} title={t('cDevelopment.milestonesTitle')}>
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
                {t('cDevelopment.addMilestone')}
              </Flex>
            </GumroadButton>

            {error && (
              <div style={{ marginBottom: '16px' }}>
                <ErrorState message={error} onRetry={fetchMilestones} />
              </div>
            )}

            {!error && milestones.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  {t('cDevelopment.noMilestones')}
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {milestones.map((m) =>
                  deletingId === m.id ? (
                    <GumroadCard key={m.id} color="salmon" padding="md" shadow="md" role="alert">
                      <GumroadText level="body-md">
                        {t('cDevelopment.removeMilestoneConfirm', { title: deletingMilestone?.title, status: t(`cDevelopment.milestoneStatus.${m.status}`, { defaultValue: MILESTONE_STATUS_LABELS[m.status] }) })}
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
              {t('cDevelopment.newMilestone')}
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
              {t('cDevelopment.editMilestone')}
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
