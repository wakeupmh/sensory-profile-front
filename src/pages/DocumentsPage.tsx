import { useState, useMemo } from 'react';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { documentApi } from '../services/api';
import type { DocumentRecord } from '../types/documents';
import { getExpiryStatus } from '../types/documents';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { ChildSelector } from '../components/domain/ChildSelector';
import { ErrorState } from '../components/domain/ErrorState';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { DocumentsGridSkeleton } from '../components/skeletons/PageSkeletons';
import UploadDropzone from '../components/documents/UploadDropzone';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_PREFIXES = ['application/pdf', 'image/', 'video/'];

export default function DocumentsPage() {
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading, error, reload: fetchDocuments, setData } = useDomainResource(
    (token) => documentApi.list(token, { childId: effectiveChildId }),
    [effectiveChildId],
    { errorMessage: 'Erro ao carregar documentos. Por favor, tente novamente.', enabled: Boolean(effectiveChildId) },
  );

  const documents = useMemo(() => data ?? [], [data]);
  // Atualização otimista: o upload aparece na hora, sem esperar uma nova
  // busca. Era `setDocuments` antes de a busca virar hook.
  const setDocuments = (update: (previous: DocumentRecord[]) => DocumentRecord[]) =>
    setData((previous) => update(previous ?? []));

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

  const handleUpdated = (doc: DocumentRecord) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    setPreviewDoc(doc);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    const token = await getTokenRef.current();
    await documentApi.delete(token, id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const expiringCount = useMemo(
    () => documents.filter((d) => {
      const status = getExpiryStatus(d.expiresAt);
      return status === 'expired' || status === 'expiring-soon';
    }).length,
    [documents],
  );

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

      {expiringCount > 0 && (
        <GumroadCard role="alert" color="yellow" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="p">
              {expiringCount === 1
                ? '1 documento vencido ou vencendo em breve'
                : `${expiringCount} documentos vencidos ou vencendo em breve`}
            </GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {children.length === 0 ? null : !effectiveChildId ? (
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
            <DocumentsGridSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchDocuments} />
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

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} onUpdated={handleUpdated} />

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
