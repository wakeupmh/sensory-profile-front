import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../services/api';
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
  Callout
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  EyeOpenIcon, 
  Pencil1Icon, 
  FileTextIcon, 
  TrashIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons';

interface Assessment {
  id: string;
  childName: string;
  examinerName: string;
  createdAt: string;
}

const Home = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const data = await assessmentApi.getAllAssessments();
        setAssessments(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar avaliações. Por favor, tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const handleDeleteAssessment = async (id: string) => {
    try {
      await assessmentApi.deleteAssessment(id);
      setAssessments(assessments.filter(assessment => assessment.id !== id));
    } catch (err) {
      setError('Erro ao excluir avaliação. Por favor, tente novamente.');
      console.error(err);
    }
  };

  return (
    <Box style={{ margin: '0 auto' }}>
      <Flex justify="between" align="center" mb="6" gap="6">
        <Box>
          <Heading size="6" mb="1">Avaliações de Perfil Sensorial</Heading>
          <Text size="2" color="gray">Gerencie todas as avaliações de perfil sensorial em um só lugar</Text>
        </Box>
       <Button size="2" color="violet" asChild>
          <Link to="/assessment/new" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusIcon />
            Nova Avaliação
          </Link>
        </Button>
      </Flex>

      <Separator size="4" mb="6" />

      {loading ? (
        <Card variant="surface" size="2" style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text size="2">Carregando avaliações...</Text>
        </Card>
      ) : error ? (
        <Callout.Root color="crimson" size="2" mb="4">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      ) : assessments.length === 0 ? (
        <Card variant="surface" size="2" style={{ textAlign: 'center', padding: '60px 0' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={32} height={32} color="var(--gray-8)" />
            <Box>
              <Text size="4" weight="medium" mb="1">Nenhuma avaliação encontrada</Text>
              <Text size="2" color="gray">Clique em "Nova Avaliação" para começar a criar perfis sensoriais</Text>
            </Box>
            <Button size="2" color="violet" mt="4" asChild>
              <Link to="/assessment/new" style={{ textDecoration: 'none' }}>
                Criar primeira avaliação
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
                <Table.ColumnHeaderCell>Examinador</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="center">Ações</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {assessments.map((assessment) => (
                <Table.Row key={assessment.id}>
                  <Table.Cell>
                    <Text weight="medium">{assessment.childName}</Text>
                  </Table.Cell>
                  <Table.Cell>{assessment.examinerName}</Table.Cell>
                  <Table.Cell>{new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" justify="center">
                      <IconButton variant="soft" color="gray" size="1" asChild title="Visualizar">
                        <Link to={`/assessment/${assessment.id}`}>
                          <EyeOpenIcon />
                        </Link>
                      </IconButton>
                      <IconButton variant="soft" color="violet" size="1" asChild title="Editar">
                        <Link to={`/assessment/${assessment.id}/edit`}>
                          <Pencil1Icon />
                        </Link>
                      </IconButton>
                      <IconButton variant="soft" color="jade" size="1" asChild title="Relatório">
                        <Link to={`/assessment/${assessment.id}/report`}>
                          <FileTextIcon />
                        </Link>
                      </IconButton>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <IconButton variant="soft" color="red" size="1" title="Excluir">
                            <TrashIcon />
                          </IconButton>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content size="2">
                          <AlertDialog.Title>Excluir Avaliação</AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
                          </AlertDialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button variant="soft" color="gray">
                                Cancelar
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button 
                                variant="solid" 
                                color="crimson"
                                onClick={() => handleDeleteAssessment(assessment.id)}
                              >
                                Excluir
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

export default Home;
