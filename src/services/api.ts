import axios from 'axios';
import { getDelegateChildId } from './delegateChild';

import type { ChildProfile, PaginatedTimeline, TimelineEvent } from '../types/child';
import type {
  CreateLogPayload,
  DailyLog,
  LogType,
  LogAttachment,
  CreateLogAttachmentPayload,
  CreateLogAttachmentResponse,
} from '../types/logs';
import type {
  CreateDailyReportPayload,
  CreateDailyReportResponse,
  DailyReport,
  VoiceNote,
  CreateVoiceNoteResponse,
} from '../types/dailyReports';
import type {
  CreateSessionPayload,
  CreateTherapistPayload,
  TherapySession,
  TherapySessionSummary,
  Therapist,
  TherapyType,
} from '../types/therapy';
import type {
  Medication, Comorbidity, MedicalAppointment, MedicalAppointmentSummary,
  CreateMedicationPayload, UpdateMedicationPayload, MedicationQueryParams,
  CreateComorbidityPayload, UpdateComorbidityPayload,
  CreateAppointmentPayload, UpdateAppointmentPayload,
  AppointmentQueryParams,
} from '../types/medical';
import type {
  DevelopmentalMilestone, CommunicationLog, CommunicationLogSummary,
  CreateMilestonePayload, UpdateMilestonePayload, MilestoneQueryParams,
  CreateCommunicationLogPayload, UpdateCommunicationLogPayload,
  CommunicationLogQueryParams,
} from '../types/development';
import type {
  EducationPlan, CreateEducationPlanPayload, UpdateEducationPlanPayload,
  EducationPlanQueryParams, SchoolCommunication, SchoolCommunicationSummary,
  CreateSchoolCommPayload, UpdateSchoolCommPayload, SchoolCommQueryParams,
} from '../types/education';
import type {
  ConsolidatedSummary,
  ReportShare,
  CreateSharePayload,
  CreateShareResponse,
  ConsolidatedAssessments,
  ConsolidatedLogs,
  ConsolidatedTherapy,
  ConsolidatedMedical,
  ConsolidatedDevelopment,
} from '../types/consolidatedReport';
import type {
  Professional,
  ProfessionalPayload,
  ResourceShare,
  AcceptedIdentity,
  SharedAnamneseSummary,
  SharedAssessmentSummary,
} from '../types/professionals';
import type { BehaviorInsights, BehaviorOccurrence } from '../types/behaviorInsights';
import type {
  UpcomingReminder,
  Reminder,
  CreateReminderPayload,
  UpdateReminderPayload,
  ReminderOrigin,
} from '../types/reminders';
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesPayload,
  PushSubscriptionPayload,
} from '../types/notifications';
import type {
  Goal,
  CreateGoalPayload,
  UpdateGoalPayload,
  GoalQueryParams,
  GoalProgressEntry,
  CreateGoalProgressPayload,
  GoalProgressSummary,
} from '../types/goals';
import type {
  DocumentRecord,
  CreateUploadUrlPayload,
  CreateUploadUrlResponse,
  DownloadUrlResponse,
  UpdateDocumentPayload,
} from '../types/documents';
import type { ChildShare, GrantChildSharePayload, SharedChildSummary } from '../types/childSharing';
import type {
  AISummaryRecord,
  GenerateAISummaryPayload,
  AIQuestionPayload,
  AIQuestionResponse,
  AIRateLimitInfo,
} from '../types/aiSummaries';
import type { ConsultationBrief, GenerateConsultationBriefPayload } from '../types/consultationBrief';
import type { Caregiver, CreateCaregiverPayload, AcceptCaregiverInviteResponse } from '../types/caregivers';
import type {
  CareTeamMember,
  CreateCareTeamMemberPayload,
  CreateCareTeamMemberResponse,
  AcceptCareTeamInvitationResponse,
  CareTeamCaseloadEntry,
} from '../types/careTeam';
import type {
  Clinic,
  ClinicMembership,
  ClinicRosterMember,
  CreateClinicMemberResponse,
  ClinicRole,
} from '../types/clinic';
import type {
  ProfessionalNote,
  CreateProfessionalNotePayload,
  UpdateProfessionalNotePayload,
} from '../types/professionalNotes';
import type { AccessLogEntry, PaginatedAccessLogs, AccessLogQueryParams } from '../types/accessLog';
import type { DataExportResponse, AccountErasureResult } from '../types/dataExport';
import type { SearchResults } from '../types/search';

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

// ─── O núcleo: uma requisição, um envelope, quatro formas de abrir ───

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Toda rota do backend responde pelo mesmo `jsonResponse`: o payload vai
 * DENTRO de `data`, e a meta de paginação (`total`, `page`, `limit`) fica ao
 * LADO dela, no topo — não dentro. Rotas que só confirmam uma ação respondem
 * `jsonMessage`, sem `data` nenhum.
 *
 * Todos os campos são opcionais de propósito: nada aqui está garantido para
 * todas as rotas, e quem decide o que fazer na ausência é o helper escolhido
 * na chamada — nunca o tipo. É isso que impede o envelope de vazar tipado
 * como se fosse o payload, que foi como `dailyReportApi.list` entregou uma
 * página inteira ao `reports.filter` e quebrou só em runtime.
 */
interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
  total?: number;
  page?: number;
  limit?: number;
}

