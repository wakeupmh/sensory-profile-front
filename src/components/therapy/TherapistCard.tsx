import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import type { Therapist } from '../../types/therapy';

interface TherapistCardProps {
  therapist: Therapist;
  onEdit: (therapist: Therapist) => void;
  onDelete: (id: string) => void;
}

const SPECIALTY_COLORS = {
  aba: 'salmon',
  ot: 'cyan',
  fonoaudiologia: 'lavender',
  psicologia: 'yellow',
  fisioterapia: 'mint',
} as const;

const SPECIALTY_LABELS = {
  aba: 'ABA',
  ot: 'OT',
  fonoaudiologia: 'Fonoaudiologia',
  psicologia: 'Psicologia',
  fisioterapia: 'Fisioterapia',
} as const;

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

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onEdit, onDelete }) => {
  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1">
          <GumroadHeading level="title-md" style={{ fontFamily: fonts.display }}>
            {therapist.name}
          </GumroadHeading>
          <GumroadBadge color={SPECIALTY_COLORS[therapist.specialty]}>
            {SPECIALTY_LABELS[therapist.specialty]}
          </GumroadBadge>
          {therapist.phone && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              {therapist.phone}
            </GumroadText>
          )}
          {therapist.email && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              {therapist.email}
            </GumroadText>
          )}
        </Flex>
        <Flex gap="2">
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(therapist)}
            aria-label="Editar terapeuta"
          >
            <Pencil1Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => onDelete(therapist.id)}
            aria-label="Remover terapeuta"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default TherapistCard;
