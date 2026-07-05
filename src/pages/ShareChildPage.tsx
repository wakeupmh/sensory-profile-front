import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, PersonIcon } from '@radix-ui/react-icons';
import { professionalApi, childSharesApi, childApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import type { Professional } from '../types/professionals';
import type { ChildShareScope } from '../types/childSharing';
import { CHILD_SHARE_SCOPE_LABELS, CHILD_SHARE_SCOPES } from '../types/childSharing';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import ScopePill from '../components/child-profile/ScopePill';

export default function ShareChildPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [childName, setChildName] = useState<string>('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [scopesByProfessional, setScopesByProfessional] = useState<Record<string, ChildShareScope[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [pros, shares, child] = await Promise.all([
        professionalApi.list(token),
        childSharesApi.list(token, childId),
        childApi.get(childId, token).catch(() => null),
      ]);
      setProfessionals(pros);
      setChildName(child?.name ?? '');
      const map: Record<string, ChildShareScope[]> = {};
      for (const s of shares) map[s.professionalId] = s.scopes;
      setScopesByProfessional(map);
    } catch {
      setError('Não foi possível carregar profissionais ou compartilhamentos.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggleScope = async (professionalId: string, scope: ChildShareScope) => {
    if (!childId || busyId) return;
    const current = scopesByProfessional[professionalId] ?? [];
    const next = current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope];
    setBusyId(professionalId);
    try {
      const token = await getToken();
      if (next.length === 0) {
        await childSharesApi.revoke(token, childId, professionalId);
      } else {
        await childSharesApi.grant(token, childId, { professionalId, scopes: next });
      }
      setScopesByProfessional((prev) => ({ ...prev, [professionalId]: next }));
    } catch {
      setError('Não foi possível atualizar o compartilhamento. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  };

  const revokeAll = async (professionalId: string) => {
    if (!childId || busyId) return;
    setBusyId(professionalId);
    try {
      const token = await getToken();
      await childSharesApi.revoke(token, childId, professionalId);
      setScopesByProfessional((prev) => ({ ...prev, [professionalId]: [] }));
    } catch {
      setError('Não foi possível revogar o acesso. Tente novamente.');
    } finally {
      setBusyId(null);
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
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Compartilhar {childName || 'criança'}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Conceda acesso somente-leitura a domínios inteiros para profissionais cadastrados
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : professionals.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.75 }}>
              Você ainda não cadastrou nenhum profissional.
            </GumroadText>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/professionals/new" style={{ textDecoration: 'none' }}>+ Cadastrar profissional</Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {professionals.map((pro) => {
            const scopes = scopesByProfessional[pro.id] ?? [];
            const hasAccess = scopes.length > 0;
            return (
              <GumroadCard key={pro.id} color={hasAccess ? 'white' : 'cream'} shadow="md" padding="md">
                <Flex justify="between" align="start" gap="3" wrap="wrap" mb="2">
                  <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        width: 36, height: 36, borderRadius: radii.full,
                        backgroundColor: colors['surface-cream'], border: `2px solid ${colors.ink}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <PersonIcon />
                    </Box>
                    <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                      <GumroadText level="body-sm" as="span" style={{ fontWeight: 700 }}>{pro.name}</GumroadText>
                      {pro.profession && (
                        <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>{pro.profession}</GumroadText>
                      )}
                    </Flex>
                    <GumroadBadge color={pro.status === 'accepted' ? 'mint' : 'yellow'}>
                      {pro.status === 'accepted' ? 'Aceito' : 'Convite pendente'}
                    </GumroadBadge>
                  </Flex>
                  {hasAccess && (
                    <GumroadButton variant="danger" size="sm" onClick={() => revokeAll(pro.id)} disabled={busyId === pro.id}>
                      Revogar tudo
                    </GumroadButton>
                  )}
                </Flex>

                <Flex gap="2" wrap="wrap" style={{
                  paddingTop: spacing.xs,
                  borderTop: `1.5px solid rgba(10,10,26,0.15)`,
                  opacity: busyId === pro.id ? 0.6 : 1,
                }}>
                  {CHILD_SHARE_SCOPES.map((scope) => (
                    <ScopePill
                      key={scope}
                      label={CHILD_SHARE_SCOPE_LABELS[scope]}
                      active={scopes.includes(scope)}
                      onClick={() => toggleScope(pro.id, scope)}
                      disabled={busyId === pro.id}
                    />
                  ))}
                </Flex>
              </GumroadCard>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
