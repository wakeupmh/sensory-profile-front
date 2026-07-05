import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon, EyeOpenIcon, InfoCircledIcon, PersonIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedChildrenApi } from '../services/api';
import type { SharedChildSummary } from '../types/childSharing';
import { CHILD_SHARE_SCOPE_LABELS } from '../types/childSharing';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export default function SharedChildrenList() {
  const { getToken, isLoaded, session } = useAuthContext();
  const [children, setChildren] = useState<SharedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const list = await sharedChildrenApi.list(token);
      setChildren(list);
    } catch {
      setError('Não foi possível carregar as crianças compartilhadas.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && session) fetchAll();
  }, [isLoaded, session, fetchAll]);

  return (
    <Box>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Crianças compartilhadas comigo
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Acesso somente-leitura concedido por responsáveis
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : children.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} />
            <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, textAlign: 'center' }}>
              Nenhuma criança foi compartilhada com você ainda.
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {children.map((child) => (
            <GumroadCard key={child.id} color="white" shadow="md" padding="md">
              <Flex justify="between" align={{ initial: 'start', sm: 'center' }} gap="3" direction={{ initial: 'column', sm: 'row' }}>
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 40, height: 40, borderRadius: radii.full,
                      backgroundColor: colors['surface-cream'], border: `2px solid ${colors.ink}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Flex direction="column" gap="1">
                    <GumroadHeading level="title-sm" as="h3">{child.name}</GumroadHeading>
                    <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>
                      Compartilhado em {formatDate(child.grantedAt)}
                    </GumroadText>
                  </Flex>
                </Flex>
                <Flex gap="2" align="center" wrap="wrap">
                  {child.scopes.map((scope) => (
                    <GumroadBadge key={scope} color="lavender">{CHILD_SHARE_SCOPE_LABELS[scope]}</GumroadBadge>
                  ))}
                  <GumroadButton variant="primary" size="sm" asChild>
                    <Link to={`/shared/children/${child.id}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <EyeOpenIcon /> Abrir
                    </Link>
                  </GumroadButton>
                </Flex>
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
}
