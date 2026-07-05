import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import EducationPlanCard from './EducationPlanCard';
import EducationPlanForm from './EducationPlanForm';
import { educationPlanApi } from '../../services/api';
import type {
  EducationPlan,
  CreateEducationPlanPayload,
  UpdateEducationPlanPayload,
} from '../../types/education';
import { useAuthContext } from '../../context/AuthContext';
import { usePanelCrud } from '../../hooks/usePanelCrud';

interface EducationPlansPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
}

const EducationPlansPanel: React.FC<EducationPlansPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
}) => {
  const { getToken } = useAuthContext();

  const fetchFn = useCallback(async () => {
    const token = await getToken();
    return educationPlanApi.list(token, { childId: childId || undefined });
  }, [getToken, childId]);

  const {
    items: plans,
    editingItem: editingPlan,
    setEditingItem: setEditingPlan,
    isLoading,
    setIsLoading,
    error,
    view,
    setView,
    fetchItems: fetchPlans,
    startEdit,
  } = usePanelCrud<EducationPlan>({ isOpen, onClose, childId, fetchFn });

  const handleAdd = async (payload: CreateEducationPlanPayload | UpdateEducationPlanPayload) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await educationPlanApi.create(token, { ...(payload as CreateEducationPlanPayload), childId });
      await fetchPlans();
      onMutate?.();
      setView('list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateEducationPlanPayload | UpdateEducationPlanPayload) => {
    if (!editingPlan) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await educationPlanApi.update(token, editingPlan.id, payload as UpdateEducationPlanPayload);
      await fetchPlans();
      onMutate?.();
      setView('list');
      setEditingPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await educationPlanApi.delete(token, id);
      await fetchPlans();
      onMutate?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Planos Educacionais">
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
                Adicionar Plano
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard role="alert" color="salmon" padding="md" style={{ marginBottom: '16px' }}>
                <GumroadText level="body-md">{error}</GumroadText>
              </GumroadCard>
            )}

            {!error && plans.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum plano cadastrado
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {plans.map((plan) => (
                  <EducationPlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </Flex>
            )}
          </>
        )}

        {view === 'add' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Novo Plano
            </GumroadHeading>
            <EducationPlanForm
              initial={{ childId }}
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              childId={childId}
              isEdit={false}
            />
          </>
        )}

        {view === 'edit' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Editar Plano
            </GumroadHeading>
            <EducationPlanForm
              initial={editingPlan ?? {}}
              onSubmit={handleEdit}
              onCancel={() => setView('list')}
              childId={childId}
              isEdit={true}
            />
          </>
        )}
      </>
    </GumroadModal>
  );
};

export default EducationPlansPanel;
