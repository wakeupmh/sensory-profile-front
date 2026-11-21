import { useState, useEffect, useCallback, useRef } from 'react';
import i18n from 'i18next';

type PanelView = 'list' | 'add' | 'edit';

interface UsePanelCrudOptions<T> {
  isOpen: boolean;
  /** Aceito por compatibilidade; o fechamento (Escape/backdrop) é do GumroadModal */
  onClose?: () => void;
  /** When provided, triggers refetch on isOpen/childId change */
  childId?: string;
  /** Async function to fetch items. If omitted, items must be set externally via setItems or passed as props. */
  fetchFn?: () => Promise<T[]>;
  /** Extra reset logic when panel closes (e.g. clear pagination state) */
  onReset?: () => void;
}

/**
 * Shared hook for panel CRUD components.
 *
 * @typeParam T - list item type (must have `id: string`)
 * @typeParam E - editing item type (defaults to T). Use when the edit form
 *               needs a richer object than the list summary (e.g. CommunicationLog
 *               vs CommunicationLogSummary).
 */
export function usePanelCrud<
  T extends { id: string },
  E extends { id: string } = T,
>({
  isOpen,
  childId,
  fetchFn,
  onReset,
}: UsePanelCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [editingItem, setEditingItem] = useState<E | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<PanelView>('list');

  // Só a busca mais recente escreve: reabrir o painel para outra criança com
  // a busca anterior em voo não mostra a lista da criança anterior.
  const latestFetch = useRef(0);
  const fetchItems = useCallback(async () => {
    if (!fetchFn) return;
    const mine = ++latestFetch.current;
    try {
      setError(null);
      const data = await fetchFn();
      if (mine === latestFetch.current) setItems(data);
    } catch {
      if (mine === latestFetch.current) setError(i18n.t('p1Hooks.loadError'));
    }
  }, [fetchFn]);

  // Reset state when panel closes; fetch when it opens
  useEffect(() => {
    if (!isOpen) {
      latestFetch.current++;
      // Fechado, não segura a lista: ao reabrir para outra criança ela não
      // aparece por um instante (ou para sempre, se a busca falhar).
      if (fetchFn) setItems([]);
      setView('list');
      setEditingItem(null);
      setDeletingId(null);
      setError(null);
      onReset?.();
      return;
    }
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, childId, fetchItems]);

  const startEdit = useCallback((item: E) => {
    setEditingItem(item);
    setView('edit');
  }, []);

  const handleSaved = useCallback(async () => {
    setView('list');
    setEditingItem(null);
    await fetchItems();
  }, [fetchItems]);

  return {
    items,
    setItems,
    editingItem,
    setEditingItem,
    deletingId,
    setDeletingId,
    isLoading,
    setIsLoading,
    error,
    setError,
    view,
    setView,
    fetchItems,
    startEdit,
    handleSaved,
  };
}
