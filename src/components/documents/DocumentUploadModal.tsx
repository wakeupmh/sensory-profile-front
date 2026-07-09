import React, { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import DocumentTypeIcon from './DocumentTypeIcon';
import { documentApi, appointmentApi, therapyApi, educationPlanApi, schoolCommApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { DocumentRecord, DocumentResourceType } from '../../types/documents';
import { DOCUMENT_RESOURCE_TYPE_LABELS, formatFileSize } from '../../types/documents';

interface ResourceOption {
  id: string;
  label: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  file: File | null;
  childId: string;
  onClose: () => void;
  onUploaded: (document: DocumentRecord) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 12px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  fontFamily: fonts.display,
  fontSize: '14px',
  color: colors.ink,
  backgroundColor: 'transparent',
  boxSizing: 'border-box',
  boxShadow: shadows.input,
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

async function fetchOptions(
  resourceType: DocumentResourceType,
  childId: string,
  token: string | null,
): Promise<ResourceOption[]> {
  try {
    switch (resourceType) {
      case 'appointment': {
        const res = await appointmentApi.list(token, { childId });
        return res.data.map((a) => ({
          id: a.id,
          label: `${new Date(a.occurredAt).toLocaleDateString('pt-BR')} — ${a.specialty}`,
        }));
      }
      case 'therapy_session': {
        const res = await therapyApi.getSessions(token, { childId, limit: 30 });
        return res.data.map((s) => ({
          id: s.id,
          label: `${new Date(s.occurredAt).toLocaleDateString('pt-BR')} — ${s.therapyType}`,
        }));
      }
      case 'education_plan': {
        const plans = await educationPlanApi.list(token, { childId });
        return plans.map((p) => ({ id: p.id, label: `${p.schoolName} — ${p.planType}` }));
      }
      case 'school_comm': {
        const res = await schoolCommApi.list(token, { childId });
        return res.data.map((c) => ({
          id: c.id,
          label: `${new Date(c.occurredAt).toLocaleDateString('pt-BR')} — ${c.subject}`,
        }));
      }
      default:
        return [];
    }
  } catch {
    return [];
  }
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, file, childId, onClose, onUploaded }) => {
  const { getToken } = useAuthContext();
  const toast = useToast();
  const [resourceType, setResourceType] = useState<DocumentResourceType | ''>('');
  const [resourceId, setResourceId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [options, setOptions] = useState<ResourceOption[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setResourceType('');
      setResourceId('');
      setExpiresAt('');
      setOptions([]);
      setProgress(0);
      setUploading(false);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!resourceType || !childId) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const token = await getToken();
      const opts = await fetchOptions(resourceType, childId, token);
      if (!cancelled) setOptions(opts);
    })();
    return () => { cancelled = true; };
  }, [resourceType, childId, getToken]);

  if (!file) return null;

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const token = await getToken();
      const { document, uploadUrl } = await documentApi.createUploadUrl(token, {
        childId,
        title: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        resourceType: resourceType || undefined,
        resourceId: resourceType ? resourceId || undefined : undefined,
        expiresAt: expiresAt || undefined,
      });
      await documentApi.uploadToPresignedUrl(uploadUrl, file, setProgress);
      setSuccess(true);
      toast.success('Documento enviado');
      onUploaded(document);
      window.setTimeout(onClose, 700);
    } catch {
      setError('Falha no upload. Verifique o arquivo e tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GumroadModal
      open={isOpen}
      onClose={onClose}
      title="Enviar documento"
      variant="center"
      maxWidth="460px"
      closeDisabled={uploading}
    >
        <Flex align="center" gap="3" mb="4" style={{ padding: '12px', border: `2px solid ${colors.ink}`, borderRadius: radii.md, backgroundColor: colors.surface }}>
          <DocumentTypeIcon mimeType={file.type} size={28} />
          <Flex direction="column" style={{ minWidth: 0 }}>
            <GumroadText level="body-sm" as="span" style={{ fontWeight: 600, wordBreak: 'break-word' }}>{file.name}</GumroadText>
            <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>{formatFileSize(file.size)}</GumroadText>
          </Flex>
        </Flex>

        <Flex direction="column" gap="3" mb="4">
          <div>
            <label style={labelStyle} htmlFor="docupload-vincular-a">Vincular a um registro (opcional)</label>
            <select id="docupload-vincular-a"
              value={resourceType}
              onChange={(e) => { setResourceType(e.target.value as DocumentResourceType | ''); setResourceId(''); }}
              style={inputStyle}
              disabled={uploading}
            >
              <option value="">Nenhum</option>
              {(Object.entries(DOCUMENT_RESOURCE_TYPE_LABELS) as [DocumentResourceType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {resourceType && (
            <div>
              <label style={labelStyle} htmlFor="docupload-selecione-o">Selecione o registro</label>
              <select id="docupload-selecione-o" value={resourceId} onChange={(e) => setResourceId(e.target.value)} style={inputStyle} disabled={uploading}>
                <option value="">Selecione...</option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              {options.length === 0 && (
                <GumroadText level="caption" as="p" style={{ opacity: 0.6, marginTop: '4px' }}>
                  Nenhum registro encontrado para vincular
                </GumroadText>
              )}
            </div>
          )}

          <div>
            <label style={labelStyle} htmlFor="docupload-validade">Data de validade (opcional)</label>
            <input
              id="docupload-validade"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={inputStyle}
              disabled={uploading}
            />
            <GumroadText level="caption" as="p" style={{ opacity: 0.6, marginTop: '4px' }}>
              Para laudos, receitas e carteirinhas com prazo de validade
            </GumroadText>
          </div>
        </Flex>

        {uploading && (
          <div style={{ marginBottom: spacing.md }}>
            <div style={{ width: '100%', height: '18px', border: `2px solid ${colors.ink}`, borderRadius: radii.pill, backgroundColor: colors.surface, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, backgroundColor: success ? colors['brand-mint'] : colors['brand-cyan'], transition: 'width 0.15s ease' }} />
            </div>
            <GumroadText level="caption" as="p" style={{ marginTop: '4px', opacity: 0.7 }}>
              {success ? '✅ Enviado com sucesso!' : `Enviando... ${progress}%`}
            </GumroadText>
          </div>
        )}

        {error && (
          <GumroadText level="body-sm" as="p" style={{ color: colors.error, marginBottom: spacing.sm }}>
            {error}
          </GumroadText>
        )}

        <Flex gap="2">
          <GumroadButton variant="primary" size="md" onClick={handleUpload} disabled={uploading || success}>
            {uploading ? 'Enviando...' : 'Enviar'}
          </GumroadButton>
          <GumroadButton variant="secondary" size="md" onClick={onClose} disabled={uploading}>
            Cancelar
          </GumroadButton>
        </Flex>
    </GumroadModal>
  );
};

export default DocumentUploadModal;
