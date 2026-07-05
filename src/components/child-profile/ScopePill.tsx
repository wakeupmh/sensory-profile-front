import React from 'react';
import { colors, radii } from '../../theme/tokens';

interface ScopePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ScopePill: React.FC<ScopePillProps> = ({ label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '5px 14px',
      borderRadius: radii.pill,
      border: `2px solid ${colors.ink}`,
      backgroundColor: active ? colors['brand-cyan'] : 'transparent',
      color: colors.ink,
      fontWeight: 700,
      fontSize: '12px',
      fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      whiteSpace: 'nowrap',
      transition: 'background-color 0.12s ease',
    }}
  >
    {label}
  </button>
);

export default ScopePill;
