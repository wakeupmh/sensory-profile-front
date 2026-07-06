import { useCallback, useEffect, useState } from 'react';
import { logApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import {
  getQueuedLogs,
  removeQueuedLog,
  subscribeToLogQueue,
  type QueuedLog,
} from '../services/offlineLogQueue';

/**
 * Mantém a fila de registros criados offline sincronizada: tenta reenviar
 * ao montar e sempre que a conexão volta (evento "online"). Reenvia em
 * ordem, um de cada vez, e para na primeira falha para tentar de novo mais
 * tarde — evita descartar registros por causa de uma falha de rede parcial.
 */
export function useOfflineLogQueue() {
  const { getToken } = useAuthContext();
  const [queue, setQueue] = useState<QueuedLog[]>(() => getQueuedLogs());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => subscribeToLogQueue(() => setQueue(getQueuedLogs())), []);

  const flush = useCallback(async () => {
    if (syncing) return;
    const pending = getQueuedLogs();
    if (pending.length === 0) return;
    setSyncing(true);
    try {
      const token = await getToken();
      for (const entry of pending) {
        try {
          await logApi.createLog(token, entry.payload);
          removeQueuedLog(entry.id);
        } catch {
          // Para na primeira falha (provavelmente ainda offline); o que
          // restar tenta de novo na próxima reconexão ou montagem.
          break;
        }
      }
    } finally {
      setSyncing(false);
    }
  }, [getToken, syncing]);

  useEffect(() => {
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { queuedCount: queue.length, syncing, flush };
}
