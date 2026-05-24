import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import ComorbidityCard from './ComorbidityCard';
import ComorbidityForm from './ComorbidityForm';
import type { Comorbidity, CreateComorbidityPayload } from '../../types/medical';

interface ComorbiditiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  comorbidities: Comorbidity[];
  onAdd: (payload: CreateComorbidityPayload) => Promise<void>;
  onEdit: (id: string, payload: Omit<CreateComorbidityPayload, 'childId'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type PanelView = 'list' | 'add' | 'edit';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: 200,
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

const ComorbiditiesPanel: React.FC<ComorbiditiesPanelProps> = ({
  isOpen,
  onClose,
  childId,
  comorbidities,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [view, setView] = useState<PanelView>('list');
  const [editingComorbidity, setEditingComorbidity] = useState<Comorbidity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingComorbidity(null);
      setDeletingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAdd = async (payload: CreateComorbidityPayload | Omit<CreateComorbidityPayload, 'childId'>) => {
    setIsLoading(true);
    try {
      await onAdd(payload as CreateComorbidityPayload);
      setView('list');
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
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Diagnósticos
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
                      onEdit={(comorbidity) => {
                        setEditingComorbidity(comorbidity);
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
      </div>
    </div>
  );
};

export default ComorbiditiesPanel;
