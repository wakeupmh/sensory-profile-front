/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Separator } from '@radix-ui/themes';
import { ChevronLeftIcon, ExclamationTriangleIcon, ClipboardIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedApi } from '../services/api';
import ChildSection from '../components/anamnese/ChildSection';
import CaregiverSection from '../components/anamnese/CaregiverSection';
import ClinicalHistorySection from '../components/anamnese/ClinicalHistorySection';
import { emptyClinicalHistory } from '../components/anamnese/types';
import type { AnamneseFormData } from '../components/anamnese/types';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing } from '../theme/tokens';

const emptyFormData: AnamneseFormData = {
  child: { name: '', birthDate: '', gender: 'male', nationalIdentity: '', otherInfo: '', age: 0 },
  caregiver: { name: '', relationship: '', contact: '' },
  clinicalHistory: emptyClinicalHistory(),
};

const noop = () => {};

const SharedAnamneseView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const [data, setData] = useState<AnamneseFormData>(emptyFormData);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
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
        const payload = await sharedApi.get('anamnese', id, token);
        if (cancelled) return;
        const responses = payload.responses ?? {};
        setData({
          child: responses.child ?? payload.child ?? emptyFormData.child,
          caregiver: responses.caregiver ?? payload.caregiver ?? emptyFormData.caregiver,
          clinicalHistory: responses.clinicalHistory ?? payload.clinicalHistory ?? emptyClinicalHistory(),
        });
        setCreatedAt(payload.createdAt ?? null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        const status = err?.response?.status;
        setError(
          status === 404
            ? 'Você não tem acesso a esta anamnese ou ela não existe mais.'
            : 'Não foi possível carregar a anamnese.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [id, getToken]);

  return (
    <Box style={{ maxWidth: 960, margin: '0 auto' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/shared')}>
          <ChevronLeftIcon /> Voltar
        </GumroadButton>
        <GumroadBadge color="lavender">Compartilhado com você</GumroadBadge>
      </Flex>

      <Flex align="center" gap="2" mb="2">
        <ClipboardIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          Anamnese
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, marginBottom: spacing.md }}>
        Visualização somente-leitura. {createdAt && <>Criada em {new Date(createdAt).toLocaleDateString('pt-BR')}.</>}
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
      ) : (
        <GumroadCard color="white" shadow="md" padding="lg">
          <ChildSection formData={data} updateFormData={noop} disabled />
          <CaregiverSection formData={data} updateFormData={noop} disabled />
          <ClinicalHistorySection formData={data} updateFormData={noop} disabled />
        </GumroadCard>
      )}
    </Box>
  );
};

export default SharedAnamneseView;
