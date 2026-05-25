import React, { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { FoodData } from '../../types/logs';

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

const MEAL_OPTIONS: { value: FoodData['meal']; label: string }[] = [
  { value: 'cafe', label: 'Café da manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'lanche', label: 'Lanche' },
];

function parseList(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

interface FoodLogFormProps {
  onSubmit: (data: FoodData) => void;
  isLoading?: boolean;
}

export default function FoodLogForm({ onSubmit, isLoading }: FoodLogFormProps) {
  const [meal, setMeal] = useState<FoodData['meal'] | null>(null);
  const [accepted, setAccepted] = useState('');
  const [refused, setRefused] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptedList = parseList(accepted);
    const refusedList = parseList(refused);
    const data: FoodData = {
      ...(meal ? { meal } : {}),
      ...(acceptedList.length > 0 ? { accepted: acceptedList } : {}),
      ...(refusedList.length > 0 ? { refused: refusedList } : {}),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <label style={labelStyle}>Refeição</label>
          <Flex gap="2" wrap="wrap">
            {MEAL_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMeal(meal === value ? null : value)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: meal === value ? colors['brand-peach'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.pill,
                  boxShadow: meal === value ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.ink,
                  transform: meal === value ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {label}
              </button>
            ))}
          </Flex>
        </Box>

        <Box>
          <label style={labelStyle}>Alimentos aceitos</label>
          <input
            type="text"
            style={inputStyle}
            value={accepted}
            onChange={e => setAccepted(e.target.value)}
            placeholder="Ex: arroz, frango, cenoura"
          />
        </Box>

        <Box>
          <label style={labelStyle}>Alimentos recusados</label>
          <input
            type="text"
            style={inputStyle}
            value={refused}
            onChange={e => setRefused(e.target.value)}
            placeholder="Ex: brócolis, feijão"
          />
        </Box>

        <GumroadButton type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </GumroadButton>
      </Flex>
    </form>
  );
}
