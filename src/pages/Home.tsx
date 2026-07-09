import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { DashboardSkeleton } from '../components/skeletons/PageSkeletons';

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
  const { t, i18n } = useTranslation();
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
      setError(t('dashboard.errors.fetchAssessments'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAssessments();
    }
  }, [fetchAssessments, isLoaded, session]);

  const handleDiscardDraft = async (formType: 'sensory_assessment' | 'anamnese') => {
    try {
      const token = await getTokenRef.current();
      await draftApi.deleteDraft(formType, token);
      // Also clear localStorage so /assessment/new doesn't restore from cache
      if (session?.user?.id) {
        localStorage.removeItem(`draft:${formType}:${session.user.id}`);
      }
      if (formType === 'sensory_assessment') setAssessmentDraft(null);
      else setAnamneseDraft(null);
    } catch (err) {
      console.error('Erro ao descartar rascunho:', err);
      setError(t('dashboard.errors.discardDraft'));
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      setDeleteLoading(id);
      const token = await getToken();
      await assessmentApi.deleteAssessment(id, token);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(t('dashboard.errors.deleteAssessment'));
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
            {t('dashboard.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            {t('dashboard.subtitle')}
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" asChild>
          <Link
            to="/assessment/new"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            <PlusIcon />
            {t('nav.newAssessment')}
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
                {t('dashboard.consolidatedReport.title')}
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
                      {t('dashboard.consolidatedReport.viewProfile')}
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
                    {t('dashboard.draft.assessmentInProgress')}
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginTop: spacing.xxs }}>
                    {t('dashboard.draft.lastEdited', { date: new Date(assessmentDraft.updatedAt).toLocaleString(i18n.language) })}
                  </GumroadText>
                </Box>
                <Flex gap="2">
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/assessment/new')}
                  >
                    {t('dashboard.draft.continue')}
                  </GumroadButton>
                  <GumroadButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDiscardDraft('sensory_assessment')}
                  >
                    {t('dashboard.draft.discard')}
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
                    {t('dashboard.draft.anamneseInProgress')}
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginTop: spacing.xxs }}>
                    {t('dashboard.draft.lastEdited', { date: new Date(anamneseDraft.updatedAt).toLocaleString(i18n.language) })}
                  </GumroadText>
                </Box>
                <Flex gap="2">
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/anamnese/new')}
                  >
                    {t('dashboard.draft.continue')}
                  </GumroadButton>
                  <GumroadButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDiscardDraft('anamnese')}
                  >
                    {t('dashboard.draft.discard')}
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
            {t('dashboard.filter.byInstrument')}
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
            {t('dashboard.filter.all')}
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
        <DashboardSkeleton />
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg">
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
                {t('dashboard.empty.noAssessments.title')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('dashboard.empty.noAssessments.description', { action: t('nav.newAssessment') })}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/assessment/new" style={{ textDecoration: 'none' }}>
                {t('dashboard.empty.noAssessments.cta')}
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
                {t('dashboard.empty.noneForInstrument.title')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('dashboard.empty.noneForInstrument.description', { all: t('dashboard.filter.all') })}
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
          {filteredAssessments.map((assessment, i) => {
            const instrument = getInstrument(assessment.instrumentId);
            return (
              <GumroadCard
                key={assessment.id}
                color="white"
                shadow="md"
                padding="lg"
                className="stagger-item"
                style={{ ['--i' as string]: Math.min(i, 8) }}
              >
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
                      <strong>{t('dashboard.card.examiner')}</strong> {assessment.examinerName}
                    </GumroadText>
                    <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                      <strong>{t('dashboard.card.date')}</strong>{' '}
                      {new Date(assessment.createdAt).toLocaleDateString(i18n.language)}
                    </GumroadText>
                  </Flex>

                  {/* Actions */}
                  <Flex gap="2" mt="auto" pt="2">
                    <IconButton
                      variant="soft"
                      size="2"
                      asChild
                      title={t('dashboard.actions.view')}
                      aria-label={t('dashboard.actions.viewAssessment')}
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
                      title={t('dashboard.actions.edit')}
                      aria-label={t('dashboard.actions.editAssessment')}
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
                      title={t('dashboard.actions.report')}
                      aria-label={t('dashboard.actions.viewReport')}
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
                          title={t('dashboard.actions.delete')}
                          aria-label={t('dashboard.actions.deleteAssessment')}
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
                        <AlertDialog.Title>{t('dashboard.deleteDialog.title')}</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          {t('dashboard.deleteDialog.description')}
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <GumroadButton variant="secondary" size="sm">
                              {t('dashboard.deleteDialog.cancel')}
                            </GumroadButton>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <GumroadButton
                              variant="danger"
                              size="sm"
                              disabled={deleteLoading === assessment.id}
                              onClick={() => handleDeleteAssessment(assessment.id)}
                            >
                              {deleteLoading === assessment.id ? t('dashboard.deleteDialog.deleting') : t('dashboard.actions.delete')}
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
