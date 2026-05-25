import React from 'react';
import type { ConsolidatedDevelopment } from '../../types/consolidatedReport';
import { colors, itemCardStyle } from '../../theme/tokens';

interface Props {
  data: ConsolidatedDevelopment;
}

const MILESTONE_PILLS = [
  { key: 'achieved' as const, label: 'Alcançados', bg: '#b7f5b7', border: '#22c55e' },
  { key: 'inProgress' as const, label: 'Em progresso', bg: colors['brand-yellow'], border: '#d97706' },
  { key: 'notYet' as const, label: 'Não iniciados', bg: '#e5e7eb', border: '#6b7280' },
  { key: 'regressed' as const, label: 'Em regressão', bg: colors['brand-salmon'], border: '#dc2626' },
];

const DevelopmentSection: React.FC<Props> = ({ data }) => {
  const totalMilestones = Object.values(data.milestoneStats).reduce((s, v) => s + v, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Milestone stats */}
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px', opacity: 0.8 }}>
          Marcos de desenvolvimento{totalMilestones > 0 ? ` · ${totalMilestones} total` : ''}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MILESTONE_PILLS.map(({ key, label, bg, border }) => (
            <div
              key={key}
              style={{
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: '9999px',
                padding: '4px 14px',
                fontWeight: 700,
                fontSize: '0.83rem',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              <span>{label}</span>
              <span style={{ opacity: 0.8 }}>· {data.milestoneStats[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent communication logs */}
      {data.recentCommunicationLogs.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Registros de comunicação recentes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.recentCommunicationLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  ...itemCardStyle,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.entryType}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {log.wordsCount !== null && (
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{log.wordsCount} palavras</span>
                    )}
                    <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>
                      {new Date(log.occurredAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                {log.description && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.7, lineHeight: 1.4 }}>
                    {log.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalMilestones === 0 && data.recentCommunicationLogs.length === 0 && (
        <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
          Nenhum dado de desenvolvimento registrado.
        </p>
      )}
    </div>
  );
};

export default DevelopmentSection;
