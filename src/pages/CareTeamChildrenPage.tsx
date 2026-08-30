import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { BadgeIcon, InfoCircledIcon, PersonIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { careTeamApi } from '../services/api';
import type { CareTeamCaseloadEntry } from '../types/careTeam';
import { CARE_TEAM_ROLE_LABELS } from '../types/careTeam';
import { colors, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState } from '../components/domain/ErrorState';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

/**
 * Caseload do profissional: crianças com participação aceita e não revogada
 * (GET /api/care-team/my-children). Ao clicar, o profissional segue para
 * `/children/:childId` — a MESMA página que o responsável usa, com o próprio
 * login do profissional, sem cabeçalho de delegação. Não reaproveita
 * `DelegationContext`/`X-Delegate-Child-Id`: aquele mecanismo é para
 * cuidadores (CaregiverShare) e resolve `effectiveUserId` como o DONO da
 * criança no backend — usá-lo aqui faria o middleware de delegação rejeitar
 * a requisição (403 "No caregiver relationship to this child"), já que o
 * profissional não tem linha em `caregiver_shares`. O acesso do care team é
 * resolvido pelo backend a partir do próprio token do profissional
 * (`careTeamChildIds` no escopo da requisição — ver CONTRACT.md), então não
 * há nada para "ativar" aqui: é só navegação.
 */
export default function CareTeamChildrenPage() {
  const { t } = useTranslation();
  const { getToken, isLoaded, session } = useAuthContext();
  const [caseload, setCaseload] = useState<CareTeamCaseloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const list = await careTeamApi.myChildren(token);
      setCaseload(list);
    } catch {
      setError(t('careTeam.caseload.error'));
    } finally {
      setLoading(false);
    }
  }, [getToken, t]);

  useEffect(() => {
    if (isLoaded && session) fetchAll();
  }, [isLoaded, session, fetchAll]);

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box mb="6">
        <Flex align="center" gap="2" mb="1">
          <BadgeIcon width={22} height={22} />
          <GumroadHeading level="display-sm" as="h1">
            {t('careTeam.caseload.title')}
          </GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('careTeam.caseload.subtitle')}
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAll} />
      ) : caseload.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} />
            <GumroadHeading level="title-sm" as="h3">
              {t('careTeam.caseload.empty.title')}
            </GumroadHeading>
            <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, textAlign: 'center' }}>
              {t('careTeam.caseload.empty.description')}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {caseload.map((entry) => (
            <GumroadCard key={entry.membershipId} color="white" shadow="md" padding="md">
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
                    <GumroadHeading level="title-sm" as="h3">{entry.childName}</GumroadHeading>
                    {entry.acceptedAt && (
                      <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>
                        {t('careTeam.caseload.acceptedOn', { date: formatDate(entry.acceptedAt) })}
                      </GumroadText>
                    )}
                  </Flex>
                </Flex>
                <Flex gap="2" align="center" wrap="wrap">
                  <GumroadBadge color="lavender">{CARE_TEAM_ROLE_LABELS[entry.role]}</GumroadBadge>
                  <GumroadButton variant="primary" size="sm" asChild>
                    <Link to={`/children/${entry.childId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {t('careTeam.caseload.open')}
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
