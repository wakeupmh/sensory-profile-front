import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ArrowLeftIcon, ChatBubbleIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { childNotesApi } from '../services/api';
import type { ProfessionalNote } from '../types/professionalNotes';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TeamNotesPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

  const [notes, setNotes] = useState<ProfessionalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const list = await childNotesApi.list(token, childId);
      setNotes([...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Erro ao carregar as notas da equipe. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </Box>

      <Box style={{ marginBottom: spacing.lg }}>
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Notas da equipe
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Anotações que profissionais com acesso a esta criança deixaram — somente leitura
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : notes.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              Nenhum profissional deixou notas sobre esta criança ainda.
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex gap="3" wrap="wrap">
          {notes.map((note) => (
            <GumroadCard key={note.id} color="yellow" shadow="sm" padding="sm" style={{ width: '260px' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ChatBubbleIcon width={14} height={14} />
                  <GumroadText level="body-sm" as="span" style={{ fontWeight: 700 }}>
                    {note.professionalName ?? 'Profissional'}
                  </GumroadText>
                </Flex>
                {note.professionalProfession && (
                  <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>{note.professionalProfession}</GumroadText>
                )}
                <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</GumroadText>
                <GumroadText level="caption" as="span" style={{ opacity: 0.55 }}>{formatDate(note.createdAt)}</GumroadText>
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
}
