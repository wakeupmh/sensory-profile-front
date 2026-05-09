import React from 'react';
import { TextField, Text } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

interface GumroadInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  style?: React.CSSProperties;
}

const GumroadInput = React.forwardRef<HTMLInputElement, GumroadInputProps>(
  ({ label, placeholder, value, defaultValue, onChange, onBlur, disabled, required, style }, ref) => {
    const inputStyle: React.CSSProperties = {
      backgroundColor: colors.canvas,
      color: colors.ink,
      border: `2px solid ${colors.ink}`,
      borderRadius: radii.md,
      boxShadow: shadows.input,
      height: '48px',
      padding: '12px 16px',
      fontFamily: typography['body-md'].font,
      fontSize: typography['body-md'].size,
      fontWeight: typography['body-md'].weight,
      lineHeight: typography['body-md'].lh,
      width: '100%',
      outline: 'none',
      transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      ...style,
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
        <TextField.Root
          ref={ref}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={inputStyle}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = colors['brand-cyan'];
            (e.currentTarget as HTMLInputElement).style.boxShadow = `3px 3px 0px ${colors['brand-cyan']}`;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = colors.ink;
            (e.currentTarget as HTMLInputElement).style.boxShadow = shadows.input;
            onBlur?.();
          }}
        />
      </div>
    );
  }
);

GumroadInput.displayName = 'GumroadInput';

export default GumroadInput;
