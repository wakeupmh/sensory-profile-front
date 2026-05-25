import React from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import type { TherapyType } from '../../types/therapy';

interface TherapyTypeSelectorProps {
  selected: TherapyType | null;
  onSelect: (type: TherapyType) => void;
}

const TYPE_CONFIG: Record<TherapyType, { label: string; subtitle: string; color: string }> = {
  aba: { label: 'ABA', subtitle: 'Análise do Comportamento Aplicada', color: colors['brand-salmon'] },
  ot: { label: 'OT', subtitle: 'Terapia Ocupacional', color: colors['brand-cyan'] },
  fonoaudiologia: { label: 'Fonoaudiologia', subtitle: 'Linguagem e Comunicação', color: colors['brand-lavender'] },
  psicologia: { label: 'Psicologia', subtitle: 'Suporte Psicológico', color: colors['brand-yellow'] },
  fisioterapia: { label: 'Fisioterapia', subtitle: 'Desenvolvimento Motor', color: '#A8E6CF' },
};

const THERAPY_TYPES = Object.keys(TYPE_CONFIG) as TherapyType[];

const TherapyTypeSelector: React.FC<TherapyTypeSelectorProps> = ({ selected, onSelect }) => {
  const btnStyle = (type: TherapyType, isSelected: boolean): React.CSSProperties => ({
    minHeight: '52px',
    width: '100%',
    padding: '10px 16px',
    border: `2px solid ${colors.ink}`,
    borderRadius: radii.md,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    backgroundColor: isSelected ? TYPE_CONFIG[type].color : colors.canvas,
    boxShadow: isSelected ? 'none' : shadows['card-sm'],
    transform: isSelected ? 'translate(2px, 2px)' : 'none',
    transition: 'all 0.1s ease',
  });

  return (
    <Flex direction="column" gap="2">
      {THERAPY_TYPES.map((type) => {
        const config = TYPE_CONFIG[type];
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={btnStyle(type, isSelected)}
          >
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '15px', color: colors.ink }}>
              {config.label}
            </div>
            <div style={{ fontFamily: fonts.display, fontSize: '12px', color: colors.ink, opacity: 0.7 }}>
              {config.subtitle}
            </div>
          </button>
        );
      })}
    </Flex>
  );
};

export default TherapyTypeSelector;
