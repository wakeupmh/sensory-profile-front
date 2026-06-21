import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
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
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const fetchedRef = useRef(false);

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
        const token = await getToken();
        const p = await professionalApi.get(id, token);
        setProfessional(p);
        setForm({ name: p.name, email: p.email ?? '', profession: p.profession ?? '' });
        fetchedRef.current = true;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) setNotFound(true);
        else setError('Não foi possível carregar o profissional.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, getToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!form.name.trim()) {
      setValidationError('Informe o nome do profissional.');
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
      setError('Não foi possível salvar o profissional. Tente novamente.');
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
      setError('Não foi possível gerar um novo código de convite.');
    }
  };

  const handleBack = () => navigate('/professionals');

  const getTitle = () => {
    if (isNewMode) return justCreated ? 'Profissional cadastrado' : 'Novo profissional';
    if (isEditMode) return 'Editar profissional';
    return professional?.name ?? 'Profissional';
  };

  if (loading) {
    return (
      <GumroadCard color="cream" shadow="md" padding="xl">
        <Flex direction="column" align="center" gap="3" py="9">
          <LoadingSpinner size="large" text="Carregando..." />
        </Flex>
      </GumroadCard>
    );
  }

  if (notFound) {
    return (
      <NotFound title="Profissional não encontrado" message="Este profissional não existe ou foi removido." />
    );
  }

  return (
    <Box style={{ maxWidth: 720, margin: '0 auto' }}>
      <Flex align="center" gap="2" mb="4">
        <GumroadButton variant="secondary" size="sm" onClick={handleBack}>
          <ChevronLeftIcon /> Voltar
        </GumroadButton>
      </Flex>

      <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.lg }}>
        {getTitle()}
      </GumroadHeading>

      {error && (
        <GumroadCard color="salmon" shadow="sm" padding="sm" style={{ marginBottom: spacing.md }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-sm" as="span">
              {error}
            </GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {/* Just-created flow: show the invitation token, then "Concluir" */}
      {justCreated ? (
        <Flex direction="column" gap="4">
          <GumroadText level="body-md" as="p" color={colors.ink} style={{ opacity: 0.8 }}>
            Pronto! O profissional <strong>{justCreated.name}</strong> está cadastrado como <em>pendente</em>. Envie o código
            abaixo para que ele(a) possa vincular a conta dele(a).
          </GumroadText>
          {justCreated.invitationToken && (
            <InvitationTokenCard token={justCreated.invitationToken} professionalName={justCreated.name} />
          )}
          <Flex gap="2" justify="end">
            <GumroadButton variant="secondary" size="md" onClick={handleBack}>
              Voltar para a lista
            </GumroadButton>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => navigate(`/professionals/${justCreated.id}`)}
            >
              Ver detalhes
            </GumroadButton>
          </Flex>
        </Flex>
      ) : isViewMode && professional ? (
        <Flex direction="column" gap="4">
          <GumroadCard color="white" shadow="md" padding="md">
            <Flex direction="column" gap="3">
              <Field label="Nome" value={professional.name} />
              <Field label="E-mail" value={professional.email ?? '—'} />
              <Field label="Profissão / Especialidade" value={professional.profession ?? '—'} />
              <Field
                label="Status"
                value={professional.status === 'accepted' ? 'Aceito' : 'Convite pendente'}
              />
              {professional.acceptedAt && (
                <Field label="Aceito em" value={new Date(professional.acceptedAt).toLocaleString('pt-BR')} />
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
              Voltar
            </GumroadButton>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => navigate(`/professionals/${professional.id}/edit`)}
            >
              Editar
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
                    backgroundColor: '#FFEBEE',
                    borderRadius: '8px',
                    border: `2px solid ${colors['brand-salmon']}`,
                  }}
                >
                  <GumroadText level="body-sm" as="span" color={colors.ink}>
                    {validationError}
                  </GumroadText>
                </Box>
              )}
              <GumroadInput
                label="Nome"
                placeholder="Nome do profissional"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <GumroadInput
                label="E-mail (opcional)"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <GumroadInput
                label="Profissão / Especialidade (opcional)"
                placeholder="Ex: Terapeuta Ocupacional"
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
              />
            </Flex>
          </GumroadCard>

          <Flex gap="2" justify="end" mt="4">
            <GumroadButton variant="secondary" size="md" onClick={handleBack}>
              Cancelar
            </GumroadButton>
            <GumroadButton variant="primary" size="md" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isNewMode ? 'Cadastrar e gerar convite' : 'Salvar alterações'}
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
