import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import { useToast } from '../../context/ToastContext';
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

const AppointmentsPanel: React.FC<AppointmentsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  appointments,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const toast = useToast();
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

  const handleAdd = async (payload: CreateAppointmentPayload | Omit<CreateAppointmentPayload, 'childId'>) => {
    setIsLoading(true);
    try {
      await onAdd(payload as CreateAppointmentPayload);
      setView('list');
      toast.success('Consulta adicionada');
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
      toast.success('Consulta removida');
    } finally {
      setIsLoading(false);
    }
  };

  const deletingAppointment = appointments.find((a) => a.id === deletingId);

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Consultas">
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
      </>
    </GumroadModal>
  );
};

export default AppointmentsPanel;
