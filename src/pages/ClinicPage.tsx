import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { CheckIcon, CopyIcon, PersonIcon, PlusIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clinicApi } from '../services/api';
import { useDomainResource } from '../hooks/useDomainResource';
import type { ClinicRosterMember, CreateClinicMemberResponse, ClinicRole } from '../types/clinic';
import { CLINIC_ROLES, CLINIC_ROLE_LABEL_KEYS, getClinicDisplayStatus, type ClinicDisplayStatus } from '../types/clinic';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import FastSelect from '../components/sensory-profile/FastSelect';
import ErrorState from '../components/domain/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, radii, shadows } from '../theme/tokens';

const STATUS_ORDER: ClinicDisplayStatus[] = ['active', 'pending', 'expired', 'revoked'];

const STATUS_BADGE_COLOR: Record<ClinicDisplayStatus, 'mint' | 'yellow' | 'peach' | 'cream'> = {
  active: 'mint',
  pending: 'yellow',
  expired: 'peach',
  revoked: 'cream',
};

function buildInviteLink(token: string): string {
  return `${window.location.origin}/clinics/accept?token=${encodeURIComponent(token)}`;
}

/**
 * O quadro de uma clínica, para quem administra.
 *
 * Repare no que NÃO existe nesta tela: nome de criança nenhum. A clínica
 * administra pessoas — de cada profissional aparece QUANTAS crianças ele
 * atende, e nunca quais. Quem concede acesso a uma criança é o responsável
 * dela, para um profissional com nome, na tela da equipe de cuidado.
 */
