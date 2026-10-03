import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Instrument } from '../types';
import type { SensoryItem } from '../../components/sensory-profile/types';
import { computeMchatScores, type MchatScores } from './scoring';

interface MchatRSummaryProps {
  scores: unknown;
  instrument: Instrument;
  assessmentId?: string;
  sections?: Record<string, { items: SensoryItem[] }>;
}

// O relatório é sempre exibido em "papel" branco (inclusive no tema escuro e na
// impressão), por isso as cores abaixo são fixas, como em ReportContent.
const INK = '#0A0A1A';
const RISK_COLORS: Record<string, string> = {
  baixo: '#4ECDC4',
  medio: '#FFD93D',
  alto: '#FF6B6B',
};

const isMchatScores = (v: unknown): v is MchatScores =>
  !!v && typeof v === 'object' && typeof (v as MchatScores).failCount === 'number'
  && Array.isArray((v as MchatScores).failedItemIds);

export function MchatRSummary({ scores, instrument, assessmentId, sections }: MchatRSummaryProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Usa os scores da API; se não vierem, calcula a partir das respostas
  let data: MchatScores | null = isMchatScores(scores) ? scores : null;
  if (!data && sections) {
    const items = Object.values(sections).flatMap((s) => s.items ?? []);
    if (items.some((i) => i.response)) {
      data = computeMchatScores(items.map((i) => ({ id: i.id, response: i.response })));
    }
  }

  if (!data) return null;

  const { failCount, failedItemIds, risk } = data;
  const riskColor = RISK_COLORS[risk] ?? '#ccc';

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
        border: `2px solid ${INK}`,
        borderRadius: '12px',
        boxShadow: `6px 6px 0px ${INK}`,
        padding: '20px 24px',
        marginBottom: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
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
          {t(`mchatR.risk.${risk}`, { defaultValue: risk })}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: INK }}>
          {t('mchatR.failedCount', { count: failCount })}
        </span>
      </div>

      <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.5, color: '#333' }}>
        {t(`mchatR.explanation.${risk}`)}
      </p>

      {risk === 'medio' && assessmentId && (
        // screen-only: o botão não deve aparecer na versão impressa
        <div className="screen-only" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/assessment/new?instrument=mchat-rf-followup&parent=${encodeURIComponent(assessmentId)}`,
              )
            }
            style={{
              background: '#fff',
              border: `2px solid ${INK}`,
              borderRadius: '9999px',
              padding: '10px 20px',
              minHeight: '44px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              color: INK,
              boxShadow: `4px 4px 0px ${INK}`,
              cursor: 'pointer',
            }}
          >
            {t('mchatR.startFollowup')}
          </button>
        </div>
      )}

      {risk === 'alto' && (
        <div
          role="note"
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            border: `2px solid ${INK}`,
            borderRadius: '8px',
            background: '#FFF1F1',
            color: INK,
            fontSize: '14px',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {t('mchatR.highRisk.title')}
          </strong>
          {t('mchatR.highRisk.body')}
        </div>
      )}

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
            {t('mchatR.failedItemsTitle')}
          </p>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: 0, padding: 0, listStyle: 'none' }}>
            {failedPositions.map((pos) => (
              <li
                key={pos}
                style={{
                  background: '#FFFEF5',
                  border: `2px solid ${INK}`,
                  borderRadius: '8px',
                  padding: '3px 10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: INK,
                  boxShadow: `2px 2px 0px ${INK}`,
                }}
              >
                {pos}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{t('mchatR.noFailedItems')}</p>
      )}
    </div>
  );
}
