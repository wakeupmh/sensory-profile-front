// Enums
export type MilestoneCategory = 'motor_gross' | 'motor_fine' | 'language' | 'communication' | 'social' | 'cognitive' | 'self_care' | 'other';
export type MilestoneStatus = 'not_yet' | 'in_progress' | 'achieved' | 'regressed';
export type CommunicationEntryType = 'vocabulary' | 'aac_usage' | 'verbal_speech' | 'signs' | 'other';

// PT-BR labels for display
export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  motor_gross: 'Motor Grosso',
  motor_fine: 'Motor Fino',
  language: 'Linguagem',
  communication: 'Comunicação',
  social: 'Social',
  cognitive: 'Cognitivo',
  self_care: 'Autocuidado',
  other: 'Outro',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  not_yet: 'Ainda não',
  in_progress: 'Em progresso',
  achieved: 'Conquistado',
  regressed: 'Regressão',
};

export const COMMUNICATION_ENTRY_TYPE_LABELS: Record<CommunicationEntryType, string> = {
  vocabulary: 'Vocabulário',
  aac_usage: 'Uso de CAA',
  verbal_speech: 'Fala Verbal',
  signs: 'Sinais/Libras',
  other: 'Outro',
};

// Status colors for UI
export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, { bg: string; text: string }> = {
  not_yet: { bg: '#F5F5F5', text: '#666666' },
  in_progress: { bg: '#FFF3CD', text: '#856404' },
  achieved: { bg: '#D1F5EA', text: '#1A7A4A' },
  regressed: { bg: '#FFE5E5', text: '#C0392B' },
};

// Category colors
export const MILESTONE_CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  motor_gross: '#4ECDC4',
  motor_fine: '#C7B8FF',
  language: '#FFD93D',
  communication: '#FF6B6B',
  social: '#4ECDC4',
  cognitive: '#C7B8FF',
  self_care: '#FFD93D',
  other: '#E0E0E0',
};

// Entity types
export interface DevelopmentalMilestone {
  id: string;
  userId: string;
  childId: string;
  title: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  achievedDate: string | null;   // YYYY-MM-DD string
  targetDate: string | null;     // YYYY-MM-DD string
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLogSummary {
  id: string;
  childId: string;
  occurredAt: string;   // ISO datetime
  entryType: CommunicationEntryType;
  description: string | null;
  wordsCount: number | null;
  createdAt: string;
}

export interface CommunicationLog extends CommunicationLogSummary {
  userId: string;
  notes: string | null;
  updatedAt: string;
}

// Payload types
export interface CreateMilestonePayload {
  childId: string;
  title: string;
  category: MilestoneCategory;
  status?: MilestoneStatus;
  achievedDate?: string | null;
  targetDate?: string | null;
  notes?: string | null;
}

export interface UpdateMilestonePayload {
  title?: string;
  category?: MilestoneCategory;
  status?: MilestoneStatus;
  achievedDate?: string | null;
  targetDate?: string | null;
  notes?: string | null;
}

export interface CreateCommunicationLogPayload {
  childId: string;
  occurredAt: string;   // ISO datetime string
  entryType: CommunicationEntryType;
  description?: string | null;
  wordsCount?: number | null;
  notes?: string | null;
}

export interface UpdateCommunicationLogPayload {
  occurredAt?: string;
  entryType?: CommunicationEntryType;
  description?: string | null;
  wordsCount?: number | null;
  notes?: string | null;
}

export interface MilestoneQueryParams {
  childId?: string;
  category?: MilestoneCategory;
  status?: MilestoneStatus;
}

export interface CommunicationLogQueryParams {
  childId?: string;
  entryType?: CommunicationEntryType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCommunicationLogs {
  data: CommunicationLogSummary[];
  total: number;
  page: number;
  limit: number;
}
