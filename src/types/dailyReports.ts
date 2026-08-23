import type { LogType } from './logs';

export type DailyReportStatus = 'draft' | 'transcribing' | 'ready' | 'failed';

/**
 * Registros diários que a IA *propõe* a partir do relato falado. Nada disso
 * é salvo até o cuidador confirmar — ver DailyReportPage.
 */
export interface SuggestedLog {
  logType: LogType;
  notes?: string;
  data?: Record<string, unknown>;
}

export interface DailyReportStructured {
  summary?: string;
  highlights?: string[];
  concerns?: string[];
  suggestedLogs?: SuggestedLog[];
}

export interface DailyReport {
  id: string;
  childId: string;
  /** YYYY-MM-DD */
  reportDate: string;
  status: DailyReportStatus;
  transcript: string | null;
  structured: DailyReportStructured | null;
  error: string | null;
  hasAudio: boolean;
  audioExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyReportPayload {
  childId: string;
  reportDate: string;
  mimeType: string;
}

export interface CreateDailyReportResponse {
  report: DailyReport;
  uploadUrl: string;
}

/** Ditado avulso — o texto é o produto; o áudio é descartado pelo backend assim que sai. */
export interface VoiceNote {
  id: string;
  status: 'draft' | 'transcribing' | 'ready' | 'failed';
  transcript: string | null;
  error: string | null;
  createdAt: string;
}

export interface CreateVoiceNoteResponse {
  note: VoiceNote;
  uploadUrl: string;
}
