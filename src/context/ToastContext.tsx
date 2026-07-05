import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircledIcon, CrossCircledIcon, InfoCircledIcon, Cross2Icon } from '@radix-ui/react-icons';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
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

const KIND_ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircledIcon width={20} height={20} aria-hidden="true" />,
  error: <CrossCircledIcon width={20} height={20} aria-hidden="true" />,
  info: <InfoCircledIcon width={20} height={20} aria-hidden="true" />,
};

/**
 * Sistema de toasts do app, sobre o @radix-ui/react-toast: região aria-live,
 * pausa no hover/foco, dispensa por swipe e atalho F8 vêm do primitivo.
 * Erros usam type="foreground" (anunciados imediatamente); sucessos/infos
 * usam "background".
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: ToastKind, title: string, description?: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, kind, title, description }]);
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
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className="toast-root"
            data-kind={toast.kind}
            type={toast.kind === 'error' ? 'foreground' : 'background'}
            onOpenChange={(open) => {
              if (!open) remove(toast.id);
            }}
          >
            {KIND_ICONS[toast.kind]}
            <div className="toast-copy">
              <ToastPrimitive.Title className="toast-title">{toast.title}</ToastPrimitive.Title>
              {toast.description && (
                <ToastPrimitive.Description className="toast-description">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="toast-close" aria-label="Fechar notificação">
              <Cross2Icon width={14} height={14} aria-hidden="true" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="toast-viewport" label="Notificações" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};
