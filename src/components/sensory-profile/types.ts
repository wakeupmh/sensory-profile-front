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

export type SensorySectionKey = 
  | 'auditoryProcessing'
  | 'visualProcessing'
  | 'tactileProcessing'
  | 'movementProcessing'
  | 'bodyPositionProcessing'
  | 'oralSensitivityProcessing'
  | 'behavioralResponses'
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
  behavioralResponses: SensorySection;
  socialEmotionalResponses: SensorySection;
  attentionResponses: SensorySection;
  createdAt?: string;
  [key: string]: any;
}
