import { useState } from 'react';
import { Box, Flex, TextField } from '@radix-ui/themes';
import { CopyIcon, Link2Icon, Share1Icon } from '@radix-ui/react-icons';
import { useAuthContext } from '../../context/AuthContext';
import { anamneseApi } from '../../services/api';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { colors, shadows, radii, typography } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';

interface ShareLinkBoxProps {
  anamneseId: string;
  shareToken: string | null;
  onTokenChange: (token: string | null) => void;
}

const buildShareUrl = (token: string): string => {
  if (typeof window === 'undefined') return `/anamnese/shared/${token}`;
  return `${window.location.origin}/anamnese/shared/${token}`;
};

const ShareLinkBox: React.FC<ShareLinkBoxProps> = ({ anamneseId, shareToken, onTokenChange }) => {
  const { getToken } = useAuthContext();
  const { copied, error: copyError, copy } = useCopyToClipboard();
  const [loading, setLoading] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const error = opError ?? copyError;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setOpError(null);
      const token = await getToken();
      const result = await anamneseApi.generateShareLink(anamneseId, token);
      onTokenChange(result.shareToken);
    } catch (err) {
      console.error(err);
      setOpError('Erro ao gerar link de compartilhamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      setOpError(null);
      const token = await getToken();
      await anamneseApi.revokeShareLink(anamneseId, token);
      onTokenChange(null);
    } catch (err) {
      console.error(err);
      setOpError('Erro ao revogar link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareToken) copy(buildShareUrl(shareToken));
  };

  return (
    <Box>
      <Flex align="center" gap="2" mb="2">
        <Share1Icon />
        <GumroadHeading level="title-md" as="h3">
          Compartilhar anamnese
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.8, marginBottom: '12px' }}>
        Gere um link somente-leitura para compartilhar com outros profissionais.
      </GumroadText>

      {shareToken ? (
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1, width: '100%' }}>
              <TextField.Root
                size="2"
                value={buildShareUrl(shareToken)}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  backgroundColor: colors.canvas,
                  color: colors.ink,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  boxShadow: shadows.input,
                  height: '48px',
                  padding: '12px 16px',
                  fontFamily: typography['body-md'].font,
                  fontSize: typography['body-md'].size,
                  width: '100%',
                }}
              >
                <TextField.Slot>
                  <Link2Icon />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Flex gap="2">
              <GumroadButton variant="secondary" size="sm" onClick={handleCopy} disabled={loading}>
                <CopyIcon /> {copied ? 'Copiado!' : 'Copiar'}
              </GumroadButton>
              <GumroadButton variant="danger" size="sm" onClick={handleRevoke} disabled={loading}>
                Revogar
              </GumroadButton>
            </Flex>
          </Flex>
          {error && <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'] }}>{error}</GumroadText>}
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          <GumroadButton variant="primary" size="sm" onClick={handleGenerate} disabled={loading}>
            <Share1Icon /> {loading ? 'Gerando...' : 'Gerar link de compartilhamento'}
          </GumroadButton>
          {error && <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'] }}>{error}</GumroadText>}
        </Flex>
      )}
    </Box>
  );
};

export default ShareLinkBox;
