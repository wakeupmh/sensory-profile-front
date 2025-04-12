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
  required?: boolean;
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
  required = false,
  color = 'violet',
  onValueChange 
}: FastRadioCardsProps) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(name, newValue);
    }
  };

  return (
    <Box>
      <style>
        {`
          @media (max-width: 767px) {
            .radio-grid {
              grid-template-columns: 1fr !important;
              grid-template-rows: repeat(6, auto) !important;
            }
          }
          
          @media (min-width: 768px) {
            .radio-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              grid-template-rows: repeat(2, auto) !important;
            }
          }
        `}
      </style>
      <RadioCards.Root 
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        color={color as any}
        variant="classic"
        size="2"
        required={required}
        className="radio-grid"
        style={{ 
          display: 'grid',
          gap: '8px'
        }}
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
