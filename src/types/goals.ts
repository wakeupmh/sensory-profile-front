// Types for therapeutic goals / PEI with progress tracking

export type GoalDomain =
  | 'comunicacao'
  | 'social'
  | 'motor'
  | 'autocuidado'
  | 'academico'
  | 'comportamental'
  | 'outro';

export type GoalStatus = 'active' | 'achieved' | 'paused' | 'discontinued';

export interface Goal {
  id: string;
  childId: string;
  title: string;
  domain: GoalDomain;
  description?: string | null;
  masteryCriteria?: string | null;
  baselineValue: number | null;
  targetValue: number | null;
  unit?: string | null;
  status: GoalStatus;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  childId: string;
  title: string;
  domain: GoalDomain;
  description?: string | null;
  masteryCriteria?: string | null;
  baselineValue?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  targetDate?: string | null;
  status?: GoalStatus;
}

export type UpdateGoalPayload = Partial<Omit<CreateGoalPayload, 'childId'>>;

export interface GoalQueryParams {
  childId?: string;
  domain?: GoalDomain;
  status?: GoalStatus;
}

export interface GoalProgressEntry {
  id: string;
  goalId: string;
  value: number | null;
  recordedAt: string;
  notes?: string | null;
  therapySessionId?: string | null;
  createdAt: string;
}

export interface CreateGoalProgressPayload {
  value: number;
  recordedAt: string;
  notes?: string | null;
  therapySessionId?: string | null;
}

export interface GoalProgressSummary {
  goalId: string;
  baselineValue: number | null;
  targetValue: number | null;
  latestValue: number | null;
  latestRecordedAt: string | null;
  entryCount: number;
  deltaFromBaseline: number | null;
}

export const GOAL_DOMAIN_LABELS: Record<GoalDomain, string> = {
  comunicacao: 'Comunicação',
  social: 'Social',
  motor: 'Motor',
  autocuidado: 'Autocuidado',
  academico: 'Acadêmico',
  comportamental: 'Comportamental',
  outro: 'Outro',
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'Ativa',
  achieved: 'Alcançada',
  paused: 'Pausada',
  discontinued: 'Descontinuada',
};

export const GOAL_STATUS_COLORS: Record<GoalStatus, 'cyan' | 'mint' | 'yellow' | 'cream'> = {
  active: 'cyan',
  achieved: 'mint',
  paused: 'yellow',
  discontinued: 'cream',
};
