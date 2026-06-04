import React, { useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
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

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Planos Educacionais
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
                Adicionar Plano
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard color="salmon" padding="md" style={{ marginBottom: '16px' }}>
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
      </div>
    </div>
  );
};

export default EducationPlansPanel;
