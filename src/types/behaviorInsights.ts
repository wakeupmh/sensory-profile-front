// Types for behavior (ABC) insights panel — GET /api/logs/insights/behavior

export interface BehaviorTopItem {
  value: string;
  count: number;
}

export interface BehaviorOccurrence {
  id: string;
  occurredAt: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  intensity: number | null;
}

export interface BehaviorInsights {
  totalCount: number;
  previousCount: number;
  percentChange: number | null;
  averageIntensity: number | null;
  byWeekday: Record<string, number>;
  byHour: Record<string, number>;
  topAntecedents: BehaviorTopItem[];
  topBehaviors: BehaviorTopItem[];
  recent: BehaviorOccurrence[];
}

export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
