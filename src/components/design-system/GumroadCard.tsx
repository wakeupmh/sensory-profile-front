import React from 'react';
import { Box } from '@radix-ui/themes';
import { colors, shadows, radii, spacing } from '../../theme/tokens';

type CardColor = 'cyan' | 'yellow' | 'salmon' | 'mint' | 'lavender' | 'peach' | 'cream' | 'white';
type CardShadow = 'md' | 'lg' | 'sm' | 'none';

interface GumroadCardProps {
  children: React.ReactNode;
  color?: CardColor;
  shadow?: CardShadow;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Papel ARIA opcional (ex.: "alert" para banners de erro) */
  role?: React.AriaRole;
}

const colorMap: Record<CardColor, string> = {
  cyan: colors['brand-cyan'],
  yellow: colors['brand-yellow'],
  salmon: colors['brand-salmon'],
  mint: colors['brand-mint'],
  lavender: colors['brand-lavender'],
  peach: colors['brand-peach'],
  cream: colors['surface-cream'],
  white: colors.surface,
};

const shadowMap: Record<CardShadow, string> = {
  md: shadows.card,
  lg: shadows['card-hover'],
  sm: shadows['card-sm'],
  none: shadows.none,
};

const paddingMap: Record<string, string> = {
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
  xl: spacing.xxl,
};

const GumroadCard = React.forwardRef<HTMLDivElement, GumroadCardProps>(
  ({ children, color = 'white', shadow = 'md', padding = 'lg', className, style, onClick, role }, ref) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: colorMap[color],
      border: `2px solid ${colors.ink}`,
      borderRadius: radii.xl,
      boxShadow: shadowMap[shadow],
      padding: paddingMap[padding],
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    };

    // Hover/focus lift via CSS (.gumroad-card-interactive) — responde
    // também ao foco de teclado, ao contrário do antigo onMouseEnter
    const interactiveClass = shadow !== 'none' ? 'gumroad-card-interactive' : '';
    const mergedClassName = [interactiveClass, className].filter(Boolean).join(' ') || undefined;

    return (
      <Box
        ref={ref}
        className={mergedClassName}
        style={baseStyle}
        onClick={onClick}
        role={role ?? (onClick ? 'button' : undefined)}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </Box>
    );
  }
);

GumroadCard.displayName = 'GumroadCard';

export default GumroadCard;
