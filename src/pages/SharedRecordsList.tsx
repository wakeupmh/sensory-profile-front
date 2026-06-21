import { useCallback, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Separator, Tabs } from '@radix-ui/themes';
import {
  ClipboardIcon,
  FileTextIcon,
  EyeOpenIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedApi } from '../services/api';
import type {
  SharedAnamneseSummary,
  SharedAssessmentSummary,
} from '../types/professionals';
import { getInstrument } from '../instruments';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing } from '../theme/tokens';

const SharedRecordsList: React.FC = () => {
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [anamneses, setAnamneses] = useState<SharedAnamneseSummary[]>([]);
  const [assessments, setAssessments] = useState<SharedAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const [a, b] = await Promise.all([
        sharedApi.listAnamneses(token).catch(() => [] as SharedAnamneseSummary[]),
        sharedApi.listAssessments(token).catch(() => [] as SharedAssessmentSummary[]),
      ]);
      setAnamneses(a);
      setAssessments(b);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os registros compartilhados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && session) fetchAll();
  }, [isLoaded, session, fetchAll]);

  const totalShared = anamneses.length + assessments.length;

  return (
    <Box>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Compartilhados comigo
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Registros que pacientes ou familiares concederam acesso a você
        </GumroadText>
      </Box>

      <Separator size="4" mb="6" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <LoadingSpinner size="large" text="Carregando..." />
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">
              {error}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : totalShared === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={32} height={32} />
            <Box style={{ textAlign: 'center' }}>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nada compartilhado ainda
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                Quando alguém compartilhar uma anamnese ou avaliação com você, ela aparecerá aqui.
              </GumroadText>
            </Box>
            <GumroadButton variant="secondary" size="md" asChild>
              <Link to="/invite/accept" style={{ textDecoration: 'none' }}>
                Tem um código de convite?
              </Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Tabs.Root defaultValue={anamneses.length > 0 ? 'anamneses' : 'assessments'}>
          <Tabs.List>
            <Tabs.Trigger value="anamneses">
              Anamneses
              <GumroadBadge color="cream" style={{ marginLeft: 8 }}>
                {anamneses.length}
              </GumroadBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="assessments">
              Avaliações
              <GumroadBadge color="cream" style={{ marginLeft: 8 }}>
                {assessments.length}
              </GumroadBadge>
            </Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="anamneses">
              {anamneses.length === 0 ? (
                <GumroadCard color="cream" shadow="sm" padding="md">
                  <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                    Nenhuma anamnese foi compartilhada com você ainda.
                  </GumroadText>
                </GumroadCard>
              ) : (
                <Flex direction="column" gap="3">
                  {anamneses.map((a) => (
                    <SharedRow
                      key={a.id}
                      title={a.title || 'Anamnese'}
                      to={`/shared/anamnese/${a.id}`}
                      icon={<ClipboardIcon />}
                      meta={`Criada em ${formatDate(a.createdAt)} · Compartilhada em ${formatDate(a.grantedAt)}`}
                    />
                  ))}
                </Flex>
              )}
            </Tabs.Content>

            <Tabs.Content value="assessments">
              {assessments.length === 0 ? (
                <GumroadCard color="cream" shadow="sm" padding="md">
                  <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                    Nenhuma avaliação foi compartilhada com você ainda.
                  </GumroadText>
                </GumroadCard>
              ) : (
                <Flex direction="column" gap="3">
                  {assessments.map((a) => {
                    const instrumentLabel = a.instrumentId ? getInstrument(a.instrumentId).shortName : null;
                    return (
                      <SharedRow
                        key={a.id}
                        title={a.childName || 'Avaliação'}
                        to={`/shared/assessment/${a.id}`}
                        icon={<FileTextIcon />}
                        meta={`Criada em ${formatDate(a.createdAt)} · Compartilhada em ${formatDate(a.grantedAt)}`}
                        badge={instrumentLabel}
                      />
                    );
                  })}
                </Flex>
              )}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      )}
    </Box>
  );
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

const SharedRow: React.FC<{
  title: string;
  to: string;
  icon: React.ReactNode;
  meta: string;
  badge?: string | null;
}> = ({ title, to, icon, meta, badge }) => (
  <GumroadCard color="white" shadow="md" padding="md">
    <Flex
      justify="between"
      align={{ initial: 'start', sm: 'center' }}
      gap="3"
      direction={{ initial: 'column', sm: 'row' }}
    >
      <Flex align="center" gap="3" style={{ minWidth: 0 }}>
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: colors['surface-cream'],
            border: `2px solid ${colors.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
          <GumroadHeading level="title-sm" as="h3">
            {title}
          </GumroadHeading>
          <GumroadText level="caption" as="span" color={colors.ink} style={{ opacity: 0.65 }}>
            {meta}
          </GumroadText>
        </Flex>
      </Flex>
      <Flex gap="2" align="center" wrap="wrap">
        {badge && <GumroadBadge color="lavender">{badge}</GumroadBadge>}
        <GumroadButton variant="primary" size="sm" asChild>
          <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <EyeOpenIcon />
            Abrir
          </Link>
        </GumroadButton>
      </Flex>
    </Flex>
  </GumroadCard>
);

export default SharedRecordsList;
