import { useNavigate } from 'react-router-dom';
import type { Instrument } from '../types';

interface MchatRScores {
  failCount: number;
  failedItemIds: number[];
  risk: 'baixo' | 'medio' | 'alto';
}

interface MchatRSummaryProps {
  scores: unknown;
  instrument: Instrument;
  assessmentId?: string;
}

const RISK_COLORS: Record<string, string> = {
  baixo: '#4ECDC4',
  medio: '#FFD93D',
  alto: '#FF6B6B',
};

const RISK_LABELS: Record<string, string> = {
  baixo: 'Baixo Risco',
  medio: 'Risco Médio',
  alto: 'Alto Risco',
};

const RISK_EXPLANATIONS: Record<string, string> = {
  baixo:
    'Resultado de baixo risco: poucas ou nenhuma sinalização de autismo. Continue acompanhando o desenvolvimento da criança e mantenha as consultas pediátricas de rotina.',
  medio:
    'Resultado de risco médio: recomenda-se a realização da Entrevista de Acompanhamento (M-CHAT-R/F) para investigar mais detalhadamente os itens reprovados. Se o risco for confirmado, procure uma avaliação especializada.',
  alto:
    'Resultado de alto risco: indica necessidade de avaliação diagnóstica especializada o mais breve possível. Agende uma consulta com um profissional capacitado em desenvolvimento infantil (neuropediatra, psiquiatra infantil ou equipe multidisciplinar).',
};

export function MchatRSummary({ scores, instrument, assessmentId }: MchatRSummaryProps) {
  const navigate = useNavigate();
  const data = scores as MchatRScores;

  if (!data || typeof data.failCount !== 'number') {
    return null;
  }

  const { failCount, failedItemIds, risk } = data;
  const riskColor = RISK_COLORS[risk] ?? '#ccc';
  const riskLabel = RISK_LABELS[risk] ?? risk;

  // Map global item IDs back to 1-based positions within the triagem section
  const section = instrument.sections.find((s) => s.key === 'triagem');
  const sectionItems = section?.items ?? [];

  const failedPositions = failedItemIds
    .map((gid) => {
      const idx = sectionItems.findIndex((item) => item.id === gid);
      return idx >= 0 ? idx + 1 : null;
    })
    .filter((pos): pos is number => pos !== null)
    .sort((a, b) => a - b);

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #0A0A1A',
        borderRadius: '12px',
        boxShadow: '6px 6px 0px #0A0A1A',
        padding: '20px 24px',
        marginBottom: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span
          style={{
            background: riskColor,
            border: '2px solid #0A0A1A',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            color: '#0A0A1A',
            boxShadow: '2px 2px 0px #0A0A1A',
            display: 'inline-block',
          }}
        >
          {riskLabel}
        </span>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#0A0A1A',
          }}
        >
          Itens não aprovados: {failCount}/20
        </span>
      </div>

      {risk === 'medio' && assessmentId && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() =>
              navigate(
                `/sensory-profile/new?instrument=mchat-rf-followup&parent=${assessmentId}`,
              )
            }
            style={{
              background: '#fff',
              border: '2px solid #0A0A1A',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              color: '#0A0A1A',
              boxShadow: '4px 4px 0px #0A0A1A',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px #0A0A1A';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px #0A0A1A';
            }}
          >
            Iniciar Entrevista de Acompanhamento →
          </button>
        </div>
      )}

      <p
        style={{
          margin: '0 0 16px',
          fontSize: '14px',
          lineHeight: 1.5,
          color: '#333',
        }}
      >
        {RISK_EXPLANATIONS[risk]}
      </p>

      {failedPositions.length > 0 ? (
        <div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#444',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Itens reprovados (posição na triagem)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {failedPositions.map((pos) => (
              <span
                key={pos}
                style={{
                  background: '#FFFEF5',
                  border: '2px solid #0A0A1A',
                  borderRadius: '8px',
                  padding: '3px 10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0A0A1A',
                  boxShadow: '2px 2px 0px #0A0A1A',
                }}
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
          Nenhum item reprovado.
        </p>
      )}
    </div>
  );
}
