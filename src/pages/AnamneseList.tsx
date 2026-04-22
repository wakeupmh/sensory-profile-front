import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { anamneseApi } from '../services/api';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Table,
  Card,
  AlertDialog,
  IconButton,
  Separator,
  Callout,
  Badge,
} from '@radix-ui/themes';
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
import { useAuth } from '@clerk/clerk-react';
import type { AnamneseSummary } from '../components/anamnese/types';

const AnamneseList = () => {
  const [items, setItems] = useState<AnamneseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
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
    <Box style={{ margin: '0 auto' }}>
      <Flex justify="between" align="center" mb="6" gap="6">
        <Box>
          <Heading size="6" mb="1">Anamneses</Heading>
          <Text size="2" color="gray">Centralize a anamnese da criança e compartilhe com os profissionais envolvidos</Text>
        </Box>
        <Button size="2" color="violet" asChild>
          <Link to="/anamnese/new" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusIcon />
            Nova Anamnese
          </Link>
        </Button>
      </Flex>

      <Separator size="4" mb="6" />

      {loading ? (
        <Card variant="surface" size="2" style={{ textAlign: 'center', padding: '40px 0' }}>
          <Flex direction="column" align="center" gap="4">
            <LoadingSpinner size="large" text="Carregando anamneses..." />
          </Flex>
        </Card>
      ) : error ? (
        <Callout.Root color="crimson" size="2" mb="4">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      ) : items.length === 0 ? (
        <Card variant="surface" size="2" style={{ textAlign: 'center', padding: '60px 0' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={32} height={32} color="var(--gray-8)" />
            <Box>
              <Text size="4" weight="medium" mb="1">Nenhuma anamnese cadastrada</Text><br />
              <Text size="2" color="gray">Crie uma anamnese para reutilizar os dados em várias avaliações</Text>
            </Box>
            <Button size="2" color="violet" mt="4" asChild>
              <Link to="/anamnese/new" style={{ textDecoration: 'none' }}>
                Criar primeira anamnese
              </Link>
            </Button>
          </Flex>
        </Card>
      ) : (
        <Card variant="surface" size="2">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Nome da Criança</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Responsável</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Criada em</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Compartilhada</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="center">Ações</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>
                    <Text weight="medium">{a.childName}</Text>
                  </Table.Cell>
                  <Table.Cell>{a.caregiverName}</Table.Cell>
                  <Table.Cell>{new Date(a.createdAt).toLocaleDateString('pt-BR')}</Table.Cell>
                  <Table.Cell>
                    {a.shareToken ? (
                      <Badge color="jade" variant="soft">
                        <Share1Icon /> Sim
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="soft">Não</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" justify="center">
                      <IconButton variant="soft" color="gray" size="1" asChild title="Visualizar" aria-label="Visualizar anamnese">
                        <Link to={`/anamnese/${a.id}`}>
                          <EyeOpenIcon />
                        </Link>
                      </IconButton>
                      <IconButton variant="soft" color="violet" size="1" asChild title="Editar" aria-label="Editar anamnese">
                        <Link to={`/anamnese/${a.id}/edit`}>
                          <Pencil1Icon />
                        </Link>
                      </IconButton>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <IconButton variant="soft" color="red" size="1" title="Excluir" aria-label="Excluir anamnese">
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
                              <Button variant="soft" color="gray">Cancelar</Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                variant="solid"
                                color="crimson"
                                disabled={deleteLoading === a.id}
                                onClick={() => handleDelete(a.id)}
                              >
                                {deleteLoading === a.id ? (
                                  <Flex gap="2" align="center">
                                    <LoadingSpinner size="small" />
                                    <Text>Excluindo...</Text>
                                  </Flex>
                                ) : 'Excluir'}
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      )}
    </Box>
  );
};

export default AnamneseList;
