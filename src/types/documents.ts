// Types for document/attachment upload & library (S3 presigned URL flow)

export type DocumentResourceType = 'appointment' | 'therapy_session' | 'education_plan' | 'school_comm';

export interface DocumentRecord {
  id: string;
  childId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  resourceType?: DocumentResourceType | null;
  resourceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUploadUrlPayload {
  childId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  resourceType?: DocumentResourceType | null;
  resourceId?: string | null;
}

export interface CreateUploadUrlResponse {
  document: DocumentRecord;
  uploadUrl: string;
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
