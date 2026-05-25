import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import type { MedicalAppointmentSummary } from '../../types/medical';

interface AppointmentCardProps {
  appointment: MedicalAppointmentSummary;
  onEdit: (a: MedicalAppointmentSummary) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const iconBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  backgroundColor: colors.canvas,
  boxShadow: shadows['card-sm'],
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete }) => {
  const summaryPreview = appointment.summary
    ? appointment.summary.length > 80
      ? appointment.summary.slice(0, 80) + '…'
      : appointment.summary
    : null;

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <GumroadHeading level="title-md" style={{ fontFamily: fonts.display }}>
            {formatDateTime(appointment.occurredAt)}
          </GumroadHeading>

          {(appointment.doctorName || appointment.specialty) && (
            <Flex align="center" gap="2" style={{ flexWrap: 'wrap' }}>
              {appointment.doctorName && (
                <GumroadText level="body-sm" style={{ fontWeight: 600 }}>
                  Dr./Dra. {appointment.doctorName}
                </GumroadText>
              )}
              {appointment.specialty && (
                <GumroadBadge color="cyan">{appointment.specialty}</GumroadBadge>
              )}
            </Flex>
          )}

          {appointment.clinicName && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              {appointment.clinicName}
            </GumroadText>
          )}

          {summaryPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              {summaryPreview}
            </GumroadText>
          )}

          {appointment.followUpDate && (
            <GumroadText level="body-sm" style={{ color: colors['brand-cyan'], fontWeight: 600 }}>
              Retorno: {formatDate(appointment.followUpDate)}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(appointment)}
            aria-label="Editar consulta"
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => onDelete(appointment.id)}
            aria-label="Remover consulta"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default AppointmentCard;
