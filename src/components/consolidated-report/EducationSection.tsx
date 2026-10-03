import React from 'react';
import { useTranslation } from 'react-i18next';
import { EDUCATION_PLAN_TYPE_LABELS, SCHOOL_COMM_TYPE_LABELS } from '../../types/education';
import type { ConsolidatedEducation } from '../../types/consolidatedReport';
import { colors, itemCardStyle } from '../../theme/tokens';

interface Props {
  data: ConsolidatedEducation;
}

const PLAN_TYPE_COLORS: Record<string, string> = {
  pei: '#E3F2FD',
  pei_simplificado: '#E8F5E9',
  adaptacao_curricular: '#FFF8E1',
  plano_aee: '#F3E5F5',
  outro: '#F5F5F5',
};

const EducationSection: React.FC<Props> = ({ data }) => {
  const { t, i18n } = useTranslation();
  if (data.plans.length === 0 && data.recentComms.length === 0) {
    return (
      <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
        {t('cConsolidated.educationEmpty')}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Education plans */}
      {data.plans.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            {t('cConsolidated.educationPlans')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  ...itemCardStyle,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{plan.schoolName}</span>
                <span
                  style={{
                    background: PLAN_TYPE_COLORS[plan.planType] ?? '#eee',
                    border: `1px solid ${colors.ink}`,
                    borderRadius: '6px',
                    padding: '1px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {t(`cEducation.planType.${plan.planType}`, { defaultValue: (EDUCATION_PLAN_TYPE_LABELS as Record<string, string>)[plan.planType] ?? plan.planType.toUpperCase() })}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{plan.academicYear}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent school communications */}
      {data.recentComms.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            {t('cConsolidated.recentComms')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.recentComms.map((c) => (
              <div
                key={c.id}
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
                  <span
                    style={{
                      background: colors['brand-yellow'],
                      border: `1px solid ${colors.ink}`,
                      borderRadius: '6px',
                      padding: '1px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {t(`cEducation.commType.${c.commType}`, { defaultValue: (SCHOOL_COMM_TYPE_LABELS as Record<string, string>)[c.commType] ?? c.commType })}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.subject}</span>
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                  {new Date(c.occurredAt).toLocaleDateString(i18n.language)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationSection;
