import { memo, useEffect, useState, CSSProperties } from 'react';
import { colors, shadows, radii, typography } from '../../theme/tokens';
import type { ResponseScale } from '../../instruments/types';

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
  /** When provided, overrides the hardcoded SP-2 options with scale.options */
  scale?: ResponseScale;
  /** Per-value color overrides; keys match option.value. Falls back to frequencyBg when absent. */
  theme?: Record<string, { bg: string; text?: string }>;
}

const frequencyBg: Record<string, { bg: string; text: string }> = {
  'não se aplica':   { bg: '#EDE8FA', text: '#0A0A1A' },
  'quase nunca':     { bg: '#D4CAFE', text: '#0A0A1A' },
  'ocasionalmente':  { bg: '#B8A3E3', text: '#0A0A1A' },
  'metade do tempo': { bg: '#9B7FE8', text: '#FFFFFF' },
  'frequentemente':  { bg: '#7B5FD8', text: '#FFFFFF' },
  'quase sempre':    { bg: '#5B3EC8', text: '#FFFFFF' },
};

const FastRadioCards = memo(({
  name,
  options,
  initialValue = '',
  disabled = false,
  required = false,
  onValueChange,
  scale,
  theme,
}: FastRadioCardsProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleClick = (optionValue: string) => {
    if (disabled) return;
    setValue(optionValue);
    if (onValueChange) onValueChange(name, optionValue);
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .radio-grid-${name.replace(/[^a-z0-9]/gi, '')} {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) {
          .radio-grid-${name.replace(/[^a-z0-9]/gi, '')} {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
      <div
        className={`radio-grid-${name.replace(/[^a-z0-9]/gi, '')}`}
        style={{ display: 'grid', gap: '8px', width: '100%' }}
      >
        {(scale ? scale.options : options).map((option) => {
          const isSelected = value === option.value;
          const colorEntry = theme
            ? theme[option.value]
            : frequencyBg[option.value];
          const bg = colorEntry?.bg ?? colors.canvas;
          const textColor = (colorEntry as { bg: string; text?: string } | undefined)?.text ?? colors.ink;

          const style: CSSProperties = {
            backgroundColor: isSelected ? bg : '#FFFFFF',
            color: isSelected ? textColor : colors.ink,
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            boxShadow: isSelected ? '4px 4px 0px #0A0A1A' : shadows.input,
            padding: '12px',
            fontFamily: typography['body-md'].font,
            fontSize: '14px',
            fontWeight: isSelected ? 700 : 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            width: '100%',
            textAlign: 'center',
            transition: 'box-shadow 0.15s ease, transform 0.1s ease, background-color 0.15s ease',
            transform: isSelected ? 'translate(2px, 2px)' : 'none',
            outline: 'none',
          };

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-required={required}
              disabled={disabled}
              onClick={() => handleClick(option.value)}
              style={style}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
});

FastRadioCards.displayName = 'FastRadioCards';

export default FastRadioCards;
