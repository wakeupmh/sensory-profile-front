import type { CreateLogPayload } from '../types/logs';

/**
 * O contexto em que o registro foi feito: só é reenviado nesse mesmo contexto.
 * Enviado por outra conta, ou fora do modo cuidador, o servidor o recusa (a
 * criança não é de quem chama) — e a fila travava para sempre nesse registro.
 */
export interface QueueOwner {
  userId: string;
  delegateChildId: string | null;
}

export interface QueuedLog extends Partial<QueueOwner> {
  id: string;
  payload: CreateLogPayload;
  queuedAt: string;
}

const STORAGE_KEY = 'offline-log-queue';
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((cb) => cb());
}

function read(): QueuedLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedLog[]) : [];
  } catch {
    return [];
  }
}

function write(entries: QueuedLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  notify();
}

export function getQueuedLogs(): QueuedLog[] {
  return read();
}

export function queueLog(payload: CreateLogPayload, owner?: QueueOwner): QueuedLog {
  const entry: QueuedLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    payload,
    queuedAt: new Date().toISOString(),
    ...owner,
  };
  write([...read(), entry]);
  return entry;
}

export function removeQueuedLog(id: string): void {
  write(read().filter((entry) => entry.id !== id));
}

/** Notifica quando a fila muda (criação, remoção) para a UI reagir. */
export function subscribeToLogQueue(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Um erro de rede real (offline, DNS falhou, servidor inacessível) chega ao
 * axios sem `error.response` — existe `error.request` mas nenhuma resposta
 * do servidor. Erros de validação/negócio (400, 409, etc.) SEMPRE têm
 * `response` e não devem ser tratados como "estou offline".
 */
export function isNetworkError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { request?: unknown; response?: unknown };
  return !!e.request && !e.response;
}

/** Registros gravados antes de existir o dono valem para quem estiver logado. */
export function belongsTo(entry: QueuedLog, owner: QueueOwner): boolean {
  return (entry.userId ?? owner.userId) === owner.userId
    && (entry.delegateChildId ?? null) === owner.delegateChildId;
}

/**
 * O servidor respondeu e recusou de vez (400, 403, 404, 409, 422...): reenviar
 * não muda a resposta. 401, 408 e 429 passam com o tempo, como os 5xx.
 */
export function isPermanentRejection(err: unknown): boolean {
  const status = (err as { response?: { status?: number } } | null)?.response?.status;
  return status !== undefined && status >= 400 && status < 500 && ![401, 408, 429].includes(status);
}

/** Apaga a fila inteira (ao sair da conta: registros de saúde não ficam no aparelho). */
export function clearLogQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // armazenamento indisponível: não há o que apagar
  }
  notify();
}
