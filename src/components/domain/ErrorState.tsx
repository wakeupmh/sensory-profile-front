import { Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import { GumroadText } from '../design-system/GumroadHeading';

interface ErrorStateProps {
  /** Mensagem de erro já traduzida (não alterada por este componente). */
  message: string;
  /** Reexecuta o fetch que falhou — normalmente o mesmo useCallback usado no load inicial. */
  onRetry: () => void;
  /** Rótulo do botão de retry. Mantém "Tentar novamente" como padrão em todo o app. */
  retryLabel?: string;
}

/**
 * Card de erro padrão (neubrutalista) com ação de retry.
 *
 * Substitui as ~28 cópias de `<GumroadCard color="salmon">` espalhadas pelas
 * páginas de domínio, que exibiam a mensagem de erro sem nenhuma forma de o
 * usuário tentar de novo sem recarregar a página (e perder o estado do PWA).
 */
export function ErrorState({ message, onRetry, retryLabel = 'Tentar novamente' }: ErrorStateProps) {
  return (
    <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
      <Flex align="center" gap="2" justify="between" wrap="wrap">
        <Flex align="center" gap="2">
          <ExclamationTriangleIcon />
          <GumroadText level="body-md" as="p">
            {message}
          </GumroadText>
        </Flex>
        <GumroadButton variant="primary" size="sm" onClick={onRetry}>
          {retryLabel}
        </GumroadButton>
      </Flex>
    </GumroadCard>
  );
}

export default ErrorState;
