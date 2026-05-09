 import { memo, useEffect, useState } from 'react';
import { Select, Text } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

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
  const [value, setValue] = useState(initialValue !== undefined && initialValue !== '' ? initialValue : 'placeholder');

  // Atualizar o valor inicial se ele mudar
  useEffect(() => {
    setValue(initialValue !== undefined && initialValue !== '' ? initialValue : 'placeholder');
  }, [initialValue]);

  // Manipulador de alteração que atualiza o estado local e notifica o componente pai
  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(name, newValue === 'placeholder' ? '' : newValue);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Text
        as="label"
        size="2"
        weight="bold"
        mb="1"
        style={{
          display: 'block',
          fontFamily: typography['title-sm'].font,
          fontWeight: typography['title-sm'].weight,
          fontSize: typography['title-sm'].size,
          marginBottom: '6px',
        }}
      >
        {label} {required && <span style={{ color: colors['brand-salmon'] }}>*</span>}
      </Text>
      <Select.Root
        size="2"
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
      >
        <Select.Trigger
          style={{
            backgroundColor: 'transparent',
            color: colors.ink,
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            boxShadow: shadows.input,
            height: '48px',
            padding: '12px 16px',
            fontFamily: typography['body-md'].font,
            fontSize: typography['body-md'].size,
            width: '100%',
            outline: 'none',
          }}
        />
        <Select.Content
          style={{
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            boxShadow: shadows.card,
          }}
        >
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
    </div>
  );
});

FastSelect.displayName = 'FastSelect';

export default FastSelect;
