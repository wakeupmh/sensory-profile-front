import React, { useState, useEffect, memo } from 'react';
import { TextArea, Text, Box } from '@radix-ui/themes';

interface FastTextAreaProps {
  name: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  onValueChange?: (name: string, value: string) => void;
}

const FastTextArea = memo(({
  name,
  label,
  placeholder = '',
  initialValue = '',
  disabled = false,
  required = false,
  rows = 3,
  onValueChange,
}: FastTextAreaProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

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
      <TextArea
        size="2"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        rows={rows}
      />
    </Box>
  );
});

FastTextArea.displayName = 'FastTextArea';

export default FastTextArea;
