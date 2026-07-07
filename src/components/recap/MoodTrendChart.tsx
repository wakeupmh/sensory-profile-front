import React from 'react';
import { colors, fonts } from '../../theme/tokens';

export interface DayMood {
  day: number;
  average: number;
}

interface MoodTrendChartProps {
  data: DayMood[];
  daysInMonth: number;
}

const WIDTH = 600;
const HEIGHT = 140;
const PAD_X = 24;
const PAD_Y = 20;
const MAX_LEVEL = 5;

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data, daysInMonth }) => {
  if (data.length === 0) {
    return (
      <p style={{ fontFamily: fonts.body, fontSize: '13px', opacity: 0.6, fontStyle: 'italic' }}>
        Sem registros de humor neste mês
      </p>
    );
  }

  const usableWidth = WIDTH - 2 * PAD_X;
  const usableHeight = HEIGHT - 2 * PAD_Y;
  const barWidth = Math.max(usableWidth / daysInMonth - 2, 2);

  return (
    <svg
      width="100%"
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label="Gráfico de humor médio por dia no mês"
    >
      {data.map(({ day, average }) => {
        const x = PAD_X + ((day - 1) / daysInMonth) * usableWidth;
        const barHeight = (average / MAX_LEVEL) * usableHeight;
        const y = HEIGHT - PAD_Y - barHeight;
        return (
          <rect
            key={day}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={colors['brand-cyan']}
            stroke={colors.ink}
            strokeWidth={1.5}
            rx={2}
          >
            <title>{`Dia ${day}: humor médio ${average.toFixed(1)}`}</title>
          </rect>
        );
      })}
      <line
        x1={PAD_X}
        y1={HEIGHT - PAD_Y}
        x2={WIDTH - PAD_X}
        y2={HEIGHT - PAD_Y}
        stroke={colors.ink}
        strokeOpacity={0.3}
        strokeWidth={1}
      />
    </svg>
  );
};

export default MoodTrendChart;
