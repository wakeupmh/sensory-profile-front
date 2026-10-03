import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { MoodData } from '../../types/logs';

const MOOD_LEVELS: { value: 1|2|3|4|5; emoji: string }[] = [
  { value: 1, emoji: '😣' },
  { value: 2, emoji: '😟' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😊' },
];

const MOOD_TAGS = ['calmo', 'agitado', 'feliz', 'triste', 'ansioso', 'frustrado'];

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: spacing.xxs,
};

interface MoodLogFormProps {
  onSubmit: (data: MoodData) => void;
  isLoading?: boolean;
}

export default function MoodLogForm({ onSubmit, isLoading }: MoodLogFormProps) {
  const { t } = useTranslation();
  const uid = useId();
  const [level, setLevel] = useState<1|2|3|4|5|null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (level === null) return;
    const data: MoodData = { level, ...(tags.length > 0 ? { tags } : {}) };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <div id={`${uid}-l`} style={labelStyle}>{t('p2Logs.mood.how')} <span style={{ color: colors.error }} aria-hidden="true">*</span></div>
          <Flex gap="2" role="group" aria-labelledby={`${uid}-l`}>
            {MOOD_LEVELS.map(({ value, emoji }) => {
              const label = t(`p2Logs.mood.l${value}`);
              return (
              <button className="press-in"
                key={value}
                type="button"
                onClick={() => setLevel(value)}
                title={label}
                aria-pressed={level === value}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 4px',
                  backgroundColor: level === value ? colors['brand-cyan'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: level === value ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  transform: level === value ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                <span style={{ fontSize: '24px', lineHeight: 1 }} aria-hidden="true">{emoji}</span>
                <span style={{ fontFamily: fonts.display, fontSize: '10px', fontWeight: 600, color: colors.ink, textAlign: 'center', lineHeight: 1.2 }}>
                  {label}
                </span>
              </button>
              );
            })}
          </Flex>
        </Box>

        <Box>
          <div id={`${uid}-t`} style={labelStyle}>{t('p2Logs.mood.tags')}</div>
          <Flex gap="2" wrap="wrap" role="group" aria-labelledby={`${uid}-t`}>
            {MOOD_TAGS.map(tag => {
              const isSelected = tags.includes(tag);
              return (
                <button className="press-in"
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: isSelected ? colors['brand-lavender'] : colors.surface,
                    border: `2px solid ${colors.ink}`,
                    borderRadius: radii.pill,
                    boxShadow: isSelected ? shadows['button-active'] : shadows.button,
                    cursor: 'pointer',
                    fontFamily: fonts.display,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.ink,
                    transform: isSelected ? 'translate(2px, 2px)' : 'translate(0, 0)',
                    transition: 'transform 0.1s ease, background-color 0.1s ease',
                  }}
                >
                  {t(`p2Logs.mood.tag.${tag}`)}
                </button>
              );
            })}
          </Flex>
        </Box>

        <GumroadButton type="submit" variant="primary" size="lg" disabled={isLoading || level === null}>
          {isLoading ? t('p2Logs.saving') : t('p2Logs.save')}
        </GumroadButton>
        {level === null && (
          <p style={{ margin: 0, fontFamily: fonts.display, fontSize: '12px', color: colors['ink-muted'] }}>
            {t('p2Logs.mood.pickLevel')}
          </p>
        )}
      </Flex>
    </form>
  );
}
