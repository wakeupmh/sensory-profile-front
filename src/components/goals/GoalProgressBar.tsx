import React from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, radii, fonts } from '../../theme/tokens';

interface GoalProgressBarProps {
  baseline: number;
  target: number;
  current: number | null;
  unit?: string | null;
  height?: number;
}

function computeGoalPercent(baseline: number, target: number, current: number | null): number {
  if (current === null) return 0;
  if (target === baseline) return current >= target ? 100 : 0;
  const raw = ((current - baseline) / (target - baseline)) * 100;
  return Math.min(100, Math.max(0, raw));
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({ baseline, target, current, unit, height = 22 }) => {
  const percent = computeGoalPercent(baseline, target, current);
  const isAchieved = percent >= 100;

  return (
    <Flex direction="column" gap="1" style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: isAchieved ? colors['brand-mint'] : colors['brand-cyan'],
            transition: 'width 0.3s ease',
            borderRight: percent > 0 && percent < 100 ? `2px solid ${colors.ink}` : 'none',
          }}
        />
      </div>
      <Flex justify="between" style={{ fontFamily: fonts.body, fontSize: '12px', color: colors.ink, opacity: 0.7 }}>
        <span>Baseline: {baseline}{unit ? ` ${unit}` : ''}</span>
        <span>Meta: {target}{unit ? ` ${unit}` : ''}</span>
      </Flex>
    </Flex>
  );
};

export default GoalProgressBar;
