import { useCallback, useEffect, useRef, useState } from 'react';
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
  // Guarda em ref: o listener de "online" é registrado uma única vez e enxergava
  // sempre `syncing === false`, então dois envios simultâneos criavam o mesmo
  // registro duas vezes no servidor.
  const syncingRef = useRef(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => subscribeToLogQueue(() => setQueue(getQueuedLogs())), []);

  const flush = useCallback(async () => {
    if (syncingRef.current) return;
    const pending = getQueuedLogs();
    if (pending.length === 0) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const token = await getTokenRef.current();
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

  return { queuedCount: queue.length, syncing, flush };
}
