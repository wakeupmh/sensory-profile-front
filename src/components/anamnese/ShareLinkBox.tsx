import { useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { CopyIcon, Link2Icon, Share1Icon } from '@radix-ui/react-icons';
import { useAuth } from '@clerk/clerk-react';
import { anamneseApi } from '../../services/api';

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
  const { getToken } = useAuth();
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
      setError('Erro ao gerar link de compartilhamento.');
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
      setError('Erro ao revogar link.');
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
        setError('Copie o link manualmente (clipboard indisponível).');
      }
    } catch {
      setError('Copie o link manualmente.');
    }
  };

  return (
    <Card mb="4">
      <Flex align="center" gap="2" mb="2">
        <Share1Icon />
        <Heading size="4">Compartilhar anamnese</Heading>
      </Flex>
      <Text size="2" color="gray" mb="3" as="p">
        Gere um link somente-leitura para compartilhar com outros profissionais. Quem receber o link poderá ver a anamnese sem precisar de conta.
      </Text>

      {shareToken ? (
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1, width: '100%' }}>
              <TextField.Root
                size="2"
                value={buildShareUrl(shareToken)}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
              >
                <TextField.Slot>
                  <Link2Icon />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Flex gap="2">
              <Button variant="soft" color="violet" onClick={handleCopy} disabled={loading}>
                <CopyIcon /> {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button variant="soft" color="crimson" onClick={handleRevoke} disabled={loading}>
                Revogar
              </Button>
            </Flex>
          </Flex>
          {error && <Text color="crimson" size="2">{error}</Text>}
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          <Button color="violet" onClick={handleGenerate} disabled={loading} style={{ alignSelf: 'flex-start' }}>
            <Share1Icon /> {loading ? 'Gerando...' : 'Gerar link de compartilhamento'}
          </Button>
          {error && <Text color="crimson" size="2">{error}</Text>}
        </Flex>
      )}
    </Card>
  );
};

export default ShareLinkBox;
