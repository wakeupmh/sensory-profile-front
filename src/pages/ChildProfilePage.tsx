import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { childApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import DomainStatsCard from '../components/child-profile/DomainStatsCard';
import UnifiedTimeline from '../components/child-profile/UnifiedTimeline';
import ChildForm, { ChildFormValue } from '../components/sensory-profile/ChildForm';
import type { ChildProfile } from '../types/child';

const PERIOD_OPTIONS = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
];

function formatDOB(dob: string | null): string | null {
  if (!dob) return null;
  const d = new Date(dob + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
}

function childProfileToFormValue(profile: ChildProfile): ChildFormValue {
  return {
    name: profile.child.name,
    birthDate: profile.child.dateOfBirth ?? '',
    gender: '',
    nationalIdentity: '',
    otherInfo: profile.child.notes ?? '',
  };
}

const ChildProfilePage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);

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
      setError('Erro ao carregar perfil da criança. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [childId]);

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
    if (isDirty && !window.confirm('Descartar alterações?')) {
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
      setError('Erro ao salvar criança. Por favor, tente novamente.');
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
          <ArrowLeftIcon />
          Voltar
        </GumroadButton>
      </Box>

      {/* Error */}
      {error && (
        <GumroadCard color="salmon" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando perfil..." />
        </GumroadCard>
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
                    Nascimento: {formatDOB(child.dateOfBirth)}
                  </GumroadText>
                )}
              </Box>
              {!isEditing && (
                <GumroadButton variant="secondary" size="sm" onClick={handleStartEdit}>
                  <Pencil1Icon />
                  Editar
                </GumroadButton>
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
                    {editSaving ? 'Salvando...' : 'Salvar'}
                  </GumroadButton>
                  <GumroadButton variant="secondary" size="sm" onClick={handleCancelEdit} disabled={editSaving}>
                    Cancelar
                  </GumroadButton>
                </Flex>
              </Box>
            )}
          </GumroadCard>

          {/* Period selector */}
          <Box style={{ marginBottom: spacing.lg }}>
            <GumroadText level="body-sm" as="p" style={{ marginBottom: spacing.xs, opacity: 0.7, fontWeight: 600 }}>
              Período das estatísticas
            </GumroadText>
            <Flex gap="2" wrap="wrap">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  style={{
                    padding: '6px 16px',
                    border: `2px solid ${colors.ink}`,
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: periodDays === opt.value ? colors.ink : 'transparent',
                    color: periodDays === opt.value ? '#FFFEF5' : colors.ink,
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </Flex>
          </Box>

          {/* Stats grid */}
          {stats && (
            <Box style={{ marginBottom: spacing.lg }}>
              <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.md }}>
                Resumo
              </GumroadHeading>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                }}
              >
                <DomainStatsCard
                  label="Avaliações"
                  count={stats.assessmentCount}
                  icon="🧠"
                  href={`/dashboard?childId=${childId}`}
                  accentColor="#C7B8FF"
                />
                <DomainStatsCard
                  label="Registros"
                  count={stats.logCount}
                  icon="📋"
                  href={`/logs?childId=${childId}`}
                  accentColor="#FFD93D"
                />
                <DomainStatsCard
                  label="Sessões"
                  count={stats.therapySessionCount}
                  icon="💉"
                  href={`/therapy?childId=${childId}`}
                  accentColor="#4ECDC4"
                />
                <DomainStatsCard
                  label="Medicamentos"
                  count={stats.activeMedicationCount}
                  icon="💊"
                  href={`/medical?childId=${childId}`}
                  accentColor="#FF6B6B"
                />
                <DomainStatsCard
                  label="Marcos alcançados"
                  count={stats.achievedMilestoneCount}
                  icon="🌱"
                  href={`/development?childId=${childId}`}
                  accentColor="#B8F0C7"
                />
                <DomainStatsCard
                  label="Planos educacionais"
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
                📊 Ver Relatório Consolidado
              </Link>
            </GumroadButton>
          </Flex>

          {/* Timeline */}
          <Box>
            <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: spacing.md }}>
              Linha do Tempo
            </GumroadHeading>
            {childId && <UnifiedTimeline childId={childId} />}
          </Box>
        </>
      ) : !error ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
            Criança não encontrada.
          </GumroadText>
        </GumroadCard>
      ) : null}
    </Box>
  );
};

export default ChildProfilePage;
