import React, { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { SleepData } from '../../types/logs';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: 'transparent',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  boxShadow: shadows.input,
  fontFamily: fonts.body,
  fontSize: '15px',
  color: colors.ink,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: spacing.xxs,
};

const QUALITY_OPTIONS: { value: 1|2|3; label: string }[] = [
  { value: 1, label: 'Ruim' },
  { value: 2, label: 'Razoável' },
  { value: 3, label: 'Boa' },
];

interface SleepLogFormProps {
  onSubmit: (data: SleepData) => void;
  isLoading?: boolean;
}

export default function SleepLogForm({ onSubmit, isLoading }: SleepLogFormProps) {
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [wakings, setWakings] = useState('');
  const [quality, setQuality] = useState<1|2|3|null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: SleepData = {
      ...(bedtime ? { bedtime } : {}),
      ...(waketime ? { waketime } : {}),
      ...(wakings !== '' ? { wakings: parseInt(wakings, 10) } : {}),
      ...(quality !== null ? { quality } : {}),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Flex gap="3">
          <Box style={{ flex: 1 }}>
            <label style={labelStyle}>Hora de dormir</label>
            <input
              type="time"
              style={inputStyle}
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <label style={labelStyle}>Hora de acordar</label>
            <input
              type="time"
              style={inputStyle}
              value={waketime}
              onChange={e => setWaketime(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <label style={labelStyle}>Vezes que acordou</label>
          <input
            type="number"
            min={0}
            max={20}
            style={{ ...inputStyle, width: '100px' }}
            value={wakings}
            onChange={e => setWakings(e.target.value)}
            placeholder="0"
          />
        </Box>

        <Box>
          <label style={labelStyle}>Qualidade</label>
          <Flex gap="2">
            {QUALITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuality(quality === value ? null : value)}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: quality === value ? colors['brand-mint'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: quality === value ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.ink,
                  transform: quality === value ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {label}
              </button>
            ))}
          </Flex>
        </Box>

        <GumroadButton type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </GumroadButton>
      </Flex>
    </form>
  );
}
