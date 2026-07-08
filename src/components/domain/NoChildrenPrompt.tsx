import { Link } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import { PersonIcon } from '@radix-ui/react-icons';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import { spacing } from '../../theme/tokens';

interface NoChildrenPromptProps {
  description?: string;
}

export function NoChildrenPrompt({
  description = 'Cadastre uma criança para começar a usar esta área.',
}: NoChildrenPromptProps) {
  return (
    <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
      <Flex direction="column" align="center" gap="4">
        <PersonIcon width={40} height={40} />
        <Box>
          <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
            Nenhuma criança cadastrada
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            {description}
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" asChild>
          <Link to="/children" style={{ textDecoration: 'none' }}>
            Adicionar Criança
          </Link>
        </GumroadButton>
      </Flex>
    </GumroadCard>
  );
}

export default NoChildrenPrompt;
