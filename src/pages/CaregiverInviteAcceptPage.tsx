import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { CheckIcon, ExclamationTriangleIcon, GroupIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { useDelegation } from '../context/DelegationContext';
import { caregiverApi } from '../services/api';
import type { DelegateChild } from '../types/caregivers';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { colors, spacing } from '../theme/tokens';

const CaregiverInviteAcceptPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const { addCaregiverChild, startDelegating } = useDelegation();

  const [tokenInput, setTokenInput] = useState(searchParams.get('token') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ caregiverName: string; child: DelegateChild | null } | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const submit = async (rawToken: string) => {
    const cleaned = rawToken.trim();
    if (!cleaned) {
      setError(t('p1CgInvite.pasteCode'));
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const authToken = await getToken();
      const result = await caregiverApi.acceptInvite(authToken, cleaned);
      const child = result.child ?? null;
      if (child) addCaregiverChild(child);
      setSuccess({ caregiverName: result.caregiver.caregiverName, child });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 400) setError(t('p1CgInvite.invalidCode'));
      else setError(t('p1CgInvite.errAccept'));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken && !autoSubmitted && !success && !error) {
      setAutoSubmitted(true);
      submit(urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(tokenInput);
  };

  const handleStartCaring = () => {
    if (success?.child) startDelegating(success.child);
    navigate('/dashboard');
  };

  return (
    <Box style={{ maxWidth: 540, margin: '0 auto' }}>
      <Flex align="center" gap="2" mb="4">
        <GroupIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          {t('p1CgInvite.title')}
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.75, marginBottom: spacing.lg }}>
        {t('p1CgInvite.intro')}
      </GumroadText>

      {success ? (
        <GumroadCard color="mint" shadow="md" padding="md">
          <Flex direction="column" gap="3" align="start">
            <Flex align="center" gap="2">
              <CheckIcon width={20} height={20} />
              <GumroadHeading level="title-md" as="h2">
                {t('p1CgInvite.accepted')}
              </GumroadHeading>
            </Flex>
            <GumroadText level="body-md" as="p">
              {t('p1CgInvite.acceptedBody', { of: success.child ? t('p1CgInvite.ofChild', { name: success.child.name }) : '' })}
            </GumroadText>
            {success.child && (
              <GumroadButton variant="primary" size="md" onClick={handleStartCaring}>
                {t('p1CgInvite.startNow')}
              </GumroadButton>
            )}
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('p1CgInvite.goHome')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <form onSubmit={handleSubmit}>
          <GumroadCard color="white" shadow="md" padding="md">
            <Flex direction="column" gap="3">
              {error && (
                <Flex role="alert" align="center" gap="2" style={{ color: colors['brand-salmon'] }}>
                  <ExclamationTriangleIcon aria-hidden="true" />
                  <GumroadText level="body-sm" as="span">
                    {error}
                  </GumroadText>
                </Flex>
              )}
              <GumroadInput
                label={t('p1CgInvite.codeLabel')}
                placeholder={t('p1CgInvite.codePh')}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
              />
            </Flex>
          </GumroadCard>

          <Flex gap="2" justify="end" mt="4">
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('p1CgInvite.cancel')}
            </GumroadButton>
            <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? t('p1CgInvite.validating') : t('p1CgInvite.accept')}
            </GumroadButton>
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default CaregiverInviteAcceptPage;