export default function ClinicPage({ clinicId, clinicName }: { clinicId: string; clinicName: string }) {
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const toast = useToast();

  // Dentro do componente porque o rótulo passa pelo i18n — no escopo do
  // módulo o `t` ainda não existe.
  const roleOptions = useMemo(
    () => CLINIC_ROLES.map((role) => ({ value: role, label: t(CLINIC_ROLE_LABEL_KEYS[role]) })),
    [t],
  );

  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<ClinicRole>('profissional');
  const [inviting, setInviting] = useState(false);
  const [justInvited, setJustInvited] = useState<CreateClinicMemberResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, loading, error, reload, setData } = useDomainResource(
    (token) => clinicApi.roster(token, clinicId),
    [clinicId],
    { errorMessage: t('clinic.errors.load') },
  );
  const roster = data ?? [];

  const handleInvite = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!nameInput.trim() || inviting) return;
      try {
        setInviting(true);
        const token = await getToken();
        const created = await clinicApi.invite(token, clinicId, {
          memberName: nameInput.trim(),
          role: roleInput,
        });
        setJustInvited(created);
        setCopied(false);
        setNameInput('');
        // O quadro nunca devolve o token, então a linha nova entra a partir da
        // resposta da criação — e o link fica visível só enquanto esta tela
        // estiver aberta.
        setData((previous) => [{ ...created, caseloadSize: 0 }, ...(previous ?? [])]);
      } catch {
        toast.error(t('clinic.errors.invite'));
      } finally {
        setInviting(false);
      }
    },
    [nameInput, roleInput, inviting, getToken, clinicId, setData, toast, t],
  );

  const handleCopy = useCallback(async () => {
    if (!justInvited?.invitationToken) return;
    try {
      await navigator.clipboard.writeText(buildInviteLink(justInvited.invitationToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('clinic.errors.copy'));
    }
  }, [justInvited, toast, t]);

  const handleRemove = useCallback(
    async (member: ClinicRosterMember) => {
      try {
        setRemovingId(member.id);
        const token = await getToken();
        await clinicApi.removeMember(token, clinicId, member.id);
        toast.success(t('clinic.removed'));
        reload();
      } catch {
        toast.error(t('clinic.errors.remove'));
      } finally {
        setRemovingId(null);
      }
    },
    [getToken, clinicId, reload, toast, t],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const sorted = [...roster].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(getClinicDisplayStatus(a)) - STATUS_ORDER.indexOf(getClinicDisplayStatus(b)) ||
      a.memberName.localeCompare(b.memberName),
  );

  return (
    <Box>
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.xs }}>
        {clinicName}
      </GumroadHeading>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.lg }}>
        {t('clinic.subtitle')}
      </GumroadText>

      <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
        <form onSubmit={handleInvite}>
          <Flex direction={{ initial: 'column', sm: 'row' }} gap="3" align={{ sm: 'end' }}>
            <Box style={{ flex: 1 }}>
              <label htmlFor="clinic-member-name">
                <GumroadText level="caption" as="span">{t('clinic.form.name')}</GumroadText>
              </label>
              <GumroadInput
                id="clinic-member-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('clinic.form.namePlaceholder')}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="clinicRole"
                label={t('clinic.form.role')}
                options={roleOptions}
                initialValue={roleInput}
                onValueChange={(_name, value) => setRoleInput(value as ClinicRole)}
                required
              />
            </Box>
            <GumroadButton type="submit" variant="primary" disabled={!nameInput.trim() || inviting}>
              <PlusIcon /> {inviting ? t('clinic.form.inviting') : t('clinic.form.invite')}
            </GumroadButton>
          </Flex>
        </form>
      </GumroadCard>

      {justInvited?.invitationToken && (
        <GumroadCard color="yellow" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
          <GumroadText level="body-sm" as="p" style={{ marginBottom: spacing.xs }}>
            <strong>{t('clinic.invite.title', { name: justInvited.memberName })}</strong>
          </GumroadText>
          <GumroadText level="caption" as="p" style={{ marginBottom: spacing.sm, opacity: 0.8 }}>
            {t('clinic.invite.onceOnly')}
          </GumroadText>
          <Flex gap="2" align="center" wrap="wrap">
            <code
              style={{
                flex: 1,
                minWidth: '12rem',
                padding: spacing.xs,
                background: colors.surface,
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.sm,
                boxShadow: shadows.input,
                fontSize: '0.75rem',
                wordBreak: 'break-all',
              }}
            >
              {buildInviteLink(justInvited.invitationToken)}
            </code>
            <GumroadButton variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <><CheckIcon /> {t('clinic.invite.copied')}</> : <><CopyIcon /> {t('clinic.invite.copy')}</>}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      )}

      {sorted.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <PersonIcon width={32} height={32} />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              {t('clinic.empty')}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {sorted.map((member) => {
            const status = getClinicDisplayStatus(member);
            return (
              <GumroadCard key={member.id} color="white" shadow="sm" padding="md">
                <Flex justify="between" align="center" gap="3" wrap="wrap">
                  <Box style={{ minWidth: 0 }}>
                    <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                      {member.memberName}
                    </GumroadText>
                    <GumroadText level="caption" as="p" style={{ opacity: 0.7 }}>
                      {t(CLINIC_ROLE_LABEL_KEYS[member.role])}
                      {status === 'active' && ` · ${t('clinic.caseload', { count: member.caseloadSize })}`}
                    </GumroadText>
                  </Box>
                  <Flex gap="2" align="center">
                    <GumroadBadge color={STATUS_BADGE_COLOR[status]}>
                      {t(`clinic.status.${status}`)}
                    </GumroadBadge>
                    {status !== 'revoked' && (
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <GumroadButton variant="danger" size="sm" disabled={removingId === member.id}>
                            {t('clinic.remove')}
                          </GumroadButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content maxWidth="26rem">
                          <AlertDialog.Title>{t('clinic.confirm.title')}</AlertDialog.Title>
                          <AlertDialog.Description>
                            {t('clinic.confirm.body', { name: member.memberName })}
                          </AlertDialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <GumroadButton variant="secondary" size="sm">{t('common.cancel')}</GumroadButton>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <GumroadButton variant="danger" size="sm" onClick={() => handleRemove(member)}>
                                {t('clinic.remove')}
                              </GumroadButton>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    )}
                  </Flex>
                </Flex>
              </GumroadCard>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
