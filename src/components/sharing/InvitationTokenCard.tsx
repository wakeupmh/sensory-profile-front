import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
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
  const { t } = useTranslation();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.info(t('p2Sharing.token.copyFailed'));
      }
    } catch {
      // Sem permissão de área de transferência: avisa e deixa o usuário copiar à mão.
      toast.info(t('p2Sharing.token.copyFailed'));
    }
  };

  const handleRotate = async () => {
    if (!onRotate) return;
    try {
      setRotating(true);
      await onRotate();
    } catch {
      toast.error(t('p2Sharing.token.rotateError'));
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
            {t('p2Sharing.token.pending')}
          </GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.8 }}>
          {professionalName ? (
            <Trans i18nKey="p2Sharing.token.sendTo" values={{ name: professionalName }} components={{ strong: <strong /> }} />
          ) : (
            t('p2Sharing.token.sendGeneric')
          )}
        </GumroadText>

        <TextField.Root
          value={token}
          readOnly
          aria-label={t('p2Sharing.token.codeLabel')}
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
            {copied ? t('p2Sharing.token.copied') : t('p2Sharing.token.copy')}
          </GumroadButton>
          {onRotate && (
            <GumroadButton variant="secondary" size="sm" onClick={handleRotate} disabled={rotating}>
              {rotating ? t('p2Sharing.token.rotating') : t('p2Sharing.token.rotate')}
            </GumroadButton>
          )}
        </Flex>

        <GumroadText level="caption" as="p" color={colors.ink} style={{ opacity: 0.65, marginTop: spacing.xs }}>
          {t('p2Sharing.token.oneUse')}
        </GumroadText>
      </Flex>
    </GumroadCard>
  );
};

export default InvitationTokenCard;
