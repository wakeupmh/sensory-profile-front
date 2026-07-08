import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex, Switch } from '@radix-ui/themes';
import { ExclamationTriangleIcon, EnvelopeClosedIcon, SunIcon, MoonIcon, DesktopIcon } from '@radix-ui/react-icons';
import { notificationApi } from '../services/api';
import type { NotificationPreferences } from '../types/notifications';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import { colors, radii, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Claro', icon: <SunIcon /> },
  { value: 'dark', label: 'Escuro', icon: <MoonIcon /> },
  { value: 'system', label: 'Sistema', icon: <DesktopIcon /> },
];

export default function SettingsPage() {
  const { getToken } = useAuthContext();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const data = await notificationApi.getPreferences(token);
      setPreferences(data);
    } catch {
      setError('Erro ao carregar preferências. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.success(checked ? 'Lembretes por e-mail ativados' : 'Lembretes por e-mail desativados');
    } catch {
      setPreferences(previous);
      toast.error('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Configurações
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Preferências de notificação e conta
        </GumroadText>
      </Box>

      <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
        <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.xs }}>
          Aparência
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
          Escolha entre tema claro, escuro ou seguir o sistema do dispositivo
        </GumroadText>
        <Flex gap="2" wrap="wrap" role="radiogroup" aria-label="Tema do aplicativo">
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
                {opt.label}
              </Flex>
            </GumroadButton>
          ))}
        </Flex>
      </GumroadCard>

      {loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text="Carregando..." /></Flex>
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
            <GumroadHeading level="title-md" as="h2">Lembretes por e-mail</GumroadHeading>
          </Flex>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
            Além do feed de lembretes no app, receba um e-mail quando algo estiver vencendo nos próximos dias
            (retornos médicos, revisões de PEI, fim de medicação, documentos e mais).
          </GumroadText>

          <Flex align="center" justify="between" gap="3" style={{
            padding: spacing.sm,
            border: `2px solid ${colors.ink}`,
            borderRadius: '8px',
            backgroundColor: colors.surface,
          }}>
            <Box>
              <GumroadText level="body-sm" as="p" style={{ fontWeight: 600 }}>
                Receber lembretes por e-mail
              </GumroadText>
              {preferences.email ? (
                <GumroadText level="caption" as="p" style={{ opacity: 0.6 }}>
                  Enviado para {preferences.email}
                </GumroadText>
              ) : (
                <GumroadText level="caption" as="p" style={{ opacity: 0.6 }}>
                  Seu e-mail ainda não foi identificado — acesse o app normalmente e ele será capturado automaticamente
                </GumroadText>
              )}
            </Box>
            <Switch
              checked={preferences.reminderEmailsEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
              color="cyan"
              aria-label="Receber lembretes por e-mail"
            />
          </Flex>
        </GumroadCard>
      ) : null}
    </Box>
  );
}
