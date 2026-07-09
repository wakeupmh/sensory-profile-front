import { Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { colors, spacing, typography } from '../theme/tokens';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';

const LAST_UPDATED = '9 de julho de 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box mb="6">
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.sm }}>
        {title}
      </GumroadHeading>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>{children}</Box>
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <GumroadText level="body-md" as="p" style={{ lineHeight: 1.7 }}>
      {children}
    </GumroadText>
  );
}

export default function TermsOfServicePage() {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: colors.canvas }}>
      <Box
        style={{
          borderBottom: `2px solid ${colors.ink}`,
          padding: `${spacing.md} ${spacing.lg}`,
        }}
      >
        <Flex align="center" gap="4" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: colors.ink,
              fontFamily: typography['nav-link'].font,
              fontWeight: 600,
              fontSize: typography['nav-link'].size,
            }}
          >
            <ArrowLeftIcon />
            Perfil Sensorial
          </Link>
        </Flex>
      </Box>

      <Box style={{ maxWidth: '760px', margin: '0 auto', padding: `${spacing.xxl} ${spacing.lg}` }}>
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Termos de Uso
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, marginBottom: spacing.xl }}>
          Última atualização: {LAST_UPDATED}
        </GumroadText>

        <Section title="1. Sobre o serviço">
          <P>
            O Perfil Sensorial é uma ferramenta de acompanhamento para cuidadores e responsáveis
            registrarem e organizarem informações sobre o desenvolvimento sensorial, comportamental,
            terapêutico, educacional e de saúde de uma criança. Ao criar uma conta e usar o app, você
            concorda com estes termos.
          </P>
        </Section>

        <Section title="2. Não é um serviço médico">
          <P>
            O Perfil Sensorial não presta diagnóstico, tratamento ou aconselhamento médico, e não
            substitui a avaliação de profissionais de saúde qualificados. As avaliações, resumos e
            pautas de consulta gerados pelo app — inclusive os gerados por inteligência artificial —
            são ferramentas de organização e apoio, não recomendações clínicas. Decisões sobre saúde,
            terapia ou educação da criança devem sempre ser tomadas com profissionais qualificados.
          </P>
        </Section>

        <Section title="3. Sua conta">
          <P>
            Você é responsável por manter a confidencialidade das suas credenciais de acesso e por
            todas as atividades realizadas na sua conta. Você declara ter capacidade legal para
            atuar como responsável pela criança cujos dados está inserindo, nos termos descritos na
            nossa <Link to="/privacidade" style={{ color: colors.ink }}>Política de Privacidade</Link>.
          </P>
        </Section>

        <Section title="4. Uso aceitável">
          <P>
            Você concorda em usar o app apenas para os fins a que se destina — o acompanhamento de
            crianças sob sua responsabilidade — e em não usá-lo para inserir dados de terceiros sem
            autorização, tentar acessar dados de outras contas, ou de qualquer forma comprometer a
            segurança do serviço.
          </P>
        </Section>

        <Section title="5. Compartilhamento de dados dentro do app">
          <P>
            O app permite que você convide cuidadores adicionais ou compartilhe dados com
            profissionais de saúde e educação de sua escolha. Esses compartilhamentos são de sua
            responsabilidade e podem ser revogados a qualquer momento nas telas correspondentes.
          </P>
        </Section>

        <Section title="6. Disponibilidade e mudanças no serviço">
          <P>
            Empenhamo-nos para manter o serviço disponível, mas não garantimos disponibilidade
            ininterrupta. Funcionalidades podem ser adicionadas, alteradas ou descontinuadas ao longo
            do tempo. Alterações relevantes a estes termos serão refletidas na data de "última
            atualização" no topo desta página.
          </P>
        </Section>

        <Section title="7. Seus dados">
          <P>
            O tratamento dos dados que você insere no app — o que coletamos, para quê usamos, com quem
            compartilhamos e como você pode exportá-los ou excluí-los — está descrito na nossa{' '}
            <Link to="/privacidade" style={{ color: colors.ink }}>Política de Privacidade</Link>.
          </P>
        </Section>

        <Section title="8. Limitação de responsabilidade">
          <P>
            O serviço é fornecido "como está". Na máxima medida permitida por lei, não nos
            responsabilizamos por decisões tomadas com base nas informações registradas ou geradas
            pelo app, nem por perdas decorrentes de indisponibilidade do serviço ou de uso indevido
            da conta por terceiros com acesso às suas credenciais.
          </P>
        </Section>

        <Section title="9. Contato">
          <P>
            Dúvidas sobre estes termos podem ser enviadas para{' '}
            <a href="mailto:contato@perfilsensorial.app" style={{ color: colors.ink }}>
              contato@perfilsensorial.app
            </a>
            .
          </P>
        </Section>
      </Box>
    </Box>
  );
}
