import React from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, radii, fonts } from '../../theme/tokens';

export interface BarDatum {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarDatum[];
  accentColor: string;
  barHeight?: number;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, accentColor, barHeight = 120 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <Flex align="end" gap="2" style={{ height: barHeight, width: '100%' }}>
      {data.map((d) => {
        const h = d.value === 0 ? 2 : Math.max(6, Math.round((d.value / max) * (barHeight - 24)));
        return (
          <Flex key={d.label} direction="column" align="center" justify="end" style={{ flex: 1, minWidth: 0, height: '100%' }} gap="1">
            {d.value > 0 && (
              <span style={{ fontFamily: fonts.display, fontSize: '11px', fontWeight: 700, color: colors.ink }}>
                {d.value}
              </span>
            )}
            <div
              style={{
                width: '100%',
                maxWidth: '28px',
                height: `${h}px`,
                backgroundColor: d.value === 0 ? 'rgba(10,10,26,0.08)' : accentColor,
                border: `2px solid ${colors.ink}`,
                borderRadius: `${radii.xs} ${radii.xs} 0 0`,
              }}
            />
            <span style={{ fontFamily: fonts.body, fontSize: '11px', color: colors.ink, opacity: 0.7, whiteSpace: 'nowrap' }}>
              {d.label}
            </span>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default SimpleBarChart;
