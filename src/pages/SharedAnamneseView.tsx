/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Separator } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
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

const SharedAnamneseView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const [data, setData] = useState<AnamneseFormData>(emptyFormData);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const payload = await sharedApi.getAnamnese(id, token);
        const responses = payload.responses ?? {};
        setData({
          child: responses.child ?? payload.child ?? emptyFormData.child,
          caregiver: responses.caregiver ?? payload.caregiver ?? emptyFormData.caregiver,
          clinicalHistory: responses.clinicalHistory ?? payload.clinicalHistory ?? emptyClinicalHistory(),
        });
        setCreatedAt(payload.createdAt ?? null);
        fetchedRef.current = true;
      } catch (err: any) {
        console.error(err);
        const status = err?.response?.status;
        setError(
          status === 404
            ? t('p2Share.anamnese.noAccess')
            : t('p2Share.anamnese.loadError'),
        );
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getToken, reloadKey]);

  const noop = () => {};

  return (
    <Box style={{ maxWidth: 960, margin: '0 auto' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/shared')}>
          <ChevronLeftIcon /> {t('p2Share.back')}
        </GumroadButton>
        <GumroadBadge color="lavender">{t('p2Share.anamnese.sharedBadge')}</GumroadBadge>
      </Flex>

      <Flex align="center" gap="2" mb="2">
        <ClipboardIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          {t('p2Share.anamnese.title')}
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, marginBottom: spacing.md }}>
        {t('p2Share.anamnese.readOnly')} {createdAt && t('p2Share.anamnese.created', { date: new Date(createdAt).toLocaleDateString(i18n.language) })}
      </GumroadText>

      <Separator size="4" mb="4" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3" py="9">
            <LoadingSpinner size="large" text={t('p2Share.loading')} />
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="3" wrap="wrap">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">
              {error}
            </GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
              {t('p2Share.retry')}
            </GumroadButton>
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
