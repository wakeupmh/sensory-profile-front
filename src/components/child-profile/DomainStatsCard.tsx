import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@radix-ui/themes';
import { colors, radii, shadows } from '../../theme/tokens';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';

interface DomainStatsCardProps {
  label: string;
  count: number;
  icon: string;
  href: string;
  accentColor: string;
}

const DomainStatsCard: React.FC<DomainStatsCardProps> = ({ label, count, icon, href, accentColor }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.surface,
    border: `2px solid ${colors.ink}`,
    borderLeft: `6px solid ${accentColor}`,
    borderRadius: radii.md,
    boxShadow: shadows.card,
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  };

  const hoverStyle: React.CSSProperties = {
    transform: 'translate(-2px, -2px)',
    boxShadow: shadows['card-hover'],
  };

  return (
    <Link
      to={href}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{ ...baseStyle, ...(hovered ? hoverStyle : {}) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Flex align="center" gap="2" style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <GumroadText level="body-sm" as="span" style={{ opacity: 0.7, fontWeight: 600 }}>
            {label}
          </GumroadText>
        </Flex>
        <GumroadHeading level="display-sm" as="p" style={{ color: colors.ink, lineHeight: 1 }}>
          {count}
        </GumroadHeading>
      </div>
    </Link>
  );
};

export default DomainStatsCard;
