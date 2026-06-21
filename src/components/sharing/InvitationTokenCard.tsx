import { useState } from 'react';
import { Flex, TextField } from '@radix-ui/themes';
import { CopyIcon, CheckIcon, ClipboardIcon } from '@radix-ui/react-icons';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import { colors, spacing } from '../../theme/tokens';

interface InvitationTokenCardProps {
  token: string;
  professionalName?: string;
  /** Optional rotate handler: when present, shows a "Gerar novo" button. */
  onRotate?: () => Promise<void> | void;
}

const InvitationTokenCard: React.FC<InvitationTokenCardProps> = ({ token, professionalName, onRotate }) => {
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback handled by user selecting manually.
    }
  };

  const handleRotate = async () => {
    if (!onRotate) return;
    try {
      setRotating(true);
      await onRotate();
    } finally {
      setRotating(false);
    }
  };

  return (
    <GumroadCard color="yellow" shadow="md" padding="md">
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <ClipboardIcon width={18} height={18} />
          <GumroadHeading level="title-md" as="h3">
            Convite pendente
          </GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.8 }}>
          {professionalName ? (
            <>
              Envie este código de convite para <strong>{professionalName}</strong>. Ele(a) deve fazer login e usar a página
              "Aceitar convite" para vincular a conta.
            </>
          ) : (
            'Envie este código de convite para o profissional. Ele(a) deve fazer login e usar a página "Aceitar convite" para vincular a conta.'
          )}
        </GumroadText>

        <TextField.Root
          value={token}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.ink}`,
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
          }}
        />

        <Flex gap="2" wrap="wrap">
          <GumroadButton variant="primary" size="sm" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </GumroadButton>
          {onRotate && (
            <GumroadButton variant="secondary" size="sm" onClick={handleRotate} disabled={rotating}>
              {rotating ? 'Gerando...' : 'Gerar novo código'}
            </GumroadButton>
          )}
        </Flex>

        <GumroadText level="caption" as="p" color={colors.ink} style={{ opacity: 0.65, marginTop: spacing.xs }}>
          Cada código só pode ser usado uma vez. Se for perdido, gere um novo.
        </GumroadText>
      </Flex>
    </GumroadCard>
  );
};

export default InvitationTokenCard;
