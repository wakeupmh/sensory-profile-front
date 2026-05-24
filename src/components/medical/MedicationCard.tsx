import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import type { Medication } from '../../types/medical';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR');
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

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onEdit, onDelete }) => {
  const notesPreview = medication.notes
    ? medication.notes.length > 60
      ? medication.notes.slice(0, 60) + '…'
      : medication.notes
    : null;

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2">
            <GumroadHeading level="title-md" style={{ fontFamily: fonts.display }}>
              {medication.name}
            </GumroadHeading>
            <GumroadBadge color={medication.active ? 'mint' : 'cream'}>
              {medication.active ? 'Ativo' : 'Inativo'}
            </GumroadBadge>
          </Flex>

          {(medication.dosage || medication.frequency) && (
            <GumroadText level="body-sm" style={{ opacity: 0.8 }}>
              {[medication.dosage, medication.frequency].filter(Boolean).join(' · ')}
            </GumroadText>
          )}

          {(medication.startDate || medication.endDate) && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              {medication.startDate ? formatDate(medication.startDate) : '—'}
              {' → '}
              {medication.endDate ? formatDate(medication.endDate) : 'em curso'}
            </GumroadText>
          )}

          {medication.prescribingDoctor && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              Dr./Dra. {medication.prescribingDoctor}
            </GumroadText>
          )}

          {notesPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              {notesPreview}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(medication)}
            aria-label="Editar medicamento"
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => onDelete(medication.id)}
            aria-label="Remover medicamento"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default MedicationCard;
