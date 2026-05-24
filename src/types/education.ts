export type EducationPlanType = 'pei' | 'pei_simplificado' | 'adaptacao_curricular' | 'plano_aee' | 'outro';
export type SchoolCommType = 'reuniao' | 'bilhete' | 'email' | 'telefone' | 'incidente' | 'relatorio' | 'outro';

export const EDUCATION_PLAN_TYPE_LABELS: Record<EducationPlanType, string> = {
  pei: 'PEI',
  pei_simplificado: 'PEI Simplificado',
  adaptacao_curricular: 'Adaptação Curricular',
  plano_aee: 'Plano AEE',
  outro: 'Outro',
};

export const SCHOOL_COMM_TYPE_LABELS: Record<SchoolCommType, string> = {
  reuniao: 'Reunião',
  bilhete: 'Bilhete/Comunicado',
  email: 'E-mail',
  telefone: 'Ligação telefônica',
  incidente: 'Incidente',
  relatorio: 'Relatório escolar',
  outro: 'Outro',
};

export const SCHOOL_COMM_TYPE_COLORS: Record<SchoolCommType, { bg: string; text: string }> = {
  reuniao: { bg: '#E8F4FD', text: '#1A6FA8' },
  bilhete: { bg: '#FFF3CD', text: '#856404' },
  email: { bg: '#E8F5E9', text: '#1B5E20' },
  telefone: { bg: '#F3E5F5', text: '#6A1B9A' },
  incidente: { bg: '#FFEBEE', text: '#B71C1C' },
  relatorio: { bg: '#E8EAF6', text: '#1A237E' },
  outro: { bg: '#F5F5F5', text: '#424242' },
};

export const EDUCATION_PLAN_TYPE_COLORS: Record<EducationPlanType, { bg: string; text: string }> = {
  pei: { bg: '#E3F2FD', text: '#0D47A1' },
  pei_simplificado: { bg: '#E8F5E9', text: '#1B5E20' },
  adaptacao_curricular: { bg: '#FFF8E1', text: '#E65100' },
  plano_aee: { bg: '#F3E5F5', text: '#4A148C' },
  outro: { bg: '#F5F5F5', text: '#424242' },
};

export interface EducationPlan {
  id: string;
  userId: string;
  childId: string;
  schoolName: string;
  academicYear: string;
  planType: EducationPlanType;
  startDate: string;           // DATE string 'YYYY-MM-DD'
  reviewDate: string | null;   // DATE string or null
  endDate: string | null;      // DATE string or null
  goals: string | null;
  accommodations: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolCommunicationSummary {
  id: string;
  childId: string;
  occurredAt: string;         // ISO datetime string (serialized from backend Date)
  commType: SchoolCommType;
  subject: string;
  attendees: string | null;
  followUpDate: string | null;
  createdAt: string;
}

export interface SchoolCommunication extends SchoolCommunicationSummary {
  userId: string;
  description: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface CreateEducationPlanPayload {
  childId: string;
  schoolName: string;
  academicYear: string;
  planType: EducationPlanType;
  startDate: string;
  reviewDate?: string | null;
  endDate?: string | null;
  goals?: string | null;
  accommodations?: string | null;
  notes?: string | null;
}

export type UpdateEducationPlanPayload = Partial<Omit<CreateEducationPlanPayload, 'childId'>>;

export interface CreateSchoolCommPayload {
  childId: string;
  occurredAt: string;
  commType: SchoolCommType;
  subject: string;
  description?: string | null;
  attendees?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
}

export type UpdateSchoolCommPayload = Partial<Omit<CreateSchoolCommPayload, 'childId'>>;

export interface EducationPlanQueryParams {
  childId?: string;
  academicYear?: string;
  planType?: EducationPlanType;
}

export interface SchoolCommQueryParams {
  childId?: string;
  commType?: SchoolCommType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSchoolComms {
  data: SchoolCommunicationSummary[];
  total: number;
  page: number;
  limit: number;
}
