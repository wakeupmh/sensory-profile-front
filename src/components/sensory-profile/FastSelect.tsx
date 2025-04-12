 import { memo, useEffect, useState } from 'react';
import { Select, Text, Box } from '@radix-ui/themes';

interface SelectOption {
  value: string;
  label: string;
}

interface FastSelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  initialValue?: string;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: (name: string, value: string) => void;
}

/**
 * Um componente de seleção otimizado para desempenho que gerencia seu próprio estado
 * em vez de depender do estado do componente pai, seguindo a abordagem da Epic React.
 */
const FastSelect = memo(({ 
  name, 
  label, 
  options, 
  initialValue = '', 
  disabled = false,
  required = false,
  onValueChange 
}: FastSelectProps) => {
  // Estado local para o valor do campo
  const [value, setValue] = useState(initialValue || 'placeholder');
  
  // Atualizar o valor inicial se ele mudar
  useEffect(() => {
    setValue(initialValue || 'placeholder');
  }, [initialValue]);

  // Manipulador de alteração que atualiza o estado local e notifica o componente pai
  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(name, newValue === 'placeholder' ? '' : newValue);
    }
  };

  return (
    <Box>
      <Text as="label" size="2" weight="bold" mb="1">
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Text>
      <br />
      <Select.Root 
        size="2"
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.Item value="placeholder">Selecione</Select.Item>
            {options.map(option => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Box>
  );
});

export default FastSelect;
