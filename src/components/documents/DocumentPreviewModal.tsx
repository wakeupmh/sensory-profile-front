import React, { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { DownloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { colors, radii } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import LoadingSpinner from '../LoadingSpinner';
import { documentApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { DocumentRecord } from '../../types/documents';
import { getDocumentKind } from '../../types/documents';

interface DocumentPreviewModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose }) => {
  const { getToken } = useAuthContext();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setDownloadUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const res = await documentApi.getDownloadUrl(token, document.id);
        if (!cancelled) setDownloadUrl(res.downloadUrl);
      } catch {
        if (!cancelled) setError('Não foi possível carregar o arquivo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [document, getToken]);

  if (!document) return null;

  const kind = getDocumentKind(document.mimeType);

  const handleDownload = async () => {
    const token = await getToken();
    const res = await documentApi.getDownloadUrl(token, document.id);
    window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <GumroadModal
      open={document !== null}
      onClose={onClose}
      title={document.fileName}
      variant="center"
      maxWidth="720px"
    >
        <Flex justify="end" mb="3">
          <GumroadButton variant="secondary" size="sm" onClick={handleDownload}>
            <DownloadIcon /> Baixar
          </GumroadButton>
        </Flex>

        {loading ? (
          <Flex justify="center" py="6"><LoadingSpinner size="large" text="Carregando preview..." /></Flex>
        ) : error ? (
          <Flex align="center" gap="2" style={{ color: colors.error }}>
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">{error}</GumroadText>
          </Flex>
        ) : downloadUrl ? (
          kind === 'image' ? (
            <img src={downloadUrl} alt={document.fileName} style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto', borderRadius: radii.md, border: `2px solid ${colors.ink}` }} />
          ) : kind === 'pdf' ? (
            <iframe src={downloadUrl} title={document.fileName} style={{ width: '100%', height: '70vh', border: `2px solid ${colors.ink}`, borderRadius: radii.md }} />
          ) : kind === 'video' ? (
            <video src={downloadUrl} controls style={{ width: '100%', maxHeight: '70vh', borderRadius: radii.md, border: `2px solid ${colors.ink}` }} />
          ) : (
            <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
              Pré-visualização não disponível para este tipo de arquivo. Use o botão "Baixar".
            </GumroadText>
          )
        ) : null}
    </GumroadModal>
  );
};

export default DocumentPreviewModal;
