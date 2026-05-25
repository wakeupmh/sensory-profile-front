import React from 'react';
import type { ConsolidatedEducation } from '../../types/consolidatedReport';
import { colors } from '../../theme/tokens';

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

const PLAN_TYPE_LABELS: Record<string, string> = {
  pei: 'PEI',
  pei_simplificado: 'PEI Simplificado',
  adaptacao_curricular: 'Adaptação Curricular',
  plano_aee: 'Plano AEE',
  outro: 'Outro',
};

const COMM_TYPE_LABELS: Record<string, string> = {
  reuniao: 'Reunião',
  bilhete: 'Bilhete/Comunicado',
  email: 'E-mail',
  telefone: 'Ligação telefônica',
  incidente: 'Incidente',
  relatorio: 'Relatório escolar',
  outro: 'Outro',
};

const EducationSection: React.FC<Props> = ({ data }) => {
  if (data.plans.length === 0 && data.recentComms.length === 0) {
    return (
      <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
        Nenhum dado educacional registrado.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Education plans */}
      {data.plans.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Planos educacionais
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '10px',
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
                  {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType.toUpperCase()}
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
            Comunicações recentes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.recentComms.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '10px',
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
                    {COMM_TYPE_LABELS[c.commType] ?? c.commType}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.subject}</span>
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                  {new Date(c.occurredAt).toLocaleDateString('pt-BR')}
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
