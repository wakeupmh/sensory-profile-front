import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { AbcData } from '../../types/logs';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: 'transparent',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  boxShadow: shadows.input,
  fontFamily: fonts.body,
  fontSize: '15px',
  color: colors.ink,
  resize: 'vertical',
  minHeight: '72px',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: spacing.xxs,
};

interface AbcLogFormProps {
  onSubmit: (data: AbcData) => void;
  isLoading?: boolean;
}

export default function AbcLogForm({ onSubmit, isLoading }: AbcLogFormProps) {
  const { t } = useTranslation();
  const uid = useId();
  const [antecedent, setAntecedent] = useState('');
  const [behavior, setBehavior] = useState('');
  const [consequence, setConsequence] = useState('');
  const [intensity, setIntensity] = useState<1|2|3|4|5|null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!antecedent.trim() || !behavior.trim() || !consequence.trim()) return;
    const data: AbcData = {
      antecedent: antecedent.trim(),
      behavior: behavior.trim(),
      consequence: consequence.trim(),
      ...(intensity !== null ? { intensity } : {}),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <label htmlFor={`${uid}-a`} style={labelStyle}>{t('p2Logs.abc.antecedent')} <span style={{ color: colors.error }} aria-hidden="true">*</span></label>
          <textarea
            id={`${uid}-a`}
            style={inputStyle}
            value={antecedent}
            onChange={e => setAntecedent(e.target.value)}
            placeholder={t('p2Logs.abc.antecedentPh')}
            required
          />
        </Box>

        <Box>
          <label htmlFor={`${uid}-b`} style={labelStyle}>{t('p2Logs.abc.behavior')} <span style={{ color: colors.error }} aria-hidden="true">*</span></label>
          <textarea
            id={`${uid}-b`}
            style={inputStyle}
            value={behavior}
            onChange={e => setBehavior(e.target.value)}
            placeholder={t('p2Logs.abc.behaviorPh')}
            required
          />
        </Box>

        <Box>
          <label htmlFor={`${uid}-c`} style={labelStyle}>{t('p2Logs.abc.consequence')} <span style={{ color: colors.error }} aria-hidden="true">*</span></label>
          <textarea
            id={`${uid}-c`}
            style={inputStyle}
            value={consequence}
            onChange={e => setConsequence(e.target.value)}
            placeholder={t('p2Logs.abc.consequencePh')}
            required
          />
        </Box>

        <Box>
          <div id={`${uid}-i`} style={labelStyle}>{t('p2Logs.abc.intensity')}</div>
          <Flex gap="2" role="group" aria-labelledby={`${uid}-i`}>
            {([1, 2, 3, 4, 5] as const).map(n => (
              <button className="press-in"
                key={n}
                type="button"
                onClick={() => setIntensity(intensity === n ? null : n)}
                title={t(`p2Logs.abc.i${n}`)}
                aria-label={t(`p2Logs.abc.i${n}`)}
                aria-pressed={intensity === n}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: intensity === n ? colors['brand-yellow'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: intensity === n ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.ink,
                  transform: intensity === n ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {n}
              </button>
            ))}
          </Flex>
        </Box>

        <GumroadButton type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? t('p2Logs.saving') : t('p2Logs.save')}
        </GumroadButton>
      </Flex>
    </form>
  );
}
