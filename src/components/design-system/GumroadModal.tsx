import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Theme, Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, spacing, zIndex, applyTypography } from '../../theme/tokens';

export interface GumroadModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  /** 'sheet' desliza do rodapé (padrão); 'center' centraliza na tela */
  variant?: 'sheet' | 'center';
  maxWidth?: string;
  /** Bloqueia fechar (Escape / clique fora / botão) enquanto salva */
  closeDisabled?: boolean;
  hideClose?: boolean;
  style?: React.CSSProperties;
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: shadows.button,
  flexShrink: 0,
};

/**
 * Modal acessível padrão do design system, construído sobre o Radix Dialog:
 * role="dialog", aria-modal, título ligado via aria-labelledby, foco preso e
 * restaurado, Escape/clique-fora fecham, scroll da página travado, animações
 * de entrada e saída via .modal-overlay/.modal-sheet.
 */
const GumroadModal: React.FC<GumroadModalProps> = ({
  open,
  onClose,
  title,
  children,
  variant = 'sheet',
  maxWidth = '600px',
  closeDisabled = false,
  hideClose = false,
  style,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: zIndex.modal,
    display: 'flex',
    alignItems: variant === 'center' ? 'center' : 'flex-end',
    justifyContent: 'center',
    padding: variant === 'center' ? spacing.md : 0,
  };

  const contentStyle: React.CSSProperties =
    variant === 'center'
      ? {
          backgroundColor: colors.canvas,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.lg,
          boxShadow: shadows['card-hover'],
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: spacing.xl,
          ...style,
        }
      : {
          backgroundColor: colors.canvas,
          border: `2px solid ${colors.ink}`,
          borderBottom: 'none',
          borderRadius: `${radii.xl} ${radii.xl} 0 0`,
          boxShadow: shadows['card-hover'],
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: spacing.xl,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          ...style,
        };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !closeDisabled) onClose();
      }}
    >
      <Dialog.Portal>
        {/* O portal renderiza fora do escopo .radix-themes do app — o Theme
            aninhado garante que componentes Radix internos mantenham o estilo */}
        <Theme accentColor="teal" grayColor="sand" radius="large">
          <Dialog.Overlay className="modal-overlay" style={overlayStyle}>
            <Dialog.Content
              className="modal-sheet"
              style={contentStyle}
              aria-modal="true"
              aria-describedby={undefined}
              onEscapeKeyDown={(e) => {
                if (closeDisabled) e.preventDefault();
              }}
              onPointerDownOutside={(e) => {
                if (closeDisabled) e.preventDefault();
              }}
            >
              <Flex justify="between" align="center" mb="4" gap="3">
                <Dialog.Title
                  style={{ ...applyTypography('title-lg'), margin: 0, color: colors.ink }}
                >
                  {title}
                </Dialog.Title>
                {!hideClose && (
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Fechar"
                      disabled={closeDisabled}
                      style={closeButtonStyle}
                    >
                      <Cross2Icon width={16} height={16} />
                    </button>
                  </Dialog.Close>
                )}
              </Flex>
              {children}
            </Dialog.Content>
          </Dialog.Overlay>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GumroadModal;
