import React from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import ComorbidityCard from './ComorbidityCard';
import ComorbidityForm from './ComorbidityForm';
import type { Comorbidity, CreateComorbidityPayload } from '../../types/medical';
import { usePanelCrud } from '../../hooks/usePanelCrud';
import { useToast } from '../../context/ToastContext';

interface ComorbiditiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  comorbidities: Comorbidity[];
  onAdd: (payload: CreateComorbidityPayload) => Promise<void>;
  onEdit: (id: string, payload: Omit<CreateComorbidityPayload, 'childId'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ComorbiditiesPanel: React.FC<ComorbiditiesPanelProps> = ({
  isOpen,
  onClose,
  childId,
  comorbidities,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const toast = useToast();
  const {
    editingItem: editingComorbidity,
    setEditingItem: setEditingComorbidity,
    deletingId,
    setDeletingId,
    isLoading,
    setIsLoading,
    view,
    setView,
    startEdit,
  } = usePanelCrud<Comorbidity>({ isOpen, onClose });

  const handleAdd = async (payload: CreateComorbidityPayload | Omit<CreateComorbidityPayload, 'childId'>) => {
    setIsLoading(true);
    try {
      await onAdd(payload as CreateComorbidityPayload);
      setView('list');
      toast.success('Diagnóstico adicionado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateComorbidityPayload | Omit<CreateComorbidityPayload, 'childId'>) => {
    if (!editingComorbidity) return;
    setIsLoading(true);
    try {
      await onEdit(editingComorbidity.id, payload as Omit<CreateComorbidityPayload, 'childId'>);
      setView('list');
      setEditingComorbidity(null);
      toast.success('Alterações salvas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    try {
      await onDelete(deletingId);
      setDeletingId(null);
      toast.success('Diagnóstico removido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Diagnósticos">
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
                Adicionar Diagnóstico
              </Flex>
            </GumroadButton>

            {comorbidities.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum diagnóstico cadastrado
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {comorbidities.map((c) =>
                  deletingId === c.id ? (
                    <GumroadCard key={c.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover {c.conditionName}?
                      </GumroadText>
                      <Flex gap="2" mt="2">
                        <GumroadButton
                          variant="primary"
                          size="sm"
                          onClick={handleConfirmDelete}
                          disabled={isLoading}
                        >
                          Remover
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
                    <ComorbidityCard
                      key={c.id}
                      comorbidity={c}
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
              Novo Diagnóstico
            </GumroadHeading>
            <ComorbidityForm
              childId={childId}
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              loading={isLoading}
            />
          </>
        )}

        {view === 'edit' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Editar Diagnóstico
            </GumroadHeading>
            <ComorbidityForm
              childId={childId}
              initialValues={editingComorbidity ?? {}}
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

export default ComorbiditiesPanel;
