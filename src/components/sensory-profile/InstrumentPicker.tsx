import { memo } from 'react';
import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { listInstruments } from '../../instruments';
import { colors, radii, shadows } from '../../theme/tokens';

interface InstrumentPickerProps {
  value: string;
  onChange: (instrumentId: string) => void;
  disabled?: boolean;
}

const formatAgeRange = (minMonths: number, maxMonths: number): string => {
  if (maxMonths >= 9000) {
    return minMonths <= 0 ? 'Todas as idades' : `${minMonths}m+`;
  }
  const toLabel = (m: number) => (m >= 12 ? `${Math.floor(m / 12)}a` : `${m}m`);
  return `${toLabel(minMonths)}–${toLabel(maxMonths)}`;
};

const InstrumentPicker: React.FC<InstrumentPickerProps> = memo(({ value, onChange, disabled }) => {
  const instruments = listInstruments();

  return (
    <Card mb="4">
      <Flex direction="column" gap="2" mb="3">
        <Heading size="4">Instrumento</Heading>
        <Text size="2" color="gray">
          Escolha o questionário adequado à faixa etária. Ao trocar, as respostas já preenchidas desta avaliação serão reiniciadas.
        </Text>
      </Flex>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {instruments.map((i) => {
          const isSelected = value === i.id;
          return (
            <button
              key={i.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => !disabled && onChange(i.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'left',
                padding: '16px',
                borderRadius: radii.md,
                border: `2px solid ${colors.ink}`,
                boxShadow: isSelected ? '4px 4px 0px #0A0A1A' : shadows.input,
                backgroundColor: isSelected ? '#2A9D8F' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : colors.ink,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
                transform: isSelected ? 'translate(2px, 2px)' : 'none',
                transition: 'background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                width: '100%',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'inherit' }}>{i.name}</span>
              <span style={{ fontSize: '12px', opacity: isSelected ? 0.85 : 0.6 }}>
                Faixa etária: {formatAgeRange(i.ageRange.minMonths, i.ageRange.maxMonths)} · {i.sections.length} seções
              </span>
              <span style={{ fontSize: '13px', marginTop: '4px', color: 'inherit' }}>{i.description}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
});

InstrumentPicker.displayName = 'InstrumentPicker';

export default InstrumentPicker;
