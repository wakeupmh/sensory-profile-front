// Types for persisted AI summaries history + Q&A chat (SP-13)

export interface AISummaryRecord {
  id: string;
  childId: string;
  periodDays: number;
  model: string;
  summary: string;
  createdAt: string;
}

export interface GenerateAISummaryPayload {
  childId: string;
  periodDays?: number;
}

export interface AIQuestionPayload {
  childId: string;
  question: string;
  periodDays?: number;
}

export interface AIQuestionResponse {
  answer: string;
}

export interface AIRateLimitInfo {
  limit: number;
  remaining: number | null;
  retryAfterSeconds: number | null;
}

export const AI_RATE_LIMIT_PER_HOUR = 5;
