import React from 'react';
import { Flex } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { colors, radii, shadows } from '../../theme/tokens';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import DocumentTypeIcon from './DocumentTypeIcon';
import type { DocumentRecord } from '../../types/documents';
import { DOCUMENT_RESOURCE_TYPE_LABELS, formatFileSize, getExpiryStatus } from '../../types/documents';

function formatExpiresAt(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface DocumentCardProps {
  document: DocumentRecord;
  onOpen: (document: DocumentRecord) => void;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpen, onDelete }) => {
  const { t, i18n } = useTranslation();
  const expiryStatus = getExpiryStatus(document.expiresAt);

  return (
    <div
      style={{
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Abrir é um botão de verdade (foco, Enter e Espaço); o botão de remover
          fica ao lado, e não dentro, para não aninhar controles interativos. */}
      <button
        type="button"
        onClick={() => onOpen(document)}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Flex
          align="center"
          justify="center"
          aria-hidden="true"
          style={{ height: '100px', width: '100%', backgroundColor: colors['surface-cream'], borderBottom: `2px solid ${colors.ink}` }}
        >
          <DocumentTypeIcon mimeType={document.mimeType} size={40} />
        </Flex>
        <Flex direction="column" gap="1" style={{ padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}>
          <GumroadText
            level="body-sm"
            as="p"
            style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {document.title}
          </GumroadText>
          <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>
            {formatFileSize(document.sizeBytes)}
          </GumroadText>
          {document.resourceType && (
            <GumroadBadge color="lavender" style={{ alignSelf: 'flex-start' }}>
              {t(`cDocuments.resourceType.${document.resourceType}`, { defaultValue: DOCUMENT_RESOURCE_TYPE_LABELS[document.resourceType] })}
            </GumroadBadge>
          )}
          {expiryStatus === 'expired' && (
            <GumroadBadge color="salmon" style={{ alignSelf: 'flex-start' }}>
              {t('cDocuments.expiredOn', { date: formatExpiresAt(document.expiresAt!, i18n.language) })}
            </GumroadBadge>
          )}
          {expiryStatus === 'expiring-soon' && (
            <GumroadBadge color="yellow" style={{ alignSelf: 'flex-start' }}>
              {t('cDocuments.expiresOn', { date: formatExpiresAt(document.expiresAt!, i18n.language) })}
            </GumroadBadge>
          )}
        </Flex>
      </button>
      <button
        type="button"
        onClick={() => onDelete(document.id)}
        aria-label={t('cDocuments.removeAria')}
        title={t('cDocuments.removeAria')}
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '32px',
          height: '32px',
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.md,
          backgroundColor: colors.canvas,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TrashIcon aria-hidden="true" />
      </button>
    </div>
  );
};

export default DocumentCard;
