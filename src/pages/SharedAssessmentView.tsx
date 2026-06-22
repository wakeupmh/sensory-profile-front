/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Separator } from '@radix-ui/themes';
import { ChevronLeftIcon, ExclamationTriangleIcon, FileTextIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedApi } from '../services/api';
import ReportContent from '../components/sensory-profile/ReportContent';
import { normalizeAssessmentPayload } from '../components/sensory-profile/normalizeAssessment';
import type { FormData } from '../components/sensory-profile/types';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing } from '../theme/tokens';

const SharedAssessmentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const response = await sharedApi.get('assessment', id, token);
        if (cancelled) return;
        setFormData(normalizeAssessmentPayload(response));
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        const status = err?.response?.status;
        setError(
          status === 404
            ? 'Você não tem acesso a esta avaliação ou ela não existe mais.'
            : 'Não foi possível carregar a avaliação.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [id, getToken]);

  return (
    <Box style={{ maxWidth: 1080, margin: '0 auto' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/shared')}>
          <ChevronLeftIcon /> Voltar
        </GumroadButton>
        <GumroadBadge color="lavender">Compartilhado com você</GumroadBadge>
      </Flex>

      <Flex align="center" gap="2" mb="2">
        <FileTextIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          Avaliação Sensorial
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, marginBottom: spacing.md }}>
        Visualização somente-leitura do relatório.
      </GumroadText>

      <Separator size="4" mb="4" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3" py="9">
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
      ) : formData ? (
        <GumroadCard color="white" shadow="md" padding="lg">
          <ReportContent formData={formData} />
        </GumroadCard>
      ) : null}
    </Box>
  );
};

export default SharedAssessmentView;
