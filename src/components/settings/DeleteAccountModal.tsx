import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Flex, Box } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import GumroadModal from '../design-system/GumroadModal';
import GumroadButton from '../design-system/GumroadButton';
import GumroadInput from '../design-system/GumroadInput';
import { GumroadText } from '../design-system/GumroadHeading';
import { colors, spacing, radii } from '../../theme/tokens';
import { accountApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { getToken, signOut } = useAuthContext();
  const CONFIRMATION_PHRASE = t('p2Settings.delete.phrase');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText.trim().toLowerCase() === CONFIRMATION_PHRASE;

  const handleClose = () => {
    if (deleting) return;
    setConfirmText('');
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setError(null);
    try {
      const token = await getToken();
      await accountApi.eraseAccount(token);
      await signOut();
      window.location.href = '/';
    } catch {
      setError(t('p2Settings.delete.error'));
      setDeleting(false);
    }
  };

  return (
    <GumroadModal
      open={open}
      onClose={handleClose}
      title={t('p2Settings.delete.title')}
      variant="center"
      maxWidth="480px"
      closeDisabled={deleting}
    >
      <Flex direction="column" gap="4">
        <Box
          style={{
            display: 'flex',
            gap: spacing.sm,
            padding: spacing.md,
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            backgroundColor: colors['brand-salmon'],
          }}
        >
          <ExclamationTriangleIcon width={20} height={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <GumroadText level="body-sm" as="p">
            {t('p2Settings.delete.warning')} <strong>{t('p2Settings.delete.irreversible')}</strong>
          </GumroadText>
        </Box>

        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
          <Trans i18nKey="p2Settings.delete.typePrompt" values={{ phrase: CONFIRMATION_PHRASE }} components={{ strong: <strong /> }} />
        </GumroadText>

        <GumroadInput
          id="delete-account-confirm"
          label={t('p2Settings.delete.confirmLabel')}
          placeholder={CONFIRMATION_PHRASE}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={deleting}
          error={error ?? undefined}
        />

        <Flex gap="3" justify="end">
          <GumroadButton variant="secondary" size="md" onClick={handleClose} disabled={deleting}>
            {t('p2Settings.delete.cancel')}
          </GumroadButton>
          <GumroadButton
            variant="primary"
            size="md"
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            style={!isConfirmed ? undefined : { backgroundColor: colors['brand-salmon'] }}
          >
            {deleting ? t('p2Settings.delete.deleting') : t('p2Settings.delete.confirm')}
          </GumroadButton>
        </Flex>
      </Flex>
    </GumroadModal>
  );
};

export default DeleteAccountModal;
