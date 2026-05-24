import type { Instrument } from '../types';

interface PerItemResult {
  probeItemId: number;
  screenItemId: number;
  result: 'passou' | 'falhou';
}

interface FollowupScores {
  failCount: number;
  finalRisk: 'baixo' | 'alto';
  perItem: PerItemResult[];
}

interface FollowupSummaryProps {
  scores: unknown;
  instrument: Instrument;
}

const RISK_COLORS: Record<string, string> = {
  baixo: '#4ECDC4',
  alto: '#FF6B6B',
};

const RISK_LABELS: Record<string, string> = {
  baixo: 'Baixo Risco',
  alto: 'Alto Risco',
};

const RESULT_COLORS: Record<string, string> = {
  passou: '#4ECDC4',
  falhou: '#FF6B6B',
};

const RESULT_LABELS: Record<string, string> = {
  passou: 'Passou',
  falhou: 'Falhou',
};

export function FollowupSummary({ scores }: FollowupSummaryProps) {
  const data = scores as FollowupScores;

  if (!data || typeof data.failCount !== 'number') {
    return null;
  }

  const { failCount, finalRisk, perItem } = data;
  const riskColor = RISK_COLORS[finalRisk] ?? '#ccc';
  const riskLabel = RISK_LABELS[finalRisk] ?? finalRisk;

  const sortedItems = [...(perItem ?? [])].sort(
    (a, b) => a.screenItemId - b.screenItemId,
  );

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
      {/* Risk badge + count */}
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
          {failCount} {failCount === 1 ? 'item ainda reprovado' : 'itens ainda reprovados'} após
          acompanhamento
        </span>
      </div>

      {/* Per-item results table */}
      {sortedItems.length > 0 && (
        <div>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#444',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Resultado por item
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sortedItems.map((item) => {
              const screenNum = item.screenItemId - 3000;
              const resultColor = RESULT_COLORS[item.result] ?? '#ccc';
              const resultLabel = RESULT_LABELS[item.result] ?? item.result;
              return (
                <div
                  key={item.probeItemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 10px',
                    background: '#FFFEF5',
                    border: '2px solid #0A0A1A',
                    borderRadius: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      minWidth: '60px',
                      color: '#0A0A1A',
                    }}
                  >
                    Item {screenNum}
                  </span>
                  <span
                    style={{
                      background: resultColor,
                      border: '2px solid #0A0A1A',
                      borderRadius: '9999px',
                      padding: '2px 10px',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: '#0A0A1A',
                      boxShadow: '1px 1px 0px #0A0A1A',
                    }}
                  >
                    {resultLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
