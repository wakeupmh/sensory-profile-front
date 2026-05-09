import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { anamneseApi } from '../services/api';
import { Box, Flex, AlertDialog, IconButton, Separator } from '@radix-ui/themes';
import {
  PlusIcon,
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthContext } from '../context/AuthContext';
import type { AnamneseSummary } from '../components/anamnese/types';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';

const AnamneseList = () => {
  const [items, setItems] = useState<AnamneseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const response = await anamneseApi.list(token);
      setItems(response.data ?? response);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar anamneses. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const token = await getToken();
      await anamneseApi.remove(id, token);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError('Erro ao excluir anamnese. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Anamneses
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            Centralize a anamnese da criança e compartilhe com os profissionais
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" asChild>
          <Link to="/anamnese/new" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <PlusIcon />
            Nova Anamnese
          </Link>
        </GumroadButton>
      </Flex>

      <Separator size="4" mb="6" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando anamneses..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : items.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma anamnese cadastrada
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Crie uma anamnese para reutilizar os dados em várias avaliações
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/anamnese/new" style={{ textDecoration: 'none' }}>
                Criar primeira anamnese
              </Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {items.map((a) => (
            <GumroadCard key={a.id} color="white" shadow="md" padding="lg">
              <Flex direction="column" gap="3" style={{ height: '100%' }}>
                <Flex justify="between" align="start" gap="2">
                  <GumroadHeading level="title-md" as="h3" style={{ wordBreak: 'break-word', flex: 1 }}>
                    {a.childName}
                  </GumroadHeading>
                  {a.shareToken ? (
                    <GumroadBadge color="mint">
                      <Share1Icon /> Compartilhada
                    </GumroadBadge>
                  ) : (
                    <GumroadBadge color="cream">Privada</GumroadBadge>
                  )}
                </Flex>

                <Flex direction="column" gap="1">
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                    <strong>Responsável:</strong> {a.caregiverName}
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                    <strong>Criada em:</strong>{' '}
                    {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                  </GumroadText>
                </Flex>

                <Flex gap="2" mt="auto" pt="2">
                  <IconButton
                    variant="soft"
                    size="2"
                    asChild
                    title="Visualizar"
                    aria-label="Visualizar anamnese"
                    style={{
                      background: colors.canvas,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: '10px',
                      boxShadow: '2px 2px 0px #0A0A1A',
                      cursor: 'pointer',
                    }}
                  >
                    <Link to={`/anamnese/${a.id}`}>
                      <EyeOpenIcon />
                    </Link>
                  </IconButton>
                  <IconButton
                    variant="soft"
                    size="2"
                    asChild
                    title="Editar"
                    aria-label="Editar anamnese"
                    style={{
                      background: colors['brand-cyan'],
                      border: `2px solid ${colors.ink}`,
                      borderRadius: '10px',
                      boxShadow: '2px 2px 0px #0A0A1A',
                      cursor: 'pointer',
                    }}
                  >
                    <Link to={`/anamnese/${a.id}/edit`}>
                      <Pencil1Icon />
                    </Link>
                  </IconButton>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <IconButton
                        variant="soft"
                        size="2"
                        title="Excluir"
                        aria-label="Excluir anamnese"
                        style={{
                          background: colors['brand-salmon'],
                          border: `2px solid ${colors.ink}`,
                          borderRadius: '10px',
                          boxShadow: '2px 2px 0px #0A0A1A',
                          cursor: 'pointer',
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content size="2">
                      <AlertDialog.Title>Excluir Anamnese</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Tem certeza que deseja excluir esta anamnese? Esta ação não pode ser desfeita e links compartilhados deixarão de funcionar.
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <GumroadButton variant="secondary" size="sm">
                            Cancelar
                          </GumroadButton>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <GumroadButton
                            variant="danger"
                            size="sm"
                            disabled={deleteLoading === a.id}
                            onClick={() => handleDelete(a.id)}
                          >
                            {deleteLoading === a.id ? 'Excluindo...' : 'Excluir'}
                          </GumroadButton>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>
            </GumroadCard>
          ))}
        </div>
      )}
    </Box>
  );
};

export default AnamneseList;
