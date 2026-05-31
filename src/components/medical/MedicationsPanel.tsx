import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import MedicationCard from './MedicationCard';
import MedicationForm from './MedicationForm';
import type { Medication, CreateMedicationPayload, UpdateMedicationPayload } from '../../types/medical';
import { usePanelCrud } from '../../hooks/usePanelCrud';

interface MedicationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  medications: Medication[];
  onAdd: (payload: CreateMedicationPayload) => Promise<void>;
  onEdit: (id: string, payload: UpdateMedicationPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

const MedicationsPanel: React.FC<MedicationsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  medications,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const {
    editingItem: editingMedication,
    setEditingItem: setEditingMedication,
    deletingId,
    setDeletingId,
    isLoading,
    setIsLoading,
    view,
    setView,
    startEdit,
  } = usePanelCrud<Medication>({ isOpen, onClose });

  const handleAdd = async (payload: CreateMedicationPayload | UpdateMedicationPayload) => {
    setIsLoading(true);
    try {
      await onAdd(payload as CreateMedicationPayload);
      setView('list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateMedicationPayload | UpdateMedicationPayload) => {
    if (!editingMedication) return;
    setIsLoading(true);
    try {
      await onEdit(editingMedication.id, payload as UpdateMedicationPayload);
      setView('list');
      setEditingMedication(null);
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
            Medicamentos
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
                Adicionar Medicamento
              </Flex>
            </GumroadButton>

            {medications.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhum medicamento cadastrado
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {medications.map((med) =>
                  deletingId === med.id ? (
                    <GumroadCard key={med.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover {med.name}?
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
                    <MedicationCard
                      key={med.id}
                      medication={med}
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
              Novo Medicamento
            </GumroadHeading>
            <MedicationForm
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
              Editar Medicamento
            </GumroadHeading>
            <MedicationForm
              childId={childId}
              initialValues={editingMedication ?? {}}
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

export default MedicationsPanel;
