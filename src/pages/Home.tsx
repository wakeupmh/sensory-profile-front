import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assessmentApi, draftApi, DraftData } from '../services/api';
import { Box, Flex, AlertDialog, IconButton } from '@radix-ui/themes';
import { getInstrument } from '../instruments';
import {
  PlusIcon,
  EyeOpenIcon,
  Pencil1Icon,
  FileTextIcon,
  TrashIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';

interface Assessment {
  id: string;
  childName: string;
  examinerName: string;
  createdAt: string;
  instrumentId?: string;
}

const Home = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assessmentDraft, setAssessmentDraft] = useState<DraftData | null>(null);
  const [anamneseDraft, setAnamneseDraft] = useState<DraftData | null>(null);
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const navigate = useNavigate();

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const response = await assessmentApi.getAllAssessments(token);
      setAssessments(response.data ?? response);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar avaliações. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAssessments();
    }
  }, [fetchAssessments, isLoaded, session]);

  useEffect(() => {
    if (!isLoaded || !session) return;
    const fetchDrafts = async () => {
      try {
        const token = await getTokenRef.current();
        const [ad, anmd] = await Promise.all([
          draftApi.getDraft('sensory_assessment', token),
          draftApi.getDraft('anamnese', token),
        ]);
        setAssessmentDraft(ad);
        setAnamneseDraft(anmd);
      } catch (err) {
        console.error('Erro ao carregar rascunhos:', err);
      }
    };
    fetchDrafts();
  }, [isLoaded, session]);

  const handleDiscardDraft = async (formType: 'sensory_assessment' | 'anamnese') => {
    try {
      const token = await getTokenRef.current();
      await draftApi.deleteDraft(formType, token);
      if (formType === 'sensory_assessment') setAssessmentDraft(null);
      else setAnamneseDraft(null);
    } catch (err) {
      console.error('Erro ao descartar rascunho:', err);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      setDeleteLoading(id);
      const token = await getToken();
      await assessmentApi.deleteAssessment(id, token);
      setAssessments(assessments.filter((a) => a.id !== id));
    } catch (err) {
      setError('Erro ao excluir avaliação. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Avaliações
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Gerencie todas as avaliações de perfil sensorial
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" asChild>
          <Link
            to="/assessment/new?instrument=crianca-3-14"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            <PlusIcon />
            Nova Avaliação
          </Link>
        </GumroadButton>
      </Flex>

      {/* Draft Banners */}
      {(assessmentDraft || anamneseDraft) && (
        <Flex direction="column" gap="3" mb="5">
          {assessmentDraft && (
            <GumroadCard color="yellow" shadow="md" padding="md">
              <Flex justify="between" align="center" gap="4" wrap="wrap">
                <Box>
                  <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                    Rascunho em andamento: Avaliação de Perfil Sensorial
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginTop: spacing.xxs }}>
                    Última edição:{' '}
                    {new Date(assessmentDraft.updatedAt).toLocaleString('pt-BR')}
                  </GumroadText>
                </Box>
                <Flex gap="2">
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/assessment/new')}
                  >
                    Continuar
                  </GumroadButton>
                  <GumroadButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDiscardDraft('sensory_assessment')}
                  >
                    Descartar
                  </GumroadButton>
                </Flex>
              </Flex>
            </GumroadCard>
          )}
          {anamneseDraft && (
            <GumroadCard color="yellow" shadow="md" padding="md">
              <Flex justify="between" align="center" gap="4" wrap="wrap">
                <Box>
                  <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                    Rascunho em andamento: Anamnese
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginTop: spacing.xxs }}>
                    Última edição:{' '}
                    {new Date(anamneseDraft.updatedAt).toLocaleString('pt-BR')}
                  </GumroadText>
                </Box>
                <Flex gap="2">
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/anamnese/new')}
                  >
                    Continuar
                  </GumroadButton>
                  <GumroadButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDiscardDraft('anamnese')}
                  >
                    Descartar
                  </GumroadButton>
                </Flex>
              </Flex>
            </GumroadCard>
          )}
        </Flex>
      )}

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando avaliações..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">
              {error}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : assessments.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma avaliação encontrada
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Clique em "Nova Avaliação" para começar
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/assessment/new?instrument=crianca-3-14" style={{ textDecoration: 'none' }}>
                Criar primeira avaliação
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
          {assessments.map((assessment) => {
            const instrument = getInstrument(assessment.instrumentId);
            return (
              <GumroadCard key={assessment.id} color="white" shadow="md" padding="lg">
                <Flex direction="column" gap="3" style={{ height: '100%' }}>
                  {/* Top row */}
                  <Flex justify="between" align="start" gap="2">
                    <GumroadHeading
                      level="title-md"
                      as="h3"
                      style={{ wordBreak: 'break-word', flex: 1 }}
                    >
                      {assessment.childName}
                    </GumroadHeading>
                    <GumroadBadge color="yellow">
                      {instrument.shortName}
                    </GumroadBadge>
                  </Flex>

                  {/* Details */}
                  <Flex direction="column" gap="1">
                    <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                      <strong>Examinador:</strong> {assessment.examinerName}
                    </GumroadText>
                    <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                      <strong>Data:</strong>{' '}
                      {new Date(assessment.createdAt).toLocaleDateString('pt-BR')}
                    </GumroadText>
                  </Flex>

                  {/* Actions */}
                  <Flex gap="2" mt="auto" pt="2">
                    <IconButton
                      variant="soft"
                      size="2"
                      asChild
                      title="Visualizar"
                      aria-label="Visualizar avaliação"
                      style={{
                        background: colors.canvas,
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '10px',
                        boxShadow: '2px 2px 0px #0A0A1A',
                        cursor: 'pointer',
                      }}
                    >
                      <Link to={`/assessment/${assessment.id}`}>
                        <EyeOpenIcon />
                      </Link>
                    </IconButton>
                    <IconButton
                      variant="soft"
                      size="2"
                      asChild
                      title="Editar"
                      aria-label="Editar avaliação"
                      style={{
                        background: colors['brand-cyan'],
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '10px',
                        boxShadow: '2px 2px 0px #0A0A1A',
                        cursor: 'pointer',
                      }}
                    >
                      <Link to={`/assessment/${assessment.id}/edit`}>
                        <Pencil1Icon />
                      </Link>
                    </IconButton>
                    <IconButton
                      variant="soft"
                      size="2"
                      asChild
                      title="Relatório"
                      aria-label="Ver relatório"
                      style={{
                        background: colors['brand-mint'],
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '10px',
                        boxShadow: '2px 2px 0px #0A0A1A',
                        cursor: 'pointer',
                      }}
                    >
                      <Link to={`/assessment/${assessment.id}/report`}>
                        <FileTextIcon />
                      </Link>
                    </IconButton>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <IconButton
                          variant="soft"
                          size="2"
                          title="Excluir"
                          aria-label="Excluir avaliação"
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
                        <AlertDialog.Title>Excluir Avaliação</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
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
                              disabled={deleteLoading === assessment.id}
                              onClick={() => handleDeleteAssessment(assessment.id)}
                            >
                              {deleteLoading === assessment.id ? 'Excluindo...' : 'Excluir'}
                            </GumroadButton>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </Flex>
                </Flex>
              </GumroadCard>
            );
          })}
        </div>
      )}
    </Box>
  );
};

export default Home;
