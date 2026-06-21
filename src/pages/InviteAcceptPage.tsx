import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { CheckIcon, ExclamationTriangleIcon, EnvelopeOpenIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { professionalApi } from '../services/api';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { colors, spacing } from '../theme/tokens';

const InviteAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [tokenInput, setTokenInput] = useState(searchParams.get('token') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ professionalName?: string } | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const submit = async (rawToken: string) => {
    const cleaned = rawToken.trim();
    if (!cleaned) {
      setError('Cole o código de convite recebido do paciente.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const authToken = await getToken();
      const professional = await professionalApi.acceptInvite(cleaned, authToken);
      setSuccess({ professionalName: professional.name });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 400) setError('Código inválido ou já utilizado.');
      else setError('Não foi possível aceitar o convite. Tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit if a token was passed via URL
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
        <EnvelopeOpenIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          Aceitar convite
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.75, marginBottom: spacing.lg }}>
        Cole abaixo o código de convite que você recebeu para acessar registros compartilhados.
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
              Você agora pode acessar os registros compartilhados com você
              {success.professionalName ? ` como ${success.professionalName}` : ''}.
            </GumroadText>
            <GumroadButton variant="primary" size="md" onClick={() => navigate('/shared')}>
              Ver registros compartilhados
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

export default InviteAcceptPage;
