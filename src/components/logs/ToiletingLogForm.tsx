import React, { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { ToiletingData } from '../../types/logs';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: spacing.xxs,
};

const TYPE_OPTIONS: { value: ToiletingData['type']; label: string }[] = [
  { value: 'urina', label: 'Urina' },
  { value: 'fezes', label: 'Fezes' },
  { value: 'ambos', label: 'Ambos' },
];

interface ToiletingLogFormProps {
  onSubmit: (data: ToiletingData) => void;
  isLoading?: boolean;
}

export default function ToiletingLogForm({ onSubmit, isLoading }: ToiletingLogFormProps) {
  const [type, setType] = useState<ToiletingData['type'] | null>(null);
  const [independent, setIndependent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: ToiletingData = {
      ...(type ? { type } : {}),
      independent,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <label style={labelStyle}>Tipo</label>
          <Flex gap="2">
            {TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(type === value ? null : value)}
                style={{
                  flex: 1,
                  height: '52px',
                  backgroundColor: type === value ? colors['brand-mint'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: type === value ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.ink,
                  transform: type === value ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {label}
              </button>
            ))}
          </Flex>
        </Box>

        <Box>
          <button
            type="button"
            onClick={() => setIndependent(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              backgroundColor: independent ? colors['brand-cyan'] : colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              boxShadow: independent ? shadows['button-active'] : shadows.button,
              cursor: 'pointer',
              fontFamily: fonts.display,
              fontSize: '15px',
              fontWeight: 600,
              color: colors.ink,
              textAlign: 'left',
              transform: independent ? 'translate(2px, 2px)' : 'translate(0, 0)',
              transition: 'transform 0.1s ease, background-color 0.1s ease',
            }}
          >
            <span style={{
              width: '22px',
              height: '22px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.xs,
              backgroundColor: independent ? colors.ink : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {independent && <span style={{ color: colors.surface, fontSize: '14px', lineHeight: 1 }}>✓</span>}
            </span>
            Independente
          </button>
        </Box>

        <GumroadButton type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </GumroadButton>
      </Flex>
    </form>
  );
}
