/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { useAuthContext } from '../context/AuthContext';

import { anamneseApi } from '../services/api';
import useAnamneseForm from '../components/anamnese/useAnamneseForm';
import ChildSection from '../components/anamnese/ChildSection';
import ChildPicker from '../components/sensory-profile/ChildPicker';
import CaregiverSection from '../components/anamnese/CaregiverSection';
import ClinicalHistorySection from '../components/anamnese/ClinicalHistorySection';
import ShareLinkBox from '../components/anamnese/ShareLinkBox';
import { emptyClinicalHistory } from '../components/anamnese/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GumroadStepper from '../components/design-system/GumroadStepper';
import { useDraftPersistence } from '../hooks/useDraftPersistence';

const STEPS = [
  { key: 'child', label: 'Criança' },
  { key: 'caregiver', label: 'Responsável' },
  { key: 'clinical', label: 'Histórico Clínico' },
];

const AnamneseForm: React.FC = () => {
  const { formData, setFormData, updateFormData } = useAnamneseForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const draftCheckedRef = useRef(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuthContext();
  const fetchedRef = useRef(false);

  const isViewMode = !!id && !location.pathname.includes('/edit');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isNewMode = !id;

  const { loadDraft, clearDraft, saveOnStepChange } = useDraftPersistence({
    formType: 'anamnese',
    formData: formData as Record<string, unknown>,
    currentStep,
    enabled: isNewMode,
  });

  // Auto-resume draft on mount (new-mode only)
  useEffect(() => {
    if (!isNewMode || draftCheckedRef.current) return;
    draftCheckedRef.current = true;

    const checkDraft = async () => {
      const isFresh = searchParams.get('fresh') === '1';
      if (isFresh) {
        await clearDraft();
        return;
      }

      const draft = await loadDraft();
      if (!draft) return;
      setFormData(draft.payload as any);
      const step = draft.currentStep ?? 0;
      setCurrentStep(step);
      const completed = new Set<number>();
      for (let i = 0; i < step; i++) completed.add(i);
      setCompletedSteps(completed);
    };

    checkDraft();
  }, [isNewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch existing anamnese for view/edit
  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;

    const run = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const token = await getToken();
        const response = await anamneseApi.getById(id, token);
        const data = response.data ?? response;

        setFormData({
          child: data.child ?? { name: '', birthDate: '', gender: '', selectedChildId: '' },
          caregiver: data.caregiver ?? { name: '', relationship: '', contact: '' },
          clinicalHistory: data.clinicalHistory ?? emptyClinicalHistory(),
        });
        setShareToken(data.shareToken ?? null);
        setError(null);
        fetchedRef.current = true;
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar anamnese. Por favor, tente novamente.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, getToken, setFormData]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 0) {
      if (!formData.child?.selectedChildId) { setValidationError('Selecione ou cadastre uma criança'); return false; }
    } else if (step === 1) {
      if (!formData.caregiver?.name) { setValidationError('Nome do responsável é obrigatório'); return false; }
      if (!formData.caregiver?.relationship) { setValidationError('Relação do responsável é obrigatória'); return false; }
      if (!formData.caregiver?.contact) { setValidationError('Contato do responsável é obrigatório'); return false; }
    } else if (step === 2) {
      if (!formData.clinicalHistory?.queixa?.mainComplaint) {
        setValidationError('Queixa principal é obrigatória');
        return false;
      }
    }
    return true;
  };

  const validateForm = (): boolean => {
    setValidationError(null);
    if (!formData.child?.name) { setValidationError('Nome da criança é obrigatório'); return false; }
    if (!formData.child?.birthDate) { setValidationError('Data de nascimento da criança é obrigatória'); return false; }
    if (!formData.child?.gender) { setValidationError('Gênero da criança é obrigatório'); return false; }
    if (!formData.child?.age) { setValidationError('Idade da criança é obrigatória'); return false; }
    if (!formData.caregiver?.name) { setValidationError('Nome do responsável é obrigatório'); return false; }
    if (!formData.caregiver?.relationship) { setValidationError('Relação do responsável é obrigatória'); return false; }
    if (!formData.caregiver?.contact) { setValidationError('Contato do responsável é obrigatório'); return false; }
    if (!formData.clinicalHistory?.queixa?.mainComplaint) {
      setValidationError('Queixa principal é obrigatória');
      return false;
    }
    return true;
  };

  const handleBack = async () => {
    if (currentStep === 0) return;
    const newStep = currentStep - 1;
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    setCurrentStep(newStep);
    await saveOnStepChange(newStep);
    setValidationError(null);
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    const newStep = currentStep + 1;
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    setCurrentStep(newStep);
    await saveOnStepChange(newStep);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isNewMode) {
      if (!validateStep(currentStep)) return;
    } else {
      if (!validateForm()) return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = {
        child: formData.child,
        caregiver: formData.caregiver,
        clinicalHistory: formData.clinicalHistory,
      };

      if (isNewMode) {
        await anamneseApi.create(payload, token);
        await clearDraft();
      } else if (isEditMode && id) {
        await anamneseApi.update(id, payload, token);
      }

      navigate('/anamneses');
    } catch (err) {
      setError('Erro ao salvar anamnese. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (isNewMode) return 'Nova Anamnese';
    if (isEditMode) return 'Editar Anamnese';
    return 'Visualizar Anamnese';
  };

  const disabled = isViewMode;

  if (loading) {
    return (
      <Box width="100%">
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando anamnese..." />
          </Flex>
        </GumroadCard>
      </Box>
    );
  }

  if (notFound) {
    return (
      <NotFound
        title="Anamnese não encontrada"
        message="A anamnese que você está procurando não existe ou foi removida."
      />
    );
  }

  if (error) {
    return (
      <Box width="100%">
        <GumroadCard color="salmon" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <GumroadText level="body-md" as="p">{error}</GumroadText>
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
              Voltar
            </GumroadButton>
          </Flex>
        </GumroadCard>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <form onSubmit={handleSubmit}>
        <Flex
          justify="between"
          align={{ initial: 'start', sm: 'center' }}
          mb="6"
          gap="4"
          direction={{ initial: 'column', sm: 'row' }}
        >
          <GumroadHeading level="display-sm" as="h1">
            {getTitle()}
          </GumroadHeading>
          <Flex gap="3" wrap="wrap">
            {isViewMode && (
              <GumroadButton variant="secondary" size="sm" onClick={() => navigate(`/anamnese/${id}/edit`)}>
                Editar
              </GumroadButton>
            )}
            <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/anamneses')}>
              Voltar
            </GumroadButton>
          </Flex>
        </Flex>

        {/* Stepper — new-mode only */}
        {isNewMode && (
          <Box mb="6">
            <GumroadStepper
              steps={STEPS}
              current={currentStep}
              completed={completedSteps}
              onStepClick={(i) => {
                if (completedSteps.has(i) || i === currentStep) {
                  setCurrentStep(i);
                  setValidationError(null);
                }
              }}
            />
          </Box>
        )}

        {validationError && (
          <GumroadCard color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.lg }}>
            <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
              Erros de validação: {validationError}
            </GumroadText>
          </GumroadCard>
        )}

        {isViewMode && id && (
          <GumroadCard color="mint" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <ShareLinkBox
              anamneseId={id}
              shareToken={shareToken}
              onTokenChange={setShareToken}
            />
          </GumroadCard>
        )}

        {/* New-mode: one section at a time */}
        {isNewMode ? (
          <>
            {currentStep === 0 && (
              <GumroadCard color="cyan" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <ChildPicker
                  selectedId={formData.child?.selectedChildId ?? null}
                  onSelect={(child) => {
                    setFormData((prev) => ({
                      ...prev,
                      child: {
                        ...prev.child,
                        selectedChildId: child.id,
                        name: child.name,
                        birthDate: child.birthDate,
                        gender: child.gender ?? 'other',
                        nationalIdentity: child.nationalIdentity ?? '',
                        otherInfo: child.otherInfo ?? '',
                      },
                    }));
                  }}
                />
              </GumroadCard>
            )}
            {currentStep === 1 && (
              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <CaregiverSection
                  formData={formData}
                  updateFormData={updateFormData}
                  disabled={false}
                />
              </GumroadCard>
            )}
            {currentStep === 2 && (
              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <ClinicalHistorySection
                  formData={formData}
                  updateFormData={updateFormData}
                  disabled={false}
                />
              </GumroadCard>
            )}
          </>
        ) : (
          /* View/edit mode: all sections at once */
          <>
            <GumroadCard color="cyan" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <ChildSection
                formData={formData}
                updateFormData={updateFormData}
                disabled={disabled}
              />
            </GumroadCard>

            <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <CaregiverSection
                formData={formData}
                updateFormData={updateFormData}
                disabled={disabled}
              />
            </GumroadCard>

            <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <ClinicalHistorySection
                formData={formData}
                updateFormData={updateFormData}
                disabled={disabled}
              />
            </GumroadCard>
          </>
        )}

        <Flex gap="3" mt="4" justify="end" wrap="wrap">
          {isNewMode ? (
            <>
              <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
                Cancelar
              </GumroadButton>
              {currentStep > 0 && (
                <GumroadButton variant="secondary" size="md" onClick={handleBack}>
                  Voltar
                </GumroadButton>
              )}
              {currentStep < STEPS.length - 1 ? (
                <GumroadButton variant="primary" size="md" onClick={handleNext}>
                  Próximo
                </GumroadButton>
              ) : (
                <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                  {submitting ? 'Criando...' : 'Criar Anamnese'}
                </GumroadButton>
              )}
            </>
          ) : !isViewMode ? (
            <>
              <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
                Cancelar
              </GumroadButton>
              <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </GumroadButton>
            </>
          ) : (
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
              Voltar
            </GumroadButton>
          )}
        </Flex>
      </form>
    </Box>
  );
};

export default AnamneseForm;
