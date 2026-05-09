import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { Box, Flex, Heading } from '@radix-ui/themes';

export default function SignIn() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Box style={{ width: '400px' }}>
        <Heading size="5" mb="4" align="center">
          Perfil Sensorial
        </Heading>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Senha',
                button_label: 'Entrar',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Senha',
                button_label: 'Criar conta',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
            },
          }}
        />
      </Box>
    </Flex>
  );
}
