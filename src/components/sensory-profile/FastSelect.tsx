import { memo, useEffect, useState } from 'react';
import { Text } from '@radix-ui/themes';
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

// Chevron embutido como data-URI para o ícone à direita (appearance: none remove o nativo)
const CHEVRON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M4 6l4 4 4-4' stroke='%230A0A1A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>";

/**
 * Componente de seleção otimizado que gerencia seu próprio estado.
 * Usa um <select> nativo estilizado (neubrutalismo) em vez do Radix Select,
 * cujo Trigger não aplica a borda do design system de forma confiável.
 */
const FastSelect = memo(({
  name,
  label,
  options,
  initialValue = '',
  disabled = false,
  required = false,
  onValueChange,
}: FastSelectProps) => {
  const [value, setValue] = useState(initialValue ?? '');

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange?.(name, newValue);
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
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        style={{
          width: '100%',
          height: '48px',
          padding: '12px 40px 12px 16px',
          color: value === '' ? '#888' : colors.ink,
          backgroundColor: 'transparent',
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.md,
          boxShadow: shadows.input,
          boxSizing: 'border-box',
          fontFamily: typography['body-md'].font,
          fontSize: typography['body-md'].size,
          cursor: disabled ? 'default' : 'pointer',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundImage: `url("${CHEVRON}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors['brand-cyan'];
          e.currentTarget.style.boxShadow = `3px 3px 0px ${colors['brand-cyan']}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.ink;
          e.currentTarget.style.boxShadow = shadows.input;
        }}
      >
        <option value="" disabled>
          Selecione
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: colors.ink }}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

FastSelect.displayName = 'FastSelect';

export default FastSelect;
