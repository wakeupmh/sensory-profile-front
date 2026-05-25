import React from 'react';
import { Button } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'on-color' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GumroadButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  className?: string;
  asChild?: boolean;
}

const sizeMap: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', height: '36px', fontSize: '13px' },
  md: { padding: '12px 24px', height: '44px', fontSize: typography.button.size },
  lg: { padding: '14px 32px', height: '52px', fontSize: '16px' },
};

const variantMap: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.ink,
    color: colors.surface,
    border: `2px solid ${colors.ink}`,
  },
  secondary: {
    backgroundColor: colors.canvas,
    color: colors.ink,
    border: `2px solid ${colors.ink}`,
  },
  'on-color': {
    backgroundColor: colors.surface,
    color: colors.ink,
    border: `2px solid ${colors.ink}`,
  },
  danger: {
    backgroundColor: colors['brand-salmon'],
    color: colors.ink,
    border: `2px solid ${colors.ink}`,
  },
};

const GumroadButton = React.forwardRef<HTMLButtonElement, GumroadButtonProps>(
  ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style, className, asChild }, ref) => {
    const baseStyle: React.CSSProperties = {
      ...variantMap[variant],
      ...sizeMap[size],
      borderRadius: radii.pill,
      boxShadow: disabled ? shadows.none : shadows.button,
      fontFamily: typography.button.font,
      fontWeight: typography.button.weight,
      lineHeight: typography.button.lh,
      letterSpacing: typography.button.ls,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      ...style,
    };

    return (
      <Button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`gumroad-btn${className ? ' ' + className : ''}`}
        asChild={asChild}
        style={baseStyle}
      >
        {children}
      </Button>
    );
  }
);

GumroadButton.displayName = 'GumroadButton';

export default GumroadButton;
