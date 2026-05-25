import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import type {
  MedicalAppointment,
  MedicalAppointmentSummary,
  CreateAppointmentPayload,
} from '../../types/medical';

interface AppointmentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  appointments: MedicalAppointmentSummary[];
  onAdd: (payload: CreateAppointmentPayload) => Promise<void>;
  onEdit: (id: string, payload: Omit<CreateAppointmentPayload, 'childId'>) => Promise<void>;
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

const AppointmentsPanel: React.FC<AppointmentsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  appointments,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [view, setView] = useState<PanelView>('list');
  const [editingAppointment, setEditingAppointment] = useState<MedicalAppointmentSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingAppointment(null);
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

  const handleAdd = async (payload: CreateAppointmentPayload | Omit<CreateAppointmentPayload, 'childId'>) => {
    setIsLoading(true);
    try {
      await onAdd(payload as CreateAppointmentPayload);
      setView('list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateAppointmentPayload | Omit<CreateAppointmentPayload, 'childId'>) => {
    if (!editingAppointment) return;
    setIsLoading(true);
    try {
      await onEdit(editingAppointment.id, payload as Omit<CreateAppointmentPayload, 'childId'>);
      setView('list');
      setEditingAppointment(null);
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

  const deletingAppointment = appointments.find((a) => a.id === deletingId);

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Consultas
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
                Adicionar Consulta
              </Flex>
            </GumroadButton>

            {appointments.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhuma consulta registrada
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {appointments.map((appt) =>
                  deletingId === appt.id ? (
                    <GumroadCard key={appt.id} color="salmon" padding="md" shadow="md">
                      <GumroadText level="body-md">
                        Remover consulta
                        {deletingAppointment?.doctorName
                          ? ` com Dr./Dra. ${deletingAppointment.doctorName}`
                          : ''}?
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
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onEdit={(a) => {
                        setEditingAppointment(a);
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
              Nova Consulta
            </GumroadHeading>
            <AppointmentForm
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
              Editar Consulta
            </GumroadHeading>
            <AppointmentForm
              childId={childId}
              initialValues={editingAppointment as Partial<MedicalAppointment> ?? {}}
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

export default AppointmentsPanel;
