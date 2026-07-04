import React, { useMemo } from 'react';
import { colors, fonts } from '../../theme/tokens';
import type { GoalProgressEntry } from '../../types/goals';

interface GoalProgressChartProps {
  entries: GoalProgressEntry[];
  baseline: number;
  target: number;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD_X = 40;
const PAD_Y = 30;

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ entries, baseline, target }) => {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    [entries],
  );

  const { points, minVal, maxVal, baselineY, targetY } = useMemo(() => {
    const values = sorted.map((e) => e.value).concat([baseline, target]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const paddedMin = min - range * 0.1;
    const paddedMax = max + range * 0.1;
    const paddedRange = paddedMax - paddedMin || 1;

    const toY = (v: number) => HEIGHT - PAD_Y - ((v - paddedMin) / paddedRange) * (HEIGHT - 2 * PAD_Y);
    const usableWidth = WIDTH - 2 * PAD_X;
    const step = sorted.length > 1 ? usableWidth / (sorted.length - 1) : 0;

    const pts = sorted.map((e, idx) => ({
      x: PAD_X + (sorted.length > 1 ? idx * step : usableWidth / 2),
      y: toY(e.value),
      value: e.value,
      date: e.occurredAt,
    }));

    return { points: pts, minVal: paddedMin, maxVal: paddedMax, baselineY: toY(baseline), targetY: toY(target) };
  }, [sorted, baseline, target]);

  if (sorted.length === 0) {
    return (
      <p style={{ fontFamily: fonts.body, fontSize: '13px', opacity: 0.6, fontStyle: 'italic' }}>
        Sem registros de progresso ainda
      </p>
    );
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Baseline reference */}
      <line x1={PAD_X} y1={baselineY} x2={WIDTH - PAD_X} y2={baselineY} stroke={colors.ink} strokeOpacity={0.25} strokeDasharray="4 4" strokeWidth={1.5} />
      <text x={WIDTH - PAD_X} y={baselineY - 4} textAnchor="end" fontSize="10" fill={colors.ink} opacity={0.5}>baseline</text>

      {/* Target reference */}
      <line x1={PAD_X} y1={targetY} x2={WIDTH - PAD_X} y2={targetY} stroke={colors.success} strokeOpacity={0.4} strokeDasharray="4 4" strokeWidth={1.5} />
      <text x={WIDTH - PAD_X} y={targetY - 4} textAnchor="end" fontSize="10" fill={colors.success}>meta</text>

      {/* Progress line */}
      <path d={pathD} fill="none" stroke={colors['brand-cyan']} strokeWidth={3} />

      {/* Points */}
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r={7} fill={colors['brand-cyan']} stroke={colors.ink} strokeWidth={2}>
            <title>{`${new Date(p.date).toLocaleDateString('pt-BR')}: ${p.value}`}</title>
          </circle>
        </g>
      ))}
      <title>{`Faixa: ${minVal.toFixed(1)} a ${maxVal.toFixed(1)}`}</title>
    </svg>
  );
};

export default GoalProgressChart;
