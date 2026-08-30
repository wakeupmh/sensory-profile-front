import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex, AlertDialog, TextField } from '@radix-ui/themes';
import {
  ArrowLeftIcon,
  BadgeIcon,
  CheckIcon,
  CopyIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { careTeamApi, childApi } from '../services/api';
import type { CareTeamMember, CreateCareTeamMemberResponse } from '../types/careTeam';
import { CARE_TEAM_ROLES, CARE_TEAM_ROLE_LABEL_KEYS, getCareTeamDisplayStatus, type CareTeamDisplayStatus } from '../types/careTeam';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import FastSelect from '../components/sensory-profile/FastSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, radii, shadows, typography } from '../theme/tokens';

const STATUS_ORDER: CareTeamDisplayStatus[] = ['active', 'pending', 'expired', 'revoked'];

const STATUS_BADGE_COLOR: Record<CareTeamDisplayStatus, 'mint' | 'yellow' | 'peach' | 'cream'> = {
  active: 'mint',
  pending: 'yellow',
  expired: 'peach',
  revoked: 'cream',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

function buildInviteLink(token: string): string {
  return `${window.location.origin}/care-team/accept?token=${encodeURIComponent(token)}`;
}

export default function CareTeamPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const toast = useToast();

  const [childName, setChildName] = useState('');
  const [members, setMembers] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dentro do componente porque o rótulo passa pelo i18n — no escopo do
  // módulo o `t` ainda não existe.
  const roleOptions = useMemo(
    () => CARE_TEAM_ROLES.map((role) => ({ value: role, label: t(CARE_TEAM_ROLE_LABEL_KEYS[role]) })),
    [t],
  );

  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<string>('');
  const [inviting, setInviting] = useState(false);
  const [justInvited, setJustInvited] = useState<CreateCareTeamMemberResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [list, child] = await Promise.all([
        careTeamApi.list(token, childId),
        childApi.get(childId, token).catch(() => null),
      ]);
      setMembers(list);
      setChildName(child?.name ?? '');
    } catch {
      setError(t('careTeam.manage.error.load'));
    } finally {
      setLoading(false);
    }
  }, [childId, getToken, t]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   * Convida de novo alguém cujo convite expirou.
   *
   * Sem isto o card expirado não tinha ação nenhuma: ficava na lista para
   * sempre, e reconvidar exigia redigitar nome e especialidade no formulário
   * lá em cima. Reaproveita o mesmo caminho do convite — um convite novo, com
   * token novo e prazo novo.
   */
  const handleReinvite = async (member: CareTeamMember) => {
    setNameInput(member.memberName);
    setRoleInput(member.role);
    await submitInvite(member.memberName, member.role);
  };

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !roleInput) return;
    await submitInvite(nameInput, roleInput as CreateCareTeamMemberResponse['role']);
  };

  const submitInvite = async (memberName: string, role: CreateCareTeamMemberResponse['role']) => {
    if (!childId || !memberName.trim() || !role) return;
    setInviting(true);
    setError(null);
    try {
      const token = await getToken();
      const created = await careTeamApi.invite(token, childId, {
        memberName: memberName.trim(),
        role,
      });
      // Guarda o token só neste estado local, exibido uma vez — nunca entra
      // na lista `members` (que espelha o que a listagem devolve, sem token).
      setJustInvited(created);
      setCopied(false);
      // Monta a versão de listagem à mão (em vez de espalhar `created`) para
      // que `invitationToken` nunca entre em `members` — o mesmo formato que
      // um refresh da lista traria.
      setMembers((prev) => [
        {
          id: created.id,
          childId: created.childId,
          memberName: created.memberName,
          role: created.role,
          status: created.status,
          invitationExpiresAt: created.invitationExpiresAt,
          acceptedAt: created.acceptedAt,
          revokedAt: created.revokedAt,
          createdAt: created.createdAt,
        },
        ...prev,
      ]);
      setNameInput('');
      setRoleInput('');
      toast.success(t('careTeam.manage.inviteSuccess.title'));
    } catch {
      setError(t('careTeam.manage.error.invite'));
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!justInvited?.invitationToken) return;
    try {
      await navigator.clipboard.writeText(buildInviteLink(justInvited.invitationToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: o campo readOnly abaixo permite seleção/cópia manual.
    }
  };

  const handleRevoke = async (id: string) => {
    if (!childId) return;
    setRevokingId(id);
    try {
      const token = await getToken();
      await careTeamApi.revoke(token, childId, id);
      const revokedAt = new Date().toISOString();
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'revoked', revokedAt } : m)),
      );
      toast.success(t('careTeam.manage.memberCard.revoke'));
    } catch {
      setError(t('careTeam.manage.error.revoke'));
    } finally {
      setRevokingId(null);
    }
  };

  const grouped = useMemo(() => {
    const now = new Date();
    const byStatus = new Map<CareTeamDisplayStatus, CareTeamMember[]>();
    for (const status of STATUS_ORDER) byStatus.set(status, []);
    for (const member of members) {
      const status = getCareTeamDisplayStatus(member, now);
      byStatus.get(status)!.push(member);
    }
    return byStatus;
  }, [members]);

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon /> {t('careTeam.manage.back')}
        </GumroadButton>
      </Box>

      <Box style={{ marginBottom: spacing.lg }}>
        <Flex align="center" gap="2" mb="1">
          <BadgeIcon />
          <GumroadHeading level="display-sm" as="h1">
            {childName ? t('careTeam.manage.titleWithChild', { name: childName }) : t('careTeam.manage.title')}
          </GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('careTeam.manage.subtitle', { name: childName || t('careTeam.manage.thisChild') })}
        </GumroadText>
      </Box>

      <GumroadCard color="cream" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
        <form onSubmit={handleInvite}>
          <Flex gap="2" align="end" wrap="wrap">
            <Box style={{ flex: 2, minWidth: 220 }}>
              <GumroadInput
                label={t('careTeam.manage.inviteForm.nameLabel')}
                placeholder={t('careTeam.manage.inviteForm.namePlaceholder')}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 200 }}>
              <FastSelect
                name="role"
                label={t('careTeam.manage.inviteForm.roleLabel')}
                options={roleOptions}
                initialValue={roleInput}
                onValueChange={(_name, value) => setRoleInput(value)}
                required
              />
            </Box>
            <GumroadButton variant="primary" size="md" type="submit" disabled={inviting || !nameInput.trim() || !roleInput}>
              <PlusIcon /> {inviting ? t('careTeam.manage.inviteForm.submitting') : t('careTeam.manage.inviteForm.submit')}
            </GumroadButton>
          </Flex>
        </form>
      </GumroadCard>

      {justInvited?.invitationToken && (
        <GumroadCard color="yellow" shadow="md" padding="md" role="status" style={{ marginBottom: spacing.lg }}>
          <Flex direction="column" gap="3">
            <GumroadHeading level="title-md" as="h3">
              {t('careTeam.manage.inviteSuccess.title')}
            </GumroadHeading>
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.85 }}>
              {t('careTeam.manage.inviteSuccess.body', {
                name: justInvited.memberName,
                role: t(CARE_TEAM_ROLE_LABEL_KEYS[justInvited.role]),
              })}
            </GumroadText>
            <TextField.Root
              value={buildInviteLink(justInvited.invitationToken)}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${colors.ink}`,
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            />
            <Flex gap="2" wrap="wrap" align="center" justify="between">
              <GumroadButton variant="primary" size="sm" onClick={handleCopyLink}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? t('careTeam.manage.inviteSuccess.copied') : t('careTeam.manage.inviteSuccess.copy')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => setJustInvited(null)}>
                {t('careTeam.manage.inviteSuccess.dismiss')}
              </GumroadButton>
            </Flex>
            <Flex
              align="start"
              gap="2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.55)',
                border: `1.5px solid ${colors.ink}`,
                borderRadius: radii.sm,
                padding: '8px 12px',
              }}
            >
              <ExclamationTriangleIcon style={{ flexShrink: 0, marginTop: 2 }} />
              <GumroadText level="caption" as="p" style={{ fontWeight: 700 }}>
                {t('careTeam.manage.inviteSuccess.warning')}
              </GumroadText>
            </Flex>
          </Flex>
        </GumroadCard>
      )}

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
      ) : members.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="2">
            <GumroadHeading level="title-sm" as="h3">
              {t('careTeam.manage.empty.title')}
            </GumroadHeading>
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              {t('careTeam.manage.empty.description', { name: childName || t('careTeam.manage.thisChild') })}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="5">
          {STATUS_ORDER.map((status) => {
            const group = grouped.get(status) ?? [];
            if (group.length === 0) return null;
            return (
              <Box key={status}>
                {/* h2: é um título de seção de verdade, e o nome de cada pessoa
                    logo abaixo é h3. Como <p>, a página pulava de h1 para h3 e
                    quem navega por títulos perdia a estrutura da lista. */}
                <h2
                  style={{
                    ...typography['caption-uppercase'],
                    fontSize: typography['caption-uppercase'].size,
                    fontWeight: typography['caption-uppercase'].weight,
                    letterSpacing: typography['caption-uppercase'].ls,
                    fontFamily: typography['caption-uppercase'].font,
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    margin: `0 0 ${spacing.xs}`,
                  }}
                >
                  {t(`careTeam.manage.groupHeading.${status}`)} ({group.length})
                </h2>
                <Flex direction="column" gap="3">
                  {group.map((member) => (
                    <CareTeamMemberCard
                      key={member.id}
                      member={member}
                      status={status}
                      childName={childName}
                      revoking={revokingId === member.id}
                      onRevoke={() => handleRevoke(member.id)}
                      onReinvite={() => handleReinvite(member)}
                      reinviting={inviting}
                    />
                  ))}
                </Flex>
              </Box>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

function CareTeamMemberCard({
  member,
  status,
  childName,
  revoking,
  onRevoke,
  onReinvite,
  reinviting,
}: {
  member: CareTeamMember;
  status: CareTeamDisplayStatus;
  childName: string;
  revoking: boolean;
  onRevoke: () => void;
  onReinvite: () => void;
  reinviting: boolean;
}) {
  const { t } = useTranslation();
  // Expirado já não concede nada — o convite não pode mais ser aceito (o
  // backend confere a validade no aceite). "Revogar" só faz sentido para um
  // acesso que ainda está de pé ou que ainda pode vir a ser aceito.
  const canRevoke = status === 'active' || status === 'pending';

  return (
    <GumroadCard color={status === 'revoked' ? 'cream' : 'white'} shadow="md" padding="md" style={status === 'revoked' ? { opacity: 0.7 } : undefined}>
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
            <GumroadHeading level="title-sm" as="h3">{member.memberName}</GumroadHeading>
            <Flex gap="2" align="center" wrap="wrap">
              <GumroadBadge color={STATUS_BADGE_COLOR[status]}>{t(`careTeam.manage.status.${status}`)}</GumroadBadge>
              <GumroadText level="caption" as="span" style={{ opacity: 0.7 }}>
                {t(CARE_TEAM_ROLE_LABEL_KEYS[member.role])}
              </GumroadText>
            </Flex>
            <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>
              {status === 'active' && member.acceptedAt
                ? t('careTeam.manage.memberCard.acceptedOn', { date: formatDate(member.acceptedAt) })
                : status === 'pending' && member.invitationExpiresAt
                  ? t('careTeam.manage.memberCard.expiresOn', { date: formatDate(member.invitationExpiresAt) })
                  : status === 'expired' && member.invitationExpiresAt
                    ? t('careTeam.manage.memberCard.expiredOn', { date: formatDate(member.invitationExpiresAt) })
                    : status === 'revoked' && member.revokedAt
                      ? t('careTeam.manage.memberCard.revokedOn', { date: formatDate(member.revokedAt) })
                      : t('careTeam.manage.memberCard.invitedOn', { date: formatDate(member.createdAt) })}
            </GumroadText>
          </Flex>
        </Flex>

        {/* Expirado deixou de ter ação nenhuma: o card ficava na lista para
            sempre, e reconvidar exigia redigitar nome e especialidade no
            formulário lá em cima. O que o responsável quer aqui é reenviar. */}
        {status === 'expired' && (
          <GumroadButton variant="secondary" size="sm" disabled={reinviting} onClick={onReinvite}>
            {reinviting ? t('careTeam.manage.memberCard.reinviting') : t('careTeam.manage.memberCard.reinvite')}
          </GumroadButton>
        )}

        {canRevoke && (
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <GumroadButton variant="danger" size="sm" disabled={revoking}>
                {revoking
                  ? t('careTeam.manage.memberCard.revoking')
                  : status === 'pending'
                    ? t('careTeam.manage.memberCard.cancelInvite')
                    : t('careTeam.manage.memberCard.revoke')}
              </GumroadButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content size="2">
              <AlertDialog.Title>
                {status === 'pending' ? t('careTeam.manage.revokeDialog.titlePending') : t('careTeam.manage.revokeDialog.title')}
              </AlertDialog.Title>
              <AlertDialog.Description size="2">
                {status === 'pending'
                  ? t('careTeam.manage.revokeDialog.descriptionPending', { name: member.memberName })
                  : t('careTeam.manage.revokeDialog.description', { name: member.memberName, childName: childName || t('careTeam.manage.thisChild') })}
              </AlertDialog.Description>
              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <GumroadButton variant="secondary" size="sm">{t('careTeam.manage.revokeDialog.cancel')}</GumroadButton>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <GumroadButton variant="danger" size="sm" onClick={onRevoke}>
                    {status === 'pending' ? t('careTeam.manage.revokeDialog.confirmPending') : t('careTeam.manage.revokeDialog.confirm')}
                  </GumroadButton>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        )}
      </Flex>
    </GumroadCard>
  );
}
