import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { BadgeIcon, CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { careTeamApi } from '../services/api';
import { resetCareTeamCaseloadCache } from '../hooks/useCareTeamCaseload';
import { CARE_TEAM_ROLE_LABEL_KEYS } from '../types/careTeam';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { colors, spacing } from '../theme/tokens';

interface AcceptSuccess {
  role: string;
  childName: string | null;
}

const CareTeamAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getToken } = useAuthContext();

  const [tokenInput, setTokenInput] = useState(searchParams.get('token') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<AcceptSuccess | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const submit = async (rawToken: string) => {
    const cleaned = rawToken.trim();
    if (!cleaned) {
      setError(t('careTeam.accept.errors.empty'));
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const authToken = await getToken();
      const accepted = await careTeamApi.acceptInvite(authToken, cleaned);

      // A resposta do aceite é mínima de propósito (id/childId/role — ver
      // CareTeamController no backend); busca o caseload em seguida só para
      // enriquecer a mensagem de sucesso com o nome da criança. Best-effort:
      // se falhar, o sucesso ainda é mostrado, sem o nome.
      let childName: string | null = null;
      try {
        const caseload = await careTeamApi.myChildren(authToken);
        childName = caseload.find((c) => c.childId === accepted.childId)?.childName ?? null;
      } catch {
        // Segue sem o nome — o aceite já está confirmado de qualquer forma.
      }

      resetCareTeamCaseloadCache();
      setSuccess({ role: t(CARE_TEAM_ROLE_LABEL_KEYS[accepted.role]), childName });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 400) setError(t('careTeam.accept.errors.invalid'));
      else setError(t('careTeam.accept.errors.generic'));
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

  return (
    <Box style={{ maxWidth: 540, margin: '0 auto' }}>
      <Flex align="center" gap="2" mb="4">
        <BadgeIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          {t('careTeam.accept.title')}
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.75, marginBottom: spacing.lg }}>
        {t('careTeam.accept.description')}
      </GumroadText>

      {success ? (
        <GumroadCard color="mint" shadow="md" padding="md">
          <Flex direction="column" gap="3" align="start">
            <Flex align="center" gap="2">
              <CheckIcon width={20} height={20} />
              <GumroadHeading level="title-md" as="h2">
                {t('careTeam.accept.success.title')}
              </GumroadHeading>
            </Flex>
            <GumroadText level="body-md" as="p">
              {success.childName
                ? t('careTeam.accept.success.bodyWithChild', { name: success.childName, role: success.role })
                : t('careTeam.accept.success.bodyGeneric', { role: success.role })}
            </GumroadText>
            <Flex gap="2" wrap="wrap">
              <GumroadButton variant="primary" size="md" onClick={() => navigate('/care-team/children')}>
                {t('careTeam.accept.success.cta')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
                {t('careTeam.accept.success.secondaryCta')}
              </GumroadButton>
            </Flex>
          </Flex>
        </GumroadCard>
      ) : (
        <form onSubmit={handleSubmit}>
          <GumroadCard color="white" shadow="md" padding="md">
            <Flex direction="column" gap="3">
              {error && (
                <Flex align="center" gap="2" style={{ color: colors['brand-salmon'] }}>
                  <ExclamationTriangleIcon />
                  <GumroadText level="body-sm" as="span">
                    {error}
                  </GumroadText>
                </Flex>
              )}
              <GumroadInput
                label={t('careTeam.accept.tokenLabel')}
                placeholder={t('careTeam.accept.tokenPlaceholder')}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
              />
            </Flex>
          </GumroadCard>

          <Flex gap="2" justify="end" mt="4">
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('careTeam.accept.cancel')}
            </GumroadButton>
            <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? t('careTeam.accept.submitting') : t('careTeam.accept.submit')}
            </GumroadButton>
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default CareTeamAcceptPage;
