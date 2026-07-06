import type { CreateLogPayload } from '../types/logs';

export interface QueuedLog {
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

export function queueLog(payload: CreateLogPayload): QueuedLog {
  const entry: QueuedLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    payload,
    queuedAt: new Date().toISOString(),
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
