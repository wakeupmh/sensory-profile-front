export type TherapyType = 'aba' | 'ot' | 'fonoaudiologia' | 'psicologia' | 'fisioterapia';

export interface Therapist {
  id: string;
  userId: string;
  name: string;
  specialty: TherapyType;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapySessionSummary {
  id: string;
  childId: string;
  therapistId: string | null;
  therapyType: TherapyType;
  occurredAt: string;
  durationMinutes: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface TherapySession extends TherapySessionSummary {
  updatedAt: string;
}

export interface CreateSessionPayload {
  childId: string;
  therapistId?: string | null;
  therapyType: TherapyType;
  occurredAt: string;
  durationMinutes?: number | null;
  notes?: string | null;
}

export interface CreateTherapistPayload {
  name: string;
  specialty: TherapyType;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface PaginatedSessions {
  data: TherapySessionSummary[];
  total: number;
  page: number;
  limit: number;
}
