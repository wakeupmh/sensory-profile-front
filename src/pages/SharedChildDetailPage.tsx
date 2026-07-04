import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, Tabs } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedChildrenApi } from '../services/api';
import type { ChildShareScope, SharedChildSummary } from '../types/childSharing';
import { CHILD_SHARE_SCOPE_LABELS } from '../types/childSharing';
import type {
  ConsolidatedAssessments,
  ConsolidatedLogs,
  ConsolidatedTherapy,
  ConsolidatedMedical,
  ConsolidatedDevelopment,
} from '../types/consolidatedReport';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionCard from '../components/consolidated-report/SectionCard';
import AssessmentsSection from '../components/consolidated-report/AssessmentsSection';
import LogsSummary from '../components/consolidated-report/LogsSummary';
import TherapySection from '../components/consolidated-report/TherapySection';
import MedicalSection from '../components/consolidated-report/MedicalSection';
import DevelopmentSection from '../components/consolidated-report/DevelopmentSection';

interface DomainData {
  assessments?: ConsolidatedAssessments;
  daily_logs?: ConsolidatedLogs;
  therapy?: ConsolidatedTherapy;
  medical?: ConsolidatedMedical;
  development?: ConsolidatedDevelopment;
}

const SCOPE_ORDER: ChildShareScope[] = ['assessments', 'daily_logs', 'therapy', 'medical', 'development'];

export default function SharedChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [child, setChild] = useState<SharedChildSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainData, setDomainData] = useState<DomainData>({});
  const [domainErrors, setDomainErrors] = useState<Partial<Record<ChildShareScope, string>>>({});

  const fetchAll = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const token = await getToken();
      const list = await sharedChildrenApi.list(token);
      const match = list.find((c) => c.id === childId);
      if (!match) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setChild(match);

      const fetchers: Record<ChildShareScope, () => Promise<unknown>> = {
        assessments: () => sharedChildrenApi.getAssessments(token, childId),
        daily_logs: () => sharedChildrenApi.getDailyLogs(token, childId),
        therapy: () => sharedChildrenApi.getTherapy(token, childId),
        medical: () => sharedChildrenApi.getMedical(token, childId),
        development: () => sharedChildrenApi.getDevelopment(token, childId),
      };

      const results = await Promise.allSettled(
        match.scopes.map(async (scope) => [scope, await fetchers[scope]()] as const),
      );

      const nextData: DomainData = {};
      const nextErrors: Partial<Record<ChildShareScope, string>> = {};
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const [scope, data] = result.value;
          (nextData as Record<string, unknown>)[scope] = data;
        }
      }
      for (let i = 0; i < match.scopes.length; i++) {
        if (results[i].status === 'rejected') {
          nextErrors[match.scopes[i]] = 'Não foi possível carregar estes dados.';
        }
      }
      setDomainData(nextData);
      setDomainErrors(nextErrors);
    } catch {
      setError('Não foi possível carregar esta criança. Ela pode não estar mais compartilhada com você.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/shared/children')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : notFound ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <ExclamationTriangleIcon width={32} height={32} />
            <GumroadHeading level="title-md" as="h3">Acesso não encontrado</GumroadHeading>
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              Esta criança não foi compartilhada com você, ou o acesso foi revogado.
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : child ? (
        <>
          <Flex
            align="center"
            gap="2"
            style={{
              backgroundColor: colors['brand-yellow'],
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              padding: '8px 14px',
              marginBottom: spacing.md,
            }}
          >
            <EyeOpenIcon />
            <GumroadText level="caption-uppercase" as="span" style={{ fontWeight: 700 }}>
              Modo visualização — somente leitura
            </GumroadText>
          </Flex>

          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.lg }}>
            {child.name}
          </GumroadHeading>

          <Tabs.Root defaultValue={child.scopes[0]}>
            <Tabs.List>
              {SCOPE_ORDER.filter((s) => child.scopes.includes(s)).map((scope) => (
                <Tabs.Trigger key={scope} value={scope}>
                  {CHILD_SHARE_SCOPE_LABELS[scope]}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Box pt="4">
              {child.scopes.includes('assessments') && (
                <Tabs.Content value="assessments">
                  <DomainTabContent error={domainErrors.assessments}>
                    {domainData.assessments && (
                      <SectionCard title="Avaliações" icon="🧠" accentColor={colors['brand-cyan']}>
                        <AssessmentsSection data={domainData.assessments} />
                      </SectionCard>
                    )}
                  </DomainTabContent>
                </Tabs.Content>
              )}
              {child.scopes.includes('daily_logs') && (
                <Tabs.Content value="daily_logs">
                  <DomainTabContent error={domainErrors.daily_logs}>
                    {domainData.daily_logs && (
                      <SectionCard title="Registros Diários" icon="📋" accentColor={colors['brand-yellow']}>
                        <LogsSummary data={domainData.daily_logs} />
                      </SectionCard>
                    )}
                  </DomainTabContent>
                </Tabs.Content>
              )}
              {child.scopes.includes('therapy') && (
                <Tabs.Content value="therapy">
                  <DomainTabContent error={domainErrors.therapy}>
                    {domainData.therapy && (
                      <SectionCard title="Terapia" icon="🏥" accentColor={colors['brand-mint']}>
                        <TherapySection data={domainData.therapy} />
                      </SectionCard>
                    )}
                  </DomainTabContent>
                </Tabs.Content>
              )}
              {child.scopes.includes('medical') && (
                <Tabs.Content value="medical">
                  <DomainTabContent error={domainErrors.medical}>
                    {domainData.medical && (
                      <SectionCard title="Saúde" icon="💊" accentColor={colors['brand-salmon']}>
                        <MedicalSection data={domainData.medical} />
                      </SectionCard>
                    )}
                  </DomainTabContent>
                </Tabs.Content>
              )}
              {child.scopes.includes('development') && (
                <Tabs.Content value="development">
                  <DomainTabContent error={domainErrors.development}>
                    {domainData.development && (
                      <SectionCard title="Desenvolvimento" icon="🌱" accentColor="#22c55e">
                        <DevelopmentSection data={domainData.development} />
                      </SectionCard>
                    )}
                  </DomainTabContent>
                </Tabs.Content>
              )}
            </Box>
          </Tabs.Root>
        </>
      ) : null}
    </Box>
  );
}

function DomainTabContent({ error, children }: { error?: string; children: ReactNode }) {
  if (error) {
    return (
      <GumroadCard color="salmon" shadow="sm" padding="md">
        <Flex align="center" gap="2">
          <ExclamationTriangleIcon />
          <GumroadText level="body-sm" as="span">{error}</GumroadText>
        </Flex>
      </GumroadCard>
    );
  }
  return <>{children}</>;
}
