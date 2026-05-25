import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { educationPlanApi, schoolCommApi, childApi } from '../services/api';
import type { ChildData } from '../services/api';
import type { EducationPlan, SchoolCommunicationSummary } from '../types/education';
import {
  EDUCATION_PLAN_TYPE_LABELS,
  EDUCATION_PLAN_TYPE_COLORS,
  SCHOOL_COMM_TYPE_LABELS,
  SCHOOL_COMM_TYPE_COLORS,
} from '../types/education';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, shadows, radii, fonts } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import EducationPlansPanel from '../components/education/EducationPlansPanel';
import SchoolCommsPanel from '../components/education/SchoolCommsPanel';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EducationPage() {
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [plans, setPlans] = useState<EducationPlan[]>([]);
  const [comms, setComms] = useState<SchoolCommunicationSummary[]>([]);
  const [commsTotal, setCommsTotal] = useState(0);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [searchParams] = useSearchParams();
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get('childId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plansPanelOpen, setPlansPanelOpen] = useState(false);
  const [commsPanelOpen, setCommsPanelOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const childIdParam = selectedChildId || undefined;
      const [plansData, commsData, childList] = await Promise.all([
        educationPlanApi.list(token, { childId: childIdParam }),
        schoolCommApi.list(token, { childId: childIdParam, limit: 3, page: 1 }),
        childApi.list(token),
      ]);
      setPlans(plansData);
      setComms(commsData.data);
      setCommsTotal(commsData.total);
      setChildren(childList);
      setError(null);
    } catch {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAll();
    }
  }, [fetchAll, isLoaded, session]);

  const effectiveChildId = selectedChildId || (children.length > 0 ? children[0].id : '');

  const previewItemStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    padding: `${spacing.xs} 0`,
    borderBottom: `1px solid rgba(10,10,26,0.1)`,
  };

  const emptyStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    opacity: 0.5,
    fontStyle: 'italic',
  };

  const handleMutate = () => {
    fetchAll();
  };

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Educação
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Planos educacionais e comunicações com a escola
          </GumroadText>
        </Box>
      </Flex>

      {/* Child filter */}
      {children.length > 0 && (
        <Box mb="4">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{
              height: '44px',
              padding: '0 12px',
              backgroundColor: colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              fontFamily: fonts.display,
              fontSize: '14px',
              fontWeight: 500,
              color: colors.ink,
              cursor: 'pointer',
              boxShadow: shadows['card-sm'],
              minWidth: '200px',
            }}
          >
            <option value="">Todas as crianças</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Box>
      )}

      {/* No child selected prompt */}
      {children.length > 0 && !effectiveChildId && (
        <GumroadCard color="cream" shadow="md" padding="lg" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" style={{ opacity: 0.7 }}>
            Selecione uma criança para ver os dados educacionais.
          </GumroadText>
        </GumroadCard>
      )}

      {/* Loading state */}
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          {/* Planos Educacionais */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Planos Educacionais
                </GumroadHeading>
                <GumroadBadge color="cyan">{plans.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setPlansPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {plans.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum plano cadastrado</p>
            ) : (
              plans.slice(0, 3).map((plan) => {
                const planTypeColors = EDUCATION_PLAN_TYPE_COLORS[plan.planType];
                return (
                  <div key={plan.id} style={previewItemStyle}>
                    {plan.schoolName}
                    {' '}
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: 0.7,
                        fontStyle: 'italic',
                      }}
                    >
                      — {plan.academicYear}
                    </span>
                    {' '}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        backgroundColor: planTypeColors.bg,
                        color: planTypeColors.text,
                        fontSize: '11px',
                        fontWeight: 600,
                        marginLeft: '4px',
                        border: `1px solid ${colors.ink}`,
                      }}
                    >
                      {EDUCATION_PLAN_TYPE_LABELS[plan.planType]}
                    </span>
                  </div>
                );
              })
            )}
          </GumroadCard>

          {/* Comunicações com a Escola */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Comunicações com a Escola
                </GumroadHeading>
                <GumroadBadge color="lavender">{commsTotal}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setCommsPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {comms.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhuma comunicação registrada</p>
            ) : (
              comms.slice(0, 3).map((comm) => {
                const commTypeColors = SCHOOL_COMM_TYPE_COLORS[comm.commType];
                return (
                  <div key={comm.id} style={previewItemStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        backgroundColor: commTypeColors.bg,
                        color: commTypeColors.text,
                        fontSize: '11px',
                        fontWeight: 600,
                        marginRight: '6px',
                        border: `1px solid ${colors.ink}`,
                      }}
                    >
                      {SCHOOL_COMM_TYPE_LABELS[comm.commType]}
                    </span>
                    {comm.subject}
                    {' '}
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>
                      — {formatDateTime(comm.occurredAt)}
                    </span>
                  </div>
                );
              })
            )}
          </GumroadCard>
        </Flex>
      )}

      {/* Panels */}
      <EducationPlansPanel
        isOpen={plansPanelOpen}
        onClose={() => setPlansPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={handleMutate}
      />

      <SchoolCommsPanel
        isOpen={commsPanelOpen}
        onClose={() => setCommsPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={handleMutate}
      />
    </Box>
  );
}
