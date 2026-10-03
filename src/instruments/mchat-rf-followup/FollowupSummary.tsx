import { useTranslation } from 'react-i18next';
import type { Instrument } from '../types';
import type { SensoryItem } from '../../components/sensory-profile/types';
import { computeFollowupScores, type FollowupScores } from '../mchat-r/scoring';

interface FollowupSummaryProps {
  scores: unknown;
  instrument: Instrument;
  assessmentId?: string;
  sections?: Record<string, { items: SensoryItem[] }>;
}

// Relatório em "papel" branco (também na impressão): cores fixas, como em ReportContent.
const INK = '#0A0A1A';
const RISK_COLORS: Record<string, string> = {
  baixo: '#4ECDC4',
  alto: '#FF6B6B',
};

const RESULT_COLORS: Record<string, string> = {
  passou: '#4ECDC4',
  falhou: '#FF6B6B',
};

const isFollowupScores = (v: unknown): v is FollowupScores =>
  !!v && typeof v === 'object' && typeof (v as FollowupScores).failCount === 'number';

export function FollowupSummary({ scores, sections }: FollowupSummaryProps) {
  const { t } = useTranslation();

  let data: FollowupScores | null = isFollowupScores(scores) ? scores : null;
  if (!data && sections) {
    const items = Object.values(sections).flatMap((s) => s.items ?? []);
    if (items.some((i) => i.response)) {
      data = computeFollowupScores(items.map((i) => ({ id: i.id, response: i.response })));
    }
  }

  if (!data) return null;

  const { failCount, finalRisk, perItem } = data;
  const riskColor = RISK_COLORS[finalRisk] ?? '#ccc';

  const sortedItems = [...(perItem ?? [])].sort(
    (a, b) => a.screenItemId - b.screenItemId,
  );

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${INK}`,
        borderRadius: '12px',
        boxShadow: `6px 6px 0px ${INK}`,
        padding: '20px 24px',
        marginBottom: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Risk badge + count */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <span
          style={{
            background: riskColor,
            border: `2px solid ${INK}`,
            borderRadius: '9999px',
            padding: '6px 16px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            color: INK,
            boxShadow: `2px 2px 0px ${INK}`,
            display: 'inline-block',
          }}
        >
          {t(`mchatFollowup.risk.${finalRisk}`, { defaultValue: finalRisk })}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: INK }}>
          {t(failCount === 1 ? 'mchatFollowup.failedCountOne' : 'mchatFollowup.failedCountOther', { count: failCount })}
        </span>
      </div>

      <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.5, color: '#333' }}>
        {t(`mchatFollowup.explanation.${finalRisk}`)}
      </p>

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
            {t('mchatFollowup.resultPerItem')}
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0, listStyle: 'none' }}>
            {sortedItems.map((item) => {
              const screenNum = item.screenItemId - 3000;
              const resultColor = RESULT_COLORS[item.result] ?? '#ccc';
              return (
                <li
                  key={item.probeItemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 10px',
                    background: '#FFFEF5',
                    border: `2px solid ${INK}`,
                    borderRadius: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      minWidth: '60px',
                      color: INK,
                    }}
                  >
                    {t('mchatFollowup.itemLabel', { n: screenNum })}
                  </span>
                  <span
                    style={{
                      background: resultColor,
                      border: `2px solid ${INK}`,
                      borderRadius: '9999px',
                      padding: '2px 10px',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: INK,
                      boxShadow: `1px 1px 0px ${INK}`,
                    }}
                  >
                    {t(`mchatFollowup.result.${item.result}`, { defaultValue: item.result })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
