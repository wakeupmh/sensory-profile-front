import React from 'react';
import { Badge } from '@radix-ui/themes';
import { colors, radii, typography } from '../../theme/tokens';

type BadgeColor = 'yellow' | 'cyan' | 'salmon' | 'mint' | 'lavender' | 'peach' | 'cream' | 'ink';

interface GumroadBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  style?: React.CSSProperties;
  className?: string;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  yellow: { bg: colors['brand-yellow'], text: colors.ink },
  cyan: { bg: colors['brand-cyan'], text: colors.ink },
  salmon: { bg: colors['brand-salmon'], text: colors.ink },
  mint: { bg: colors['brand-mint'], text: colors.ink },
  lavender: { bg: colors['brand-lavender'], text: colors.ink },
  peach: { bg: colors['brand-peach'], text: colors.ink },
  cream: { bg: colors['surface-cream'], text: colors.ink },
  ink: { bg: colors.ink, text: colors.surface },
};

const GumroadBadge: React.FC<GumroadBadgeProps> = ({ children, color = 'yellow', style, className }) => {
  const palette = colorMap[color];
  return (
    <Badge
      className={className}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.pill,
        padding: '4px 12px',
        fontFamily: typography.caption.font,
        fontSize: typography.caption.size,
        fontWeight: typography.caption.weight,
        lineHeight: typography.caption.lh,
        letterSpacing: typography.caption.ls,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...style,
      }}
    >
      {children}
    </Badge>
  );
};

export default GumroadBadge;