/** Lista paginada como as telas a consomem: os itens já separados da meta. */
interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface RequestOptions {
  params?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/**
 * O único lugar que põe o header de autenticação e dispara a requisição.
 * Devolve o corpo cru como envelope; quem extrai o payload são os helpers
 * abaixo, e é por eles que todas as chamadas deste arquivo passam.
 */
async function requestEnvelope<T>(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiEnvelope<T>> {
  const config = { ...options, headers: { ...(options?.headers ?? {}), ...getAuthHeaders(token) } };
  switch (method) {
    case 'get': return (await api.get<ApiEnvelope<T>>(url, config)).data;
    case 'post': return (await api.post<ApiEnvelope<T>>(url, body, config)).data;
    case 'put': return (await api.put<ApiEnvelope<T>>(url, body, config)).data;
    case 'patch': return (await api.patch<ApiEnvelope<T>>(url, body, config)).data;
    // DELETE com corpo só existe no axios via `data` no config (as
    // push-subscriptions são revogadas pelo endpoint, não pelo path).
    case 'delete': return (await api.delete<ApiEnvelope<T>>(url, body === undefined ? config : { ...config, data: body })).data;
  }
}

/** Rotas que devolvem UM objeto em `data` — GET /:id, POST, PUT, PATCH. */
async function requestData<T>(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return (await requestEnvelope<T>(method, token, url, body, options)).data as T;
}

/**
 * Rotas de lista. `data` ausente vira `[]`: algumas rotas omitem o campo
 * quando não há nada, e uma tela que faz `.map` em `undefined` quebra.
 */
async function requestList<T>(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T[]> {
  return (await requestEnvelope<T[]>(method, token, url, body, options)).data ?? [];
}

/**
 * Rotas de lista paginada: junta `data` com a meta que veio ao lado dela.
 * Os defaults não são política — `jsonResponse` sempre manda os três nessas
 * rotas; existem só para o tipo ser `number` e nunca `number | undefined`.
 */
async function requestPage<T>(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<Page<T>> {
  const envelope = await requestEnvelope<T[]>(method, token, url, body, options);
  return {
    data: envelope.data ?? [],
    total: envelope.total ?? 0,
    page: envelope.page ?? 1,
    limit: envelope.limit ?? 0,
  };
}

/** Rotas sem corpo útil: DELETE e revogações, que respondem só uma mensagem. */
async function requestVoid(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<void> {
  await requestEnvelope<unknown>(method, token, url, body, options);
}

/**
 * Rotas públicas de link compartilhado: a própria URL é a credencial, então
 * vão sem Authorization. O envelope é o mesmo.
 */
async function publicRequestEnvelope<T>(url: string): Promise<ApiEnvelope<T>> {
  return (await api.get<ApiEnvelope<T>>(url)).data;
}

async function publicRequestData<T>(url: string): Promise<T> {
  return (await publicRequestEnvelope<T>(url)).data as T;
}

/**
 * As rotas de avaliações e anamneses (as mais antigas) devolvem o envelope
 * cru para a tela, e cada tela o abre do seu jeito — `response.data ??
 * response`, `response.assessment`, ou espalhando o objeto inteiro. Tipar
 * isso de verdade mudaria a forma de retorno e quebraria essas telas, então
 * o `any` aqui é o contrato honesto até que elas sejam migradas. É o único
 * `any` do arquivo, e nomeá-lo é o que permite encontrar todas as chamadas
 * que ainda dependem dele.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyPayload = any;

/** Devolve o corpo inteiro, sem abrir o envelope. Ver `LegacyPayload`. */
function requestLegacy(
  method: HttpMethod,
  token: string | null,
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<LegacyPayload> {
  return requestEnvelope<unknown>(method, token, url, body, options);
}

// ─── A fábrica de recursos ──────────────────────────────────────────
// Quase todo domínio expõe a mesma rota: `/base` lista e cria, `/base/:id`
// lê, altera e apaga. O que varia de verdade é o verbo do update e se a
// lista vem paginada — daí a opção e as duas fábricas. Endpoints que fogem
// disso (upload pré-assinado, transcrição, tokens de convite, filas offline)
// ficam escritos à mão logo abaixo do recurso a que pertencem: enfiá-los
// aqui custaria mais em opções do que a repetição que a fábrica apaga.

interface ResourceConfig {
  basePath: string;
  /** PATCH nas rotas novas; PUT em `/api/children` e `/api/professionals`. */
  updateMethod?: 'patch' | 'put';
}

function createCrud<TItem, TCreate, TUpdate>({ basePath, updateMethod = 'patch' }: ResourceConfig) {
  return {
    get: (token: string | null, id: string): Promise<TItem> =>
      requestData<TItem>('get', token, `${basePath}/${id}`),

    create: (token: string | null, payload: TCreate): Promise<TItem> =>
      requestData<TItem>('post', token, basePath, payload),

    update: (token: string | null, id: string, payload: TUpdate): Promise<TItem> =>
      requestData<TItem>(updateMethod, token, `${basePath}/${id}`, payload),

    delete: (token: string | null, id: string): Promise<void> =>
      requestVoid('delete', token, `${basePath}/${id}`),
  };
}

/** Recurso cuja listagem devolve o array inteiro. */
function createResourceApi<TItem, TCreate, TUpdate, TParams = void, TSummary = TItem>(
  config: ResourceConfig,
) {
  return {
    list: (token: string | null, params?: TParams): Promise<TSummary[]> =>
      requestList<TSummary>('get', token, config.basePath, undefined, { params }),
    ...createCrud<TItem, TCreate, TUpdate>(config),
  };
}

/** Recurso cuja listagem é paginada — `total`/`page`/`limit` ao lado dos itens. */
function createPagedResourceApi<TItem, TCreate, TUpdate, TParams = void, TSummary = TItem>(
  config: ResourceConfig,
) {
  return {
    list: (token: string | null, params?: TParams): Promise<Page<TSummary>> =>
      requestPage<TSummary>('get', token, config.basePath, undefined, { params }),
    ...createCrud<TItem, TCreate, TUpdate>(config),
  };
}

/** Sem header de autenticação: a própria URL pré-assinada é a credencial. */
function putPresignedFile(uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
  return axios
    .put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    })
    .then(() => undefined);
}

/** Idem, para o áudio gravado no navegador — que chega como Blob, não File. */
function putPresignedBlob(uploadUrl: string, blob: Blob, mimeType: string): Promise<void> {
  return axios.put(uploadUrl, blob, { headers: { 'Content-Type': mimeType } }).then(() => undefined);
}

// ─── Avaliações e anamneses (rotas legadas — ver `LegacyPayload`) ────

export const assessmentApi = {
  getAllAssessments: (token: string | null): Promise<LegacyPayload> =>
    requestLegacy('get', token, '/api/assessments'),

  getAssessmentById: (id: string, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('get', token, `/api/assessments/${id}`),

  createAssessment: (assessmentData: unknown, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('post', token, '/api/assessments', assessmentData),

  updateAssessment: (id: string, assessmentData: unknown, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('put', token, `/api/assessments/${id}`, assessmentData),

  deleteAssessment: (id: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/assessments/${id}`),

  generateReport: (id: string, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('get', token, `/api/assessments/${id}/report`),
};

export const anamneseApi = {
  list: (token: string | null): Promise<LegacyPayload> =>
    requestLegacy('get', token, '/api/anamneses'),

  getById: (id: string, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('get', token, `/api/anamneses/${id}`),

  create: (data: unknown, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('post', token, '/api/anamneses', data),

  update: (id: string, data: unknown, token: string | null): Promise<LegacyPayload> =>
    requestLegacy('put', token, `/api/anamneses/${id}`, data),

  remove: (id: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/anamneses/${id}`),

  generateShareLink: (id: string, token: string | null): Promise<{ shareToken: string; sharedAt?: string }> =>
    requestData<{ shareToken: string; sharedAt?: string }>('post', token, `/api/anamneses/${id}/share`, {}),

  revokeShareLink: (id: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/anamneses/${id}/share`),

  // Public endpoint — intentionally omits Authorization header.
  getBySharedToken: (shareToken: string): Promise<LegacyPayload> =>
    publicRequestEnvelope<LegacyPayload>(`/api/anamneses/shared/${shareToken}`),
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

export const draftApi = {
  getDraft: (formType: string, token: string | null): Promise<DraftData | null> =>
    requestData<DraftData | null>('get', token, `/api/drafts/${formType}`),

  saveDraft: (
    formType: string,
    payload: Record<string, unknown>,
    currentStep: number,
    instrumentId: string | null | undefined,
    token: string | null
  ): Promise<DraftData> =>
    requestData<DraftData>('put', token, `/api/drafts/${formType}`, { payload, currentStep, instrumentId }),

  deleteDraft: (formType: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/drafts/${formType}`),
};

// ─── Crianças ───────────────────────────────────────────────────────

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

// Fora da fábrica porque o token vem POR ÚLTIMO aqui, e não primeiro: é a
// ordem que as telas de criança já usam, e mexer nela seria mudança de
// comportamento, não refatoração.
export const childApi = {
  list: (token: string | null): Promise<ChildData[]> =>
    requestList<ChildData>('get', token, '/api/children'),

  get: (id: string, token: string | null): Promise<ChildData> =>
    requestData<ChildData>('get', token, `/api/children/${id}`),

  create: (payload: ChildPayload, token: string | null): Promise<ChildData> =>
    requestData<ChildData>('post', token, '/api/children', payload),

  update: (id: string, payload: ChildUpdatePayload, token: string | null): Promise<ChildData> =>
    requestData<ChildData>('put', token, `/api/children/${id}`, payload),

  delete: (id: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/children/${id}`),

  getProfile: (id: string, token: string | null, periodDays = 30): Promise<ChildProfile> =>
    requestData<ChildProfile>('get', token, `/api/children/${id}/profile`, undefined, { params: { periodDays } }),

  getTimeline: (
    id: string,
    token: string | null,
    params: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): Promise<PaginatedTimeline> =>
    requestPage<TimelineEvent>('get', token, `/api/children/${id}/timeline`, undefined, { params }),
};

// ─── Registros diários ──────────────────────────────────────────────

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

const logResource = createPagedResourceApi<DailyLog, CreateLogPayload, Partial<CreateLogPayload>, LogQueryParams>({
  basePath: '/api/logs',
});

export const logApi = {
  getLogs: logResource.list,
  getLog: logResource.get,
  createLog: logResource.create,
  updateLog: logResource.update,
  deleteLog: logResource.delete,

  // Anexos vivem sob o registro, não sob uma rota própria de recurso.
  requestAttachmentUpload: (
    token: string | null,
    logId: string,
    payload: CreateLogAttachmentPayload,
  ): Promise<CreateLogAttachmentResponse> =>
    requestData<CreateLogAttachmentResponse>('post', token, `/api/logs/${logId}/attachments`, payload),

  listAttachments: (token: string | null, logId: string): Promise<LogAttachment[]> =>
    requestList<LogAttachment>('get', token, `/api/logs/${logId}/attachments`),

  deleteAttachment: (token: string | null, logId: string, attachmentId: string): Promise<void> =>
    requestVoid('delete', token, `/api/logs/${logId}/attachments/${attachmentId}`),

  /** Uploads the raw file bytes directly to the presigned S3 URL (same generic PUT as documentApi). */
  uploadAttachmentToPresignedUrl: putPresignedFile,
};

// ─── Ditado avulso e relato falado do dia ───────────────────────────

/**
 * Ditado avulso: o mesmo maquinário do relato do dia, mas devolvendo texto
 * puro para qualquer campo do app. Não recebe childId — o ditado é da conta.
 */
export const voiceNoteApi = {
  create: (token: string | null, mimeType: string): Promise<CreateVoiceNoteResponse> =>
    requestData<CreateVoiceNoteResponse>('post', token, '/api/voice-notes', { mimeType }),

  startTranscription: (token: string | null, id: string): Promise<VoiceNote> =>
    requestData<VoiceNote>('post', token, `/api/voice-notes/${id}/transcribe`),

  get: (token: string | null, id: string): Promise<VoiceNote> =>
    requestData<VoiceNote>('get', token, `/api/voice-notes/${id}`),

  uploadAudio: putPresignedBlob,
};

/**
 * Relato falado do dia. O fluxo tem três passos porque o áudio nunca passa
 * pelo backend (upload direto ao S3) e a transcrição é assíncrona:
 * `create` -> `uploadAudio` -> `startTranscription` -> `get` em loop.
 */
export const dailyReportApi = {
  // `childId` é argumento posicional, não objeto de filtros — é o que as
  // telas já passam.
  list: (token: string | null, childId: string): Promise<DailyReport[]> =>
    requestList<DailyReport>('get', token, '/api/daily-reports', undefined, { params: { childId } }),

  get: (token: string | null, id: string): Promise<DailyReport> =>
    requestData<DailyReport>('get', token, `/api/daily-reports/${id}`),

  create: (token: string | null, payload: CreateDailyReportPayload): Promise<CreateDailyReportResponse> =>
    requestData<CreateDailyReportResponse>('post', token, '/api/daily-reports', payload),

  startTranscription: (token: string | null, id: string): Promise<DailyReport> =>
    requestData<DailyReport>('post', token, `/api/daily-reports/${id}/transcribe`),

  /**
   * Corrige a transcrição de um relato `ready` (nome, remédio ou termo que a
   * transcrição automática errou). O backend reestrutura via IA a partir do
   * texto novo, então o relato devolvido pode trazer `structured` atualizado
   * (ou `null`, se a reestruturação falhar) — nunca a versão antiga.
   */
  updateTranscript: (token: string | null, id: string, transcript: string): Promise<DailyReport> =>
    requestData<DailyReport>('patch', token, `/api/daily-reports/${id}`, { transcript }),

  getAudioUrl: (token: string | null, id: string): Promise<{ url: string }> =>
    requestData<{ url: string }>('get', token, `/api/daily-reports/${id}/audio`),

  remove: (token: string | null, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/daily-reports/${id}`),

  uploadAudio: putPresignedBlob,
};

// ─── Terapia ────────────────────────────────────────────────────────

export interface SessionQueryParams {
  childId?: string;
  therapyType?: TherapyType;
  therapistId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const sessionResource = createPagedResourceApi<
  TherapySession, CreateSessionPayload, Partial<CreateSessionPayload>, SessionQueryParams, TherapySessionSummary
>({ basePath: '/api/therapy/sessions' });

export const therapyApi = {
  getSessions: sessionResource.list,
  getSession: sessionResource.get,
  createSession: sessionResource.create,
  updateSession: sessionResource.update,
  deleteSession: sessionResource.delete,
};

const therapistResource = createResourceApi<Therapist, CreateTherapistPayload, Partial<CreateTherapistPayload>>({
  basePath: '/api/therapy/therapists',
});

export const therapistApi = {
  list: therapistResource.list,
  getById: therapistResource.get,
  create: therapistResource.create,
  update: therapistResource.update,
  delete: therapistResource.delete,
};

// ─── Saúde ──────────────────────────────────────────────────────────

export const medicationApi = createResourceApi<
  Medication, CreateMedicationPayload, UpdateMedicationPayload, MedicationQueryParams
>({ basePath: '/api/medical/medications' });

export const comorbidityApi = createResourceApi<
  Comorbidity, CreateComorbidityPayload, UpdateComorbidityPayload, { childId?: string }
>({ basePath: '/api/medical/comorbidities' });

export const appointmentApi = createPagedResourceApi<
  MedicalAppointment, CreateAppointmentPayload, UpdateAppointmentPayload, AppointmentQueryParams, MedicalAppointmentSummary
>({ basePath: '/api/medical/appointments' });

// ─── Desenvolvimento ────────────────────────────────────────────────

export const milestoneApi = createResourceApi<
  DevelopmentalMilestone, CreateMilestonePayload, UpdateMilestonePayload, MilestoneQueryParams
>({ basePath: '/api/development/milestones' });

export const communicationLogApi = createPagedResourceApi<
  CommunicationLog, CreateCommunicationLogPayload, UpdateCommunicationLogPayload,
  CommunicationLogQueryParams, CommunicationLogSummary
>({ basePath: '/api/development/logs' });

// ─── Educação ───────────────────────────────────────────────────────

export const educationPlanApi = createResourceApi<
  EducationPlan, CreateEducationPlanPayload, UpdateEducationPlanPayload, EducationPlanQueryParams
>({ basePath: '/api/education/plans' });

export const schoolCommApi = createPagedResourceApi<
  SchoolCommunication, CreateSchoolCommPayload, UpdateSchoolCommPayload,
  SchoolCommQueryParams, SchoolCommunicationSummary
>({ basePath: '/api/education/comms' });

// ─── Relatório consolidado e compartilhamento por link ──────────────

export const consolidatedReportApi = {
  getSummary: (token: string | null, childId: string, periodDays = 90, signal?: AbortSignal): Promise<ConsolidatedSummary> =>
    requestData<ConsolidatedSummary>('get', token, '/api/consolidated/summary', undefined, {
      params: { childId, periodDays },
      signal,
    }),

  createShare: (token: string | null, payload: CreateSharePayload): Promise<CreateShareResponse> =>
    requestData<CreateShareResponse>('post', token, '/api/consolidated/shares', payload),

  listShares: (token: string | null, childId: string): Promise<{ shares: ReportShare[] }> =>
    requestData<{ shares: ReportShare[] }>('get', token, '/api/consolidated/shares', undefined, { params: { childId } }),

  // O token de UM compartilhamento, no clique de copiar. A listagem não os
  // traz mais; ver o comentário em `ReportShare.token`.
  revealShareToken: async (token: string | null, id: string): Promise<string> =>
    (await requestData<{ token: string }>('get', token, `/api/consolidated/shares/${id}/token`)).token,

  deleteShare: (token: string | null, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/consolidated/shares/${id}`),

  // Public endpoint — intentionally omits Authorization header.
  getShared: (shareToken: string): Promise<ConsolidatedSummary> =>
    publicRequestData<ConsolidatedSummary>(`/api/consolidated/shared/${shareToken}`),
};

// ─── Professionals (owner-side directory) ──────────────────────────
// Token por último, como em `childApi` — ordem preservada das telas.
export const professionalApi = {
  list: (token: string | null): Promise<Professional[]> =>
    requestList<Professional>('get', token, '/api/professionals'),

  get: (id: string, token: string | null): Promise<Professional> =>
    requestData<Professional>('get', token, `/api/professionals/${id}`),

  // A criação é a ÚNICA resposta que traz o token do convite; a listagem
  // devolve `toListView()`, que não o inclui.
  create: (payload: ProfessionalPayload, token: string | null): Promise<Professional> =>
    requestData<Professional>('post', token, '/api/professionals', payload),

  update: (id: string, payload: Partial<ProfessionalPayload>, token: string | null): Promise<Professional> =>
    requestData<Professional>('put', token, `/api/professionals/${id}`, payload),

  remove: (id: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/professionals/${id}`),

  // Gera um token novo e invalida o anterior — mesma regra da criação: é
  // aqui, e só aqui, que a tela consegue mostrá-lo.
  rotateToken: (id: string, token: string | null): Promise<Professional> =>
    requestData<Professional>('post', token, `/api/professionals/${id}/rotate-token`),

  myIdentities: (token: string | null): Promise<AcceptedIdentity[]> =>
    requestList<AcceptedIdentity>('get', token, '/api/professionals/me/identities'),

  acceptInvite: (inviteToken: string, token: string | null): Promise<Professional> =>
    requestData<Professional>('post', token, '/api/professional-invites/accept', { token: inviteToken }),
};

// ─── Per-resource sharing ─────────────────────────────────────────
export const anamneseSharesApi = {
  list: (anamneseId: string, token: string | null): Promise<ResourceShare[]> =>
    requestList<ResourceShare>('get', token, `/api/anamneses/${anamneseId}/shares`),

  grant: (anamneseId: string, professionalId: string, token: string | null): Promise<ResourceShare> =>
    requestData<ResourceShare>('post', token, `/api/anamneses/${anamneseId}/shares`, { professionalId }),

  revoke: (anamneseId: string, professionalId: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/anamneses/${anamneseId}/shares/${professionalId}`),
};

export const assessmentSharesApi = {
  list: (assessmentId: string, token: string | null): Promise<ResourceShare[]> =>
    requestList<ResourceShare>('get', token, `/api/assessments/${assessmentId}/shares`),

  grant: (assessmentId: string, professionalId: string, token: string | null): Promise<ResourceShare> =>
    requestData<ResourceShare>('post', token, `/api/assessments/${assessmentId}/shares`, { professionalId }),

  revoke: (assessmentId: string, professionalId: string, token: string | null): Promise<void> =>
    requestVoid('delete', token, `/api/assessments/${assessmentId}/shares/${professionalId}`),
};

// ─── Professional read-only access (records shared with me) ──────────
export const sharedApi = {
  listAnamneses: (token: string | null): Promise<SharedAnamneseSummary[]> =>
    requestList<SharedAnamneseSummary>('get', token, '/api/shared/anamneses'),

  // Legado: a tela abre o payload por conta própria (ver `LegacyPayload`).
  getAnamnese: (id: string, token: string | null): Promise<LegacyPayload> =>
    requestData<LegacyPayload>('get', token, `/api/shared/anamneses/${id}`),

  listAssessments: (token: string | null): Promise<SharedAssessmentSummary[]> =>
    requestList<SharedAssessmentSummary>('get', token, '/api/shared/assessments'),

  getAssessment: (id: string, token: string | null): Promise<LegacyPayload> =>
    requestData<LegacyPayload>('get', token, `/api/shared/assessments/${id}`),
};

// ─── Behavior (ABC) insights ────────────────────────────────────────

/**
 * O painel tolera um resumo incompleto: o backend pode não ter nada no
 * período, e `recent` já se chamou `recentOccurrences`. Cada campo ganha um
 * default aqui para a tela nunca ter de checar.
 */
type RawBehaviorInsights = Partial<BehaviorInsights> & { recentOccurrences?: BehaviorOccurrence[] };

export const behaviorInsightsApi = {
  get: async (token: string | null, childId: string, days = 30): Promise<BehaviorInsights> => {
    const raw = (await requestData<RawBehaviorInsights | null>(
      'get', token, '/api/logs/insights/behavior', undefined, { params: { childId, days } },
    )) ?? {};
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

const reminderResource = createResourceApi<
  Reminder, CreateReminderPayload, UpdateReminderPayload, { childId?: string }
>({ basePath: '/api/reminders' });

export const reminderApi = {
  // Rota irmã, fora do CRUD: mistura lembretes reais com os derivados de
  // outros domínios, e por isso passa pelo mapeamento acima.
  getUpcoming: async (token: string | null, childId: string, days = 14): Promise<UpcomingReminder[]> => {
    const raw = await requestList<RawUpcomingReminderItem>(
      'get', token, '/api/reminders/upcoming', undefined, { params: { childId, days } },
    );
    return raw.map(toUpcomingReminder);
  },

  list: reminderResource.list,
  create: reminderResource.create,
  update: reminderResource.update,
  delete: reminderResource.delete,
};

// ─── Reminder e-mail delivery preferences ────────────────────────────

export const notificationApi = {
  getPreferences: (token: string | null): Promise<NotificationPreferences> =>
    requestData<NotificationPreferences>('get', token, '/api/notifications/preferences'),

  updatePreferences: (
    token: string | null,
    payload: UpdateNotificationPreferencesPayload,
  ): Promise<NotificationPreferences> =>
    requestData<NotificationPreferences>('patch', token, '/api/notifications/preferences', payload),

  getPushPublicKey: async (token: string | null): Promise<string> =>
    (await requestData<{ publicKey: string }>('get', token, '/api/notifications/push-subscriptions/public-key')).publicKey,

  subscribeToPush: (token: string | null, subscription: PushSubscriptionPayload): Promise<void> =>
    requestVoid('post', token, '/api/notifications/push-subscriptions', subscription),

  // A inscrição é identificada pelo endpoint, que vai no CORPO do DELETE.
  unsubscribeFromPush: (token: string | null, endpoint: string): Promise<void> =>
    requestVoid('delete', token, '/api/notifications/push-subscriptions', { endpoint }),
};

// ─── Therapeutic goals / PEI with progress tracking ─────────────────

export const goalApi = createResourceApi<Goal, CreateGoalPayload, UpdateGoalPayload, GoalQueryParams>({
  basePath: '/api/goals',
});

// Sub-recurso da meta: o caminho depende do `goalId`, então não é uma base fixa.
export const goalProgressApi = {
  list: (token: string | null, goalId: string): Promise<GoalProgressEntry[]> =>
    requestList<GoalProgressEntry>('get', token, `/api/goals/${goalId}/progress`),

  create: (token: string | null, goalId: string, payload: CreateGoalProgressPayload): Promise<GoalProgressEntry> =>
    requestData<GoalProgressEntry>('post', token, `/api/goals/${goalId}/progress`, payload),

  summary: (token: string | null, goalId: string): Promise<GoalProgressSummary> =>
    requestData<GoalProgressSummary>('get', token, `/api/goals/${goalId}/progress/summary`),
};

// ─── Documents (S3 presigned upload/download) ───────────────────────

const documentResource = createResourceApi<
  DocumentRecord, never, UpdateDocumentPayload,
  { childId?: string; resourceType?: string; resourceId?: string }
>({ basePath: '/api/documents' });

export const documentApi = {
  list: documentResource.list,
  update: documentResource.update,
  delete: documentResource.delete,

  // A criação não é um POST no recurso: o backend devolve uma URL pré-assinada
  // e o arquivo sobe direto para o S3, sem passar pelo servidor.
  createUploadUrl: (token: string | null, payload: CreateUploadUrlPayload): Promise<CreateUploadUrlResponse> =>
    requestData<CreateUploadUrlResponse>('post', token, '/api/documents/upload-url', payload),

  getDownloadUrl: (token: string | null, id: string): Promise<DownloadUrlResponse> =>
    requestData<DownloadUrlResponse>('get', token, `/api/documents/${id}/download-url`),

  /** Uploads the raw file bytes directly to the presigned S3 URL (no auth header — the URL itself is the credential). */
  uploadToPresignedUrl: putPresignedFile,
};

// ─── Whole-child domain sharing with professionals ──────────────────

export const childSharesApi = {
  list: (token: string | null, childId: string): Promise<ChildShare[]> =>
    requestList<ChildShare>('get', token, `/api/children/${childId}/shares`),

  grant: (token: string | null, childId: string, payload: GrantChildSharePayload): Promise<ChildShare> =>
    requestData<ChildShare>('post', token, `/api/children/${childId}/shares`, payload),

  revoke: (token: string | null, childId: string, professionalId: string): Promise<void> =>
    requestVoid('delete', token, `/api/children/${childId}/shares/${professionalId}`),
};

export const sharedChildrenApi = {
  list: (token: string | null): Promise<SharedChildSummary[]> =>
    requestList<SharedChildSummary>('get', token, '/api/shared/children'),

  getAssessments: (token: string | null, childId: string): Promise<ConsolidatedAssessments> =>
    requestData<ConsolidatedAssessments>('get', token, `/api/shared/children/${childId}/assessments`),

  getDailyLogs: (token: string | null, childId: string): Promise<ConsolidatedLogs> =>
    requestData<ConsolidatedLogs>('get', token, `/api/shared/children/${childId}/daily-logs`),

  getTherapy: (token: string | null, childId: string): Promise<ConsolidatedTherapy> =>
    requestData<ConsolidatedTherapy>('get', token, `/api/shared/children/${childId}/therapy`),

  getMedical: (token: string | null, childId: string): Promise<ConsolidatedMedical> =>
    requestData<ConsolidatedMedical>('get', token, `/api/shared/children/${childId}/medical`),

  getDevelopment: (token: string | null, childId: string): Promise<ConsolidatedDevelopment> =>
    requestData<ConsolidatedDevelopment>('get', token, `/api/shared/children/${childId}/development`),
};

// ─── AI summaries history + Q&A chat (SP-13) ────────────────────────

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

/**
 * Fora do núcleo por um motivo só: estas rotas têm cota, e a cota vive nos
 * HEADERS da resposta — que `requestEnvelope` descarta ao devolver o corpo.
 * A tela precisa dos dois, inclusive no 429, onde não há corpo útil nenhum.
 */
async function aiRequest<T>(
  method: 'get' | 'post',
  token: string | null,
  url: string,
  data?: unknown,
  params?: unknown,
): Promise<{ data: T; rateLimit: AIRateLimitInfo }> {
  const authHeaders = getAuthHeaders(token);
  try {
    const response = method === 'get'
      ? await api.get<ApiEnvelope<T>>(url, { headers: authHeaders, params })
      : await api.post<ApiEnvelope<T>>(url, data, { headers: authHeaders });
    return { data: response.data.data as T, rateLimit: parseRateLimitInfo(response.headers as Record<string, unknown>) };
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

/**
 * A pauta vem de um modelo, e não de um schema: os nomes dos campos variam
 * entre gerações (`whatChanged` / `changesSinceLastVisit` / `changes`), e às
 * vezes vem aninhada em `brief`. Tudo opcional, e a normalização abaixo é
 * que produz o `ConsultationBrief` que a tela conhece.
 */
interface RawConsultationBrief {
  brief?: RawConsultationBrief;
  whatChanged?: string;
  changesSinceLastVisit?: string;
  changes?: string;
  currentTreatments?: string;
  medications?: string;
  treatments?: string;
  suggestedQuestions?: string[] | string;
  questions?: string[] | string;
}

export const consultationBriefApi = {
  generate: async (token: string | null, payload: GenerateConsultationBriefPayload): Promise<{ brief: ConsultationBrief; rateLimit: AIRateLimitInfo }> => {
    const { data, rateLimit } = await aiRequest<RawConsultationBrief>('post', token, '/api/consolidated/consultation-brief', payload);
    const raw: RawConsultationBrief = data?.brief ?? data ?? {};
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

export const caregiverApi = {
  list: (token: string | null, childId: string): Promise<Caregiver[]> =>
    requestList<Caregiver>('get', token, `/api/children/${childId}/caregivers`),

  // O convite é a ÚNICA resposta que traz o token; a listagem devolve
  // `toListView()`, sem ele. Quem chama tem de mostrar o link agora.
  invite: (token: string | null, childId: string, payload: CreateCaregiverPayload): Promise<Caregiver> =>
    requestData<Caregiver>('post', token, `/api/children/${childId}/caregivers`, payload),

  revoke: (token: string | null, childId: string, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/children/${childId}/caregivers/${id}`),

  acceptInvite: (token: string | null, inviteToken: string): Promise<AcceptCaregiverInviteResponse> =>
    requestData<AcceptCaregiverInviteResponse>('post', token, '/api/caregiver-invites/accept', { token: inviteToken }),
};

// ─── Care team: professionals granted read-write access to one child ────
// (phase 1 — see /workspace/sensory-profile-backend/CONTRACT.md). Distinct
// from `caregiverApi` above: a care-team grant is per-child, addressed to a
// role (fonoaudióloga, psicóloga, ...), and the accept/list/my-children
// split across two route prefixes because a professional accepting an
// invite or opening their caseload has no childId in hand yet.

export const clinicApi = {
  create: (token: string | null, name: string): Promise<Clinic> =>
    requestData<Clinic>('post', token, '/api/clinics', { name }),

  // As clínicas de que EU faço parte, com o meu papel em cada uma.
  listMine: (token: string | null): Promise<ClinicMembership[]> =>
    requestList<ClinicMembership>('get', token, '/api/clinics/mine'),

  // O quadro. Cada linha traz `caseloadSize` — um número. Quais crianças cada
  // profissional atende continua sendo entre ele e o responsável.
  roster: (token: string | null, clinicId: string): Promise<ClinicRosterMember[]> =>
    requestList<ClinicRosterMember>('get', token, `/api/clinics/${clinicId}/members`),

  // Devolve `invitationToken` — a ÚNICA resposta da API que o traz. A tela que
  // chama isto tem de mostrar o link agora; o quadro nunca mais o devolve.
  invite: (
    token: string | null,
    clinicId: string,
    payload: { memberName: string; role: ClinicRole },
  ): Promise<CreateClinicMemberResponse> =>
    requestData<CreateClinicMemberResponse>('post', token, `/api/clinics/${clinicId}/members`, payload),

  // Saída soft no backend: a linha fica, com `revokedAt` preenchido.
  removeMember: (token: string | null, clinicId: string, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/clinics/${clinicId}/members/${id}`),

  acceptInvite: (token: string | null, inviteToken: string): Promise<{ clinicId: string; role: ClinicRole }> =>
    requestData<{ id: string; clinicId: string; role: ClinicRole }>(
      'post', token, '/api/clinics/accept', { token: inviteToken },
    ),
};

export const careTeamApi = {
  list: (token: string | null, childId: string): Promise<CareTeamMember[]> =>
    requestList<CareTeamMember>('get', token, `/api/children/${childId}/care-team`),

  // Devolve `invitationToken` — a ÚNICA resposta da API que o traz. A tela
  // que chama isto é responsável por mostrar o link agora, porque um
  // refresh da lista nunca mais vai trazê-lo de volta.
  invite: (
    token: string | null,
    childId: string,
    payload: CreateCareTeamMemberPayload,
  ): Promise<CreateCareTeamMemberResponse> =>
    requestData<CreateCareTeamMemberResponse>('post', token, `/api/children/${childId}/care-team`, payload),

  // Revogação SOFT no backend (a linha fica, com revokedAt preenchido) —
  // devolve só uma mensagem, sem `data`.
  revoke: (token: string | null, childId: string, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/children/${childId}/care-team/${id}`),

  acceptInvite: (token: string | null, inviteToken: string): Promise<AcceptCareTeamInvitationResponse> =>
    requestData<AcceptCareTeamInvitationResponse>('post', token, '/api/care-team/accept', { token: inviteToken }),

  // O caseload do profissional: as crianças com participação aceita e não
  // revogada, em qualquer família. Endpoint irmão de `list` mas fora do
  // prefixo `/children/:childId` — quem chama ainda não tem criança na mão.
  myChildren: (token: string | null): Promise<CareTeamCaseloadEntry[]> =>
    requestList<CareTeamCaseloadEntry>('get', token, '/api/care-team/my-children'),
};

// ─── Professional notes on shared children + owner access audit (SP-20) ──

// Professional-side: my own notes on a child shared with me.
export const sharedNotesApi = {
  list: (token: string | null, childId: string): Promise<ProfessionalNote[]> =>
    requestList<ProfessionalNote>('get', token, `/api/shared/children/${childId}/notes`),

  create: (token: string | null, childId: string, payload: CreateProfessionalNotePayload): Promise<ProfessionalNote> =>
    requestData<ProfessionalNote>('post', token, `/api/shared/children/${childId}/notes`, payload),

  // Alterar e apagar saem do prefixo da criança: a nota é minha, e o backend
  // a encontra pelo id.
  update: (token: string | null, id: string, payload: UpdateProfessionalNotePayload): Promise<ProfessionalNote> =>
    requestData<ProfessionalNote>('patch', token, `/api/shared/notes/${id}`, payload),

  delete: (token: string | null, id: string): Promise<void> =>
    requestVoid('delete', token, `/api/shared/notes/${id}`),
};

// Owner-side: read-only view of every professional's notes on my child.
export const childNotesApi = {
  list: (token: string | null, childId: string): Promise<ProfessionalNote[]> =>
    requestList<ProfessionalNote>('get', token, `/api/children/${childId}/notes`),
};

// Owner-side: paginated data-access audit trail for my child.
export const accessLogApi = {
  list: (token: string | null, childId: string, params?: AccessLogQueryParams): Promise<PaginatedAccessLogs> =>
    requestPage<AccessLogEntry>('get', token, `/api/children/${childId}/access-logs`, undefined, { params }),
};

// Owner-side: full data export (LGPD, direito à portabilidade dos dados).
export const dataExportApi = {
  request: (token: string | null, childId: string): Promise<DataExportResponse> =>
    requestData<DataExportResponse>('get', token, `/api/children/${childId}/export`),
};

// Free-text search across children, daily logs, and documents.
export const searchApi = {
  search: (token: string | null, query: string, signal?: AbortSignal): Promise<SearchResults> =>
    requestData<SearchResults>('get', token, '/api/search', undefined, { params: { q: query }, signal }),
};

// Account-wide equivalents (LGPD Art. 18): everything the account owns —
// every child, not just one — plus anamneses, professionals and drafts,
// which aren't linked to a specific child. Never resolves through
// delegated caregiver access on the backend, regardless of headers sent.
export const accountApi = {
  exportAll: (token: string | null): Promise<DataExportResponse> =>
    requestData<DataExportResponse>('get', token, '/api/account/export'),

  eraseAccount: (token: string | null): Promise<AccountErasureResult> =>
    requestData<AccountErasureResult>('delete', token, '/api/account'),
};

export default api;
