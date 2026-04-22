import type { ChildData, CaregiverData } from '../sensory-profile/types';

export type DeliveryType = 'vaginal' | 'cesarean' | 'forceps' | 'other' | '';
export type SchoolShift = 'morning' | 'afternoon' | 'full' | '';

export interface ClinicalHistoryQueixa {
  mainComplaint: string;
  complaintOnset: string;
  previousTreatments: string;
}

export interface ClinicalHistoryGestation {
  plannedPregnancy: boolean | null;
  prenatalCareDetails: string;
  complications: string;
  medicationsDuringPregnancy: string;
  deliveryType: DeliveryType;
  gestationalAgeWeeks: number | null;
  birthWeightGrams: number | null;
  birthLengthCm: number | null;
  apgar1min: number | null;
  apgar5min: number | null;
  neonatalIntercurrences: string;
}

export interface ClinicalHistoryDevelopment {
  heldHeadMonths: number | null;
  sattMonths: number | null;
  crawledMonths: number | null;
  walkedMonths: number | null;
  firstWordsMonths: number | null;
  firstSentencesMonths: number | null;
  sphincterControlMonths: number | null;
  currentMotorObservations: string;
  currentLanguageObservations: string;
}

export interface ClinicalHistoryHealth {
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastSurgeries: string;
  hospitalizations: string;
  recurrentIllnesses: string;
  sleepPattern: string;
  feedingPattern: string;
}

export interface ClinicalHistorySchool {
  attendsSchool: boolean | null;
  schoolName: string;
  grade: string;
  shift: SchoolShift;
  academicPerformance: string;
  socialBehaviorAtSchool: string;
  hasSupportTeacher: boolean | null;
  supportDetails: string;
}

export interface ClinicalHistoryFamily {
  livesWith: string;
  parentsMaritalStatus: string;
  siblings: string;
  familyHistoryOfDisorders: string;
  socioeconomicNotes: string;
  additionalNotes: string;
}

export interface AnamneseClinicalHistory {
  queixa: ClinicalHistoryQueixa;
  gestation: ClinicalHistoryGestation;
  development: ClinicalHistoryDevelopment;
  health: ClinicalHistoryHealth;
  school: ClinicalHistorySchool;
  family: ClinicalHistoryFamily;
}

export interface AnamneseFormData {
  child: ChildData;
  caregiver: CaregiverData;
  clinicalHistory: AnamneseClinicalHistory;
}

export interface Anamnese extends AnamneseFormData {
  id: string;
  ownerId?: string;
  createdAt: string;
  updatedAt?: string;
  shareToken?: string | null;
  sharedAt?: string | null;
}

export interface AnamneseSummary {
  id: string;
  childName: string;
  caregiverName: string;
  createdAt: string;
  updatedAt?: string;
  shareToken?: string | null;
}

export const emptyClinicalHistory = (): AnamneseClinicalHistory => ({
  queixa: {
    mainComplaint: '',
    complaintOnset: '',
    previousTreatments: '',
  },
  gestation: {
    plannedPregnancy: null,
    prenatalCareDetails: '',
    complications: '',
    medicationsDuringPregnancy: '',
    deliveryType: '',
    gestationalAgeWeeks: null,
    birthWeightGrams: null,
    birthLengthCm: null,
    apgar1min: null,
    apgar5min: null,
    neonatalIntercurrences: '',
  },
  development: {
    heldHeadMonths: null,
    sattMonths: null,
    crawledMonths: null,
    walkedMonths: null,
    firstWordsMonths: null,
    firstSentencesMonths: null,
    sphincterControlMonths: null,
    currentMotorObservations: '',
    currentLanguageObservations: '',
  },
  health: {
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    pastSurgeries: '',
    hospitalizations: '',
    recurrentIllnesses: '',
    sleepPattern: '',
    feedingPattern: '',
  },
  school: {
    attendsSchool: null,
    schoolName: '',
    grade: '',
    shift: '',
    academicPerformance: '',
    socialBehaviorAtSchool: '',
    hasSupportTeacher: null,
    supportDetails: '',
  },
  family: {
    livesWith: '',
    parentsMaritalStatus: '',
    siblings: '',
    familyHistoryOfDisorders: '',
    socioeconomicNotes: '',
    additionalNotes: '',
  },
});
