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

export default function PrivacyPolicyPage() {
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
          Política de Privacidade
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, marginBottom: spacing.xl }}>
          Última atualização: {LAST_UPDATED}
        </GumroadText>

        <Section title="1. Quem somos e o que este documento cobre">
          <P>
            O Perfil Sensorial é um aplicativo para cuidadores e responsáveis acompanharem o
            desenvolvimento sensorial, comportamental, terapêutico, educacional e de saúde de uma
            criança sob seus cuidados. Esta política descreve quais dados coletamos, para quê os
            usamos, com quem eles podem ser compartilhados e quais direitos você tem sobre eles, em
            conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </P>
        </Section>

        <Section title="2. Quem é o titular dos dados">
          <P>
            A conta e o login pertencem a você, o cuidador/responsável. Os dados da criança
            (avaliações, registros diários, informações de saúde, terapia e educação) são inseridos
            por você como representante legal, nos termos do Art. 14 da LGPD — o app não coleta
            esses dados diretamente da criança.
          </P>
        </Section>

        <Section title="3. Quais dados coletamos">
          <P>
            <strong>Dados de conta:</strong> e-mail (usado para login via Supabase Auth e para enviar
            lembretes, quando ativados).
          </P>
          <P>
            <strong>Dados sobre a criança, inseridos por você:</strong> nome, data de nascimento e
            informações gerais; avaliações de perfil sensorial e anamneses; registros diários
            (comportamento, humor, sono, alimentação, uso do banheiro), incluindo fotos anexadas
            quando você optar por isso; histórico de saúde (medicações, comorbidades, consultas);
            sessões de terapia; marcos de desenvolvimento e comunicação; planos e comunicações
            escolares; metas terapêuticas e progresso; documentos (laudos, receitas, exames) que você
            envia.
          </P>
          <P>
            <strong>Dados técnicos:</strong> registros de acesso (quem visualizou ou alterou dados de
            uma criança, com data/hora — sua própria trilha de auditoria, visível para você em
            "Registro de acesso"); dados de uso do app armazenados localmente no seu dispositivo
            (rascunhos de formulário e uma fila de registros pendentes de sincronização, para uso
            offline).
          </P>
        </Section>

        <Section title="4. Para que usamos seus dados e base legal">
          <P>
            Usamos os dados para viabilizar as funcionalidades do app: registrar e consultar o
            histórico da criança, gerar relatórios e resumos, enviar lembretes (quando ativados) e
            manter a trilha de auditoria de quem acessou o quê. A base legal é a execução do
            contrato de uso do serviço (Art. 7º, V) e, para dados de saúde da criança, a tutela da
            saúde exercida por você como responsável legal (Art. 11, II, "f").
          </P>
          <P>
            Resumos gerados por inteligência artificial (quando você solicita um resumo trimestral,
            uma pauta de consulta ou faz uma pergunta sobre os dados) processam as informações da
            criança para gerar o texto solicitado — veja a seção de operadores abaixo.
          </P>
        </Section>

        <Section title="5. Com quem compartilhamos dados (operadores)">
          <P>
            Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing. Usamos
            os seguintes prestadores de serviço (operadores, nos termos do Art. 5º, VII da LGPD)
            para operar o app:
          </P>
          <P>
            <strong>Supabase</strong> — autenticação (login por e-mail/senha) e verificação de
            sessão.
          </P>
          <P>
            <strong>Amazon Web Services (AWS)</strong> — infraestrutura de nuvem: Amazon S3
            (armazenamento de documentos, fotos anexadas e gravações do relato do dia), Amazon SES
            (envio de e-mails de lembrete), Amazon Transcribe (transcrição do áudio do relato do
            dia, quando você grava um) e Amazon Bedrock (geração de resumos por IA e organização do
            relato transcrito, quando você solicita essa funcionalidade). Esses serviços podem processar dados em servidores fora do Brasil,
            conforme a região da AWS configurada para esta aplicação — o que constitui uma
            transferência internacional de dados (Art. 33 da LGPD), amparada pelas cláusulas
            contratuais padrão da AWS.
          </P>
          <P>
            Você também pode optar por compartilhar dados diretamente com terceiros de sua escolha
            através das funcionalidades do próprio app — por exemplo, gerar um link de relatório
            para um médico, ou convidar um profissional ou cuidador adicional para acessar os dados
            de uma criança. Esses compartilhamentos são iniciados e controlados por você, e podem
            ser revogados a qualquer momento nas telas de compartilhamento correspondentes.
          </P>
        </Section>

        <Section title="6. Por quanto tempo guardamos os dados">
          <P>
            Os dados da criança (avaliações, registros, documentos, histórico de saúde etc.) são
            mantidos enquanto sua conta existir, para que o histórico continue disponível e útil ao
            longo do tempo. Registros de acesso (trilha de auditoria) são mantidos por 180 dias, e o
            histórico de envio de lembretes por e-mail por 90 dias — depois disso são apagados
            automaticamente. A gravação de áudio do relato do dia é apagada 30 dias depois de
            enviada; a transcrição e o relatório gerado a partir dela permanecem, como qualquer
            outro registro. Links de compartilhamento público (relatório consolidado) expiram
            automaticamente na data configurada ao criá-los.
          </P>
        </Section>

        <Section title="7. Seus direitos e como exercê-los">
          <P>
            Nos termos do Art. 18 da LGPD, você pode a qualquer momento:
          </P>
          <P>
            <strong>Acessar e corrigir</strong> — todos os dados que você cadastrou ficam visíveis e
            editáveis diretamente nas telas do app.
          </P>
          <P>
            <strong>Exportar (portabilidade)</strong> — em Configurações → "Exportar todos os meus
            dados", ou na página de uma criança específica → "Exportar meus dados", você recebe um
            arquivo com todos os dados correspondentes.
          </P>
          <P>
            <strong>Eliminar</strong> — em Configurações → "Zona de risco" → "Excluir minha conta",
            você pode apagar permanentemente todas as crianças cadastradas e tudo o que está ligado a
            elas, além de anamneses, profissionais cadastrados e rascunhos. Essa ação não pode ser
            desfeita.
          </P>
          <P>
            <strong>Revogar consentimento e revisar compartilhamentos</strong> — convites e acessos
            concedidos a cuidadores ou profissionais podem ser revogados a qualquer momento nas telas
            de compartilhamento.
          </P>
        </Section>

        <Section title="8. Segurança">
          <P>
            O acesso à sua conta é protegido por autenticação via Supabase, e toda comunicação entre
            o app e nossos servidores é criptografada (HTTPS). Documentos e fotos são armazenados no
            Amazon S3 e acessados apenas por meio de links temporários e assinados. Cada operação
            sobre os dados de uma criança é registrada na trilha de auditoria mencionada acima.
          </P>
        </Section>

        <Section title="9. Dados armazenados no seu dispositivo">
          <P>
            Para que o app funcione mesmo sem conexão, alguns dados ficam temporariamente guardados
            no armazenamento local do seu navegador: rascunhos de formulários em andamento e
            registros diários feitos offline, aguardando sincronização. Esses dados saem do
            dispositivo assim que sincronizados, e você pode limpá-los a qualquer momento apagando os
            dados do site nas configurações do seu navegador.
          </P>
        </Section>

        <Section title="10. Contato">
          <P>
            Para dúvidas, solicitações relacionadas aos seus dados, ou para exercer qualquer um dos
            direitos listados acima que não estejam disponíveis diretamente no app, entre em contato
            pelo e-mail{' '}
            <a href="mailto:privacidade@perfilsensorial.app" style={{ color: colors.ink }}>
              privacidade@perfilsensorial.app
            </a>
            .
          </P>
        </Section>
      </Box>
    </Box>
  );
}
