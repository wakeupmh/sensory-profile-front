import React from 'react';
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
  return (
    <Link
      to={href}
      className="domain-stats-card"
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.surface,
        border: `2px solid ${colors.ink}`,
        borderLeft: `6px solid ${accentColor}`,
        borderRadius: radii.md,
        boxShadow: shadows.card,
        padding: '16px',
        cursor: 'pointer',
        outline: 'none',
      }}
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
    </Link>
  );
};

export default DomainStatsCard;
