import { memo } from 'react';
import { Box, Card, Flex, Heading, Text, RadioCards } from '@radix-ui/themes';
import { listInstruments } from '../../instruments';

interface InstrumentPickerProps {
  value: string;
  onChange: (instrumentId: string) => void;
  disabled?: boolean;
}

const formatAgeRange = (minMonths: number, maxMonths: number): string => {
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
      <RadioCards.Root
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        columns={{ initial: '1', sm: '2' }}
      >
        {instruments.map((i) => (
          <RadioCards.Item key={i.id} value={i.id}>
            <Flex direction="column" gap="1" width="100%">
              <Text weight="bold">{i.name}</Text>
              <Text size="1" color="gray">
                Faixa etária: {formatAgeRange(i.ageRange.minMonths, i.ageRange.maxMonths)} · {i.sections.length} seções
              </Text>
              <Box mt="1">
                <Text size="1">{i.description}</Text>
              </Box>
            </Flex>
          </RadioCards.Item>
        ))}
      </RadioCards.Root>
    </Card>
  );
});

InstrumentPicker.displayName = 'InstrumentPicker';

export default InstrumentPicker;
