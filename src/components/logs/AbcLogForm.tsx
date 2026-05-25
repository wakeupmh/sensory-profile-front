import React, { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { AbcData } from '../../types/logs';

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
  resize: 'vertical',
  minHeight: '72px',
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

const INTENSITY_LABELS: Record<number, string> = {
  1: '1 — Muito leve',
  2: '2 — Leve',
  3: '3 — Moderado',
  4: '4 — Intenso',
  5: '5 — Muito intenso',
};

interface AbcLogFormProps {
  onSubmit: (data: AbcData) => void;
  isLoading?: boolean;
}

export default function AbcLogForm({ onSubmit, isLoading }: AbcLogFormProps) {
  const [antecedent, setAntecedent] = useState('');
  const [behavior, setBehavior] = useState('');
  const [consequence, setConsequence] = useState('');
  const [intensity, setIntensity] = useState<1|2|3|4|5|null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!antecedent.trim() || !behavior.trim() || !consequence.trim()) return;
    const data: AbcData = {
      antecedent: antecedent.trim(),
      behavior: behavior.trim(),
      consequence: consequence.trim(),
      ...(intensity !== null ? { intensity } : {}),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <label style={labelStyle}>O que aconteceu antes? <span style={{ color: colors['brand-salmon'] }}>*</span></label>
          <textarea
            style={inputStyle}
            value={antecedent}
            onChange={e => setAntecedent(e.target.value)}
            placeholder="Descreva o antecedente..."
            required
          />
        </Box>

        <Box>
          <label style={labelStyle}>Qual foi o comportamento? <span style={{ color: colors['brand-salmon'] }}>*</span></label>
          <textarea
            style={inputStyle}
            value={behavior}
            onChange={e => setBehavior(e.target.value)}
            placeholder="Descreva o comportamento..."
            required
          />
        </Box>

        <Box>
          <label style={labelStyle}>O que aconteceu depois? <span style={{ color: colors['brand-salmon'] }}>*</span></label>
          <textarea
            style={inputStyle}
            value={consequence}
            onChange={e => setConsequence(e.target.value)}
            placeholder="Descreva a consequência..."
            required
          />
        </Box>

        <Box>
          <label style={labelStyle}>Intensidade</label>
          <Flex gap="2">
            {([1, 2, 3, 4, 5] as const).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setIntensity(intensity === n ? null : n)}
                title={INTENSITY_LABELS[n]}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: intensity === n ? colors['brand-yellow'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: intensity === n ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.ink,
                  transform: intensity === n ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {n}
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
