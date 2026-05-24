import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const { token } = useParams<{ token: string }>();
  const [summary, setSummary] = useState<ConsolidatedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setLoading(false);
      return;
    }
    if (fetchedRef.current) return;

    const run = async () => {
      try {
        const data = await consolidatedReportApi.getShared(token);
        setSummary(data);
        fetchedRef.current = true;
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  if (loading) {
    return (
      <Container size="3" p="6">
        <Flex align="center" justify="center" py="9">
          <LoadingSpinner size="large" text="Carregando relatório compartilhado..." />
        </Flex>
      </Container>
    );
  }

  if (invalid || !summary) {
    return (
      <Container size="2" p="6">
        <div
          style={{
            background: '#fff',
            border: `2px solid ${colors.ink}`,
            borderRadius: '16px',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <ExclamationTriangleIcon width={32} height={32} color="var(--crimson-9)" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontFamily: fonts.display, fontWeight: 700, marginBottom: '8px' }}>
            Link inválido ou expirado
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.65 }}>
            Este link de compartilhamento não é mais válido. Solicite um novo link à família responsável.
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
          Relatório de Acompanhamento — {summary.child.name}
        </h1>
      </Flex>

      <p style={{ fontSize: '0.84rem', opacity: 0.6, marginBottom: '6px' }}>
        Compartilhado por família · Visualização somente-leitura
      </p>
      <p style={{ fontSize: '0.82rem', opacity: 0.55, marginBottom: '24px' }}>
        Período: {new Date(summary.period.from).toLocaleDateString('pt-BR')} a{' '}
        {new Date(summary.period.to).toLocaleDateString('pt-BR')}
      </p>

      <div style={{ maxWidth: '720px' }}>
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

      </div>
    </Container>
  );
};

export default ConsolidatedReportSharedView;
