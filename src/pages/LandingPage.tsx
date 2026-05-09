import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { colors, spacing, typography } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { useAuthContext } from '../context/AuthContext';
import {
  FileTextIcon,
  ClipboardIcon,
  FileIcon,
  StarIcon,
} from '@radix-ui/react-icons';

const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuthContext();

  const handleStart = () => {
    if (session) navigate('/dashboard');
    else navigate('/sign-in');
  };

  const senses = ['👁️', '👂', '🤲', '👃', '🧠'];
  const [senseIdx, setSenseIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSenseIdx(i => (i + 1) % senses.length);
        setVisible(true);
      }, 300);
    }, 1400);
    return () => clearInterval(cycle);
  }, []);

  return (
    <Box style={{ backgroundColor: colors.canvas, minHeight: '100vh' }}>
      {/* Hero */}
      <Box
        px={{ initial: '4', sm: '6', md: '8' }}
        py={{ initial: '6', md: '9' }}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        <Flex
          direction={{ initial: 'column', md: 'row' }}
          gap="6"
          align="center"
          justify="between"
        >
          <Box style={{ flex: 1, maxWidth: '600px' }}>
            <GumroadHeading level="display-lg" as="h1" style={{ marginBottom: spacing.md }}>
              Avalie o Perfil Sensorial da Criança
            </GumroadHeading>
            <GumroadText
              level="body-lg"
              as="p"
              style={{ marginBottom: spacing.xl, color: colors.ink, opacity: 0.8 }}
            >
              Sistema completo para avaliação sensorial baseado no Perfil Sensorial 2.
              Crie avaliações, gere relatórios e compartilhe anamneses com a equipe.
            </GumroadText>
            <Flex gap="3" wrap="wrap">
              <GumroadButton variant="primary" size="lg" onClick={handleStart}>
                Começar Avaliação
              </GumroadButton>
              <GumroadButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/sign-in')}
              >
                Entrar
              </GumroadButton>
            </Flex>
          </Box>

          {/* Stacked cards illustration */}
          <Box
            style={{
              position: 'relative',
              width: '320px',
              height: '280px',
              flexShrink: 0,
            }}
            display={{ initial: 'none', md: 'block' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '280px',
                height: '200px',
                background: colors['brand-yellow'],
                border: `2px solid ${colors.ink}`,
                borderRadius: '20px',
                boxShadow: '6px 6px 0px #0A0A1A',
                transform: 'rotate(-6deg)',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30px',
                left: '20px',
                width: '280px',
                height: '200px',
                background: colors['brand-lavender'],
                border: `2px solid ${colors.ink}`,
                borderRadius: '20px',
                boxShadow: '6px 6px 0px #0A0A1A',
                transform: 'rotate(3deg)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '40px',
                width: '280px',
                height: '200px',
                background: colors['brand-cyan'],
                border: `2px solid ${colors.ink}`,
                borderRadius: '20px',
                boxShadow: '6px 6px 0px #0A0A1A',
                transform: 'rotate(-2deg)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: typography['display-sm'].font,
                fontSize: typography['display-sm'].size,
                fontWeight: 700,
              }}
            >
              <Flex direction="column" align="center" gap="2">
                <span style={{
                  fontSize: '56px',
                  lineHeight: 1,
                  display: 'block',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.7)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}>
                  {senses[senseIdx]}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', opacity: 0.7 }}>
                  SENSORIAL
                </span>
              </Flex>
            </div>
          </Box>
        </Flex>
      </Box>

      {/* Feature Cards */}
      <Box
        px={{ initial: '4', sm: '6', md: '8' }}
        py={{ initial: '6', md: '9' }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <GumroadHeading
          level="display-sm"
          as="h2"
          style={{ textAlign: 'center', marginBottom: spacing.xl }}
        >
          O que você pode fazer
        </GumroadHeading>

        <Flex
          direction={{ initial: 'column', md: 'row' }}
          gap="5"
          justify="center"
        >
          <GumroadCard color="cyan" shadow="md" padding="xl" style={{ flex: 1 }}>
            <Flex direction="column" gap="4">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileTextIcon width={24} height={24} />
              </Box>
              <GumroadHeading level="title-lg" as="h3">
                Avaliações Sensoriais
              </GumroadHeading>
              <GumroadText level="body-md" as="p">
                Aplique o Perfil Sensorial 2 com questionários de 86 itens para
                crianças de 3 a 14 anos. Classificação automática por quadrantes.
              </GumroadText>
            </Flex>
          </GumroadCard>

          <GumroadCard color="yellow" shadow="md" padding="xl" style={{ flex: 1 }}>
            <Flex direction="column" gap="4">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClipboardIcon width={24} height={24} />
              </Box>
              <GumroadHeading level="title-lg" as="h3">
                Anamneses Digitais
              </GumroadHeading>
              <GumroadText level="body-md" as="p">
                Cadastre anamneses completas e compartilhe com links públicos.
                Reutilize dados em múltiplas avaliações.
              </GumroadText>
            </Flex>
          </GumroadCard>

          <GumroadCard color="salmon" shadow="md" padding="xl" style={{ flex: 1 }}>
            <Flex direction="column" gap="4">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  background: colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileIcon width={24} height={24} />
              </Box>
              <GumroadHeading level="title-lg" as="h3">
                Relatórios Automáticos
              </GumroadHeading>
              <GumroadText level="body-md" as="p">
                Gere relatórios completos com gráficos de curva normal,
                classificações e observações por seção.
              </GumroadText>
            </Flex>
          </GumroadCard>
        </Flex>
      </Box>

      {/* CTA Band */}
      <Box
        px={{ initial: '4', sm: '6', md: '8' }}
        py={{ initial: '6', md: '9' }}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        <GumroadCard color="yellow" shadow="lg" padding="xl">
          <Flex direction="column" align="center" gap="4" style={{ textAlign: 'center' }}>
            <GumroadHeading level="display-sm" as="h2">
              Comece sua primeira avaliação hoje
            </GumroadHeading>
            <GumroadText level="body-md" as="p" style={{ maxWidth: '500px' }}>
              Cadastre-se gratuitamente e comece a avaliar o perfil sensorial
              das crianças com um sistema profissional e completo.
            </GumroadText>
            <GumroadButton variant="primary" size="lg" onClick={handleStart}>
              <StarIcon />
              Começar Agora
            </GumroadButton>
          </Flex>
        </GumroadCard>
      </Box>

      {/* Footer */}
      <Box
        px={{ initial: '4', sm: '6', md: '8' }}
        py="6"
        style={{
          borderTop: `2px solid ${colors.ink}`,
          backgroundColor: colors.canvas,
          marginTop: spacing.xxl,
        }}
      >
        <Flex
          direction={{ initial: 'column', sm: 'row' }}
          justify="between"
          align="center"
          gap="4"
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <GumroadText level="caption" as="p">
            &copy; {new Date().getFullYear()} Perfil Sensorial. Todos os direitos reservados.
          </GumroadText>
          <Flex gap="4">
            <a href="#" style={{ fontFamily: typography.caption.font, fontSize: typography.caption.size }}>
              Termos
            </a>
            <a href="#" style={{ fontFamily: typography.caption.font, fontSize: typography.caption.size }}>
              Privacidade
            </a>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default LandingPage;
