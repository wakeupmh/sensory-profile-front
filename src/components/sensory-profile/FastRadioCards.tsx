/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useEffect, useState } from 'react';
import { RadioCards, Text, Box } from '@radix-ui/themes';

interface RadioOption {
  value: string;
  label: string;
}

interface FastRadioCardsProps {
  name: string;
  options: RadioOption[];
  initialValue?: string;
  disabled?: boolean;
  columns?: { initial: string; xs?: string; sm?: string; md?: string; lg?: string };
  color?: string;
  onValueChange?: (name: string, value: string) => void;
}

/**
 * Um componente de cartões de rádio otimizado para desempenho que gerencia seu próprio estado
 * em vez de depender do estado do componente pai, seguindo a abordagem da Epic React.
 */
const FastRadioCards = memo(({ 
  name, 
  options, 
  initialValue = '', 
  disabled = false,
  columns = { initial: '1', md: '5' },
  color = 'violet',
  onValueChange 
}: FastRadioCardsProps) => {
  // Estado local para o valor selecionado
  const [value, setValue] = useState(initialValue);
  
  // Atualizar o valor inicial se ele mudar
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Manipulador de alteração que atualiza o estado local e notifica o componente pai
  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(name, newValue);
    }
  };

  return (
    <Box>
      <RadioCards.Root 
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        color={color as any}
        variant="classic"
        columns={columns}
        size="2"
      >
        {options.map(option => (
          <RadioCards.Item key={option.value} value={option.value}>
            <Text size="1" weight="medium">{option.label}</Text>
          </RadioCards.Item>
        ))}
      </RadioCards.Root>
    </Box>
  );
});

export default FastRadioCards;
