export interface Medication {
  id: string;
  userId: string;
  childId: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  prescribingDoctor: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comorbidity {
  id: string;
  userId: string;
  childId: string;
  conditionName: string;
  icdCode: string | null;
  diagnosisDate: string | null;
  diagnosingDoctor: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalAppointmentSummary {
  id: string;
  childId: string;
  doctorName: string | null;
  specialty: string | null;
  clinicName: string | null;
  occurredAt: string;
  summary: string | null;
  followUpDate: string | null;
  createdAt: string;
}

export interface MedicalAppointment extends MedicalAppointmentSummary {
  userId: string;
  notes: string | null;
  updatedAt: string;
}

export interface CreateMedicationPayload {
  childId: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  prescribingDoctor?: string | null;
  active?: boolean;
  notes?: string | null;
}

export interface UpdateMedicationPayload {
  name?: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  prescribingDoctor?: string | null;
  active?: boolean;
  notes?: string | null;
}

export interface CreateComorbidityPayload {
  childId: string;
  conditionName: string;
  icdCode?: string | null;
  diagnosisDate?: string | null;
  diagnosingDoctor?: string | null;
  notes?: string | null;
}

export interface UpdateComorbidityPayload {
  conditionName?: string;
  icdCode?: string | null;
  diagnosisDate?: string | null;
  diagnosingDoctor?: string | null;
  notes?: string | null;
}

export interface CreateAppointmentPayload {
  childId: string;
  doctorName?: string | null;
  specialty?: string | null;
  clinicName?: string | null;
  occurredAt: string;
  summary?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
}

export interface UpdateAppointmentPayload {
  doctorName?: string | null;
  specialty?: string | null;
  clinicName?: string | null;
  occurredAt?: string;
  summary?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
}

export interface MedicationQueryParams {
  childId?: string;
  active?: boolean;
}

export interface AppointmentQueryParams {
  childId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointments {
  data: MedicalAppointmentSummary[];
  total: number;
  page: number;
  limit: number;
}
