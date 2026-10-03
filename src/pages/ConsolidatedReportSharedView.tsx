import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon, BarChartIcon } from '@radix-ui/react-icons';
import { consolidatedReportApi } from '../services/api';
import type { ConsolidatedSummary } from '../types/consolidatedReport';
import { colors, fonts } from '../theme/tokens';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionCard from '../components/consolidated-report/SectionCard';
import AssessmentsSection from '../components/consolidated-report/AssessmentsSection';
import LogsSummary from '../components/consolidated-report/LogsSummary';
import TherapySection from '../components/consolidated-report/TherapySection';
import MedicalSection from '../components/consolidated-report/MedicalSection';
import DevelopmentSection from '../components/consolidated-report/DevelopmentSection';
import EducationSection from '../components/consolidated-report/EducationSection';

const ConsolidatedReportSharedView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [summary, setSummary] = useState<ConsolidatedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setInvalid(false);

    const run = async () => {
      try {
        const data = await consolidatedReportApi.getShared(token);
        if (!cancelled) setSummary(data);
      } catch {
        if (!cancelled) setInvalid(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <Container size="3" p="6">
        <Flex align="center" justify="center" py="9">
          <LoadingSpinner size="large" text={t('p1ConsolidatedShared.loading')} />
        </Flex>
      </Container>
    );
  }

  if (invalid || !summary) {
    return (
      <Container size="2" p="6">
        <div
          style={{
            background: colors.surface,
            border: `2px solid ${colors.ink}`,
            borderRadius: '16px',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <ExclamationTriangleIcon aria-hidden="true" width={32} height={32} color="var(--crimson-9)" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontFamily: fonts.display, fontWeight: 700, marginBottom: '8px' }}>
            {t('p1ConsolidatedShared.invalidTitle')}
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.65 }}>
            {t('p1ConsolidatedShared.invalidBody')}
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '12px' }}>
            <Link to="/">{t('p1ConsolidatedShared.goHome')}</Link>
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="3" p={{ initial: '4', sm: '6' }}>
      {/* Header */}
      <Flex align="center" gap="2" mb="2">
        <BarChartIcon width={24} height={24} color={colors['brand-cyan']} />
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: colors.ink,
            margin: 0,
          }}
        >
          {t('p1ConsolidatedShared.title', { name: summary.child.name })}
        </h1>
      </Flex>

      <p style={{ fontSize: '0.84rem', opacity: 0.6, marginBottom: '6px' }}>
        {t('p1ConsolidatedShared.sharedBy')}
      </p>
      <p style={{ fontSize: '0.82rem', opacity: 0.55, marginBottom: '24px' }}>
        {t('p1ConsolidatedShared.period', {
          from: new Date(summary.period.from).toLocaleDateString(i18n.language),
          to: new Date(summary.period.to).toLocaleDateString(i18n.language),
        })}
      </p>

      <div className="paper-surface" style={{ maxWidth: '720px' }}>
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

      </div>
    </Container>
  );
};

export default ConsolidatedReportSharedView;
