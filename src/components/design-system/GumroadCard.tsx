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
  ({ children, color = 'white', shadow = 'md', padding = 'lg', className, style, onClick }, ref) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: colorMap[color],
      border: `2px solid ${colors.ink}`,
      borderRadius: radii.xl,
      boxShadow: shadowMap[shadow],
      padding: paddingMap[padding],
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    };

    return (
      <Box
        ref={ref}
        className={className}
        style={baseStyle}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (shadow !== 'none') {
            (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px, -2px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = shadowMap.lg;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translate(0, 0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = shadowMap[shadow];
        }}
      >
        {children}
      </Box>
    );
  }
);

GumroadCard.displayName = 'GumroadCard';

export default GumroadCard;
