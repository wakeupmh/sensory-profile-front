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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error)) {
      const url = error.config?.url ?? 'unknown';
      const method = (error.config?.method ?? 'unknown').toUpperCase();
      console.error(`[API] ${method} ${url} failed:`, error.response?.status, error.message);
    }
    return Promise.reject(error);
  },
);

function getAuthHeaders(token: string | null): { Authorization: string } {
  if (!token) {
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }
  return { Authorization: `Bearer ${token}` };
}

async function authRequest<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  token: string | null,
  url: string,
  data?: unknown,
  config?: { headers?: Record<string, string>; [key: string]: unknown }
): Promise<T> {
  const authHeaders = getAuthHeaders(token);
  const mergedConfig = { ...config, headers: { ...(config?.headers ?? {}), ...authHeaders } };
  switch (method) {
    case 'get': return api.get(url, mergedConfig).then(r => r.data);
    case 'post': return api.post(url, data, mergedConfig).then(r => r.data);
    case 'put': return api.put(url, data, mergedConfig).then(r => r.data);
    case 'patch': return api.patch(url, data, mergedConfig).then(r => r.data);
    case 'delete': return api.delete(url, mergedConfig).then(r => r.data);
  }
}

export const assessmentApi = {
  getAllAssessments: (token: string | null) => authRequest<any>('get', token, '/api/assessments'),
  getAssessmentById: (id: string, token: string | null) => authRequest<any>('get', token, `/api/assessments/${id}`),
  createAssessment: (assessmentData: any, token: string | null) => authRequest<any>('post', token, '/api/assessments', assessmentData),
  updateAssessment: (id: string, assessmentData: any, token: string | null) => authRequest<any>('put', token, `/api/assessments/${id}`, assessmentData),
  deleteAssessment: (id: string, token: string | null) => authRequest<any>('delete', token, `/api/assessments/${id}`),
  generateReport: (id: string, token: string | null) => authRequest<any>('get', token, `/api/assessments/${id}/report`),
};

export const anamneseApi = {
  list: (token: string | null) =>
    authRequest<any>('get', token, '/api/anamneses'),

  getById: (id: string, token: string | null) =>
    authRequest<any>('get', token, `/api/anamneses/${id}`),

  create: (data: any, token: string | null) =>
    authRequest<any>('post', token, '/api/anamneses', data),

  update: (id: string, data: any, token: string | null) =>
    authRequest<any>('put', token, `/api/anamneses/${id}`, data),

  remove: (id: string, token: string | null) =>
    authRequest<any>('delete', token, `/api/anamneses/${id}`),

  generateShareLink: (id: string, token: string | null) =>
    authRequest<{ shareToken: string; sharedAt?: string }>('post', token, `/api/anamneses/${id}/share`, {}),

  revokeShareLink: (id: string, token: string | null) =>
    authRequest<any>('delete', token, `/api/anamneses/${id}/share`),

  // Public endpoint — intentionally omits Authorization header.
  getBySharedToken: async (shareToken: string) => {
    const response = await api.get(`/api/anamneses/shared/${shareToken}`);
    return response.data;
  },
};

