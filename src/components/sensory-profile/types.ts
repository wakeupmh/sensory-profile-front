// Definição dos tipos de resposta
export type FrequencyResponse = 'always' | 'frequently' | 'occasionally' | 'rarely' | 'never' | null;

// Definição dos tipos de dados do formulário
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
  quadrant: string;
  description: string;
  response: FrequencyResponse;
}

export interface SensorySection {
  items: SensoryItem[];
  comments: string;
  rawScore: number;
}

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
}
