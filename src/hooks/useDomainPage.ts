import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { childApi, type ChildData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

/**
 * Chave por usuário, como os rascunhos em Home.tsx (`draft:...:${userId}`).
 *
 * Uma chave global seria mais simples, mas `effectiveChildId` passa a valer
 * antes de a lista de crianças chegar — então, num aparelho compartilhado, a
 * sessão recém-logada dispararia buscas com o id da criança do usuário
 * anterior. O servidor recusa (as consultas são escopadas por usuário), então
 * não vaza dado; o que aparece é um erro na tela até a validação limpar a
 * sobra. Guardar por usuário elimina a situação em vez de remediá-la.
 */
export function selectedChildStorageKey(userId: string): string {
  return `sensory-profile-selected-child:${userId}`;
}

function readPersistedChildId(userId: string): string | null {
  try {
    return localStorage.getItem(selectedChildStorageKey(userId));
  } catch {
    return null;
  }
}

function persistChildId(userId: string, childId: string): void {
  try {
    localStorage.setItem(selectedChildStorageKey(userId), childId);
  } catch {
    // localStorage indisponível (modo privado, cota excedida) — a seleção
    // continua funcionando em memória para a página atual.
  }
}

export function useDomainPage() {
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [children, setChildren] = useState<ChildData[]>([]);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const urlChildId = searchParams.get('childId');

  const userId = session?.user?.id ?? null;

  // Um ?childId= explícito na URL (link direto) vence a seleção persistida.
  const [selectedChildId, setSelectedChildIdState] = useState<string>(() => urlChildId ?? '');
  const hydratedForUser = useRef<string | null>(null);

  const setSelectedChildId = useCallback(
    (childId: string) => {
      setSelectedChildIdState(childId);
      if (userId) persistChildId(userId, childId);
    },
    [userId],
  );

  // A sessão do Supabase carrega de forma assíncrona, então a seleção
  // guardada só pode ser lida depois que se sabe DE QUEM ela é. Uma vez por
  // usuário: reidratar de novo sobrescreveria uma escolha feita nesta sessão.
  useEffect(() => {
    if (!userId || hydratedForUser.current === userId) return;
    hydratedForUser.current = userId;
    if (urlChildId !== null) return;
    const persisted = readPersistedChildId(userId);
    if (persisted !== null) setSelectedChildIdState(persisted);
  }, [userId, urlChildId]);

  // Cobre navegação que só troca a query string sem remontar a página
  // (ex.: botão voltar do navegador) — o link direto continua vencendo.
  useEffect(() => {
    if (urlChildId !== null) {
      setSelectedChildId(urlChildId);
    }
  }, [urlChildId, setSelectedChildId]);

  const fetchChildren = useCallback(async () => {
    try {
      const token = await getTokenRef.current();
      if (!token) return;
      const list = await childApi.list(token);
      setChildren(list);
      setChildrenLoaded(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        window.location.href = '/sign-in';
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && session) {
      fetchChildren();
    }
  }, [fetchChildren, isLoaded, session]);

  // A criança selecionada (persistida ou vinda da URL) pode não pertencer
  // mais a esta conta — foi excluída, ou é sobra de outro usuário no mesmo
  // aparelho. Só depois que a lista real chega do servidor é que dá para
  // saber isso; se não for encontrada, descarta em vez de deixar
  // `effectiveChildId` apontar para uma criança inexistente.
  useEffect(() => {
    if (!childrenLoaded) return;
    if (selectedChildId && !children.some((c) => c.id === selectedChildId)) {
      setSelectedChildId('');
    }
  }, [childrenLoaded, children, selectedChildId, setSelectedChildId]);

  const effectiveChildId = selectedChildId || (children.length > 0 ? children[0].id : '');

  return { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef };
}
