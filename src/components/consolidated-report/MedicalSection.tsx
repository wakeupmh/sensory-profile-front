import React from 'react';
import type { ConsolidatedMedical } from '../../types/consolidatedReport';
import { colors } from '../../theme/tokens';

interface Props {
  data: ConsolidatedMedical;
}

const MedicalSection: React.FC<Props> = ({ data }) => {
  const isEmpty =
    data.activeMedications.length === 0 &&
    data.comorbidities.length === 0 &&
    data.recentAppointments.length === 0;

  if (isEmpty) {
    return (
      <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
        Nenhum dado médico registrado.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Active medications */}
      {data.activeMedications.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Medicações ativas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.activeMedications.map((m) => (
              <div
                key={m.id}
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
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                {m.dosage && (
                  <span
                    style={{
                      background: '#ffd6d6',
                      border: `1px solid ${colors.ink}`,
                      borderRadius: '6px',
                      padding: '1px 8px',
                      fontSize: '0.78rem',
                    }}
                  >
                    {m.dosage}
                  </span>
                )}
                {m.frequency && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{m.frequency}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comorbidities */}
      {data.comorbidities.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Comorbidades
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.comorbidities.map((c) => (
              <div
                key={c.id}
                style={{
                  background: colors['brand-lavender'],
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '9999px',
                  padding: '3px 12px',
                  fontSize: '0.83rem',
                  fontWeight: 600,
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                <span>{c.conditionName}</span>
                {c.icdCode && (
                  <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>{c.icdCode}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent appointments */}
      {data.recentAppointments.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', opacity: 0.8 }}>
            Consultas recentes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.recentAppointments.map((a) => (
              <div
                key={a.id}
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
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.specialty}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>
                    {new Date(a.occurredAt).toLocaleDateString('pt-BR')}
                  </span>
                  {a.followUpDate && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>
                      Retorno: {new Date(a.followUpDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalSection;
