/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { useAuthContext } from '../context/AuthContext';

import { anamneseApi } from '../services/api';
import useAnamneseForm from '../components/anamnese/useAnamneseForm';
import ChildSection from '../components/anamnese/ChildSection';
import ChildPicker from '../components/sensory-profile/ChildPicker';
import CaregiverSection from '../components/anamnese/CaregiverSection';
import ClinicalHistorySection from '../components/anamnese/ClinicalHistorySection';
import ShareLinkBox from '../components/anamnese/ShareLinkBox';
import ProfessionalSharePanel from '../components/sharing/ProfessionalSharePanel';
import { emptyClinicalHistory } from '../components/anamnese/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GumroadStepper from '../components/design-system/GumroadStepper';
import { useDraftPersistence } from '../hooks/useDraftPersistence';


const AnamneseForm: React.FC = () => {
  const { t } = useTranslation();
  const STEPS = [
    { key: 'child', label: t('p1AnamneseForm.stepChild') },
    { key: 'caregiver', label: t('p1AnamneseForm.stepCaregiver') },
    { key: 'clinical', label: t('p1AnamneseForm.stepClinical') },
  ];
  const { formData, setFormData, updateFormData } = useAnamneseForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Falha ao salvar não pode trocar o formulário por uma tela de erro: o usuário perderia o que digitou.
  const [saveError, setSaveError] = useState<string | null>(null);
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
    formData: formData as unknown as Record<string, unknown>,
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
          setError(t('p1AnamneseForm.errLoad'));
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
      if (!formData.child?.selectedChildId) { setValidationError(t('p1AnamneseForm.vChild')); return false; }
    } else if (step === 1) {
      if (!formData.caregiver?.name) { setValidationError(t('p1AnamneseForm.vCgName')); return false; }
      if (!formData.caregiver?.relationship) { setValidationError(t('p1AnamneseForm.vCgRel')); return false; }
      if (!formData.caregiver?.contact) { setValidationError(t('p1AnamneseForm.vCgContact')); return false; }
    } else if (step === 2) {
      if (!formData.clinicalHistory?.queixa?.mainComplaint) {
        setValidationError(t('p1AnamneseForm.vComplaint'));
        return false;
      }
    }
    return true;
  };

  const validateForm = (): boolean => {
    setValidationError(null);
    if (!formData.child?.name) { setValidationError(t('p1AnamneseForm.vName')); return false; }
    if (!formData.child?.birthDate) { setValidationError(t('p1AnamneseForm.vBirth')); return false; }
    if (!formData.child?.gender) { setValidationError(t('p1AnamneseForm.vGender')); return false; }
    if (!formData.child?.age) { setValidationError(t('p1AnamneseForm.vAge')); return false; }
    if (!formData.caregiver?.name) { setValidationError(t('p1AnamneseForm.vCgName')); return false; }
    if (!formData.caregiver?.relationship) { setValidationError(t('p1AnamneseForm.vCgRel')); return false; }
    if (!formData.caregiver?.contact) { setValidationError(t('p1AnamneseForm.vCgContact')); return false; }
    if (!formData.clinicalHistory?.queixa?.mainComplaint) {
      setValidationError(t('p1AnamneseForm.vComplaint'));
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
      setSaveError(null);
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
      setSaveError(t('p1AnamneseForm.errSave'));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (isNewMode) return t('p1AnamneseForm.titleNew');
    if (isEditMode) return t('p1AnamneseForm.titleEdit');
    return t('p1AnamneseForm.titleView');
  };

  const disabled = isViewMode;

  if (loading) {
    return (
      <Box width="100%">
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text={t('p1AnamneseForm.loading')} />
          </Flex>
        </GumroadCard>
      </Box>
    );
  }

  if (notFound) {
    return (
      <NotFound
        title={t('p1AnamneseForm.notFoundTitle')}
        message={t('p1AnamneseForm.notFoundMsg')}
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
              {t('p1AnamneseForm.back')}
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
                {t('p1AnamneseForm.edit')}
              </GumroadButton>
            )}
            <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/anamneses')}>
              {t('p1AnamneseForm.back')}
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
              {t('p1AnamneseForm.validation', { message: validationError })}
            </GumroadText>
          </GumroadCard>
        )}

        {saveError && (
          <div role="alert">
            <GumroadCard color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.lg }}>
              <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                {saveError}
              </GumroadText>
            </GumroadCard>
          </div>
        )}

        {isViewMode && id && (
          <>
            <GumroadCard color="mint" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <ShareLinkBox
                anamneseId={id}
                shareToken={shareToken}
                onTokenChange={setShareToken}
              />
            </GumroadCard>
            <ProfessionalSharePanel resourceType="anamnese" resourceId={id} />
          </>
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
                {t('p1AnamneseForm.cancel')}
              </GumroadButton>
              {currentStep > 0 && (
                <GumroadButton variant="secondary" size="md" onClick={handleBack}>
                  {t('p1AnamneseForm.back')}
                </GumroadButton>
              )}
              {currentStep < STEPS.length - 1 ? (
                <GumroadButton variant="primary" size="md" onClick={handleNext}>
                  {t('p1AnamneseForm.next')}
                </GumroadButton>
              ) : (
                <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                  {submitting ? t('p1AnamneseForm.creating') : t('p1AnamneseForm.create')}
                </GumroadButton>
              )}
            </>
          ) : !isViewMode ? (
            <>
              <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
                {t('p1AnamneseForm.cancel')}
              </GumroadButton>
              <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                {submitting ? t('p1AnamneseForm.saving') : t('p1AnamneseForm.saveChanges')}
              </GumroadButton>
            </>
          ) : (
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/anamneses')}>
              {t('p1AnamneseForm.back')}
            </GumroadButton>
          )}
        </Flex>
      </form>
    </Box>
  );
};

export default AnamneseForm;
