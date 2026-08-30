import { FormEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clinicApi } from '../services/api';
import { useDomainResource } from '../hooks/useDomainResource';
import { CLINIC_ROLE_LABEL_KEYS } from '../types/clinic';
import ClinicPage from './ClinicPage';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import ErrorState from '../components/domain/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';
import { spacing } from '../theme/tokens';

/**
 * As clínicas de que este login faz parte.
 *
 * Quem administra abre o quadro; quem é profissional vê que faz parte e o
 * papel, e nada além — os atendimentos dele continuam em "Meus atendimentos",
 * que vem da concessão do responsável, não da clínica.
 */
export default function ClinicsPage() {
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const toast = useToast();

  const [nameInput, setNameInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [openClinicId, setOpenClinicId] = useState<string | null>(null);

  const { data, loading, error, reload } = useDomainResource(
    (token) => clinicApi.listMine(token),
    [],
    { errorMessage: t('clinic.errors.load') },
  );
  const memberships = data ?? [];

  const handleCreate = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!nameInput.trim() || creating) return;
      try {
        setCreating(true);
        const token = await getToken();
        await clinicApi.create(token, nameInput.trim());
        setNameInput('');
        toast.success(t('clinic.created'));
        reload();
      } catch {
        toast.error(t('clinic.errors.create'));
      } finally {
        setCreating(false);
      }
    },
    [nameInput, creating, getToken, reload, toast, t],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const open = memberships.find((m) => m.clinicId === openClinicId);
  if (open) {
    return (
      <Box>
        <GumroadButton variant="secondary" size="sm" onClick={() => setOpenClinicId(null)}>
          {t('common.back')}
        </GumroadButton>
        <Box style={{ marginTop: spacing.md }}>
          <ClinicPage clinicId={open.clinicId} clinicName={open.clinicName} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
        {t('clinic.pageTitle')}
      </GumroadHeading>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.lg }}>
        {t('clinic.pageSubtitle')}
      </GumroadText>

      <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
        <form onSubmit={handleCreate}>
          <Flex direction={{ initial: 'column', sm: 'row' }} gap="3" align={{ sm: 'end' }}>
            <Box style={{ flex: 1 }}>
              <label htmlFor="clinic-name">
                <GumroadText level="caption" as="span">{t('clinic.create.label')}</GumroadText>
              </label>
              <GumroadInput
                id="clinic-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('clinic.create.placeholder')}
              />
            </Box>
            <GumroadButton type="submit" variant="primary" disabled={!nameInput.trim() || creating}>
              <PlusIcon /> {creating ? t('clinic.create.creating') : t('clinic.create.submit')}
            </GumroadButton>
          </Flex>
        </form>
      </GumroadCard>

      {memberships.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            {t('clinic.noneYet')}
          </GumroadText>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {memberships.map((m) => (
            <GumroadCard key={m.clinicId} color="white" shadow="sm" padding="md">
              <Flex justify="between" align="center" gap="3" wrap="wrap">
                <Box>
                  <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                    {m.clinicName}
                  </GumroadText>
                  <GumroadBadge color={m.role === 'admin' ? 'mint' : 'cream'}>
                    {t(CLINIC_ROLE_LABEL_KEYS[m.role])}
                  </GumroadBadge>
                </Box>
                {m.role === 'admin' && (
                  <GumroadButton variant="secondary" size="sm" onClick={() => setOpenClinicId(m.clinicId)}>
                    {t('clinic.openRoster')}
                  </GumroadButton>
                )}
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
}
