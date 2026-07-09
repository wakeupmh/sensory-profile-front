import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex, Switch } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, EnvelopeClosedIcon, BellIcon, GlobeIcon, SunIcon, MoonIcon, DesktopIcon, DownloadIcon } from '@radix-ui/react-icons';
import { notificationApi, accountApi } from '../services/api';
import type { NotificationPreferences } from '../types/notifications';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import type { SupportedLanguage } from '../i18n';
import {
  getCurrentPushSubscription,
  getPushPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermissionState,
} from '../services/pushNotifications';
import { colors, radii, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';

const APPEARANCE_OPTIONS: { value: ThemePreference; labelKey: string; icon: React.ReactNode }[] = [
  { value: 'light', labelKey: 'settings.appearance.light', icon: <SunIcon /> },
  { value: 'dark', labelKey: 'settings.appearance.dark', icon: <MoonIcon /> },
  { value: 'system', labelKey: 'settings.appearance.system', icon: <DesktopIcon /> },
];

const LANGUAGE_OPTIONS: { value: SupportedLanguage; labelKey: string }[] = [
  { value: 'pt-BR', labelKey: 'settings.language.ptBR' },
  { value: 'en-US', labelKey: 'settings.language.enUS' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<PushPermissionState>('unsupported');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const data = await notificationApi.getPreferences(token);
      setPreferences(data);
    } catch {
      setError(t('settings.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (checked: boolean) => {
    if (!preferences) return;
    const previous = preferences;
    setPreferences({ ...preferences, reminderEmailsEnabled: checked });
    setSaving(true);
    try {
      const token = await getTokenRef.current();
      const updated = await notificationApi.updatePreferences(token, { reminderEmailsEnabled: checked });
      setPreferences(updated);
      toast.success(checked ? t('settings.emailReminders.enabledToast') : t('settings.emailReminders.disabledToast'));
    } catch {
      setPreferences(previous);
      toast.error(t('settings.emailReminders.saveErrorToast'));
    } finally {
      setSaving(false);
    }
  };

  const refreshPushState = useCallback(async () => {
    const permission = getPushPermissionState();
    setPushPermission(permission);
    if (permission === 'granted') {
      const subscription = await getCurrentPushSubscription();
      setPushSubscribed(subscription !== null);
    } else {
      setPushSubscribed(false);
    }
  }, []);

  useEffect(() => {
    refreshPushState();
  }, [refreshPushState]);

  const handlePushToggle = async (checked: boolean) => {
    setPushBusy(true);
    try {
      const token = await getTokenRef.current();
      if (checked) {
        await subscribeToPush(token);
        toast.success(t('settings.push.enabledToast'));
      } else {
        await unsubscribeFromPush(token);
        toast.success(t('settings.push.disabledToast'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('settings.push.errorToast'));
    } finally {
      await refreshPushState();
      setPushBusy(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const token = await getTokenRef.current();
      const { downloadUrl } = await accountApi.exportAll(token);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success('Exportação pronta', 'O download foi aberto em uma nova aba');
    } catch {
      toast.error('Não foi possível gerar a exportação. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          {t('settings.title')}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('settings.subtitle')}
        </GumroadText>
      </Box>

      <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
        <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.xs }}>
          {t('settings.appearance.title')}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          {t('settings.appearance.description')}
        </GumroadText>
        <Flex gap="2" wrap="wrap" role="radiogroup" aria-label={t('settings.appearance.groupLabel')}>
          {APPEARANCE_OPTIONS.map((opt) => (
            <GumroadButton
              key={opt.value}
              variant={theme === opt.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTheme(opt.value)}
              aria-pressed={theme === opt.value}
              style={{ borderRadius: radii.pill }}
            >
              <Flex align="center" gap="2">
                {opt.icon}
                {t(opt.labelKey)}
              </Flex>
            </GumroadButton>
          ))}
        </Flex>
      </GumroadCard>

      <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
        <Flex align="center" gap="2" mb="1">
          <GlobeIcon />
          <GumroadHeading level="title-md" as="h2">{t('settings.language.title')}</GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          {t('settings.language.description')}
        </GumroadText>
        <Flex gap="2" wrap="wrap" role="radiogroup" aria-label={t('settings.language.groupLabel')}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <GumroadButton
              key={opt.value}
              variant={i18n.language === opt.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => i18n.changeLanguage(opt.value)}
              aria-pressed={i18n.language === opt.value}
              style={{ borderRadius: radii.pill }}
            >
              {t(opt.labelKey)}
            </GumroadButton>
          ))}
        </Flex>
      </GumroadCard>

      {loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text={t('settings.loading')} /></Flex>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : preferences ? (
        <GumroadCard color="white" shadow="md" padding="lg">
          <Flex align="center" gap="2" mb="3">
            <EnvelopeClosedIcon />
            <GumroadHeading level="title-md" as="h2">{t('settings.emailReminders.title')}</GumroadHeading>
          </Flex>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
            {t('settings.emailReminders.description')}
          </GumroadText>

          <Flex align="center" justify="between" gap="3" style={{
            padding: spacing.sm,
            border: `2px solid ${colors.ink}`,
            borderRadius: '8px',
            backgroundColor: colors.surface,
          }}>
            <Box>
              <GumroadText level="body-sm" as="p" style={{ fontWeight: 600 }}>
                {t('settings.emailReminders.toggleLabel')}
              </GumroadText>
              {preferences.email ? (
                <GumroadText level="caption" as="p" style={{ opacity: 0.6 }}>
                  {t('settings.emailReminders.sentTo', { email: preferences.email })}
                </GumroadText>
              ) : (
                <GumroadText level="caption" as="p" style={{ opacity: 0.6 }}>
                  {t('settings.emailReminders.emailUnknown')}
                </GumroadText>
              )}
            </Box>
            <Switch
              checked={preferences.reminderEmailsEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
              color="cyan"
              aria-label={t('settings.emailReminders.toggleLabel')}
            />
          </Flex>
        </GumroadCard>
      ) : null}

      <GumroadCard color="white" shadow="md" padding="lg" style={{ marginTop: spacing.lg }}>
        <Flex align="center" gap="2" mb="3">
          <BellIcon />
          <GumroadHeading level="title-md" as="h2">{t('settings.push.title')}</GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          {t('settings.push.description')}
        </GumroadText>

        {pushPermission === 'unsupported' ? (
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.6 }}>
            {t('settings.push.unsupported')}
          </GumroadText>
        ) : pushPermission === 'denied' ? (
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.6 }}>
            {t('settings.push.denied')}
          </GumroadText>
        ) : (
          <Flex align="center" justify="between" gap="3" style={{
            padding: spacing.sm,
            border: `2px solid ${colors.ink}`,
            borderRadius: '8px',
            backgroundColor: colors.surface,
          }}>
            <GumroadText level="body-sm" as="p" style={{ fontWeight: 600 }}>
              {t('settings.push.toggleLabel')}
            </GumroadText>
            <Switch
              checked={pushSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={pushBusy}
              color="cyan"
              aria-label={t('settings.push.toggleLabel')}
            />
          </Flex>
        )}
      </GumroadCard>

      <GumroadCard color="white" shadow="md" padding="lg" style={{ marginTop: spacing.lg }}>
        <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.xs }}>
          Privacidade e dados
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          Baixe uma cópia de tudo que sua conta possui — todas as crianças, avaliações, registros,
          anamneses, documentos e demais dados — em um único arquivo.
        </GumroadText>
        <GumroadButton variant="secondary" size="md" onClick={handleExportAll} disabled={exporting}>
          <DownloadIcon />
          {exporting ? 'Gerando exportação...' : 'Exportar todos os meus dados'}
        </GumroadButton>
      </GumroadCard>

      <GumroadCard
        color="white"
        shadow="md"
        padding="lg"
        style={{ marginTop: spacing.lg, border: `2px solid ${colors['brand-salmon']}` }}
      >
        <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.xs }}>
          Zona de risco
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          Excluir sua conta apaga permanentemente todas as crianças cadastradas e tudo ligado a elas.
          Essa ação não pode ser desfeita.
        </GumroadText>
        <GumroadButton
          variant="secondary"
          size="md"
          onClick={() => setDeleteModalOpen(true)}
          style={{ borderColor: colors['brand-salmon'], color: colors['brand-salmon'] }}
        >
          Excluir minha conta
        </GumroadButton>
      </GumroadCard>

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </Box>
  );
}
