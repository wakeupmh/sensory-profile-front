import React from 'react';
import type { ConsolidatedLogs } from '../../types/consolidatedReport';
import { LOG_TYPE_LABELS } from '../../types/consolidatedReport';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  data: ConsolidatedLogs;
}

const LOG_COLORS: Record<string, string> = {
  abc: colors['brand-salmon'],
  mood: colors['brand-yellow'],
  sleep: colors['brand-lavender'],
  food: '#b7f5b7',
  toileting: '#fcd9b6',
};

const LogsSummary: React.FC<Props> = ({ data }) => {
  const entries = Object.entries(data.byType).filter(([, count]) => count > 0);

  return (
    <div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1.4rem',
          marginBottom: '12px',
          color: colors.ink,
        }}
      >
        {data.totalCount}{' '}
        <span style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.7 }}>
          {data.totalCount === 1 ? 'registro total' : 'registros totais'}
        </span>
      </div>

      {entries.length === 0 ? (
        <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
          Nenhum registro diário no período.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {entries.map(([type, count]) => (
            <div
              key={type}
              style={{
                background: LOG_COLORS[type] ?? '#eee',
                border: `2px solid ${colors.ink}`,
                borderRadius: '9999px',
                padding: '4px 14px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{LOG_TYPE_LABELS[type] ?? type}</span>
              <span style={{ opacity: 0.75 }}>· {count}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogsSummary;
