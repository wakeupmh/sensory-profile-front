// Types for document/attachment upload & library (S3 presigned URL flow)

export type DocumentResourceType = 'appointment' | 'therapy_session' | 'education_plan' | 'school_comm';

export interface DocumentRecord {
  id: string;
  childId: string;
  title: string;
  description?: string | null;
  mimeType: string;
  sizeBytes: number;
  resourceType?: DocumentResourceType | null;
  resourceId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUploadUrlPayload {
  childId: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  resourceType?: DocumentResourceType | null;
  resourceId?: string | null;
  expiresAt?: string | null;
}

export interface CreateUploadUrlResponse {
  document: DocumentRecord;
  uploadUrl: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string | null;
  expiresAt?: string | null;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt?: string;
}

export const DOCUMENT_RESOURCE_TYPE_LABELS: Record<DocumentResourceType, string> = {
  appointment: 'Consulta médica',
  therapy_session: 'Sessão de terapia',
  education_plan: 'Plano educacional',
  school_comm: 'Comunicação escolar',
};

export type DocumentKind = 'pdf' | 'image' | 'video' | 'other';

export function getDocumentKind(mimeType: string): DocumentKind {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const EXPIRY_WARNING_DAYS = 30;

export type DocumentExpiryStatus = 'expired' | 'expiring-soon' | 'valid' | 'none';

/** Laudos, receitas controladas e carteirinhas costumam ter validade — usado
 * para destacar documentos vencidos/a vencer sem depender do backend. */
export function getExpiryStatus(
  expiresAt: string | null | undefined,
  warningDays: number = EXPIRY_WARNING_DAYS,
): DocumentExpiryStatus {
  if (!expiresAt) return 'none';
  const diffDays = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'expired';
  if (diffDays <= warningDays) return 'expiring-soon';
  return 'valid';
}
