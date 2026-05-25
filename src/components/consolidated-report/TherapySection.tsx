import React from 'react';
import type { ConsolidatedTherapy } from '../../types/consolidatedReport';
import { THERAPY_TYPE_LABELS } from '../../types/consolidatedReport';
import { colors, fonts, itemCardStyle } from '../../theme/tokens';

interface Props {
  data: ConsolidatedTherapy;
}

const TherapySection: React.FC<Props> = ({ data }) => {
  const typeEntries = Object.entries(data.byType).filter(([, count]) => count > 0);
  const recentSessions = data.recentSessions.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Session count + type breakdown */}
      <div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: '1.2rem',
            marginBottom: '8px',
            color: colors.ink,
          }}
        >
          {data.sessionCount}{' '}
          <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.7 }}>
            {data.sessionCount === 1 ? 'sessão' : 'sessões'} no período
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {typeEntries.map(([type, count]) => (
            <span
              key={type}
              style={{
                background: colors['brand-cyan'],
                border: `2px solid ${colors.ink}`,
                borderRadius: '9999px',
                padding: '2px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {THERAPY_TYPE_LABELS[type] ?? type} · {count}
            </span>
          ))}
          {typeEntries.length === 0 && (
            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Sem sessões registradas.</span>
          )}
        </div>
      </div>

      {/* Active therapists */}
      {data.activeTherapists.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Terapeutas ativos
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.activeTherapists.map((t) => (
              <div
                key={t.id}
                style={{
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '10px',
                  padding: '4px 12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span
                  style={{
                    background: colors['brand-lavender'],
                    borderRadius: '6px',
                    padding: '0 6px',
                    fontSize: '0.75rem',
                  }}
                >
                  {t.specialty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Sessões recentes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentSessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  ...itemCardStyle,
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {THERAPY_TYPE_LABELS[s.therapyType] ?? s.therapyType}
                  </span>
                  {s.therapistName && (
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>· {s.therapistName}</span>
                  )}
                  {s.durationMinutes && (
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>· {s.durationMinutes} min</span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                  {new Date(s.occurredAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapySection;
