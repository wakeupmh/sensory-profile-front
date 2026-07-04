// Types for whole-child domain sharing with professionals

export type ChildShareScope = 'assessments' | 'daily_logs' | 'therapy' | 'medical' | 'development';

export interface ChildShare {
  id: string;
  childId: string;
  professionalId: string;
  scopes: ChildShareScope[];
  createdAt: string;
  updatedAt: string;
}

export interface GrantChildSharePayload {
  professionalId: string;
  scopes: ChildShareScope[];
}

/** Item returned by GET /api/shared/children (professional-side listing). */
export interface SharedChildSummary {
  id: string;
  name: string;
  birthDate?: string | null;
  scopes: ChildShareScope[];
  grantedAt: string;
}

export const CHILD_SHARE_SCOPE_LABELS: Record<ChildShareScope, string> = {
  assessments: 'Avaliações',
  daily_logs: 'Registros diários',
  therapy: 'Terapia',
  medical: 'Saúde',
  development: 'Desenvolvimento',
};

export const CHILD_SHARE_SCOPES: ChildShareScope[] = ['assessments', 'daily_logs', 'therapy', 'medical', 'development'];
