import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Select } from '@radix-ui/themes';
import {
  PersonIcon,
  CrossCircledIcon,
  Share1Icon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../../context/AuthContext';
import {
  professionalApi,
  anamneseSharesApi,
  assessmentSharesApi,
} from '../../services/api';
import type { Professional, ResourceShare } from '../../types/professionals';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadBadge from '../design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import { colors, spacing, radii, shadows } from '../../theme/tokens';

type ResourceType = 'anamnese' | 'assessment';

interface ProfessionalSharePanelProps {
  resourceType: ResourceType;
  resourceId: string;
}

const apiFor = (resourceType: ResourceType) =>
  resourceType === 'anamnese' ? anamneseSharesApi : assessmentSharesApi;

const ProfessionalSharePanel: React.FC<ProfessionalSharePanelProps> = ({ resourceType, resourceId }) => {
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [shares, setShares] = useState<ResourceShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Falha ao conceder/revogar não pode esconder a lista inteira: vira aviso acima dela
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [granting, setGranting] = useState(false);

  const sharesApi = apiFor(resourceType);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getTokenRef.current();
        const [pros, shareList] = await Promise.all([
          professionalApi.list(token),
          sharesApi.list(resourceId, token),
        ]);
        if (cancelled) return;
        setProfessionals(pros);
        setShares(shareList);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(t('p2Sharing.panel.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, sharesApi, reloadKey]);

  const proById = useMemo(() => new Map(professionals.map((p) => [p.id, p])), [professionals]);
  const sharedIds = useMemo(() => new Set(shares.map((s) => s.professionalId)), [shares]);
  const availableProfessionals = useMemo(
    () => professionals.filter((p) => !sharedIds.has(p.id)),
    [professionals, sharedIds],
  );

  const handleGrant = async () => {
    if (!selectedId) return;
    try {
      setGranting(true);
      setActionError(null);
      const token = await getToken();
      const newShare = await sharesApi.grant(resourceId, selectedId, token);
      setShares((prev) => [...prev, newShare]);
      setSelectedId('');
    } catch (err) {
      console.error(err);
      setActionError(t('p2Sharing.panel.grantError'));
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (professionalId: string) => {
    try {
      setBusyId(professionalId);
      setActionError(null);
      const token = await getToken();
      await sharesApi.revoke(resourceId, professionalId, token);
      setShares((prev) => prev.filter((s) => s.professionalId !== professionalId));
    } catch (err) {
      console.error(err);
      setActionError(t('p2Sharing.panel.revokeError'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <GumroadCard color="cream" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
      <Flex align="center" gap="2" mb="2">
        <Share1Icon width={18} height={18} />
        <GumroadHeading level="title-md" as="h3">
          {t('p2Sharing.panel.title')}
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.75, marginBottom: spacing.md }}>
        {t('p2Sharing.panel.description')}
      </GumroadText>

      {loading ? (
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.6 }}>
          {t('p2Sharing.panel.loading')}
        </GumroadText>
      ) : error ? (
        <Flex align="center" gap="3" wrap="wrap" role="alert" style={{ color: colors['brand-salmon'] }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="span">
              {error}
            </GumroadText>
          </Flex>
          <GumroadButton variant="secondary" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
            {t('p2Sharing.panel.retry')}
          </GumroadButton>
        </Flex>
      ) : professionals.length === 0 ? (
        <Flex align="center" gap="3" wrap="wrap">
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.75 }}>
            {t('p2Sharing.panel.noPros')}
          </GumroadText>
          <GumroadButton variant="primary" size="sm" asChild>
            <Link to="/professionals/new" style={{ textDecoration: 'none' }}>
              {t('p2Sharing.panel.addPro')}
            </Link>
          </GumroadButton>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          {actionError && (
            <Flex align="center" gap="2" role="alert" style={{ color: colors['brand-salmon'] }}>
              <ExclamationTriangleIcon />
              <GumroadText level="body-sm" as="span">{actionError}</GumroadText>
            </Flex>
          )}
          {shares.length === 0 ? (
            <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.65 }}>
              {t('p2Sharing.panel.noShares')}
            </GumroadText>
          ) : (
            <Flex direction="column" gap="2">
              {shares.map((share) => {
                const pro = proById.get(share.professionalId);
                return (
                  <Flex
                    key={share.id}
                    align="center"
                    justify="between"
                    gap="3"
                    wrap="wrap"
                    style={{
                      background: colors.surface,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: radii.md,
                      padding: '10px 14px',
                      boxShadow: shadows['card-sm'],
                    }}
                  >
                    <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                      <PersonIcon />
                      <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                        <GumroadText level="body-sm" as="span" style={{ fontWeight: 600 }}>
                          {pro?.name ?? t('p2Sharing.panel.removedPro')}
                        </GumroadText>
                        {pro?.profession && (
                          <GumroadText level="caption" as="span" color={colors.ink} style={{ opacity: 0.65 }}>
                            {pro.profession}
                          </GumroadText>
                        )}
                      </Flex>
                      {pro && (
                        <GumroadBadge color={pro.status === 'accepted' ? 'mint' : 'yellow'}>
                          {pro.status === 'accepted' ? t('p2Sharing.panel.accepted') : t('p2Sharing.panel.pendingInvite')}
                        </GumroadBadge>
                      )}
                    </Flex>
                    <GumroadButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevoke(share.professionalId)}
                      disabled={busyId === share.professionalId}
                      aria-label={t('p2Sharing.panel.revokeAria', { name: pro?.name ?? t('p2Sharing.panel.removedPro') })}
                    >
                      <CrossCircledIcon />
                      {t('p2Sharing.panel.revoke')}
                    </GumroadButton>
                  </Flex>
                );
              })}
            </Flex>
          )}

          {availableProfessionals.length > 0 && (
            <Flex gap="2" align="end" wrap="wrap">
              <div style={{ flex: 1, minWidth: 220 }}>
                <GumroadText level="caption-uppercase" as="span" color={colors.ink} style={{ opacity: 0.6 }}>
                  {t('p2Sharing.panel.grantTo')}
                </GumroadText>
                <Select.Root value={selectedId || undefined} onValueChange={setSelectedId}>
                  <Select.Trigger
                    placeholder={t('p2Sharing.panel.selectPro')}
                    aria-label={t('p2Sharing.panel.grantTo')}
                    style={{
                      width: '100%',
                      border: `2px solid ${colors.ink}`,
                      borderRadius: radii.md,
                      backgroundColor: colors.surface,
                      boxShadow: shadows.input,
                      marginTop: '4px',
                    }}
                  />
                  <Select.Content>
                    {availableProfessionals.map((p) => (
                      <Select.Item key={p.id} value={p.id}>
                        {p.name}
                        {p.profession ? ` · ${p.profession}` : ''}
                        {p.status === 'pending' ? t('p2Sharing.panel.pendingInviteParen') : ''}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
              <GumroadButton variant="primary" size="md" onClick={handleGrant} disabled={!selectedId || granting}>
                {granting ? t('p2Sharing.panel.sharing') : t('p2Sharing.panel.share')}
              </GumroadButton>
            </Flex>
          )}
        </Flex>
      )}
    </GumroadCard>
  );
};

export default ProfessionalSharePanel;
