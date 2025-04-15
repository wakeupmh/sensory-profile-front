/* eslint-disable @typescript-eslint/no-explicit-any */
export type FrequencyResponse = 'almost_always' | 'frequently' | 'half_time' | 'occasionally' | 'almost_never' | 'not_applied' | '';

export interface ChildData {
  name: string;
  birthDate: string;
  gender: string;
  otherInfo: string;
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

export type SensorySectionKey = 
  | 'auditoryProcessing'
  | 'visualProcessing'
  | 'tactileProcessing'
  | 'movementProcessing'
  | 'bodyPositionProcessing'
  | 'oralSensitivityProcessing'
  | 'conductProcessing'
  | 'socialEmotionalResponses'
  | 'attentionResponses';

export interface FormData {
  child: ChildData;
  examiner: ExaminerData;
  caregiver: CaregiverData;
  auditoryProcessing: SensorySection;
  visualProcessing: SensorySection;
  tactileProcessing: SensorySection;
  movementProcessing: SensorySection;
  bodyPositionProcessing: SensorySection;
  oralSensitivityProcessing: SensorySection;
  socialEmotionalResponses: SensorySection;
  attentionResponses: SensorySection;
  createdAt?: string;
  [key: string]: any;
}
