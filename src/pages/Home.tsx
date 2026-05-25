import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assessmentApi, draftApi, childApi, DraftData } from '../services/api';
import type { ChildData } from '../services/api';
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
  BarChartIcon,
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

type BadgeColor = 'yellow' | 'cyan' | 'salmon' | 'mint' | 'lavender' | 'peach' | 'cream' | 'ink';

const INSTRUMENT_BADGE_COLOR: Record<string, BadgeColor> = {
  'crianca-3-14': 'cyan',
  'crianca-pequena': 'mint',
  'atec': 'lavender',
  'mchat-r': 'yellow',
};

const getInstrumentBadgeColor = (instrumentId?: string): BadgeColor =>
  (instrumentId && INSTRUMENT_BADGE_COLOR[instrumentId]) || 'cream';

const Home = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assessmentDraft, setAssessmentDraft] = useState<DraftData | null>(null);
  const [anamneseDraft, setAnamneseDraft] = useState<DraftData | null>(null);
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const navigate = useNavigate();

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const [response, kids, ad, anmd] = await Promise.all([
        assessmentApi.getAllAssessments(token),
        childApi.list(token).catch(() => [] as ChildData[]),
        draftApi.getDraft('sensory_assessment', token).catch(() => null),
        draftApi.getDraft('anamnese', token).catch(() => null),
      ]);
      setAssessments(response.data);
      setChildren(kids);
      setAssessmentDraft(ad);
      setAnamneseDraft(anmd);
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

  const handleDiscardDraft = async (formType: 'sensory_assessment' | 'anamnese') => {
    try {
      const token = await getTokenRef.current();
      await draftApi.deleteDraft(formType, token);
      if (formType === 'sensory_assessment') setAssessmentDraft(null);
      else setAnamneseDraft(null);
    } catch (err) {
      console.error('Erro ao descartar rascunho:', err);
      setError('Não foi possível descartar o rascunho. Tente novamente.');
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      setDeleteLoading(id);
      const token = await getToken();
      await assessmentApi.deleteAssessment(id, token);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError('Erro ao excluir avaliação. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const distinctInstrumentIds = useMemo(() => {
    const seen = new Set<string>();
    for (const a of assessments) {
      seen.add(a.instrumentId ?? 'crianca-3-14');
    }
    return Array.from(seen);
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    if (instrumentFilter === 'all') return assessments;
    return assessments.filter((a) => (a.instrumentId ?? 'crianca-3-14') === instrumentFilter);
  }, [assessments, instrumentFilter]);

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
            to="/assessment/new"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            <PlusIcon />
            Nova Avaliação
          </Link>
        </GumroadButton>
      </Flex>

      {/* Consolidated Report Quick Access */}
      {!loading && children.length > 0 && (
        <GumroadCard color="cream" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex align="center" gap="2">
              <BarChartIcon width={20} height={20} />
              <GumroadText level="body-md" as="p" style={{ fontWeight: 700 }}>
                Relatório Consolidado
              </GumroadText>
            </Flex>
            <Flex gap="2" wrap="wrap">
              {children.map((child) => (
                <Flex key={child.id} gap="1" align="center">
                  <GumroadButton
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link
                      to={`/consolidated/${child.id}`}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <BarChartIcon width={14} height={14} />
                      {child.name}
                    </Link>
                  </GumroadButton>
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    asChild
                  >
                    <Link
                      to={`/children/${child.id}`}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Ver perfil
                    </Link>
                  </GumroadButton>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </GumroadCard>
      )}

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

      {/* Instrument Filter */}
      {!loading && !error && assessments.length > 0 && distinctInstrumentIds.length > 1 && (
        <Flex align="center" gap="2" mb="4" wrap="wrap">
          <GumroadText level="body-sm" as="span" style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>
            Filtrar por instrumento:
          </GumroadText>
          <button
            onClick={() => setInstrumentFilter('all')}
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              border: `2px solid ${colors.ink}`,
              background: instrumentFilter === 'all' ? colors.ink : colors.canvas,
              color: instrumentFilter === 'all' ? colors.canvas : colors.ink,
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: instrumentFilter === 'all' ? 'none' : '2px 2px 0px #0A0A1A',
            }}
          >
            Todos
          </button>
          {distinctInstrumentIds.map((id) => {
            const inst = getInstrument(id);
            const active = instrumentFilter === id;
            return (
              <button
                key={id}
                onClick={() => setInstrumentFilter(id)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  border: `2px solid ${colors.ink}`,
                  background: active ? colors.ink : colors.canvas,
                  color: active ? colors.canvas : colors.ink,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: active ? 'none' : '2px 2px 0px #0A0A1A',
                }}
              >
                {inst.shortName}
              </button>
            );
          })}
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
              <Link to="/assessment/new" style={{ textDecoration: 'none' }}>
                Criar primeira avaliação
              </Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : filteredAssessments.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma avaliação para este instrumento
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Selecione "Todos" ou outro instrumento para ver as avaliações
              </GumroadText>
            </Box>
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
          {filteredAssessments.map((assessment) => {
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
                    <GumroadBadge color={getInstrumentBadgeColor(assessment.instrumentId)}>
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
