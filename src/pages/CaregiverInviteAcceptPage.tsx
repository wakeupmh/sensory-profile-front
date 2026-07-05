import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      setError('Cole o código de convite recebido.');
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
      if (status === 400) setError('Código inválido ou já utilizado.');
      else setError('Não foi possível aceitar o convite. Tente novamente.');
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
          Aceitar convite de cuidador
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.75, marginBottom: spacing.lg }}>
        Cole abaixo o código de convite que você recebeu para se tornar cuidador(a) de uma criança.
      </GumroadText>

      {success ? (
        <GumroadCard color="mint" shadow="md" padding="md">
          <Flex direction="column" gap="3" align="start">
            <Flex align="center" gap="2">
              <CheckIcon width={20} height={20} />
              <GumroadHeading level="title-md" as="h2">
                Convite aceito
              </GumroadHeading>
            </Flex>
            <GumroadText level="body-md" as="p">
              Você agora é cuidador(a){success.child ? ` de ${success.child.name}` : ''}. Use o seletor "Visualizando" no
              topo para atuar em nome dessa criança quando quiser.
            </GumroadText>
            {success.child && (
              <GumroadButton variant="primary" size="md" onClick={handleStartCaring}>
                Começar a cuidar agora
              </GumroadButton>
            )}
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              Ir para o início
            </GumroadButton>
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
                label="Código de convite"
                placeholder="Cole o código aqui"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
              />
            </Flex>
          </GumroadCard>

          <Flex gap="2" justify="end" mt="4">
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              Cancelar
            </GumroadButton>
            <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? 'Validando...' : 'Aceitar convite'}
            </GumroadButton>
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default CaregiverInviteAcceptPage;
