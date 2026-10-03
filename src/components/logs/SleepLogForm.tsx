import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { SleepData } from '../../types/logs';

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

const QUALITY_OPTIONS: { value: 1|2|3 }[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

interface SleepLogFormProps {
  onSubmit: (data: SleepData) => void;
  isLoading?: boolean;
}

export default function SleepLogForm({ onSubmit, isLoading }: SleepLogFormProps) {
  const { t } = useTranslation();
  const uid = useId();
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [wakings, setWakings] = useState('');
  const [quality, setQuality] = useState<1|2|3|null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: SleepData = {
      ...(bedtime ? { bedtime } : {}),
      ...(waketime ? { waketime } : {}),
      ...(wakings !== '' ? { wakings: parseInt(wakings, 10) } : {}),
      ...(quality !== null ? { quality } : {}),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Flex gap="3">
          <Box style={{ flex: 1 }}>
            <label htmlFor={`${uid}-bed`} style={labelStyle}>{t('p2Logs.sleep.bedtime')}</label>
            <input
              id={`${uid}-bed`}
              type="time"
              style={inputStyle}
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <label htmlFor={`${uid}-wake`} style={labelStyle}>{t('p2Logs.sleep.waketime')}</label>
            <input
              id={`${uid}-wake`}
              type="time"
              style={inputStyle}
              value={waketime}
              onChange={e => setWaketime(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <label htmlFor={`${uid}-n`} style={labelStyle}>{t('p2Logs.sleep.wakings')}</label>
          <input
            id={`${uid}-n`}
            inputMode="numeric"
            type="number"
            min={0}
            max={20}
            style={{ ...inputStyle, width: '100px' }}
            value={wakings}
            onChange={e => setWakings(e.target.value)}
            placeholder="0"
          />
        </Box>

        <Box>
          <div id={`${uid}-q`} style={labelStyle}>{t('p2Logs.sleep.quality')}</div>
          <Flex gap="2" role="group" aria-labelledby={`${uid}-q`}>
            {QUALITY_OPTIONS.map(({ value }) => (
              <button className="press-in"
                key={value}
                type="button"
                aria-pressed={quality === value}
                onClick={() => setQuality(quality === value ? null : value)}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: quality === value ? colors['brand-mint'] : colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: quality === value ? shadows['button-active'] : shadows.button,
                  cursor: 'pointer',
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.ink,
                  transform: quality === value ? 'translate(2px, 2px)' : 'translate(0, 0)',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
              >
                {t(`p2Logs.sleep.q${value}`)}
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
