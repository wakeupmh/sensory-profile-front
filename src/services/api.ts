/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL && import.meta.env.PROD) {
  throw new Error('VITE_API_URL environment variable is required in production');
}

const api = axios.create({
  baseURL: baseURL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getAuthHeaders(token: string | null): { Authorization: string } {
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in.');
  }
  return { Authorization: `Bearer ${token}` };
}

export const assessmentApi = {
  getAllAssessments: async (token: string | null) => {
    try {
      const response = await api.get('/api/assessments', {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  getAssessmentById: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/assessments/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  createAssessment: async (assessmentData: any, token: string | null) => {
    try {
      const response = await api.post('/api/assessments', assessmentData, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  updateAssessment: async (id: string, assessmentData: any, token: string | null) => {
    try {
      const response = await api.put(`/api/assessments/${id}`, assessmentData, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  deleteAssessment: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/assessments/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  generateReport: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/assessments/${id}/report`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating report for assessment ${id}:`, error);
      throw error;
    }
  },
};

export const anamneseApi = {
  list: async (token: string | null) => {
    try {
      const response = await api.get('/api/anamneses', {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anamneses:', error);
      throw error;
    }
  },

  getById: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/anamneses/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching anamnese ${id}:`, error);
      throw error;
    }
  },

  create: async (data: any, token: string | null) => {
    try {
      const response = await api.post('/api/anamneses', data, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating anamnese:', error);
      throw error;
    }
  },

  update: async (id: string, data: any, token: string | null) => {
    try {
      const response = await api.put(`/api/anamneses/${id}`, data, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating anamnese ${id}:`, error);
      throw error;
    }
  },

  remove: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/anamneses/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting anamnese ${id}:`, error);
      throw error;
    }
  },

  generateShareLink: async (id: string, token: string | null) => {
    try {
      const response = await api.post(`/api/anamneses/${id}/share`, {}, {
        headers: getAuthHeaders(token),
      });
      return response.data as { shareToken: string; sharedAt?: string };
    } catch (error) {
      console.error(`Error generating share link for anamnese ${id}:`, error);
      throw error;
    }
  },

  revokeShareLink: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/anamneses/${id}/share`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error revoking share link for anamnese ${id}:`, error);
      throw error;
    }
  },

  // Public endpoint — intentionally omits Authorization header.
  getBySharedToken: async (shareToken: string) => {
    try {
      const response = await api.get(`/api/anamneses/shared/${shareToken}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shared anamnese ${shareToken}:`, error);
      throw error;
    }
  },
};

export const draftApi = {
  getDraft: async (formType: string, token: string | null) => {
    try {
      const response = await api.get(`/api/drafts/${formType}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data as DraftData | null;
    } catch {
      return null;
    }
  },

  saveDraft: async (
    formType: string,
    payload: Record<string, unknown>,
    currentStep: number,
    instrumentId: string | null | undefined,
    token: string | null
  ) => {
    try {
      const response = await api.put(
        `/api/drafts/${formType}`,
        { payload, currentStep, instrumentId },
        { headers: getAuthHeaders(token) }
      );
      return response.data.data as DraftData;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  deleteDraft: async (formType: string, token: string | null) => {
    try {
      await api.delete(`/api/drafts/${formType}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  },
};

export interface DraftData {
  id: string;
  formType: string;
  payload: Record<string, unknown>;
  currentStep: number;
  instrumentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChildData {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  gender?: 'male' | 'female' | 'other';
  nationalIdentity?: string;
  otherInfo?: string;
  createdAt: string;
  updatedAt: string;
}

type ChildPayload = Omit<ChildData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
type ChildUpdatePayload = Partial<ChildPayload>;

export const childApi = {
  list: async (token: string | null): Promise<ChildData[]> => {
    try {
      const response = await api.get('/api/children', {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },

  get: async (id: string, token: string | null): Promise<ChildData> => {
    try {
      const response = await api.get(`/api/children/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching child ${id}:`, error);
      throw error;
    }
  },

  create: async (payload: ChildPayload, token: string | null): Promise<ChildData> => {
    try {
      const response = await api.post('/api/children', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  },

  update: async (id: string, payload: ChildUpdatePayload, token: string | null): Promise<ChildData> => {
    try {
      const response = await api.put(`/api/children/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating child ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string, token: string | null): Promise<void> => {
    try {
      await api.delete(`/api/children/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting child ${id}:`, error);
      throw error;
    }
  },

  getProfile: async (id: string, token: string | null, periodDays = 30): Promise<import('../types/child').ChildProfile> => {
    try {
      const response = await api.get(`/api/children/${id}/profile`, {
        headers: getAuthHeaders(token),
        params: { periodDays },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching child profile ${id}:`, error);
      throw error;
    }
  },

  getTimeline: async (
    id: string,
    token: string | null,
    params: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): Promise<import('../types/child').PaginatedTimeline> => {
    try {
      const response = await api.get(`/api/children/${id}/timeline`, {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching child timeline ${id}:`, error);
      throw error;
    }
  },
};

import type { CreateLogPayload, DailyLog, LogType } from '../types/logs';

export interface PaginatedLogs {
  data: DailyLog[];
  total: number;
  page: number;
  limit: number;
}

export interface LogQueryParams {
  childId?: string;
  logType?: LogType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const logApi = {
  getLogs: async (token: string | null, params?: LogQueryParams): Promise<PaginatedLogs> => {
    try {
      const response = await api.get('/api/logs', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  getLog: async (token: string | null, id: string): Promise<DailyLog> => {
    try {
      const response = await api.get(`/api/logs/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching log ${id}:`, error);
      throw error;
    }
  },

  createLog: async (token: string | null, payload: CreateLogPayload): Promise<DailyLog> => {
    try {
      const response = await api.post('/api/logs', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  },

  updateLog: async (token: string | null, id: string, payload: Partial<CreateLogPayload>): Promise<DailyLog> => {
    try {
      const response = await api.patch(`/api/logs/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating log ${id}:`, error);
      throw error;
    }
  },

  deleteLog: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/logs/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting log ${id}:`, error);
      throw error;
    }
  },
};

import type { CreateSessionPayload, CreateTherapistPayload, PaginatedSessions, TherapySession, Therapist, TherapyType } from '../types/therapy';

export interface SessionQueryParams {
  childId?: string;
  therapyType?: TherapyType;
  therapistId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const therapyApi = {
  getSessions: async (token: string | null, params?: SessionQueryParams): Promise<PaginatedSessions> => {
    try {
      const response = await api.get('/api/therapy/sessions', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      throw error;
    }
  },

  getSession: async (token: string | null, id: string): Promise<TherapySession> => {
    try {
      const response = await api.get(`/api/therapy/sessions/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching therapy session ${id}:`, error);
      throw error;
    }
  },

  createSession: async (token: string | null, payload: CreateSessionPayload): Promise<TherapySession> => {
    try {
      const response = await api.post('/api/therapy/sessions', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating therapy session:', error);
      throw error;
    }
  },

  updateSession: async (token: string | null, id: string, payload: Partial<CreateSessionPayload>): Promise<TherapySession> => {
    try {
      const response = await api.patch(`/api/therapy/sessions/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating therapy session ${id}:`, error);
      throw error;
    }
  },

  deleteSession: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/therapy/sessions/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting therapy session ${id}:`, error);
      throw error;
    }
  },
};

export const therapistApi = {
  list: async (token: string | null): Promise<Therapist[]> => {
    try {
      const response = await api.get('/api/therapy/therapists', {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching therapists:', error);
      throw error;
    }
  },

  getById: async (token: string | null, id: string): Promise<Therapist> => {
    try {
      const response = await api.get(`/api/therapy/therapists/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching therapist ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateTherapistPayload): Promise<Therapist> => {
    try {
      const response = await api.post('/api/therapy/therapists', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating therapist:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: Partial<CreateTherapistPayload>): Promise<Therapist> => {
    try {
      const response = await api.patch(`/api/therapy/therapists/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating therapist ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/therapy/therapists/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting therapist ${id}:`, error);
      throw error;
    }
  },
};

import type {
  Medication, Comorbidity, MedicalAppointment, MedicalAppointmentSummary,
  CreateMedicationPayload, UpdateMedicationPayload, MedicationQueryParams,
  CreateComorbidityPayload, UpdateComorbidityPayload,
  CreateAppointmentPayload, UpdateAppointmentPayload,
  AppointmentQueryParams, PaginatedAppointments,
} from '../types/medical';

export const medicationApi = {
  list: async (token: string | null, params?: MedicationQueryParams): Promise<Medication[]> => {
    try {
      const response = await api.get('/api/medical/medications', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<Medication> => {
    try {
      const response = await api.get(`/api/medical/medications/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching medication ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateMedicationPayload): Promise<Medication> => {
    try {
      const response = await api.post('/api/medical/medications', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateMedicationPayload): Promise<Medication> => {
    try {
      const response = await api.patch(`/api/medical/medications/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating medication ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/medical/medications/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting medication ${id}:`, error);
      throw error;
    }
  },
};

export const comorbidityApi = {
  list: async (token: string | null, params?: { childId?: string }): Promise<Comorbidity[]> => {
    try {
      const response = await api.get('/api/medical/comorbidities', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching comorbidities:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<Comorbidity> => {
    try {
      const response = await api.get(`/api/medical/comorbidities/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching comorbidity ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateComorbidityPayload): Promise<Comorbidity> => {
    try {
      const response = await api.post('/api/medical/comorbidities', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating comorbidity:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateComorbidityPayload): Promise<Comorbidity> => {
    try {
      const response = await api.patch(`/api/medical/comorbidities/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating comorbidity ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/medical/comorbidities/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting comorbidity ${id}:`, error);
      throw error;
    }
  },
};

export const appointmentApi = {
  list: async (token: string | null, params?: AppointmentQueryParams): Promise<PaginatedAppointments> => {
    try {
      const response = await api.get('/api/medical/appointments', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<MedicalAppointment> => {
    try {
      const response = await api.get(`/api/medical/appointments/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateAppointmentPayload): Promise<MedicalAppointment> => {
    try {
      const response = await api.post('/api/medical/appointments', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateAppointmentPayload): Promise<MedicalAppointment> => {
    try {
      const response = await api.patch(`/api/medical/appointments/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/medical/appointments/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },
};

import type {
  DevelopmentalMilestone, CommunicationLog, CommunicationLogSummary,
  CreateMilestonePayload, UpdateMilestonePayload, MilestoneQueryParams,
  CreateCommunicationLogPayload, UpdateCommunicationLogPayload,
  CommunicationLogQueryParams, PaginatedCommunicationLogs,
} from '../types/development';

export const milestoneApi = {
  list: async (token: string | null, params?: MilestoneQueryParams): Promise<DevelopmentalMilestone[]> => {
    try {
      const response = await api.get('/api/development/milestones', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<DevelopmentalMilestone> => {
    try {
      const response = await api.get(`/api/development/milestones/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching milestone ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateMilestonePayload): Promise<DevelopmentalMilestone> => {
    try {
      const response = await api.post('/api/development/milestones', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateMilestonePayload): Promise<DevelopmentalMilestone> => {
    try {
      const response = await api.patch(`/api/development/milestones/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating milestone ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/development/milestones/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting milestone ${id}:`, error);
      throw error;
    }
  },
};

export const communicationLogApi = {
  list: async (token: string | null, params?: CommunicationLogQueryParams): Promise<PaginatedCommunicationLogs> => {
    try {
      const response = await api.get('/api/development/logs', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<CommunicationLog> => {
    try {
      const response = await api.get(`/api/development/logs/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching communication log ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateCommunicationLogPayload): Promise<CommunicationLog> => {
    try {
      const response = await api.post('/api/development/logs', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating communication log:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateCommunicationLogPayload): Promise<CommunicationLog> => {
    try {
      const response = await api.patch(`/api/development/logs/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating communication log ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/development/logs/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting communication log ${id}:`, error);
      throw error;
    }
  },
};

import type {
  EducationPlan, CreateEducationPlanPayload, UpdateEducationPlanPayload,
  EducationPlanQueryParams, SchoolCommunication, SchoolCommunicationSummary,
  CreateSchoolCommPayload, UpdateSchoolCommPayload, SchoolCommQueryParams,
  PaginatedSchoolComms,
} from '../types/education';

export const educationPlanApi = {
  list: async (token: string | null, params?: EducationPlanQueryParams): Promise<EducationPlan[]> => {
    try {
      const response = await api.get('/api/education/plans', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching education plans:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<EducationPlan> => {
    try {
      const response = await api.get(`/api/education/plans/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching education plan ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateEducationPlanPayload): Promise<EducationPlan> => {
    try {
      const response = await api.post('/api/education/plans', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating education plan:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateEducationPlanPayload): Promise<EducationPlan> => {
    try {
      const response = await api.patch(`/api/education/plans/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating education plan ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/education/plans/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting education plan ${id}:`, error);
      throw error;
    }
  },
};

// Suppress unused-type warning — SchoolCommunicationSummary is used via PaginatedSchoolComms
export type { SchoolCommunicationSummary };

export const schoolCommApi = {
  list: async (token: string | null, params?: SchoolCommQueryParams): Promise<PaginatedSchoolComms> => {
    try {
      const response = await api.get('/api/education/comms', {
        headers: getAuthHeaders(token),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching school communications:', error);
      throw error;
    }
  },

  get: async (token: string | null, id: string): Promise<SchoolCommunication> => {
    try {
      const response = await api.get(`/api/education/comms/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching school communication ${id}:`, error);
      throw error;
    }
  },

  create: async (token: string | null, payload: CreateSchoolCommPayload): Promise<SchoolCommunication> => {
    try {
      const response = await api.post('/api/education/comms', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating school communication:', error);
      throw error;
    }
  },

  update: async (token: string | null, id: string, payload: UpdateSchoolCommPayload): Promise<SchoolCommunication> => {
    try {
      const response = await api.patch(`/api/education/comms/${id}`, payload, {
        headers: getAuthHeaders(token),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating school communication ${id}:`, error);
      throw error;
    }
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/education/comms/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting school communication ${id}:`, error);
      throw error;
    }
  },
};

import type {
  ConsolidatedSummary,
  ReportShare,
  CreateSharePayload,
  CreateShareResponse,
  GenerateAISummaryPayload,
} from '../types/consolidatedReport';

export const consolidatedReportApi = {
  getSummary: async (token: string | null, childId: string, periodDays = 90, signal?: AbortSignal): Promise<ConsolidatedSummary> => {
    try {
      const response = await api.get('/api/consolidated/summary', {
        headers: getAuthHeaders(token),
        params: { childId, periodDays },
        signal,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching consolidated summary:', error);
      throw error;
    }
  },

  createShare: async (token: string | null, payload: CreateSharePayload): Promise<CreateShareResponse> => {
    try {
      const response = await api.post('/api/consolidated/shares', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating consolidated share:', error);
      throw error;
    }
  },

  listShares: async (token: string | null, childId: string): Promise<{ shares: ReportShare[] }> => {
    try {
      const response = await api.get('/api/consolidated/shares', {
        headers: getAuthHeaders(token),
        params: { childId },
      });
      return response.data;
    } catch (error) {
      console.error('Error listing consolidated shares:', error);
      throw error;
    }
  },

  deleteShare: async (token: string | null, id: string): Promise<void> => {
    try {
      await api.delete(`/api/consolidated/shares/${id}`, {
        headers: getAuthHeaders(token),
      });
    } catch (error) {
      console.error(`Error deleting consolidated share ${id}:`, error);
      throw error;
    }
  },

  // Public endpoint — intentionally omits Authorization header.
  getShared: async (shareToken: string): Promise<ConsolidatedSummary> => {
    try {
      const response = await api.get(`/api/consolidated/shared/${shareToken}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shared consolidated report ${shareToken}:`, error);
      throw error;
    }
  },

  generateAISummary: async (token: string | null, payload: GenerateAISummaryPayload): Promise<{ summary: string }> => {
    try {
      const response = await api.post('/api/consolidated/ai-summary', payload, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      throw error;
    }
  },
};

export default api;


