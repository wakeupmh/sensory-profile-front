import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { CheckIcon, ExclamationTriangleIcon, HomeIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { clinicApi } from '../services/api';
import { CLINIC_ROLE_LABEL_KEYS } from '../types/clinic';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { colors, spacing } from '../theme/tokens';

/**
 * Aceitar um convite de clínica. Mesmo formato do convite da equipe de
 * cuidado — token na querystring, aceite já autenticado, mensagem única para
 * qualquer falha.
 *
 * Entrar numa clínica não dá acesso a criança nenhuma: os atendimentos
 * continuam vindo da concessão do responsável, um por um.
 */
const ClinicAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getToken } = useAuthContext();

  const [tokenInput, setTokenInput] = useState(searchParams.get('token') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const submit = async (rawToken: string) => {
    const cleaned = rawToken.trim();
    if (!cleaned) {
      setError(t('clinic.accept.errors.empty'));
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const authToken = await getToken();
      const accepted = await clinicApi.acceptInvite(authToken, cleaned);
      setSuccess(t(CLINIC_ROLE_LABEL_KEYS[accepted.role]));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 400) setError(t('clinic.accept.errors.invalid'));
      else setError(t('clinic.accept.errors.generic'));
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
        <HomeIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          {t('clinic.accept.title')}
        </GumroadHeading>
      </Flex>

      {success ? (
        <GumroadCard color="mint" shadow="md" padding="lg">
          <Flex direction="column" gap="3" align="start">
            <Flex align="center" gap="2">
              <CheckIcon />
              <GumroadText level="body-md" as="p">
                {t('clinic.accept.success', { role: success })}
              </GumroadText>
            </Flex>
            <GumroadText level="caption" as="p" style={{ opacity: 0.8 }}>
              {t('clinic.accept.noAccessNote')}
            </GumroadText>
            <GumroadButton variant="primary" size="sm" onClick={() => navigate('/clinics')}>
              {t('clinic.accept.goToClinics')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <GumroadCard color="cream" shadow="md" padding="lg">
          <form onSubmit={handleSubmit}>
            <label htmlFor="clinic-invite-token">
              <GumroadText level="caption" as="span">{t('clinic.accept.tokenLabel')}</GumroadText>
            </label>
            <GumroadInput
              id="clinic-invite-token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder={t('clinic.accept.tokenPlaceholder')}
            />
            {error && (
              <Flex align="center" gap="2" style={{ marginTop: spacing.sm, color: colors['brand-salmon'] }}>
                <ExclamationTriangleIcon />
                <GumroadText level="body-sm" as="p">{error}</GumroadText>
              </Flex>
            )}
            <Box style={{ marginTop: spacing.md }}>
              <GumroadButton type="submit" variant="primary" disabled={submitting}>
                {submitting ? t('clinic.accept.submitting') : t('clinic.accept.submit')}
              </GumroadButton>
            </Box>
          </form>
        </GumroadCard>
      )}
    </Box>
  );
};

export default ClinicAcceptPage;
