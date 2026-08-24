import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import { LOG_TYPE_EMOJI, LOG_TYPE_LABELS, LOG_TYPES } from '../../types/logs';
import type { LogType } from '../../types/logs';

// Derivado da tabela canônica — antes esta lista era uma sexta cópia dos
// nomes, e com rótulos que discordavam das outras cinco.
const LOG_TYPE_OPTIONS = LOG_TYPES.map((type) => ({
  type,
  label: LOG_TYPE_LABELS[type],
  emoji: LOG_TYPE_EMOJI[type],
}));

interface LogTypeSelectorProps {
  selected: LogType | null;
  onSelect: (type: LogType) => void;
}

export default function LogTypeSelector({ selected, onSelect }: LogTypeSelectorProps) {
  return (
    <Flex direction="column" gap="2">
      {LOG_TYPE_OPTIONS.map(({ type, label, emoji }, i) => {
        const isActive = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="modal-stagger press-in"
            style={{
              ['--i' as string]: i,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '52px',
              padding: '12px 16px',
              backgroundColor: isActive ? colors['brand-cyan'] : colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              boxShadow: isActive ? shadows['button-active'] : shadows.button,
              cursor: 'pointer',
              fontFamily: fonts.display,
              fontSize: '15px',
              fontWeight: 600,
              color: colors.ink,
              textAlign: 'left',
              width: '100%',
              transition: 'box-shadow 0.12s ease, background-color 0.12s ease',
            }}
            onMouseEnter={(e) => {
              if (isActive) return;
              e.currentTarget.style.boxShadow = `4px 4px 0px ${colors.ink}`;
            }}
            onMouseLeave={(e) => {
              if (isActive) return;
              e.currentTarget.style.boxShadow = shadows.button;
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
            {label}
          </button>
        );
      })}
    </Flex>
  );
}
