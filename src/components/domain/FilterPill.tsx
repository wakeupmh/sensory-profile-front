import { memo } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface FilterPillProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export const FilterPill = memo(({ active, label, onClick }: FilterPillProps) => (
  <button
    onClick={onClick}
    style={{
      padding: '4px 14px',
      borderRadius: '9999px',
      border: `2px solid ${colors.ink}`,
      background: active ? colors.ink : colors.canvas,
      color: active ? colors.canvas : colors.ink,
      fontWeight: 600,
      fontSize: '0.8rem',
      cursor: 'pointer',
      boxShadow: active ? 'none' : '2px 2px 0px #0A0A1A',
      fontFamily: fonts.display,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
));

FilterPill.displayName = 'FilterPill';
