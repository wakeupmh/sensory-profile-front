// Types for SP-7 Consolidated Report

export interface ConsolidatedChild {
  id: string;
  name: string;
}

export interface ConsolidatedPeriod {
  from: string;
  to: string;
}

export interface RecentAssessment {
  id: string;
  instrumentId: string;
  completedAt: string | null;
  scoresJson: Record<string, unknown> | null;
}

export interface ConsolidatedAssessments {
  recent: RecentAssessment[];
  count: number;
}

export interface ConsolidatedLogs {
  byType: Record<string, number>;
  totalCount: number;
}

export interface ActiveTherapist {
  id: string;
  name: string;
  specialty: string;
}

export interface RecentSession {
  id: string;
  therapyType: string;
  occurredAt: string;
  durationMinutes: number | null;
  therapistName: string | null;
}

export interface ConsolidatedTherapy {
  activeTherapists: ActiveTherapist[];
  recentSessions: RecentSession[];
  sessionCount: number;
  byType: Record<string, number>;
}

export interface ActiveMedication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
}

export interface Comorbidity {
  id: string;
  conditionName: string;
  icdCode: string | null;
}

export interface RecentAppointment {
  id: string;
  specialty: string;
  occurredAt: string;
  followUpDate: string | null;
}

export interface ConsolidatedMedical {
  activeMedications: ActiveMedication[];
  comorbidities: Comorbidity[];
  recentAppointments: RecentAppointment[];
}

export interface MilestoneStats {
  achieved: number;
  inProgress: number;
  notYet: number;
  regressed: number;
}

export interface RecentCommunicationLog {
  id: string;
  entryType: string;
  occurredAt: string;
  wordsCount: number | null;
  description: string | null;
}

export interface ConsolidatedDevelopment {
  milestoneStats: MilestoneStats;
  recentCommunicationLogs: RecentCommunicationLog[];
}

export interface EducationPlanSummary {
  id: string;
  schoolName: string;
  planType: string;
  academicYear: string;
  startDate: string;
}

export interface SchoolCommSummary {
  id: string;
  commType: string;
  subject: string;
  occurredAt: string;
}

export interface ConsolidatedEducation {
  plans: EducationPlanSummary[];
  recentComms: SchoolCommSummary[];
}

export interface ConsolidatedSummary {
  child: ConsolidatedChild;
  generatedAt: string;
  period: ConsolidatedPeriod;
  assessments: ConsolidatedAssessments;
  logs: ConsolidatedLogs;
  therapy: ConsolidatedTherapy;
  medical: ConsolidatedMedical;
  development: ConsolidatedDevelopment;
  education: ConsolidatedEducation;
}

export interface ReportShare {
  id: string;
  userId: string;
  childId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSharePayload {
  childId: string;
  expiresInDays?: number;
}

export interface CreateShareResponse {
  share: ReportShare;
  shareUrl: string;
}

export interface GenerateAISummaryPayload {
  childId: string;
  periodDays?: number;
}

// Label maps

export const THERAPY_TYPE_LABELS: Record<string, string> = {
  aba: 'ABA',
  ot: 'Terapia Ocupacional',
  fonoaudiologia: 'Fonoaudiologia',
  psicologia: 'Psicologia',
  fisioterapia: 'Fisioterapia',
};

export const LOG_TYPE_LABELS: Record<string, string> = {
  abc: 'Comportamento (ABC)',
  mood: 'Humor',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Higiene',
};

export const INSTRUMENT_LABELS: Record<string, string> = {
  'crianca-3-14': 'Perfil Sensorial 2 (3-14)',
  'crianca-pequena': 'Perfil Sensorial 2 (Criança Pequena)',
  'atec': 'ATEC',
  'mchat-r': 'M-CHAT-R',
  'mchat-rf-followup': 'M-CHAT-R/F Seguimento',
};
