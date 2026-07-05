import { useState, useEffect, useCallback } from 'react';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { documentApi } from '../services/api';
import type { DocumentRecord } from '../types/documents';
import { useAuthContext } from '../context/AuthContext';
import { useDomainPage } from '../hooks/useDomainPage';
import { ChildSelector } from '../components/domain/ChildSelector';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import UploadDropzone from '../components/documents/UploadDropzone';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_PREFIXES = ['application/pdf', 'image/', 'video/'];

export default function DocumentsPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!effectiveChildId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const list = await documentApi.list(token, { childId: effectiveChildId });
      setDocuments(list);
    } catch {
      setError('Erro ao carregar documentos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [effectiveChildId, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) fetchDocuments();
  }, [fetchDocuments, isLoaded, session]);

  const handleFileSelected = (file: File) => {
    setUploadError(null);
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Arquivo muito grande. O tamanho máximo é 25MB.');
      return;
    }
    if (!ACCEPTED_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      setUploadError('Tipo de arquivo não suportado. Envie PDF, imagem ou vídeo.');
      return;
    }
    setPendingFile(file);
  };

  const handleUploaded = (doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    const token = await getTokenRef.current();
    await documentApi.delete(token, id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Box>
      <Flex justify="between" align={{ initial: 'start', sm: 'center' }} mb="6" gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Documentos
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Exames, laudos, fotos e vídeos da criança
          </GumroadText>
        </Box>
      </Flex>

      <ChildSelector children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {!effectiveChildId ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
            Selecione uma criança para ver os documentos
          </GumroadText>
        </GumroadCard>
      ) : (
        <>
          <Box style={{ marginBottom: spacing.lg }}>
            <UploadDropzone onFileSelected={handleFileSelected} />
            {uploadError && (
              <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'], marginTop: spacing.xs }}>
                {uploadError}
              </GumroadText>
            )}
          </Box>

          {loading ? (
            <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
              <LoadingSpinner size="large" text="Carregando documentos..." />
            </GumroadCard>
          ) : error ? (
            <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon />
                <GumroadText level="body-md" as="p">{error}</GumroadText>
              </Flex>
            </GumroadCard>
          ) : documents.length === 0 ? (
            <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
              <Flex direction="column" align="center" gap="3">
                <InfoCircledIcon width={36} height={36} />
                <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                  Nenhum documento enviado ainda
                </GumroadText>
              </Flex>
            </GumroadCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onOpen={setPreviewDoc} onDelete={setDeletingId} />
              ))}
            </div>
          )}
        </>
      )}

      <DocumentUploadModal
        isOpen={!!pendingFile}
        file={pendingFile}
        childId={effectiveChildId}
        onClose={() => setPendingFile(null)}
        onUploaded={handleUploaded}
      />

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />

      <AlertDialog.Root open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialog.Content size="2">
          <AlertDialog.Title>Excluir documento</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <GumroadButton variant="secondary" size="sm">Cancelar</GumroadButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <GumroadButton variant="danger" size="sm" onClick={() => deletingId && handleDelete(deletingId)}>
                Excluir
              </GumroadButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
