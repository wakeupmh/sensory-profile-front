import React from 'react';
import { colors, radii } from '../../theme/tokens';

interface GumroadSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'block' | 'circle';
  style?: React.CSSProperties;
}

/**
 * Bloco de carregamento no estilo do design system: borda de tinta com
 * shimmer em tons de creme. Com prefers-reduced-motion o shimmer congela
 * num bloco estático (guarda global no index.css). Sempre aria-hidden —
 * o container da página anuncia o carregamento via role="status".
 */
const GumroadSkeleton: React.FC<GumroadSkeletonProps> = ({
  width = '100%',
  height,
  variant = 'block',
  style,
}) => {
  const base: React.CSSProperties = {
    width,
    height: height ?? (variant === 'text' ? '14px' : variant === 'circle' ? width : '48px'),
    border: variant === 'text' ? `1.5px solid ${colors.ink}` : `2px solid ${colors.ink}`,
    borderRadius: variant === 'circle' ? '50%' : variant === 'text' ? radii.xs : radii.md,
    flexShrink: 0,
    ...style,
  };

  return <div className="skeleton-shimmer" style={base} aria-hidden="true" />;
};

export default GumroadSkeleton;
