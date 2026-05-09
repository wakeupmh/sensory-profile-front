import React, { useState, useEffect, memo } from 'react';
import { TextField as RadixTextField, Text } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

// Definir um tipo específico para a propriedade 'type'
type InputType = 'text' | 'number' | 'search' | 'time' | 'tel' | 'url' | 'email' | 'date' | 'datetime-local' | 'month' | 'password' | 'week';

interface FastTextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  disabled?: boolean;
  type?: InputType;
  required?: boolean;
  onValueChange?: (name: string, value: string) => void;
}

/**
 * Um componente de campo de texto otimizado para desempenho que gerencia seu próprio estado
 * em vez de depender do estado do componente pai, seguindo a abordagem da Epic React.
 */
const FastTextField = memo(({
  name,
  label,
  placeholder = '',
  initialValue = '',
  disabled = false,
  type = 'text',
  required = false,
  onValueChange
}: FastTextFieldProps) => {
  // Estado local para o valor do campo
  const [value, setValue] = useState(initialValue);

  // Atualizar o valor inicial se ele mudar
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Manipulador de alteração que atualiza apenas o estado local
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
  };

  // Notificar o componente pai apenas quando o campo perder o foco
  const handleBlur = () => {
    if (onValueChange && value !== initialValue) {
      onValueChange(name, value);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
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
      )}
      <RadixTextField.Root
        size="2"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
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
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = colors['brand-cyan'];
          (e.currentTarget as HTMLInputElement).style.boxShadow = `3px 3px 0px ${colors['brand-cyan']}`;
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = colors.ink;
          (e.currentTarget as HTMLInputElement).style.boxShadow = shadows.input;
          handleBlur();
        }}
      />
    </div>
  );
});

export default FastTextField;
