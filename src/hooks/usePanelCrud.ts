import { useState, useEffect, useCallback } from 'react';

type PanelView = 'list' | 'add' | 'edit';

interface UsePanelCrudOptions<T> {
  isOpen: boolean;
  onClose: () => void;
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
  onClose,
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

  const fetchItems = useCallback(async () => {
    if (!fetchFn) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFn();
      setItems(data);
    } catch {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  // Reset state when panel closes; fetch when it opens
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingItem(null);
      setDeletingId(null);
      onReset?.();
      return;
    }
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, childId, fetchItems]);

  // Escape key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
