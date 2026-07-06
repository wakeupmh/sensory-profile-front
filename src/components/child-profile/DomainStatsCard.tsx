import React from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@radix-ui/themes';
import { colors, radii, shadows, applyTypography } from '../../theme/tokens';
import { GumroadText } from '../design-system/GumroadHeading';

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
      }}
    >
      <Flex align="center" gap="2" style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <GumroadText level="body-sm" as="span" style={{ opacity: 0.7, fontWeight: 600 }}>
          {label}
        </GumroadText>
      </Flex>
      {/* Não é um GumroadHeading: é uma contagem, não um título de seção —
          evita poluir a navegação por headings dos leitores de tela */}
      <p style={{ ...applyTypography('display-sm'), color: colors.ink, lineHeight: 1, margin: 0 }}>
        {count}
      </p>
    </Link>
  );
};

export default DomainStatsCard;
