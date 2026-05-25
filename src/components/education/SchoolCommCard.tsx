import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadButton from '../design-system/GumroadButton';
import type { SchoolCommunicationSummary } from '../../types/education';
import {
  SCHOOL_COMM_TYPE_LABELS,
  SCHOOL_COMM_TYPE_COLORS,
} from '../../types/education';

interface SchoolCommCardProps {
  comm: SchoolCommunicationSummary;
  onEdit: (comm: SchoolCommunicationSummary) => void;
  onDelete: (id: string) => void;
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

function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

const SchoolCommCard: React.FC<SchoolCommCardProps> = ({ comm, onEdit, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const commTypeColors = SCHOOL_COMM_TYPE_COLORS[comm.commType];

  if (confirming) {
    return (
      <GumroadCard color="salmon" padding="md" shadow="md">
        <GumroadText level="body-md">
          Remover comunicação "{comm.subject}"?
        </GumroadText>
        <Flex gap="2" mt="2">
          <GumroadButton
            variant="primary"
            size="sm"
            onClick={() => onDelete(comm.id)}
          >
            Confirmar
          </GumroadButton>
          <GumroadButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </GumroadButton>
        </Flex>
      </GumroadCard>
    );
  }

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <GumroadText level="body-sm" style={{ opacity: 0.6 }}>
            {formatDateTime(comm.occurredAt)}
          </GumroadText>

          <Flex gap="2" wrap="wrap" style={{ marginTop: '2px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: commTypeColors.bg,
                color: commTypeColors.text,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {SCHOOL_COMM_TYPE_LABELS[comm.commType]}
            </span>
          </Flex>

          <GumroadHeading level="title-md" style={{ fontWeight: 600, fontFamily: fonts.display, marginTop: '4px' }}>
            {comm.subject}
          </GumroadHeading>

          {comm.attendees && (
            <GumroadText level="body-sm" style={{ opacity: 0.7, marginTop: '2px' }}>
              {comm.attendees}
            </GumroadText>
          )}

          {comm.followUpDate && (
            <GumroadText level="body-sm" style={{ opacity: 0.7, marginTop: '2px' }}>
              <strong>Retorno em:</strong> {formatDate(comm.followUpDate)}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(comm)}
            aria-label="Editar comunicação"
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => setConfirming(true)}
            aria-label="Remover comunicação"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default SchoolCommCard;
