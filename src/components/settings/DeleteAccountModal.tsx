import { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import GumroadModal from '../design-system/GumroadModal';
import GumroadButton from '../design-system/GumroadButton';
import GumroadInput from '../design-system/GumroadInput';
import { GumroadText } from '../design-system/GumroadHeading';
import { colors, spacing, radii } from '../../theme/tokens';
import { accountApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

const CONFIRMATION_PHRASE = 'excluir minha conta';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ open, onClose }) => {
  const { getToken, signOut } = useAuthContext();
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
      setError('Não foi possível excluir a conta agora. Tente novamente.');
      setDeleting(false);
    }
  };

  return (
    <GumroadModal
      open={open}
      onClose={handleClose}
      title="Excluir minha conta"
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
            Isso apaga permanentemente todas as crianças cadastradas e tudo ligado a elas (avaliações,
            registros, documentos, terapia, saúde, metas), além de anamneses, profissionais cadastrados e
            rascunhos. <strong>Não pode ser desfeito.</strong>
          </GumroadText>
        </Box>

        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
          Digite <strong>{CONFIRMATION_PHRASE}</strong> abaixo para confirmar.
        </GumroadText>

        <GumroadInput
          id="delete-account-confirm"
          label="Confirmação"
          placeholder={CONFIRMATION_PHRASE}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={deleting}
          error={error ?? undefined}
        />

        <Flex gap="3" justify="end">
          <GumroadButton variant="secondary" size="md" onClick={handleClose} disabled={deleting}>
            Cancelar
          </GumroadButton>
          <GumroadButton
            variant="primary"
            size="md"
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            style={!isConfirmed ? undefined : { backgroundColor: colors['brand-salmon'] }}
          >
            {deleting ? 'Excluindo...' : 'Excluir permanentemente'}
          </GumroadButton>
        </Flex>
      </Flex>
    </GumroadModal>
  );
};

export default DeleteAccountModal;
