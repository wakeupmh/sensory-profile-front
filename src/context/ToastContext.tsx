import React, { Suspense, createContext, lazy, useCallback, useContext, useMemo, useRef, useState } from 'react';

// A parte visual (Radix Toast e ícones) só baixa no primeiro toast: nenhuma
// página pública mostra um, e ela pesava no primeiro carregamento de "/".
const ToastRegion = lazy(() => import('../components/ToastRegion'));

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return api;
}

/**
 * Sistema de toasts do app, sobre o @radix-ui/react-toast: região aria-live,
 * pausa no hover/foco, dispensa por swipe e atalho F8 vêm do primitivo.
 * Erros usam type="foreground" (anunciados imediatamente); sucessos/infos
 * usam "background".
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Uma vez montada, a região fica: o Viewport precisa existir para a saída
  // animada do último toast.
  const [regionMounted, setRegionMounted] = useState(false);
  const idRef = useRef(0);

  const push = useCallback((kind: ToastKind, title: string, description?: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, kind, title, description }]);
    setRegionMounted(true);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push('success', title, description),
      error: (title, description) => push('error', title, description),
      info: (title, description) => push('info', title, description),
    }),
    [push],
  );

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {regionMounted && (
        <Suspense fallback={null}>
          <ToastRegion toasts={toasts} onDismiss={remove} />
        </Suspense>
      )}
    </ToastContext.Provider>
  );
};
