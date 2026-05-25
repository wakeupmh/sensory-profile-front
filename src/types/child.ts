export interface TimelineEvent {
  id: string;
  type: 'assessment' | 'log' | 'therapy' | 'medical_appointment' | 'communication' | 'school_comm' | 'milestone';
  occurredAt: string;
  title: string;
  subtitle: string | null;
}

export interface ChildProfile {
  child: {
    id: string;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    nationalIdentity: string | null;
    notes: string | null;
    createdAt: string;
  };
  stats: {
    assessmentCount: number;
    logCount: number;
    therapySessionCount: number;
    activeMedicationCount: number;
    achievedMilestoneCount: number;
    educationPlanCount: number;
  };
}

export interface PaginatedTimeline {
  data: TimelineEvent[];
  total: number;
  page: number;
  limit: number;
}

export const TIMELINE_TYPE_LABELS: Record<TimelineEvent['type'], string> = {
  assessment: 'Avaliação',
  log: 'Registro',
  therapy: 'Terapia',
  medical_appointment: 'Consulta',
  communication: 'Comunicação',
  school_comm: 'Escola',
  milestone: 'Marco',
};

export const TIMELINE_TYPE_COLORS: Record<TimelineEvent['type'], { bg: string; text: string }> = {
  assessment: { bg: '#C7B8FF', text: '#2D1B69' },
  log: { bg: '#FFD93D', text: '#5A4000' },
  therapy: { bg: '#4ECDC4', text: '#0A4040' },
  medical_appointment: { bg: '#FF6B6B', text: '#5A0000' },
  communication: { bg: '#B8F0C7', text: '#0A4020' },
  school_comm: { bg: '#FFD4A3', text: '#5A2000' },
  milestone: { bg: '#A3D4FF', text: '#00205A' },
};
