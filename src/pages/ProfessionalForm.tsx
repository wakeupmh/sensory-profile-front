import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { Trans, useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { professionalApi } from '../services/api';
import type { Professional } from '../types/professionals';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadInput from '../components/design-system/GumroadInput';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import InvitationTokenCard from '../components/sharing/InvitationTokenCard';
import { colors, spacing } from '../theme/tokens';

const emptyForm = { name: '', email: '', profession: '' };

const ProfessionalForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const fetchedRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isNewMode = !id;
  const isEditMode = !!id && location.pathname.endsWith('/edit');
  const isViewMode = !!id && !isEditMode;

  const [form, setForm] = useState(emptyForm);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [justCreated, setJustCreated] = useState<Professional | null>(null);

  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;
    const run = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);
        const token = await getToken();
        const p = await professionalApi.get(id, token);
        setProfessional(p);
        setForm({ name: p.name, email: p.email ?? '', profession: p.profession ?? '' });
        fetchedRef.current = true;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) setNotFound(true);
        else setError(t('p2ProForm.loadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getToken, reloadKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);
    if (!form.name.trim()) {
      setValidationError(t('p2ProForm.nameRequired'));
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      profession: form.profession.trim() || null,
    };

    try {
      setSaving(true);
      const token = await getToken();
      if (isNewMode) {
        const created = await professionalApi.create(payload, token);
        setJustCreated(created);
        setProfessional(created);
        return;
      }
      if (isEditMode && id) {
        const updated = await professionalApi.update(id, payload, token);
        setProfessional(updated);
        navigate(`/professionals/${id}`);
      }
    } catch (err) {
      console.error(err);
      setError(t('p2ProForm.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = async () => {
    if (!professional) return;
    try {
      const token = await getToken();
      const updated = await professionalApi.rotateToken(professional.id, token);
      setProfessional(updated);
    } catch (err) {
      console.error(err);
      setError(t('p2ProForm.rotateError'));
    }
  };

  const handleBack = () => navigate('/professionals');

  const getTitle = () => {
    if (isNewMode) return justCreated ? t('p2ProForm.titleCreated') : t('p2ProForm.titleNew');
    if (isEditMode) return t('p2ProForm.titleEdit');
    return professional?.name ?? t('p2ProForm.titleDefault');
  };

  if (loading) {
    return (
      <GumroadCard color="cream" shadow="md" padding="xl">
        <Flex direction="column" align="center" gap="3" py="9">
          <LoadingSpinner size="large" text={t('p2ProForm.loading')} />
        </Flex>
      </GumroadCard>
    );
  }

  if (notFound) {
    return (
      <NotFound
        title={t('p2ProForm.notFoundTitle')}
        message={t('p2ProForm.notFoundMessage')}
        buttonText={t('p2ProForm.notFoundButton')}
        redirectTo="/professionals"
      />
    );
  }

  return (
    <Box style={{ maxWidth: 720, margin: '0 auto' }}>
      <Flex align="center" gap="2" mb="4">
        <GumroadButton variant="secondary" size="sm" onClick={handleBack}>
          <ChevronLeftIcon /> {t('p2ProForm.back')}
        </GumroadButton>
      </Flex>

      <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.lg }}>
        {getTitle()}
      </GumroadHeading>

      {error && (
        <GumroadCard role="alert" color="salmon" shadow="sm" padding="sm" style={{ marginBottom: spacing.md }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="span">
              {error}
            </GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {/* Falha ao carregar (não 404): sem os dados, o formulário vazio levaria a sobrescrever o cadastro */}
      {!isNewMode && !professional ? (
        <Flex gap="2">
          <GumroadButton variant="primary" size="md" onClick={() => setReloadKey((k) => k + 1)}>
            {t('p2ProForm.retry')}
          </GumroadButton>
          <GumroadButton variant="secondary" size="md" onClick={handleBack}>
            {t('p2ProForm.back')}
          </GumroadButton>
        </Flex>
      ) : justCreated ? (
        <Flex direction="column" gap="4">
          <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.8 }}>
            <Trans
              i18nKey="p2ProForm.created"
              values={{ name: justCreated.name }}
              components={{ strong: <strong />, em: <em /> }}
            />
          </GumroadText>
          {justCreated.invitationToken && (
            <InvitationTokenCard token={justCreated.invitationToken} professionalName={justCreated.name} />
          )}
          <Flex gap="2" justify="end">
            <GumroadButton variant="secondary" size="md" onClick={handleBack}>
              {t('p2ProForm.backToList')}
            </GumroadButton>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => navigate(`/professionals/${justCreated.id}`)}
            >
              {t('p2ProForm.viewDetails')}
            </GumroadButton>
          </Flex>
        </Flex>
      ) : isViewMode && professional ? (
        <Flex direction="column" gap="4">
          <GumroadCard color="white" shadow="md" padding="md">
            <Flex direction="column" gap="3">
              <Field label={t('p2ProForm.fieldName')} value={professional.name} />
              <Field label={t('p2ProForm.fieldEmail')} value={professional.email ?? '—'} />
              <Field label={t('p2ProForm.fieldProfession')} value={professional.profession ?? '—'} />
              <Field
                label={t('p2ProForm.fieldStatus')}
                value={professional.status === 'accepted' ? t('p2ProForm.accepted') : t('p2ProForm.pending')}
              />
              {professional.acceptedAt && (
                <Field label={t('p2ProForm.fieldAcceptedAt')} value={new Date(professional.acceptedAt).toLocaleString(i18n.language)} />
              )}
            </Flex>
          </GumroadCard>

          {professional.status === 'pending' && professional.invitationToken && (
            <InvitationTokenCard
              token={professional.invitationToken}
              professionalName={professional.name}
              onRotate={handleRotate}
            />
          )}

          <Flex gap="2" justify="end">
            <GumroadButton variant="secondary" size="md" onClick={handleBack}>
              {t('p2ProForm.back')}
            </GumroadButton>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => navigate(`/professionals/${professional.id}/edit`)}
            >
              {t('p2ProForm.edit')}
            </GumroadButton>
          </Flex>
        </Flex>
      ) : (
        /* New or edit form */
        <form onSubmit={handleSubmit}>
          <GumroadCard color="white" shadow="md" padding="md">
            <Flex direction="column" gap="3">
              {validationError && (
                <Box
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 107, 107, 0.15)',
                    borderRadius: '8px',
                    border: `2px solid ${colors['brand-salmon']}`,
                  }}
                >
                  <GumroadText level="body-sm" as="span" color={colors.error}>
                    {validationError}
                  </GumroadText>
                </Box>
              )}
              <GumroadInput
                label={t('p2ProForm.fieldName')}
                placeholder={t('p2ProForm.namePh')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <GumroadInput
                label={t('p2ProForm.emailOpt')}
                placeholder={t('p2ProForm.emailPh')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <GumroadInput
                label={t('p2ProForm.professionOpt')}
                placeholder={t('p2ProForm.professionPh')}
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
              />
            </Flex>
          </GumroadCard>

          <Flex gap="2" justify="end" mt="4">
            <GumroadButton variant="secondary" size="md" onClick={handleBack}>
              {t('p2ProForm.cancel')}
            </GumroadButton>
            <GumroadButton variant="primary" size="md" type="submit" disabled={saving}>
              {saving ? t('p2ProForm.saving') : isNewMode ? t('p2ProForm.createInvite') : t('p2ProForm.saveChanges')}
            </GumroadButton>
          </Flex>
        </form>
      )}
    </Box>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Flex direction={{ initial: 'column', sm: 'row' }} gap={{ initial: '0', sm: '3' }}>
    <div style={{ minWidth: 200 }}>
      <GumroadText level="caption-uppercase" as="span" color={colors.ink} style={{ opacity: 0.55 }}>
        {label}
      </GumroadText>
    </div>
    <GumroadText level="body-md" as="span">
      {value}
    </GumroadText>
  </Flex>
);

export default ProfessionalForm;
