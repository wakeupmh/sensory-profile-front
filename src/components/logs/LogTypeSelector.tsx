import React from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import type { LogType } from '../../types/logs';

const LOG_TYPES: { type: LogType; label: string; emoji: string }[] = [
  { type: 'abc', label: 'ABC (Comportamento)', emoji: '🔄' },
  { type: 'mood', label: 'Humor / Regulação', emoji: '😊' },
  { type: 'sleep', label: 'Sono', emoji: '🌙' },
  { type: 'food', label: 'Alimentação', emoji: '🍽️' },
  { type: 'toileting', label: 'Banheiro', emoji: '🚿' },
];

interface LogTypeSelectorProps {
  selected: LogType | null;
  onSelect: (type: LogType) => void;
}

export default function LogTypeSelector({ selected, onSelect }: LogTypeSelectorProps) {
  return (
    <Flex direction="column" gap="2">
      {LOG_TYPES.map(({ type, label, emoji }) => {
        const isActive = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '52px',
              padding: '12px 16px',
              backgroundColor: isActive ? colors['brand-cyan'] : colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              boxShadow: isActive ? shadows['button-active'] : shadows.button,
              cursor: 'pointer',
              fontFamily: fonts.display,
              fontSize: '15px',
              fontWeight: 600,
              color: colors.ink,
              textAlign: 'left',
              width: '100%',
              transform: isActive ? 'translate(2px, 2px)' : 'translate(0, 0)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
            {label}
          </button>
        );
      })}
    </Flex>
  );
}
