import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { consolidatedReportApi } from '../services/api';
import type { ConsolidatedSummary } from '../types/consolidatedReport';
import { useAuthContext } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme/tokens';
import LoadingSpinner from '../components/LoadingSpinner';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import SectionCard from '../components/consolidated-report/SectionCard';
import AssessmentsSection from '../components/consolidated-report/AssessmentsSection';
import LogsSummary from '../components/consolidated-report/LogsSummary';
import TherapySection from '../components/consolidated-report/TherapySection';
import MedicalSection from '../components/consolidated-report/MedicalSection';
import DevelopmentSection from '../components/consolidated-report/DevelopmentSection';
import EducationSection from '../components/consolidated-report/EducationSection';
import SharePanel from '../components/consolidated-report/SharePanel';
import AISummaryPanel from '../components/consolidated-report/AISummaryPanel';

const PERIOD_OPTIONS = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
  { label: '180 dias', value: 180 },
];

const ConsolidatedReportPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [summary, setSummary] = useState<ConsolidatedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(90);

  useEffect(() => {
    if (!childId) return;
    const ctrl = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getTokenRef.current();
        const data = await consolidatedReportApi.getSummary(token, childId, periodDays, ctrl.signal);
        if (!ctrl.signal.aborted) setSummary(data);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setError('Erro ao carregar o relatório consolidado. Tente novamente.');
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => ctrl.abort();
  }, [childId, periodDays]);

  const handlePeriodChange = (period: number) => {
    setPeriodDays(period);
  };

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/dashboard')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </div>

      {/* Header */}
      <div style={{ marginBottom: spacing.lg }}>
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Relatório Consolidado
          {summary?.child?.name && ` — ${summary.child.name}`}
        </GumroadHeading>
        {summary && (
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            Período: {new Date(summary.period.from).toLocaleDateString('pt-BR')} a{' '}
            {new Date(summary.period.to).toLocaleDateString('pt-BR')} · Gerado em{' '}
            {new Date(summary.generatedAt).toLocaleString('pt-BR')}
          </GumroadText>
        )}
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: spacing.lg }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: fonts.display }}>Período:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handlePeriodChange(opt.value)}
            style={{
              background: periodDays === opt.value ? colors.ink : colors.canvas,
              color: periodDays === opt.value ? colors.canvas : colors.ink,
              border: `2px solid ${colors.ink}`,
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: periodDays === opt.value ? 'none' : '2px 2px 0px #0A0A1A',
              fontFamily: fonts.display,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <LoadingSpinner size="large" text="Carregando relatório consolidado..." />
        </div>
      ) : error ? (
        <div
          style={{
            background: '#fff',
            border: `2px solid ${colors.ink}`,
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <ExclamationTriangleIcon width={32} height={32} style={{ marginBottom: '8px', color: colors['brand-salmon'] }} />
          <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>{error}</p>
          <GumroadButton variant="primary" size="sm" onClick={() => fetchSummary(periodDays)}>
            Tentar novamente
          </GumroadButton>
        </div>
      ) : summary ? (
        <>
          <SectionCard title="Avaliações" icon="🧠" accentColor={colors['brand-cyan']}>
            <AssessmentsSection data={summary.assessments} />
          </SectionCard>

          <SectionCard title="Registros Diários" icon="📋" accentColor={colors['brand-yellow']}>
            <LogsSummary data={summary.logs} />
          </SectionCard>

          <SectionCard title="Terapia" icon="🏥" accentColor={colors['brand-mint']}>
            <TherapySection data={summary.therapy} />
          </SectionCard>

          <SectionCard title="Saúde" icon="💊" accentColor={colors['brand-salmon']}>
            <MedicalSection data={summary.medical} />
          </SectionCard>

          <SectionCard title="Desenvolvimento" icon="🌱" accentColor="#22c55e">
            <DevelopmentSection data={summary.development} />
          </SectionCard>

          <SectionCard title="Educação" icon="🎒" accentColor={colors['brand-lavender']}>
            <EducationSection data={summary.education} />
          </SectionCard>

          {childId && (
            <>
              <SharePanel childId={childId} periodDays={periodDays} />
              <AISummaryPanel childId={childId} />
            </>
          )}
        </>
      ) : null}
    </Box>
  );
};

export default ConsolidatedReportPage;
