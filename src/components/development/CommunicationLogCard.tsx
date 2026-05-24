import React from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import { GumroadText } from '../design-system/GumroadHeading';
import type { CommunicationLogSummary } from '../../types/development';
import { COMMUNICATION_ENTRY_TYPE_LABELS } from '../../types/development';

interface CommunicationLogCardProps {
  log: CommunicationLogSummary;
  onEdit: (l: CommunicationLogSummary) => void;
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

const CommunicationLogCard: React.FC<CommunicationLogCardProps> = ({ log, onEdit, onDelete }) => {
  const descriptionPreview = log.description
    ? log.description.length > 150
      ? log.description.slice(0, 150) + '...'
      : log.description
    : null;

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <GumroadText level="body-sm" style={{ fontWeight: 600, fontFamily: fonts.display, color: colors.ink }}>
            {formatDateTime(log.occurredAt)}
          </GumroadText>

          <Flex gap="2" wrap="wrap" style={{ marginTop: '4px' }}>
            {/* Entry type badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: colors['brand-cyan'],
                color: colors.ink,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {COMMUNICATION_ENTRY_TYPE_LABELS[log.entryType]}
            </span>

            {/* Words count badge */}
            {log.wordsCount != null && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  backgroundColor: colors['brand-lavender'],
                  color: colors.ink,
                  fontSize: '12px',
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  border: `1.5px solid ${colors.ink}`,
                }}
              >
                Palavras: {log.wordsCount}
              </span>
            )}
          </Flex>

          {descriptionPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.7, marginTop: '4px' }}>
              {descriptionPreview}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(log)}
            aria-label="Editar registro"
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => onDelete(log.id)}
            aria-label="Remover registro"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default CommunicationLogCard;
