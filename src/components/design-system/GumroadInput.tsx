import React, { useId } from 'react';
import { TextField, Text } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

interface GumroadInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  /** Mensagem de erro do campo — anunciada via role="alert" e ligada por aria-describedby */
  error?: string;
  style?: React.CSSProperties;
}

const GumroadInput = React.forwardRef<HTMLInputElement, GumroadInputProps>(
  ({ id, name, label, placeholder, value, defaultValue, onChange, onBlur, disabled, required, error, style }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    const inputStyle: React.CSSProperties = {
      backgroundColor: colors.canvas,
      color: colors.ink,
      border: `2px solid ${error ? colors.error : colors.ink}`,
      borderRadius: radii.md,
      boxShadow: shadows.input,
      height: '48px',
      padding: '12px 16px',
      fontFamily: typography['body-md'].font,
      fontSize: typography['body-md'].size,
      fontWeight: typography['body-md'].weight,
      lineHeight: typography['body-md'].lh,
      width: '100%',
      transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      ...style,
    };

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <Text
            as="label"
            htmlFor={inputId}
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
            {label} {required && <span style={{ color: colors.error }} aria-hidden="true">*</span>}
          </Text>
        )}
        <TextField.Root
          ref={ref}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          style={inputStyle}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = colors['brand-cyan'];
            (e.currentTarget as HTMLInputElement).style.boxShadow = `3px 3px 0px ${colors['brand-cyan']}`;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = error ? colors.error : colors.ink;
            (e.currentTarget as HTMLInputElement).style.boxShadow = shadows.input;
            onBlur?.();
          }}
        />
        {error && (
          <Text
            as="p"
            id={errorId}
            role="alert"
            style={{
              color: colors.error,
              fontFamily: typography.caption.font,
              fontSize: typography.caption.size,
              fontWeight: 600,
              marginTop: '4px',
            }}
          >
            {error}
          </Text>
        )}
      </div>
    );
  }
);

GumroadInput.displayName = 'GumroadInput';

export default GumroadInput;
