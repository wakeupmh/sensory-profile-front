import React, { useState, useEffect, memo } from 'react';
import { TextField as RadixTextField, Text, Box } from '@radix-ui/themes';

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
    <Box>
      {label && (
        <Text as="label" size="2" weight="bold" mb="1">
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Text>
      )}
      <RadixTextField.Root 
        size="2"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
      />
    </Box>
  );
});

export default FastTextField;
