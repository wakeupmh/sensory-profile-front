import React, { useState } from 'react';
import { consolidatedReportApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

interface Props {
  childId: string;
  isPublicView?: boolean;
}

const PERIOD_OPTIONS = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
  { label: '180 dias', value: 180 },
];

const AISummaryPanel: React.FC<Props> = ({ childId, isPublicView }) => {
  const { getToken } = useAuthContext();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(90);

  if (isPublicView) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await consolidatedReportApi.generateAISummary(token, { childId, periodDays });
      setSummary(res.summary);
    } catch {
      setError('Erro ao gerar resumo com IA. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <h2
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1.05rem',
          marginBottom: '6px',
          color: colors.ink,
        }}
      >
        Resumo com IA
      </h2>
      <p style={{ fontSize: '0.84rem', opacity: 0.7, marginBottom: '14px', lineHeight: 1.5 }}>
        Gera um resumo em português para compartilhar com a equipe terapêutica.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Período:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriodDays(opt.value)}
            style={{
              background: periodDays === opt.value ? colors.ink : colors.canvas,
              color: periodDays === opt.value ? colors.canvas : colors.ink,
              border: `2px solid ${colors.ink}`,
              borderRadius: '9999px',
              padding: '3px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: periodDays === opt.value ? 'none' : '2px 2px 0px #0A0A1A',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: colors['brand-lavender'],
          border: `2px solid ${colors.ink}`,
          borderRadius: '10px',
          boxShadow: loading ? 'none' : '2px 2px 0px #0A0A1A',
          padding: '8px 20px',
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transform: loading ? 'translate(2px,2px)' : undefined,
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: `2px solid ${colors.ink}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        )}
        {loading ? 'Gerando...' : 'Gerar Resumo'}
      </button>

      {error && (
        <p style={{ color: colors['brand-salmon'], fontSize: '0.85rem', marginTop: '10px' }}>{error}</p>
      )}

      {summary && (
        <div style={{ marginTop: '16px' }}>
          <blockquote
            style={{
              background: '#f9f6ff',
              border: `2px solid ${colors.ink}`,
              borderLeft: `6px solid ${colors['brand-lavender']}`,
              borderRadius: '10px',
              padding: '14px 16px',
              margin: 0,
              fontSize: '0.92rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {summary}
          </blockquote>
          <p
            style={{
              fontSize: '0.75rem',
              opacity: 0.55,
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Gerado por IA · Revise antes de compartilhar
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AISummaryPanel;
