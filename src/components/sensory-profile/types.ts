/* eslint-disable @typescript-eslint/no-explicit-any */
export type FrequencyResponse = 'quase sempre' | 'frequentemente' | 'metade do tempo' | 'ocasionalmente' | 'quase nunca' | 'não se aplica' | '';

export interface ChildData {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  nationalIdentity?: string;
  otherInfo?: string;
  age: number;
}

export interface ExaminerData {
  name: string;
  profession: string;
  contact: string;
}

export interface CaregiverData {
  name: string;
  relationship: string;
  contact: string;
}

export interface SensoryItem {
  id: number;
  quadrant?: string;
  description: string;
  response: FrequencyResponse | null;
  responseId?: string;
}

export interface SensorySection {
  items: SensoryItem[];
  comments?: string;
  rawScore?: number;
}

/**
 * @deprecated Section keys are now defined by the selected Instrument.
 * Kept as a string alias for backwards compatibility during the refactor.
 */
export type SensorySectionKey = string;

export interface FormData {
  instrumentId: string;
  child: ChildData;
  examiner: ExaminerData;
  caregiver: CaregiverData;
  sections: Record<string, SensorySection>;
  createdAt?: string;
  [key: string]: any;
}
