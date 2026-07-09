import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { Box, Flex } from '@radix-ui/themes';
import { colors, radii, typography } from '../theme/tokens';
import GumroadHeading from '../components/design-system/GumroadHeading';

export default function SignIn() {
  const { t } = useTranslation();
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, navigate, from]);

  return (
    <Flex
      justify="center"
      align="center"
      style={{ minHeight: '100vh', background: colors.ink }}
    >
      <Box
        style={{
          background: colors.canvas,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.xl,
          padding: '48px',
          width: '420px',
          maxWidth: '90vw',
          boxShadow: '8px 8px 0px #FFFFFF',
        }}
      >
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <GumroadHeading
            level="display-sm"
            as="h1"
            style={{ marginBottom: '4px' }}
          >
            Perfil Sensorial
          </GumroadHeading>
          <div style={{ fontSize: '14px', color: colors.ink, opacity: 0.6, fontFamily: typography['body-sm'].font }}>
            {t('auth.tagline')}
          </div>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: colors.ink,
                  brandAccent: '#1A1A2E',
                  inputBackground: colors.canvas,
                  inputBorder: colors.ink,
                  inputBorderFocus: colors['brand-cyan'],
                  defaultButtonBackground: colors.ink,
                  defaultButtonBackgroundHover: '#1A1A2E',
                  defaultButtonText: colors.surface,
                },
                radii: {
                  borderRadiusButton: radii.pill,
                  buttonBorderRadius: radii.pill,
                  inputBorderRadius: radii.md,
                },
                fontSizes: { baseButtonSize: '15px' },
                space: {
                  buttonPadding: '12px 24px',
                  inputPadding: '12px 16px',
                },
              },
            },
            style: {
              button: {
                border: `2px solid ${colors.ink}`,
                boxShadow: '3px 3px 0px #0A0A1A',
                fontFamily: typography.button.font,
                fontWeight: typography.button.weight,
                height: '44px',
              },
              input: {
                border: `2px solid ${colors.ink}`,
                boxShadow: '2px 2px 0px #0A0A1A',
                fontFamily: typography['body-md'].font,
                height: '48px',
              },
              label: {
                fontFamily: typography['title-sm'].font,
                fontWeight: typography['title-sm'].weight,
              },
              anchor: {
                fontFamily: typography['body-sm'].font,
                color: colors.ink,
              },
            },
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: t('auth.signIn.emailLabel'),
                email_input_placeholder: t('auth.signIn.emailPlaceholder'),
                password_label: t('auth.signIn.passwordLabel'),
                password_input_placeholder: t('auth.signIn.passwordPlaceholder'),
                button_label: t('auth.signIn.button'),
                link_text: t('auth.signIn.linkText'),
              },
              sign_up: {
                email_label: t('auth.signUp.emailLabel'),
                email_input_placeholder: t('auth.signUp.emailPlaceholder'),
                password_label: t('auth.signUp.passwordLabel'),
                password_input_placeholder: t('auth.signUp.passwordPlaceholder'),
                button_label: t('auth.signUp.button'),
                link_text: t('auth.signUp.linkText'),
              },
              forgotten_password: {
                email_label: t('auth.forgottenPassword.emailLabel'),
                email_input_placeholder: t('auth.forgottenPassword.emailPlaceholder'),
                button_label: t('auth.forgottenPassword.button'),
                // Exibido na tela de login como o link "esqueci minha senha"
                // (é assim que a lib nomeia essa variável, não é sobre a
                // própria tela de recuperação)
                link_text: t('auth.forgottenPassword.linkText'),
              },
            },
          }}
        />
      </Box>
    </Flex>
  );
}
