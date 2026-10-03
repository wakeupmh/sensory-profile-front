import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, EyeOpenIcon, InfoCircledIcon, PersonIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedChildrenApi } from '../services/api';
import type { SharedChildSummary } from '../types/childSharing';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang);
  } catch {
    return iso;
  }
}

export default function SharedChildrenList() {
  const { t, i18n } = useTranslation();
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
      setError(t('p2Share.children.loadError'));
    } finally {
      setLoading(false);
    }
  }, [getToken, t]);

  useEffect(() => {
    if (isLoaded && session) fetchAll();
  }, [isLoaded, session, fetchAll]);

  return (
    <Box>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          {t('p2Share.children.title')}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('p2Share.children.subtitle')}
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text={t('p2Share.loading')} />
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="3" wrap="wrap">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">{error}</GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={fetchAll}>{t('p2Share.retry')}</GumroadButton>
          </Flex>
        </GumroadCard>
      ) : children.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} />
            <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, textAlign: 'center' }}>
              {t('p2Share.children.empty')}
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
                      {t('p2Share.children.sharedOn', { date: formatDate(child.grantedAt, i18n.language) })}
                    </GumroadText>
                  </Flex>
                </Flex>
                <Flex gap="2" align="center" wrap="wrap">
                  {child.scopes.map((scope) => (
                    <GumroadBadge key={scope} color="lavender">{t(`p2Share.scope.${scope}`)}</GumroadBadge>
                  ))}
                  <GumroadButton variant="primary" size="sm" asChild>
                    <Link to={`/shared/children/${child.id}`} aria-label={t('p2Share.children.openAria', { name: child.name })} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <EyeOpenIcon /> {t('p2Share.children.open')}
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
