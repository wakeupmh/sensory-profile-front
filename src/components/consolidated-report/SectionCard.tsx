import React from 'react';
import { colors, radii, shadows, fonts } from '../../theme/tokens';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  accentColor?: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  accentColor = colors['brand-cyan'],
  children,
}) => {
  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        borderLeft: `6px solid ${accentColor}`,
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          padding: '14px 20px 10px',
          borderBottom: `1px solid ${colors.ink}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {icon && <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{icon}</span>}
        <h2
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: '1.05rem',
            margin: 0,
            color: colors.ink,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
};

export default SectionCard;
