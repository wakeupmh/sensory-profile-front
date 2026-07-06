import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import TherapistCard from './TherapistCard';
import TherapistForm from './TherapistForm';
import type { Therapist, CreateTherapistPayload } from '../../types/therapy';
import { useToast } from '../../context/ToastContext';

interface TherapistsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  onAdd: (payload: CreateTherapistPayload) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CreateTherapistPayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type PanelView = 'list' | 'add' | 'edit';

const TherapistsPanel: React.FC<TherapistsPanelProps> = ({
  isOpen,
  onClose,
  therapists,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const toast = useToast();
  const [view, setView] = useState<PanelView>('list');
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingTherapist(null);
      setDeletingId(null);
    }
  }, [isOpen]);

  const handleAdd = async (payload: CreateTherapistPayload) => {
    setIsLoading(true);
    try {
      await onAdd(payload);
      setView('list');
      toast.success('Terapeuta adicionado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateTherapistPayload) => {
    if (!editingTherapist) return;
    setIsLoading(true);
    try {
      await onUpdate(editingTherapist.id, payload);
      setEditingTherapist(null);
      setView('list');
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
      toast.success('Terapeuta removido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Terapeutas">
      <>

        {/* List view */}
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
                Adicionar Terapeuta
              </Flex>
            </GumroadButton>

            {therapists.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum terapeuta cadastrado
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {therapists.map((t) =>
                  deletingId === t.id ? (
                    <GumroadCard key={t.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover {t.name}?
                      </GumroadText>
                      <Flex gap="2" mt="2">
                        <GumroadButton
                          variant="primary"
                          size="sm"
                          onClick={handleConfirmDelete}
                          disabled={isLoading}
                        >
                          Confirmar
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
                    <TherapistCard
                      key={t.id}
                      therapist={t}
                      onEdit={(therapist) => {
                        setEditingTherapist(therapist);
                        setView('edit');
                      }}
                      onDelete={(id) => setDeletingId(id)}
                    />
                  )
                )}
              </Flex>
            )}
          </>
        )}

        {/* Add view */}
        {view === 'add' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Novo Terapeuta
            </GumroadHeading>
            <TherapistForm
              initial={{}}
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Edit view */}
        {view === 'edit' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Editar Terapeuta
            </GumroadHeading>
            <TherapistForm
              initial={editingTherapist ?? {}}
              onSubmit={handleEdit}
              onCancel={() => setView('list')}
              isLoading={isLoading}
            />
          </>
        )}
      </>
    </GumroadModal>
  );
};

export default TherapistsPanel;
