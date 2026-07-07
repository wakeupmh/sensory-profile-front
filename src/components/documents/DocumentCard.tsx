import React from 'react';
import { Flex } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { colors, radii, shadows } from '../../theme/tokens';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import DocumentTypeIcon from './DocumentTypeIcon';
import type { DocumentRecord } from '../../types/documents';
import { DOCUMENT_RESOURCE_TYPE_LABELS, formatFileSize, getExpiryStatus } from '../../types/documents';

function formatExpiresAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface DocumentCardProps {
  document: DocumentRecord;
  onOpen: (document: DocumentRecord) => void;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpen, onDelete }) => {
  const expiryStatus = getExpiryStatus(document.expiresAt);

  return (
    <div
      onClick={() => onOpen(document)}
      style={{
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        backgroundColor: colors.surface,
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{ height: '100px', backgroundColor: colors['surface-cream'], borderBottom: `2px solid ${colors.ink}`, position: 'relative' }}
      >
        <DocumentTypeIcon mimeType={document.mimeType} size={40} />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(document.id); }}
          aria-label="Remover documento"
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '28px',
            height: '28px',
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            backgroundColor: colors.canvas,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrashIcon />
        </button>
      </Flex>
      <Flex direction="column" gap="1" style={{ padding: '10px 12px' }}>
        <GumroadText
          level="body-sm"
          as="p"
          style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {document.fileName}
        </GumroadText>
        <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>
          {formatFileSize(document.sizeBytes)}
        </GumroadText>
        {document.resourceType && (
          <GumroadBadge color="lavender" style={{ alignSelf: 'flex-start' }}>
            {DOCUMENT_RESOURCE_TYPE_LABELS[document.resourceType]}
          </GumroadBadge>
        )}
        {expiryStatus === 'expired' && (
          <GumroadBadge color="salmon" style={{ alignSelf: 'flex-start' }}>
            Vencido em {formatExpiresAt(document.expiresAt!)}
          </GumroadBadge>
        )}
        {expiryStatus === 'expiring-soon' && (
          <GumroadBadge color="yellow" style={{ alignSelf: 'flex-start' }}>
            Vence em {formatExpiresAt(document.expiresAt!)}
          </GumroadBadge>
        )}
      </Flex>
    </div>
  );
};

export default DocumentCard;
