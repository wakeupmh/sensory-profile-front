import { useCallback, useEffect, useRef, useState } from 'react';
import { logApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { getDelegateChildId } from '../services/delegateChild';
import {
  belongsTo,
  getQueuedLogs,
  isPermanentRejection,
  queueLog,
  removeQueuedLog,
  subscribeToLogQueue,
  type QueuedLog,
} from '../services/offlineLogQueue';
import type { CreateLogPayload } from '../types/logs';

/**
 * Mantém a fila de registros criados offline sincronizada: tenta reenviar
 * ao montar e sempre que a conexão volta (evento "online"), em ordem, um de
 * cada vez, e só os feitos por esta conta neste mesmo modo (cuidador ou não).
 *
 * - Falha passageira (rede, 5xx, 401/408/429): para e tenta de novo depois.
 * - Recusa definitiva do servidor: descarta aquele registro, segue a fila e
 *   avisa por `onRejected` — antes um registro assim travava todos os outros.
 */
export function useOfflineLogQueue({ onRejected }: { onRejected?: (count: number) => void } = {}) {
  const { getToken, session } = useAuthContext();
  const userId = session?.user?.id ?? null;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const onRejectedRef = useRef(onRejected);
  onRejectedRef.current = onRejected;
  const [queue, setQueue] = useState<QueuedLog[]>(() => getQueuedLogs());
  const [syncing, setSyncing] = useState(false);
  // Guarda em ref: o listener de "online" é registrado uma única vez e enxergava
  // sempre `syncing === false`, então dois envios simultâneos criavam o mesmo
  // registro duas vezes no servidor.
  const syncingRef = useRef(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => subscribeToLogQueue(() => setQueue(getQueuedLogs())), []);

  const flush = useCallback(async () => {
    const currentUser = userIdRef.current;
    if (syncingRef.current || !currentUser) return;
    const owner = { userId: currentUser, delegateChildId: getDelegateChildId() };
    const pending = getQueuedLogs().filter((entry) => belongsTo(entry, owner));
    if (pending.length === 0) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const token = await getTokenRef.current();
      let rejected = 0;
      for (const entry of pending) {
        try {
          await logApi.createLog(token, entry.payload);
          removeQueuedLog(entry.id);
        } catch (err) {
          if (!isPermanentRejection(err)) break;
          removeQueuedLog(entry.id);
          rejected++;
        }
      }
      if (rejected > 0) onRejectedRef.current?.(rejected);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enqueue = useCallback((payload: CreateLogPayload): QueuedLog | null => {
    const currentUser = userIdRef.current;
    if (!currentUser) return null;
    return queueLog(payload, { userId: currentUser, delegateChildId: getDelegateChildId() });
  }, []);

  const pendingHere = userId
    ? queue.filter((entry) => belongsTo(entry, { userId, delegateChildId: getDelegateChildId() })).length
    : 0;

  return { queuedCount: pendingHere, syncing, flush, enqueue };
}
