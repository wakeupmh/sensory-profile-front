import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, GroupIcon, PersonIcon, PlusIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { caregiverApi, childApi } from '../services/api';
import type { Caregiver } from '../types/caregivers';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import InvitationTokenCard from '../components/sharing/InvitationTokenCard';
import { colors, spacing, radii, shadows } from '../theme/tokens';

export default function CaregiversPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const toast = useToast();

  const [childName, setChildName] = useState('');
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [inviting, setInviting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [list, child] = await Promise.all([
        caregiverApi.list(token, childId),
        childApi.get(childId, token).catch(() => null),
      ]);
      setCaregivers(list);
      setChildName(child?.name ?? '');
    } catch {
      setError('Não foi possível carregar os cuidadores.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!childId || !nameInput.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const token = await getToken();
      const created = await caregiverApi.invite(token, childId, { caregiverName: nameInput.trim() });
      setCaregivers((prev) => [created, ...prev]);
      setNameInput('');
      toast.success('Convite criado');
    } catch {
      setError('Não foi possível convidar o cuidador. Tente novamente.');
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!childId) return;
    setRevokingId(id);
    try {
      const token = await getToken();
      await caregiverApi.revoke(token, childId, id);
      setCaregivers((prev) => prev.filter((c) => c.id !== id));
      toast.success('Acesso revogado');
    } catch {
      setError('Não foi possível revogar o acesso do cuidador.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </Box>

      <Box style={{ marginBottom: spacing.lg }}>
        <Flex align="center" gap="2" mb="1">
          <GroupIcon />
          <GumroadHeading level="display-sm" as="h1">
            Cuidadores {childName && `de ${childName}`}
          </GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Cuidadores têm as mesmas permissões que você — convide apenas pessoas de confiança (ex.: outro responsável, avós).
        </GumroadText>
      </Box>

      <GumroadCard color="cream" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
        <form onSubmit={handleInvite}>
          <Flex gap="2" align="end" wrap="wrap">
            <Box style={{ flex: 1, minWidth: 220 }}>
              <GumroadInput
                label="Nome do cuidador"
                placeholder="Ex: Avó Maria"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </Box>
            <GumroadButton variant="primary" size="md" type="submit" disabled={inviting || !nameInput.trim()}>
              <PlusIcon /> {inviting ? 'Convidando...' : 'Convidar cuidador'}
            </GumroadButton>
          </Flex>
        </form>
      </GumroadCard>

      {error && (
        <GumroadCard role="alert" color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.md }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="span">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : caregivers.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            Nenhum cuidador convidado ainda.
          </GumroadText>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {caregivers.map((c) => (
            <GumroadCard key={c.id} color={c.status === 'pending' ? 'yellow' : 'white'} shadow="md" padding="md">
              <Flex justify="between" align={{ initial: 'start', sm: 'center' }} gap="3" direction={{ initial: 'column', sm: 'row' }}>
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 40, height: 40, borderRadius: radii.full,
                      backgroundColor: colors.surface, border: `2px solid ${colors.ink}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: shadows.input,
                    }}
                  >
                    <PersonIcon width={20} height={20} />
                  </Box>
                  <Flex direction="column" gap="1">
                    <GumroadHeading level="title-sm" as="h3">{c.caregiverName}</GumroadHeading>
                    <GumroadBadge color={c.status === 'accepted' ? 'mint' : 'yellow'}>
                      {c.status === 'accepted' ? 'Aceito' : 'Convite pendente'}
                    </GumroadBadge>
                  </Flex>
                </Flex>

                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <GumroadButton variant="danger" size="sm" disabled={revokingId === c.id}>
                      {revokingId === c.id ? 'Revogando...' : 'Revogar'}
                    </GumroadButton>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content size="2">
                    <AlertDialog.Title>Revogar cuidador</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                      Tem certeza? {c.caregiverName} perderá imediatamente o acesso a esta criança.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <AlertDialog.Cancel>
                        <GumroadButton variant="secondary" size="sm">Cancelar</GumroadButton>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <GumroadButton variant="danger" size="sm" onClick={() => handleRevoke(c.id)}>
                          Revogar
                        </GumroadButton>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              </Flex>

              {c.status === 'pending' && c.invitationToken && (
                <Box style={{ marginTop: spacing.md }}>
                  <InvitationTokenCard token={c.invitationToken} professionalName={c.caregiverName} />
                </Box>
              )}
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
}
