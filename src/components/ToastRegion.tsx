import React from 'react';
import { useTranslation } from 'react-i18next';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircledIcon, CrossCircledIcon, InfoCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import type { ToastItem, ToastKind } from '../context/ToastContext';

const KIND_ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircledIcon width={20} height={20} aria-hidden="true" />,
  error: <CrossCircledIcon width={20} height={20} aria-hidden="true" />,
  info: <InfoCircledIcon width={20} height={20} aria-hidden="true" />,
};

export default function ToastRegion({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const { t } = useTranslation();
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          className="toast-root"
          data-kind={toast.kind}
          type={toast.kind === 'error' ? 'foreground' : 'background'}
          onOpenChange={(open) => {
            if (!open) onDismiss(toast.id);
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
          <ToastPrimitive.Close className="toast-close" aria-label={t('navExtra.toast.close')}>
            <Cross2Icon width={14} height={14} aria-hidden="true" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="toast-viewport" label={t('navExtra.toast.region')} />
    </ToastPrimitive.Provider>
  );
}