export const draftApi = {
  getDraft: async (formType: string, token: string | null) => {
    const response = await authRequest<any>('get', token, `/api/drafts/${formType}`);
    return response.data as DraftData | null;
  },

  saveDraft: async (
    formType: string,
    payload: Record<string, unknown>,
    currentStep: number,
    instrumentId: string | null | undefined,
    token: string | null
  ) => {
    const response = await authRequest<any>('put', token, `/api/drafts/${formType}`, { payload, currentStep, instrumentId });
    return response.data as DraftData;
  },

  deleteDraft: (formType: string, token: string | null) =>
    authRequest<any>('delete', token, `/api/drafts/${formType}`),
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
  list: (token: string | null): Promise<ChildData[]> =>
    authRequest<{ data: ChildData[] }>('get', token, '/api/children').then((r) => r.data),

  get: (id: string, token: string | null): Promise<ChildData> =>
    authRequest<{ data: ChildData }>('get', token, `/api/children/${id}`).then((r) => r.data),

  create: (payload: ChildPayload, token: string | null): Promise<ChildData> =>
    authRequest<{ data: ChildData }>('post', token, '/api/children', payload).then((r) => r.data),

  update: (id: string, payload: ChildUpdatePayload, token: string | null): Promise<ChildData> =>
    authRequest<{ data: ChildData }>('put', token, `/api/children/${id}`, payload).then((r) => r.data),

  delete: (id: string, token: string | null): Promise<void> =>
    authRequest<any>('delete', token, `/api/children/${id}`),

  getProfile: (id: string, token: string | null, periodDays = 30): Promise<import('../types/child').ChildProfile> =>
    authRequest<any>('get', token, `/api/children/${id}/profile`, undefined, { params: { periodDays } }).then((r) => r.data),

  getTimeline: (
    id: string,
    token: string | null,
    params: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): Promise<import('../types/child').PaginatedTimeline> =>
    authRequest<any>('get', token, `/api/children/${id}/timeline`, undefined, { params }).then((r) => r.data),
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
  getLogs: (token: string | null, params?: LogQueryParams): Promise<PaginatedLogs> =>
    authRequest<PaginatedLogs>('get', token, '/api/logs', undefined, { params }),

  getLog: (token: string | null, id: string): Promise<DailyLog> =>
    authRequest<DailyLog>('get', token, `/api/logs/${id}`),

  createLog: (token: string | null, payload: CreateLogPayload): Promise<DailyLog> =>
    authRequest<DailyLog>('post', token, '/api/logs', payload),

  updateLog: (token: string | null, id: string, payload: Partial<CreateLogPayload>): Promise<DailyLog> =>
    authRequest<DailyLog>('patch', token, `/api/logs/${id}`, payload),

  deleteLog: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/logs/${id}`),
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
  getSessions: (token: string | null, params?: SessionQueryParams): Promise<PaginatedSessions> =>
    authRequest<PaginatedSessions>('get', token, '/api/therapy/sessions', undefined, { params }),

  getSession: async (token: string | null, id: string): Promise<TherapySession> => {
    const response = await authRequest<any>('get', token, `/api/therapy/sessions/${id}`);
    return response.data;
  },

  createSession: async (token: string | null, payload: CreateSessionPayload): Promise<TherapySession> => {
    const response = await authRequest<any>('post', token, '/api/therapy/sessions', payload);
    return response.data;
  },

  updateSession: async (token: string | null, id: string, payload: Partial<CreateSessionPayload>): Promise<TherapySession> => {
    const response = await authRequest<any>('patch', token, `/api/therapy/sessions/${id}`, payload);
    return response.data;
  },

  deleteSession: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/therapy/sessions/${id}`),
};

export const therapistApi = {
  list: async (token: string | null): Promise<Therapist[]> => {
    const response = await authRequest<any>('get', token, '/api/therapy/therapists');
    return response.data;
  },

  getById: async (token: string | null, id: string): Promise<Therapist> => {
    const response = await authRequest<any>('get', token, `/api/therapy/therapists/${id}`);
    return response.data;
  },

  create: async (token: string | null, payload: CreateTherapistPayload): Promise<Therapist> => {
    const response = await authRequest<any>('post', token, '/api/therapy/therapists', payload);
    return response.data;
  },

  update: async (token: string | null, id: string, payload: Partial<CreateTherapistPayload>): Promise<Therapist> => {
    const response = await authRequest<any>('patch', token, `/api/therapy/therapists/${id}`, payload);
    return response.data;
  },

  delete: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/therapy/therapists/${id}`),
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
    const response = await authRequest<any>('get', token, '/api/medical/medications', undefined, { params });
    return response.data;
  },

  get: async (token: string | null, id: string): Promise<Medication> => {
    const response = await authRequest<any>('get', token, `/api/medical/medications/${id}`);
    return response.data;
  },

  create: async (token: string | null, payload: CreateMedicationPayload): Promise<Medication> => {
    const response = await authRequest<any>('post', token, '/api/medical/medications', payload);
    return response.data;
  },

  update: async (token: string | null, id: string, payload: UpdateMedicationPayload): Promise<Medication> => {
    const response = await authRequest<any>('patch', token, `/api/medical/medications/${id}`, payload);
    return response.data;
  },

  delete: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/medical/medications/${id}`),
};

