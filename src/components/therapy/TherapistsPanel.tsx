import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import TherapistCard from './TherapistCard';
import TherapistForm from './TherapistForm';
import type { Therapist, CreateTherapistPayload } from '../../types/therapy';

interface TherapistsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  onAdd: (payload: CreateTherapistPayload) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CreateTherapistPayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type PanelView = 'list' | 'add' | 'edit';

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

const TherapistsPanel: React.FC<TherapistsPanelProps> = ({
  isOpen,
  onClose,
  therapists,
  onAdd,
  onUpdate,
  onDelete,
}) => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAdd = async (payload: CreateTherapistPayload) => {
    setIsLoading(true);
    try {
      await onAdd(payload);
      setView('list');
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={sheetStyle}>
        {/* Header */}
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Terapeutas
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
      </div>
    </div>
  );
};

export default TherapistsPanel;
