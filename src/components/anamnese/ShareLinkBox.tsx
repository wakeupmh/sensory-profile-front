import { useState } from 'react';
import { Box, Flex, TextField } from '@radix-ui/themes';
import { CopyIcon, Link2Icon, Share1Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import { anamneseApi } from '../../services/api';
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
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const result = await anamneseApi.generateShareLink(anamneseId, token);
      onTokenChange(result.shareToken);
    } catch (err) {
      console.error(err);
      setError(t('cAnamnese.share.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      await anamneseApi.revokeShareLink(anamneseId, token);
      onTokenChange(null);
      setCopied(false);
    } catch (err) {
      console.error(err);
      setError(t('cAnamnese.share.revokeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareToken) return;
    const url = buildShareUrl(shareToken);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError(t('cAnamnese.share.clipboardUnavailable'));
      }
    } catch {
      setError(t('cAnamnese.share.copyManually'));
    }
  };

  return (
    <Box>
      <Flex align="center" gap="2" mb="2">
        <Share1Icon aria-hidden="true" />
        <GumroadHeading level="title-md" as="h3">
          {t('cAnamnese.share.title')}
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.8, marginBottom: '12px' }}>
        {t('cAnamnese.share.intro')}
      </GumroadText>

      {shareToken ? (
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1, width: '100%' }}>
              <TextField.Root
                size="2"
                value={buildShareUrl(shareToken)}
                readOnly
                aria-label={t('cAnamnese.share.linkLabel')}
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
                  <Link2Icon aria-hidden="true" />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Flex gap="2">
              <GumroadButton variant="secondary" size="sm" onClick={handleCopy} disabled={loading}>
                <CopyIcon aria-hidden="true" /> <span role="status">{copied ? t('cAnamnese.share.copied') : t('cAnamnese.share.copy')}</span>
              </GumroadButton>
              <GumroadButton variant="danger" size="sm" onClick={handleRevoke} disabled={loading}>
                {t('cAnamnese.share.revoke')}
              </GumroadButton>
            </Flex>
          </Flex>
          {error && <GumroadText level="body-sm" as="p" role="alert" style={{ color: colors['brand-salmon'] }}>{error}</GumroadText>}
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          <GumroadButton variant="primary" size="sm" onClick={handleGenerate} disabled={loading} loading={loading}>
            <Share1Icon aria-hidden="true" /> {loading ? t('cAnamnese.share.generating') : t('cAnamnese.share.generate')}
          </GumroadButton>
          {error && <GumroadText level="body-sm" as="p" role="alert" style={{ color: colors['brand-salmon'] }}>{error}</GumroadText>}
        </Flex>
      )}
    </Box>
  );
};

export default ShareLinkBox;
