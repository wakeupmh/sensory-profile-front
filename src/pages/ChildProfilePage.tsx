import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import {
  ArrowLeftIcon,
  Pencil1Icon,
  Share1Icon,
  GroupIcon,
  BadgeIcon,
  ChatBubbleIcon,
  ActivityLogIcon,
  DownloadIcon,
  IdCardIcon,
} from '@radix-ui/react-icons';
import { childApi, dataExportApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import { ErrorState } from '../components/domain/ErrorState';
import DomainStatsCard from '../components/child-profile/DomainStatsCard';
import UnifiedTimeline from '../components/child-profile/UnifiedTimeline';
import BehaviorInsightsPanel from '../components/behavior-insights/BehaviorInsightsPanel';
import RemindersWidget from '../components/reminders/RemindersWidget';
import ConsultationBriefModal from '../components/consolidated-report/ConsultationBriefModal';
import ChildForm, { ChildFormValue } from '../components/sensory-profile/ChildForm';
import { ChildProfileSkeleton } from '../components/skeletons/PageSkeletons';
import type { ChildProfile } from '../types/child';

const PERIOD_OPTIONS = [30, 60, 90];

function formatDOB(dob: string | null, locale: string): string | null {
  if (!dob) return null;
  const d = new Date(dob + 'T12:00:00');
  return d.toLocaleDateString(locale);
}

function childProfileToFormValue(profile: ChildProfile): ChildFormValue {
  return {
    name: profile.child.name,
    birthDate: profile.child.dateOfBirth ?? '',
    gender: profile.child.gender ?? '',
    nationalIdentity: profile.child.nationalIdentity ?? '',
    otherInfo: profile.child.notes ?? '',
  };
}

const ChildProfilePage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const toast = useToast();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    if (!childId) return;
    setExporting(true);
    try {
      const token = await getTokenRef.current();
      const { downloadUrl } = await dataExportApi.request(token, childId);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success(t('p1Profile.exportReady'), t('p1Profile.exportReadyDesc'));
    } catch {
      toast.error(t('p1Profile.exportFail'));
    } finally {
      setExporting(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editFormValue, setEditFormValue] = useState<ChildFormValue>({ name: '', birthDate: '', gender: '', nationalIdentity: '', otherInfo: '' });
  const [editBaseline, setEditBaseline] = useState<ChildFormValue | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchProfile = useCallback(async (period: number) => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const data = await childApi.getProfile(childId, token, period);
      setProfile(data);
    } catch {
      setError(t('p1Profile.errLoad'));
    } finally {
      setLoading(false);
    }
  }, [childId, t]);

  useEffect(() => {
    fetchProfile(periodDays);
  }, [fetchProfile, periodDays]);

  const handlePeriodChange = (days: number) => {
    setPeriodDays(days);
  };

  const handleStartEdit = () => {
    if (!profile) return;
    const initial = childProfileToFormValue(profile);
    setEditFormValue(initial);
    setEditBaseline(initial);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    const isDirty =
      editBaseline !== null &&
      JSON.stringify(editFormValue) !== JSON.stringify(editBaseline);
    if (isDirty && !window.confirm(t('p1Profile.discard'))) {
      return;
    }
    setIsEditing(false);
    setEditBaseline(null);
  };

  const handleSaveEdit = async () => {
    if (!childId) return;
    setError(null);
    setEditSaving(true);
    try {
      const token = await getTokenRef.current();
      const payload = {
        name: editFormValue.name,
        ...(editFormValue.birthDate ? { birthDate: editFormValue.birthDate } : {}),
        ...(editFormValue.otherInfo ? { otherInfo: editFormValue.otherInfo } : {}),
      };
      await childApi.update(childId, payload as Parameters<typeof childApi.update>[1], token);
      setIsEditing(false);
      setEditBaseline(null);
      await fetchProfile(periodDays);
    } catch {
      setError(t('p1Profile.errSave'));
    } finally {
      setEditSaving(false);
    }
  };

  const stats = profile?.stats;
  const child = profile?.child;

  return (
    <Box>
      {/* Back button */}
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/children')}>
          <ArrowLeftIcon aria-hidden="true" />
          {t('p1Profile.back')}
        </GumroadButton>
      </Box>

      {/* Error */}
      {error && (
        <Box mb="5">
          <ErrorState message={error} onRetry={() => fetchProfile(periodDays)} />
        </Box>
      )}

      {loading ? (
        <ChildProfileSkeleton />
      ) : profile && child ? (
        <>
          {/* Header card */}
          <GumroadCard color="cyan" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <Flex justify="between" align="start" gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs, wordBreak: 'break-word' }}>
                  {child.name}
                </GumroadHeading>
                {child.dateOfBirth && (
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.75 }}>
                    {t('p1Profile.birth', { date: formatDOB(child.dateOfBirth, i18n.language) })}
                  </GumroadText>
                )}
              </Box>
              {!isEditing && (
                <Flex gap="2" wrap="wrap">
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/share`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Share1Icon aria-hidden="true" />
                      {t('p1Profile.share')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/caregivers`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <GroupIcon aria-hidden="true" />
                      {t('p1Profile.caregivers')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/care-team`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <BadgeIcon aria-hidden="true" />
                      {t('careTeam.manage.childLinkButton')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/team-notes`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ChatBubbleIcon aria-hidden="true" />
                      {t('p1Profile.teamNotes')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/access-log`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ActivityLogIcon aria-hidden="true" />
                      {t('p1Profile.accessLog')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link to={`/children/${childId}/ficha`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <IdCardIcon aria-hidden="true" />
                      {t('p1Profile.ficha')}
                    </Link>
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" onClick={handleStartEdit}>
                    <Pencil1Icon aria-hidden="true" />
                    {t('p1Profile.edit')}
                  </GumroadButton>
                </Flex>
              )}
            </Flex>

            {child.notes && !isEditing && (
              <Box
                style={{
                  marginTop: spacing.sm,
                  padding: spacing.sm,
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: '8px',
                  border: `1.5px solid ${colors.ink}`,
                }}
              >
                <GumroadText level="body-sm" as="p">{child.notes}</GumroadText>
              </Box>
            )}

            {/* Edit form */}
            {isEditing && (
              <Box style={{ marginTop: spacing.md }}>
                <ChildForm
                  value={editFormValue}
                  onChange={(field, value) => setEditFormValue((prev) => ({ ...prev, [field]: value }))}
                  disabled={editSaving}
                />
                <Flex gap="3" style={{ marginTop: spacing.md }}>
                  <GumroadButton
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={editSaving || !editFormValue.name}
                  >
                    {editSaving ? t('p1Profile.saving') : t('p1Profile.save')}
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" onClick={handleCancelEdit} disabled={editSaving}>
                    {t('p1Profile.cancel')}
                  </GumroadButton>
                </Flex>
              </Box>
            )}
          </GumroadCard>

          {/* Reminders */}
          {childId && (
            <Box style={{ marginBottom: spacing.lg }}>
              <RemindersWidget childId={childId} />
            </Box>
          )}

          {/* Period selector */}
          <Box style={{ marginBottom: spacing.lg }}>
            <GumroadText level="body-sm" as="p" style={{ marginBottom: spacing.xs, opacity: 0.7, fontWeight: 600 }}>
              {t('p1Profile.periodLabel')}
            </GumroadText>
            <Flex gap="2" wrap="wrap">
              {PERIOD_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={periodDays === days}
                  onClick={() => handlePeriodChange(days)}
                  style={{
                    padding: '6px 16px',
                    border: `2px solid ${colors.ink}`,
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: periodDays === days ? colors.ink : 'transparent',
                    color: periodDays === days ? '#FFFEF5' : colors.ink,
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {t('p1Profile.days', { count: days })}
                </button>
              ))}
            </Flex>
          </Box>

          {/* Stats grid */}
          {stats && (
            <Box style={{ marginBottom: spacing.lg }}>
              <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.md }}>
                {t('p1Profile.summary')}
              </GumroadHeading>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                }}
              >
                <DomainStatsCard
                  label={t('p1Profile.assessments')}
                  count={stats.assessmentCount}
                  icon="🧠"
                  href={`/dashboard?childId=${childId}`}
                  accentColor="#C7B8FF"
                />
                <DomainStatsCard
                  label={t('p1Profile.logs')}
                  count={stats.logCount}
                  icon="📋"
                  href={`/logs?childId=${childId}`}
                  accentColor="#FFD93D"
                />
                <DomainStatsCard
                  label={t('p1Profile.sessions')}
                  count={stats.therapySessionCount}
                  icon="💉"
                  href={`/therapy?childId=${childId}`}
                  accentColor="#4ECDC4"
                />
                <DomainStatsCard
                  label={t('p1Profile.medications')}
                  count={stats.activeMedicationCount}
                  icon="💊"
                  href={`/medical?childId=${childId}`}
                  accentColor="#FF6B6B"
                />
                <DomainStatsCard
                  label={t('p1Profile.milestones')}
                  count={stats.achievedMilestoneCount}
                  icon="🌱"
                  href={`/development?childId=${childId}`}
                  accentColor="#B8F0C7"
                />
                <DomainStatsCard
                  label={t('p1Profile.eduPlans')}
                  count={stats.educationPlanCount}
                  icon="🎒"
                  href={`/education?childId=${childId}`}
                  accentColor="#A3D4FF"
                />
              </div>
            </Box>
          )}

          {/* Quick actions */}
          <Flex gap="3" wrap="wrap" style={{ marginBottom: spacing.xl }}>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to={`/consolidated/${childId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true">📊</span> {t('p1Profile.consolidated')}
              </Link>
            </GumroadButton>
            <GumroadButton variant="secondary" size="md" asChild>
              <Link to={`/goals?childId=${childId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true">🎯</span> {t('p1Profile.goals')}
              </Link>
            </GumroadButton>
            <GumroadButton variant="secondary" size="md" asChild>
              <Link to={`/documents?childId=${childId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true">🗂️</span> {t('p1Profile.documents')}
              </Link>
            </GumroadButton>
            <GumroadButton variant="secondary" size="md" onClick={() => setBriefModalOpen(true)}>
              <span aria-hidden="true">🩺</span> {t('p1Profile.prepConsult')}
            </GumroadButton>
            <GumroadButton variant="secondary" size="md" onClick={handleExportData} disabled={exporting}>
              <DownloadIcon aria-hidden="true" />
              {exporting ? t('p1Profile.exporting') : t('p1Profile.export')}
            </GumroadButton>
          </Flex>

          {/* Behavior insights */}
          {childId && (
            <Box style={{ marginBottom: spacing.xl }}>
              <BehaviorInsightsPanel childId={childId} />
            </Box>
          )}

          {/* Timeline */}
          <Box>
            <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.md }}>
              {t('p1Profile.timeline')}
            </GumroadHeading>
            {childId && <UnifiedTimeline childId={childId} />}
          </Box>
        </>
      ) : !error ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
            {t('p1Profile.notFound')}
          </GumroadText>
          <GumroadButton variant="primary" size="sm" asChild>
            <Link to="/children" style={{ textDecoration: 'none' }}>{t('p1Profile.toChildren')}</Link>
          </GumroadButton>
        </GumroadCard>
      ) : null}

      {childId && (
        <ConsultationBriefModal
          isOpen={briefModalOpen}
          onClose={() => setBriefModalOpen(false)}
          childId={childId}
          childName={profile?.child?.name}
        />
      )}
    </Box>
  );
};

export default ChildProfilePage;
