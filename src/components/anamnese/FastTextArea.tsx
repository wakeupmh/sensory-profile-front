import React, { useState, useEffect, memo } from 'react';
import { TextArea } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

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
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontFamily: typography['title-sm'].font,
            fontWeight: typography['title-sm'].weight,
            fontSize: typography['title-sm'].size,
            marginBottom: '6px',
          }}
        >
          {label} {required && <span style={{ color: colors['brand-salmon'] }}>*</span>}
        </label>
      )}
      <TextArea
        size="2"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        style={{
          backgroundColor: colors.canvas,
          color: colors.ink,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.md,
          boxShadow: shadows.input,
          padding: '12px 16px',
          fontFamily: typography['body-md'].font,
          fontSize: typography['body-md'].size,
          width: '100%',
          outline: 'none',
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
          minHeight: '80px',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLTextAreaElement).style.borderColor = colors['brand-cyan'];
          (e.currentTarget as HTMLTextAreaElement).style.boxShadow = `3px 3px 0px ${colors['brand-cyan']}`;
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLTextAreaElement).style.borderColor = colors.ink;
          (e.currentTarget as HTMLTextAreaElement).style.boxShadow = shadows.input;
          handleBlur();
        }}
      />
    </div>
  );
});

FastTextArea.displayName = 'FastTextArea';

export default FastTextArea;