export const comorbidityApi = {
  list: async (token: string | null, params?: { childId?: string }): Promise<Comorbidity[]> => {
        const response = await api.get('/api/medical/comorbidities', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data.data;
  },

  get: async (token: string | null, id: string): Promise<Comorbidity> => {
        const response = await api.get(`/api/medical/comorbidities/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateComorbidityPayload): Promise<Comorbidity> => {
        const response = await api.post('/api/medical/comorbidities', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateComorbidityPayload): Promise<Comorbidity> => {
        const response = await api.patch(`/api/medical/comorbidities/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/medical/comorbidities/${id}`, {
      headers: getAuthHeaders(token),
    });
  },
};

export const appointmentApi = {
  list: async (token: string | null, params?: AppointmentQueryParams): Promise<PaginatedAppointments> => {
        const response = await api.get('/api/medical/appointments', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data;
  },

  get: async (token: string | null, id: string): Promise<MedicalAppointment> => {
        const response = await api.get(`/api/medical/appointments/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateAppointmentPayload): Promise<MedicalAppointment> => {
        const response = await api.post('/api/medical/appointments', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateAppointmentPayload): Promise<MedicalAppointment> => {
        const response = await api.patch(`/api/medical/appointments/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/medical/appointments/${id}`, {
      headers: getAuthHeaders(token),
    });
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
        const response = await api.get('/api/development/milestones', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data.data;
  },

  get: async (token: string | null, id: string): Promise<DevelopmentalMilestone> => {
        const response = await api.get(`/api/development/milestones/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateMilestonePayload): Promise<DevelopmentalMilestone> => {
        const response = await api.post('/api/development/milestones', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateMilestonePayload): Promise<DevelopmentalMilestone> => {
        const response = await api.patch(`/api/development/milestones/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/development/milestones/${id}`, {
      headers: getAuthHeaders(token),
    });
  },
};

export const communicationLogApi = {
  list: async (token: string | null, params?: CommunicationLogQueryParams): Promise<PaginatedCommunicationLogs> => {
        const response = await api.get('/api/development/logs', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data;
  },

  get: async (token: string | null, id: string): Promise<CommunicationLog> => {
        const response = await api.get(`/api/development/logs/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateCommunicationLogPayload): Promise<CommunicationLog> => {
        const response = await api.post('/api/development/logs', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateCommunicationLogPayload): Promise<CommunicationLog> => {
        const response = await api.patch(`/api/development/logs/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/development/logs/${id}`, {
      headers: getAuthHeaders(token),
    });
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
        const response = await api.get('/api/education/plans', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data.data;
  },

  get: async (token: string | null, id: string): Promise<EducationPlan> => {
        const response = await api.get(`/api/education/plans/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateEducationPlanPayload): Promise<EducationPlan> => {
        const response = await api.post('/api/education/plans', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateEducationPlanPayload): Promise<EducationPlan> => {
        const response = await api.patch(`/api/education/plans/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/education/plans/${id}`, {
      headers: getAuthHeaders(token),
    });
  },
};

// Suppress unused-type warning — SchoolCommunicationSummary is used via PaginatedSchoolComms
export type { SchoolCommunicationSummary };

export const schoolCommApi = {
  list: async (token: string | null, params?: SchoolCommQueryParams): Promise<PaginatedSchoolComms> => {
        const response = await api.get('/api/education/comms', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data;
  },

  get: async (token: string | null, id: string): Promise<SchoolCommunication> => {
        const response = await api.get(`/api/education/comms/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  create: async (token: string | null, payload: CreateSchoolCommPayload): Promise<SchoolCommunication> => {
        const response = await api.post('/api/education/comms', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  update: async (token: string | null, id: string, payload: UpdateSchoolCommPayload): Promise<SchoolCommunication> => {
        const response = await api.patch(`/api/education/comms/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/education/comms/${id}`, {
      headers: getAuthHeaders(token),
    });
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
        const response = await api.get('/api/consolidated/summary', {
      headers: getAuthHeaders(token),
      params: { childId, periodDays },
      signal,
    });
    // Backend wraps payloads as { success, data, timestamp }; unwrap (tolerate already-unwrapped).
    return response.data?.data ?? response.data;
  },

  createShare: async (token: string | null, payload: CreateSharePayload): Promise<CreateShareResponse> => {
        const response = await api.post('/api/consolidated/shares', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data?.data ?? response.data;
  },

  listShares: async (token: string | null, childId: string): Promise<{ shares: ReportShare[] }> => {
        const response = await api.get('/api/consolidated/shares', {
      headers: getAuthHeaders(token),
      params: { childId },
    });
    return response.data?.data ?? response.data;
  },

  deleteShare: async (token: string | null, id: string): Promise<void> => {
        await api.delete(`/api/consolidated/shares/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Public endpoint — intentionally omits Authorization header.
  getShared: async (shareToken: string): Promise<ConsolidatedSummary> => {
        const response = await api.get(`/api/consolidated/shared/${shareToken}`);
    // Backend wraps payloads as { success, data, timestamp }; unwrap (tolerate already-unwrapped).
    return response.data?.data ?? response.data;
  },

  generateAISummary: async (token: string | null, payload: GenerateAISummaryPayload): Promise<{ summary: string }> => {
        const response = await api.post('/api/consolidated/ai-summary', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data?.data ?? response.data;
  },
};

export default api;


