import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { consolidatedReportApi } from '../services/api';
import type { ConsolidatedSummary } from '../types/consolidatedReport';
import { useAuthContext } from '../context/AuthContext';
import { colors, fonts, shadows, spacing } from '../theme/tokens';
import LoadingSpinner from '../components/LoadingSpinner';
import GumroadCard from '../components/design-system/GumroadCard';
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
import AISummaryHistoryPanel from '../components/consolidated-report/AISummaryHistoryPanel';
import AIQuestionChat from '../components/consolidated-report/AIQuestionChat';

const PERIOD_OPTIONS = [30, 60, 90, 180];

const ConsolidatedReportPage = () => {
  const { t, i18n } = useTranslation();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [summary, setSummary] = useState<ConsolidatedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(90);

  const fetchSummary = useCallback((period: number, signal?: AbortSignal) => {
    if (!childId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getTokenRef.current();
        const data = await consolidatedReportApi.getSummary(token, childId, period, signal);
        if (!signal?.aborted) setSummary(data);
      } catch {
        if (signal?.aborted) return;
        setError(t('p1Consolidated.errLoad'));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    })();
  }, [childId, t]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchSummary(periodDays, ctrl.signal);
    return () => ctrl.abort();
  }, [fetchSummary, periodDays]);

  const handlePeriodChange = (period: number) => {
    setPeriodDays(period);
  };

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/dashboard')}>
          <ArrowLeftIcon aria-hidden="true" /> {t('p1Consolidated.back')}
        </GumroadButton>
      </div>

      {/* Header */}
      <div style={{ marginBottom: spacing.lg }}>
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          {t('p1Consolidated.title')}
          {summary?.child?.name && ` — ${summary.child.name}`}
        </GumroadHeading>
        {summary && (
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            {t('p1Consolidated.period', {
              from: new Date(summary.period.from).toLocaleDateString(i18n.language),
              to: new Date(summary.period.to).toLocaleDateString(i18n.language),
              generated: new Date(summary.generatedAt).toLocaleString(i18n.language),
            })}
          </GumroadText>
        )}
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: spacing.lg }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: fonts.display }}>{t('p1Consolidated.periodLabel')}</span>
        {PERIOD_OPTIONS.map((days) => (
          <button
            key={days}
            type="button"
            aria-pressed={periodDays === days}
            onClick={() => handlePeriodChange(days)}
            style={{
              background: periodDays === days ? colors.ink : colors.canvas,
              color: periodDays === days ? colors.canvas : colors.ink,
              border: `2px solid ${colors.ink}`,
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: periodDays === days ? 'none' : shadows.input,
              fontFamily: fonts.display,
            }}
          >
            {t('p1Consolidated.days', { count: days })}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <LoadingSpinner size="large" text={t('p1Consolidated.loading')} />
        </div>
      ) : error ? (
        <div
          role="alert"
          style={{
            background: colors.surface,
            border: `2px solid ${colors.ink}`,
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <ExclamationTriangleIcon aria-hidden="true" width={32} height={32} style={{ marginBottom: '8px', color: colors['brand-salmon'] }} />
          <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>{error}</p>
          <GumroadButton variant="primary" size="sm" onClick={() => fetchSummary(periodDays)}>
            {t('p1Consolidated.retry')}
          </GumroadButton>
        </div>
      ) : summary ? (
        <>
          <div className="paper-surface">
            <SectionCard title={t('p1Common.sections.assessments')} icon="🧠" accentColor={colors['brand-cyan']}>
              <AssessmentsSection data={summary.assessments} />
            </SectionCard>

            <SectionCard title={t('p1Common.sections.dailyLogs')} icon="📋" accentColor={colors['brand-yellow']}>
              <LogsSummary data={summary.logs} />
            </SectionCard>

            <SectionCard title={t('p1Common.sections.therapy')} icon="🏥" accentColor={colors['brand-mint']}>
              <TherapySection data={summary.therapy} />
            </SectionCard>

            <SectionCard title={t('p1Common.sections.health')} icon="💊" accentColor={colors['brand-salmon']}>
              <MedicalSection data={summary.medical} />
            </SectionCard>

            <SectionCard title={t('p1Common.sections.development')} icon="🌱" accentColor="#22c55e">
              <DevelopmentSection data={summary.development} />
            </SectionCard>

            <SectionCard title={t('p1Common.sections.education')} icon="🎒" accentColor={colors['brand-lavender']}>
              <EducationSection data={summary.education} />
            </SectionCard>

            {childId && <SharePanel childId={childId} periodDays={periodDays} />}
          </div>

          {childId && (
            <>
              <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <AISummaryHistoryPanel childId={childId} />
              </GumroadCard>
              <GumroadCard color="white" shadow="md" padding="lg">
                <AIQuestionChat childId={childId} periodDays={periodDays} />
              </GumroadCard>
            </>
          )}
        </>
      ) : null}
    </Box>
  );
};

export default ConsolidatedReportPage;
