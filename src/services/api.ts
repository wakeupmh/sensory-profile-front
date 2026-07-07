/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getDelegateChildId } from './delegateChild';

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

// ─── Caregiver delegation (SP-21) ────────────────────────────────────
// When a caregiver is "acting as" one of their delegated children, every
// request must carry X-Delegate-Child-Id so the backend treats it as if
// it came from that child's owner. State lives in ./delegateChild, set
// via DelegationContext.
api.interceptors.request.use((config) => {
  const delegateChildId = getDelegateChildId();
  if (delegateChildId) {
    config.headers = config.headers ?? {};
    config.headers['X-Delegate-Child-Id'] = delegateChildId;
  }
  return config;
});

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
  sensoryTriggers?: string | null;
  calmingStrategies?: string | null;
  emergencyContact?: string | null;
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
    authRequest<any>('get', token, `/api/children/${id}/timeline`, undefined, { params }).then((r) => ({
      data: r.data,
      total: r.total,
      page: r.page,
      limit: r.limit,
    })),
};

import type {
  CreateLogPayload,
  DailyLog,
  LogType,
  LogAttachment,
  CreateLogAttachmentPayload,
  CreateLogAttachmentResponse,
} from '../types/logs';

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

  // getLog/createLog/updateLog unwrap response.data.data explicitly (unlike
  // getLogs above): jsonResponse always nests the payload under `data`, and
  // for a single object — unlike the list response, whose meta fields sit
  // alongside `data` at the top level and happen to match PaginatedLogs'
  // shape — that nesting means authRequest<DailyLog> would return the whole
  // {success, data, timestamp} envelope typed as DailyLog, silently making
  // every field (including `id`) undefined.
  getLog: async (token: string | null, id: string): Promise<DailyLog> => {
    const response = await api.get(`/api/logs/${id}`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  createLog: async (token: string | null, payload: CreateLogPayload): Promise<DailyLog> => {
    const response = await api.post('/api/logs', payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  updateLog: async (token: string | null, id: string, payload: Partial<CreateLogPayload>): Promise<DailyLog> => {
    const response = await api.patch(`/api/logs/${id}`, payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  deleteLog: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/logs/${id}`),

  requestAttachmentUpload: async (
    token: string | null,
    logId: string,
    payload: CreateLogAttachmentPayload,
  ): Promise<CreateLogAttachmentResponse> => {
    const response = await api.post(`/api/logs/${logId}/attachments`, payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  listAttachments: async (token: string | null, logId: string): Promise<LogAttachment[]> => {
    const response = await api.get(`/api/logs/${logId}/attachments`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data ?? [];
  },

  deleteAttachment: async (token: string | null, logId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/api/logs/${logId}/attachments/${attachmentId}`, { headers: getAuthHeaders(token) });
  },

  /** Uploads the raw file bytes directly to the presigned S3 URL (same generic PUT as documentApi). */
  uploadAttachmentToPresignedUrl: (uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<void> =>
    axios
      .put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then(() => undefined),
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
  Medication, Comorbidity, MedicalAppointment,
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
  DevelopmentalMilestone, CommunicationLog,
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
};

// ─── Professionals (owner-side directory) ──────────────────────────
import type {
  Professional,
  ProfessionalPayload,
  ResourceShare,
  AcceptedIdentity,
  SharedAnamneseSummary,
  SharedAssessmentSummary,
} from '../types/professionals';

const unwrap = <T,>(payload: any): T => (payload?.data ?? payload) as T;

export const professionalApi = {
  list: (token: string | null): Promise<Professional[]> =>
    authRequest<any>('get', token, '/api/professionals').then(unwrap<Professional[]>),

  get: (id: string, token: string | null): Promise<Professional> =>
    authRequest<any>('get', token, `/api/professionals/${id}`).then(unwrap<Professional>),

  create: (payload: ProfessionalPayload, token: string | null): Promise<Professional> =>
    authRequest<any>('post', token, '/api/professionals', payload).then(unwrap<Professional>),

  update: (id: string, payload: Partial<ProfessionalPayload>, token: string | null): Promise<Professional> =>
    authRequest<any>('put', token, `/api/professionals/${id}`, payload).then(unwrap<Professional>),

  remove: (id: string, token: string | null): Promise<void> =>
    authRequest<any>('delete', token, `/api/professionals/${id}`),

  rotateToken: (id: string, token: string | null): Promise<Professional> =>
    authRequest<any>('post', token, `/api/professionals/${id}/rotate-token`).then(unwrap<Professional>),

  myIdentities: (token: string | null): Promise<AcceptedIdentity[]> =>
    authRequest<any>('get', token, '/api/professionals/me/identities').then(unwrap<AcceptedIdentity[]>),

  acceptInvite: (inviteToken: string, token: string | null): Promise<Professional> =>
    authRequest<any>('post', token, '/api/professional-invites/accept', { token: inviteToken }).then(
      unwrap<Professional>,
    ),
};

// ─── Per-resource sharing ─────────────────────────────────────────
export const anamneseSharesApi = {
  list: (anamneseId: string, token: string | null): Promise<ResourceShare[]> =>
    authRequest<any>('get', token, `/api/anamneses/${anamneseId}/shares`).then(unwrap<ResourceShare[]>),

  grant: (anamneseId: string, professionalId: string, token: string | null): Promise<ResourceShare> =>
    authRequest<any>('post', token, `/api/anamneses/${anamneseId}/shares`, { professionalId }).then(
      unwrap<ResourceShare>,
    ),

  revoke: (anamneseId: string, professionalId: string, token: string | null): Promise<void> =>
    authRequest<any>('delete', token, `/api/anamneses/${anamneseId}/shares/${professionalId}`),
};

export const assessmentSharesApi = {
  list: (assessmentId: string, token: string | null): Promise<ResourceShare[]> =>
    authRequest<any>('get', token, `/api/assessments/${assessmentId}/shares`).then(unwrap<ResourceShare[]>),

  grant: (assessmentId: string, professionalId: string, token: string | null): Promise<ResourceShare> =>
    authRequest<any>('post', token, `/api/assessments/${assessmentId}/shares`, { professionalId }).then(
      unwrap<ResourceShare>,
    ),

  revoke: (assessmentId: string, professionalId: string, token: string | null): Promise<void> =>
    authRequest<any>('delete', token, `/api/assessments/${assessmentId}/shares/${professionalId}`),
};

// ─── Professional read-only access (records shared with me) ──────────
export const sharedApi = {
  listAnamneses: (token: string | null): Promise<SharedAnamneseSummary[]> =>
    authRequest<any>('get', token, '/api/shared/anamneses').then(unwrap<SharedAnamneseSummary[]>),

  getAnamnese: (id: string, token: string | null): Promise<any> =>
    authRequest<any>('get', token, `/api/shared/anamneses/${id}`).then(unwrap<any>),

  listAssessments: (token: string | null): Promise<SharedAssessmentSummary[]> =>
    authRequest<any>('get', token, '/api/shared/assessments').then(unwrap<SharedAssessmentSummary[]>),

  getAssessment: (id: string, token: string | null): Promise<any> =>
    authRequest<any>('get', token, `/api/shared/assessments/${id}`).then(unwrap<any>),
};

// ─── Behavior (ABC) insights ────────────────────────────────────────
import type { BehaviorInsights } from '../types/behaviorInsights';

export const behaviorInsightsApi = {
  get: async (token: string | null, childId: string, days = 30): Promise<BehaviorInsights> => {
    const response = await api.get('/api/logs/insights/behavior', {
      headers: getAuthHeaders(token),
      params: { childId, days },
    });
    const raw = response.data?.data ?? response.data ?? {};
    return {
      totalCount: raw.totalCount ?? 0,
      previousCount: raw.previousCount ?? 0,
      percentChange: raw.percentChange ?? null,
      averageIntensity: raw.averageIntensity ?? null,
      byWeekday: raw.byWeekday ?? {},
      byHour: raw.byHour ?? {},
      topAntecedents: raw.topAntecedents ?? [],
      topBehaviors: raw.topBehaviors ?? [],
      recent: raw.recent ?? raw.recentOccurrences ?? [],
    };
  },
};

// ─── Reminders feed (manual + derived) ──────────────────────────────
import type {
  UpcomingReminder,
  Reminder,
  CreateReminderPayload,
  UpdateReminderPayload,
  ReminderOrigin,
} from '../types/reminders';

// A "custom" item is a real Reminder row (already filtered to status='pending'
// server-side); a "derived" item is computed on the fly from another domain's
// date field and has no status concept at all — both are always renderable
// as 'pending' here.
export interface RawUpcomingReminderItem {
  source: 'custom' | 'derived';
  type: string;
  id: string;
  childId: string;
  title: string;
  dueAt: string;
  resourceType: string | null;
  resourceId: string | null;
}

// Maps GET /api/reminders/upcoming's `type` (UpcomingReminderService.DerivedReminderType)
// to the origin the UI actually renders against. Two backend types collapse into
// 'school' since the frontend has no separate "education plan" origin/icon.
const DERIVED_TYPE_TO_ORIGIN: Record<string, ReminderOrigin> = {
  medical_followup: 'medical',
  education_review: 'school',
  education_plan_end: 'school',
  school_followup: 'school',
  milestone_target: 'milestone',
  medication_ending: 'medication',
  document_expiring: 'document',
};

export function toUpcomingReminder(raw: RawUpcomingReminderItem): UpcomingReminder {
  return {
    id: raw.id,
    childId: raw.childId,
    title: raw.title,
    dueAt: raw.dueAt,
    origin: raw.source === 'custom' ? 'manual' : (DERIVED_TYPE_TO_ORIGIN[raw.type] ?? 'manual'),
    status: 'pending',
  };
}

export const reminderApi = {
  getUpcoming: async (token: string | null, childId: string, days = 14): Promise<UpcomingReminder[]> => {
    const response = await api.get('/api/reminders/upcoming', {
      headers: getAuthHeaders(token),
      params: { childId, days },
    });
    const raw: RawUpcomingReminderItem[] = response.data?.data ?? response.data ?? [];
    return raw.map(toUpcomingReminder);
  },

  list: async (token: string | null, params?: { childId?: string }): Promise<Reminder[]> => {
    const response = await api.get('/api/reminders', {
      headers: getAuthHeaders(token),
      params,
    });
    return response.data?.data ?? response.data ?? [];
  },

  create: async (token: string | null, payload: CreateReminderPayload): Promise<Reminder> => {
    const response = await api.post('/api/reminders', payload, {
      headers: getAuthHeaders(token),
    });
    return response.data?.data ?? response.data;
  },

  update: async (token: string | null, id: string, payload: UpdateReminderPayload): Promise<Reminder> => {
    const response = await api.patch(`/api/reminders/${id}`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data?.data ?? response.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    await api.delete(`/api/reminders/${id}`, {
      headers: getAuthHeaders(token),
    });
  },
};

// ─── Therapeutic goals / PEI with progress tracking ─────────────────
import type {
  Goal,
  CreateGoalPayload,
  UpdateGoalPayload,
  GoalQueryParams,
  GoalProgressEntry,
  CreateGoalProgressPayload,
  GoalProgressSummary,
} from '../types/goals';

export const goalApi = {
  list: async (token: string | null, params?: GoalQueryParams): Promise<Goal[]> => {
    const response = await api.get('/api/goals', { headers: getAuthHeaders(token), params });
    return response.data?.data ?? response.data ?? [];
  },

  get: async (token: string | null, id: string): Promise<Goal> => {
    const response = await api.get(`/api/goals/${id}`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  create: async (token: string | null, payload: CreateGoalPayload): Promise<Goal> => {
    const response = await api.post('/api/goals', payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  update: async (token: string | null, id: string, payload: UpdateGoalPayload): Promise<Goal> => {
    const response = await api.patch(`/api/goals/${id}`, payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    await api.delete(`/api/goals/${id}`, { headers: getAuthHeaders(token) });
  },
};

export const goalProgressApi = {
  list: async (token: string | null, goalId: string): Promise<GoalProgressEntry[]> => {
    const response = await api.get(`/api/goals/${goalId}/progress`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data ?? [];
  },

  create: async (token: string | null, goalId: string, payload: CreateGoalProgressPayload): Promise<GoalProgressEntry> => {
    const response = await api.post(`/api/goals/${goalId}/progress`, payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  summary: async (token: string | null, goalId: string): Promise<GoalProgressSummary> => {
    const response = await api.get(`/api/goals/${goalId}/progress/summary`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },
};

// ─── Documents (S3 presigned upload/download) ───────────────────────
import type {
  DocumentRecord,
  CreateUploadUrlPayload,
  CreateUploadUrlResponse,
  DownloadUrlResponse,
  UpdateDocumentPayload,
} from '../types/documents';

export const documentApi = {
  list: async (
    token: string | null,
    params?: { childId?: string; resourceType?: string; resourceId?: string },
  ): Promise<DocumentRecord[]> => {
    const response = await api.get('/api/documents', { headers: getAuthHeaders(token), params });
    return response.data?.data ?? response.data ?? [];
  },

  createUploadUrl: async (token: string | null, payload: CreateUploadUrlPayload): Promise<CreateUploadUrlResponse> => {
    const response = await api.post('/api/documents/upload-url', payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  getDownloadUrl: async (token: string | null, id: string): Promise<DownloadUrlResponse> => {
    const response = await api.get(`/api/documents/${id}/download-url`, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  update: async (token: string | null, id: string, payload: UpdateDocumentPayload): Promise<DocumentRecord> => {
    const response = await api.patch(`/api/documents/${id}`, payload, { headers: getAuthHeaders(token) });
    return response.data?.data ?? response.data;
  },

  delete: async (token: string | null, id: string): Promise<void> => {
    await api.delete(`/api/documents/${id}`, { headers: getAuthHeaders(token) });
  },

  /** Uploads the raw file bytes directly to the presigned S3 URL (no auth header — the URL itself is the credential). */
  uploadToPresignedUrl: (uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<void> =>
    axios
      .put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then(() => undefined),
};

// ─── Whole-child domain sharing with professionals ──────────────────
import type { ChildShare, GrantChildSharePayload, SharedChildSummary } from '../types/childSharing';
import type {
  ConsolidatedAssessments,
  ConsolidatedLogs,
  ConsolidatedTherapy,
  ConsolidatedMedical,
  ConsolidatedDevelopment,
} from '../types/consolidatedReport';

export const childSharesApi = {
  list: (token: string | null, childId: string): Promise<ChildShare[]> =>
    authRequest<any>('get', token, `/api/children/${childId}/shares`).then(unwrap<ChildShare[]>),

  grant: (token: string | null, childId: string, payload: GrantChildSharePayload): Promise<ChildShare> =>
    authRequest<any>('post', token, `/api/children/${childId}/shares`, payload).then(unwrap<ChildShare>),

  revoke: (token: string | null, childId: string, professionalId: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/children/${childId}/shares/${professionalId}`),
};

export const sharedChildrenApi = {
  list: (token: string | null): Promise<SharedChildSummary[]> =>
    authRequest<any>('get', token, '/api/shared/children').then(unwrap<SharedChildSummary[]>),

  getAssessments: (token: string | null, childId: string): Promise<ConsolidatedAssessments> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/assessments`).then(unwrap<ConsolidatedAssessments>),

  getDailyLogs: (token: string | null, childId: string): Promise<ConsolidatedLogs> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/daily-logs`).then(unwrap<ConsolidatedLogs>),

  getTherapy: (token: string | null, childId: string): Promise<ConsolidatedTherapy> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/therapy`).then(unwrap<ConsolidatedTherapy>),

  getMedical: (token: string | null, childId: string): Promise<ConsolidatedMedical> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/medical`).then(unwrap<ConsolidatedMedical>),

  getDevelopment: (token: string | null, childId: string): Promise<ConsolidatedDevelopment> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/development`).then(unwrap<ConsolidatedDevelopment>),
};

// ─── AI summaries history + Q&A chat (SP-13) ────────────────────────
import type {
  AISummaryRecord,
  GenerateAISummaryPayload,
  AIQuestionPayload,
  AIQuestionResponse,
  AIRateLimitInfo,
} from '../types/aiSummaries';

export class AIRateLimitError extends Error {
  info: AIRateLimitInfo;
  constructor(info: AIRateLimitInfo) {
    super('Limite de uso da IA atingido.');
    this.name = 'AIRateLimitError';
    this.info = info;
  }
}

function parseRateLimitInfo(headers: Record<string, unknown>): AIRateLimitInfo {
  const remaining = headers['x-ratelimit-remaining'];
  const limit = headers['x-ratelimit-limit'];
  const retryAfter = headers['retry-after'];
  return {
    limit: limit ? Number(limit) : 5,
    remaining: remaining !== undefined ? Number(remaining) : null,
    retryAfterSeconds: retryAfter ? Number(retryAfter) : null,
  };
}

async function aiRequest<T>(method: 'get' | 'post', token: string | null, url: string, data?: unknown, params?: unknown): Promise<{ data: T; rateLimit: AIRateLimitInfo }> {
  const authHeaders = getAuthHeaders(token);
  try {
    const response = method === 'get'
      ? await api.get(url, { headers: authHeaders, params })
      : await api.post(url, data, { headers: authHeaders });
    return { data: (response.data?.data ?? response.data) as T, rateLimit: parseRateLimitInfo(response.headers as Record<string, unknown>) };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      const body = err.response.data ?? {};
      const info = parseRateLimitInfo(err.response.headers as Record<string, unknown>);
      throw new AIRateLimitError({
        limit: info.limit,
        remaining: 0,
        retryAfterSeconds: info.retryAfterSeconds ?? body.retryAfterSeconds ?? body.retryAfter ?? null,
      });
    }
    throw err;
  }
}

export const aiSummaryApi = {
  list: async (token: string | null, childId: string): Promise<AISummaryRecord[]> => {
    const { data } = await aiRequest<AISummaryRecord[]>('get', token, '/api/consolidated/ai-summaries', undefined, { childId });
    return data ?? [];
  },

  generate: async (token: string | null, payload: GenerateAISummaryPayload): Promise<{ record: AISummaryRecord; rateLimit: AIRateLimitInfo }> => {
    const { data, rateLimit } = await aiRequest<AISummaryRecord>('post', token, '/api/consolidated/ai-summaries', payload);
    return { record: data, rateLimit };
  },
};

export const aiQuestionApi = {
  ask: async (token: string | null, payload: AIQuestionPayload): Promise<{ answer: string; rateLimit: AIRateLimitInfo }> => {
    const { data, rateLimit } = await aiRequest<AIQuestionResponse>('post', token, '/api/consolidated/ai-question', payload);
    return { answer: data.answer, rateLimit };
  },
};

// ─── AI consultation brief (SP-22) ───────────────────────────────────
import type { ConsultationBrief, GenerateConsultationBriefPayload } from '../types/consultationBrief';

export const consultationBriefApi = {
  generate: async (token: string | null, payload: GenerateConsultationBriefPayload): Promise<{ brief: ConsultationBrief; rateLimit: AIRateLimitInfo }> => {
    const { data, rateLimit } = await aiRequest<any>('post', token, '/api/consolidated/consultation-brief', payload);
    const raw = data?.brief ?? data ?? {};
    const rawQuestions = raw.suggestedQuestions ?? raw.questions;
    const brief: ConsultationBrief = {
      whatChanged: raw.whatChanged ?? raw.changesSinceLastVisit ?? raw.changes ?? '',
      currentTreatments: raw.currentTreatments ?? raw.medications ?? raw.treatments ?? '',
      suggestedQuestions: Array.isArray(rawQuestions)
        ? rawQuestions
        : typeof rawQuestions === 'string' && rawQuestions
          ? [rawQuestions]
          : [],
    };
    return { brief, rateLimit };
  },
};

// ─── Co-caregivers with read-write delegation (SP-21) ────────────────
import type { Caregiver, CreateCaregiverPayload, AcceptCaregiverInviteResponse } from '../types/caregivers';

export const caregiverApi = {
  list: (token: string | null, childId: string): Promise<Caregiver[]> =>
    authRequest<any>('get', token, `/api/children/${childId}/caregivers`).then(unwrap<Caregiver[]>),

  invite: (token: string | null, childId: string, payload: CreateCaregiverPayload): Promise<Caregiver> =>
    authRequest<any>('post', token, `/api/children/${childId}/caregivers`, payload).then(unwrap<Caregiver>),

  revoke: (token: string | null, childId: string, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/children/${childId}/caregivers/${id}`),

  acceptInvite: (token: string | null, inviteToken: string): Promise<AcceptCaregiverInviteResponse> =>
    authRequest<any>('post', token, '/api/caregiver-invites/accept', { token: inviteToken }).then(
      unwrap<AcceptCaregiverInviteResponse>,
    ),
};

// ─── Professional notes on shared children + owner access audit (SP-20) ──
import type {
  ProfessionalNote,
  CreateProfessionalNotePayload,
  UpdateProfessionalNotePayload,
} from '../types/professionalNotes';
import type { PaginatedAccessLogs, AccessLogQueryParams } from '../types/accessLog';

// Professional-side: my own notes on a child shared with me.
export const sharedNotesApi = {
  list: (token: string | null, childId: string): Promise<ProfessionalNote[]> =>
    authRequest<any>('get', token, `/api/shared/children/${childId}/notes`).then(unwrap<ProfessionalNote[]>),

  create: (token: string | null, childId: string, payload: CreateProfessionalNotePayload): Promise<ProfessionalNote> =>
    authRequest<any>('post', token, `/api/shared/children/${childId}/notes`, payload).then(unwrap<ProfessionalNote>),

  update: (token: string | null, id: string, payload: UpdateProfessionalNotePayload): Promise<ProfessionalNote> =>
    authRequest<any>('patch', token, `/api/shared/notes/${id}`, payload).then(unwrap<ProfessionalNote>),

  delete: (token: string | null, id: string): Promise<void> =>
    authRequest<any>('delete', token, `/api/shared/notes/${id}`),
};

// Owner-side: read-only view of every professional's notes on my child.
export const childNotesApi = {
  list: (token: string | null, childId: string): Promise<ProfessionalNote[]> =>
    authRequest<any>('get', token, `/api/children/${childId}/notes`).then(unwrap<ProfessionalNote[]>),
};

// Owner-side: paginated data-access audit trail for my child.
export const accessLogApi = {
  list: (token: string | null, childId: string, params?: AccessLogQueryParams): Promise<PaginatedAccessLogs> =>
    authRequest<PaginatedAccessLogs>('get', token, `/api/children/${childId}/access-logs`, undefined, { params }),
};

// Owner-side: full data export (LGPD, direito à portabilidade dos dados).
import type { DataExportResponse } from '../types/dataExport';

export const dataExportApi = {
  request: (token: string | null, childId: string): Promise<DataExportResponse> =>
    authRequest<any>('get', token, `/api/children/${childId}/export`).then(unwrap<DataExportResponse>),
};

export default api;


