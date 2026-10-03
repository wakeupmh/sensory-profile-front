import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConsolidatedAssessments } from '../../types/consolidatedReport';
import { INSTRUMENT_LABELS } from '../../types/consolidatedReport';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  data: ConsolidatedAssessments;
}

const AssessmentsSection: React.FC<Props> = ({ data }) => {
  const { t, i18n } = useTranslation();
  if (data.count === 0) {
    return (
      <p style={{ color: colors.ink, opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>
        {t('cConsolidated.assessmentsEmpty')}
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'inline-block',
          background: colors['brand-lavender'],
          border: `2px solid ${colors.ink}`,
          borderRadius: '9999px',
          padding: '3px 14px',
          fontWeight: 700,
          fontSize: '0.85rem',
          fontFamily: fonts.display,
          marginBottom: '14px',
        }}
      >
        {data.count} {t('cConsolidated.assessmentsDone', { count: data.count })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.recent.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: colors.canvas,
              border: `2px solid ${colors.ink}`,
              borderRadius: '10px',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {t(`cConsolidated.instrument.${a.instrumentId}`, { defaultValue: INSTRUMENT_LABELS[a.instrumentId] ?? a.instrumentId })}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {a.completedAt && (
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  {new Date(a.completedAt).toLocaleDateString(i18n.language)}
                </span>
              )}
              <span
                style={{
                  background: '#e8f4f8',
                  border: `1px solid ${colors.ink}`,
                  borderRadius: '6px',
                  padding: '1px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                {a.instrumentId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentsSection;
