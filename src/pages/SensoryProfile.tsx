/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { assessmentApi, ChildData } from '../services/api';
import { Box, Flex, Badge } from '@radix-ui/themes';

import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ChildPicker from '../components/sensory-profile/ChildPicker';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection, { SensorySection } from '../components/sensory-profile/SensoryProcessingSection';
import InstrumentPicker from '../components/sensory-profile/InstrumentPicker';
import useFormData from '../components/sensory-profile/useFormData';
import AnamneseSelector from '../components/anamnese/AnamneseSelector';
import ProfessionalSharePanel from '../components/sharing/ProfessionalSharePanel';
import type { Anamnese } from '../components/anamnese/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuthContext } from '../context/AuthContext';
import {
  DEFAULT_INSTRUMENT_ID,
  findSectionByItemId,
  getInstrument,
} from '../instruments';
import { toSensoryItems } from '../instruments/types';
import { colors, spacing, typography } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GumroadStepper from '../components/design-system/GumroadStepper';
import { useDraftPersistence } from '../hooks/useDraftPersistence';

const PRELUDE_STEP_KEYS = [
  { key: 'child', label: 'Criança' },
  { key: 'examiner', label: 'Examinador' },
  { key: 'caregiver', label: 'Responsável' },
  { key: 'instructions', label: 'Instruções' },
] as const;

const PRELUDE_COUNT = PRELUDE_STEP_KEYS.length; // 4

const SensoryProfileForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInstrumentId = searchParams.get('instrument') || DEFAULT_INSTRUMENT_ID;
  const isFresh = searchParams.get('fresh') === '1';
  const parentId = searchParams.get('parent');

  const { formData, updateFormData, updateItemResponse, setFormData, switchInstrument } =
    useFormData(initialInstrumentId);

  const handleInstrumentChange = (newId: string) => {
    if (newId === formData.instrumentId) return;
    const hasAnyResponse = Object.values(formData.sections || {}).some((s) =>
      s.items.some((i) => !!i.response),
    );
    if (hasAnyResponse) {
      const confirmed = typeof window === 'undefined'
        ? true
        : window.confirm('Trocar de instrumento irá reiniciar as respostas já preenchidas. Deseja continuar?');
      if (!confirmed) return;
    }
    switchInstrument(newId);
  };

  const [parentData, setParentData] = useState<{ scores_json: Record<string, unknown> } | null>(null);
  const [parentLoading, setParentLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuthContext();
  const fetchedAssessmentRef = useRef(false);
  const fetchedReportRef = useRef(false);

  const isViewMode = !!id && !location.pathname.includes('/edit') && !location.pathname.includes('/report');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isReportMode = !!id && location.pathname.includes('/report');
  const isNewMode = !id;

  const instrument = useMemo(() => getInstrument(formData.instrumentId), [formData.instrumentId]);

  const effectiveSections = useMemo(() => {
    if (instrument.dynamicSections && parentData) {
      return instrument.dynamicSections(parentData);
    }
    return instrument.sections;
  }, [instrument, parentData]);

  const steps = useMemo(
    () => [
      ...PRELUDE_STEP_KEYS,
      ...effectiveSections.map((s) => ({ key: s.key, label: s.title ?? s.key })),
    ],
    [effectiveSections],
  );

  // Stepper state (new-mode only)
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [maxStepReached, setMaxStepReached] = useState(0);
  const draftCheckedRef = useRef(false);

  const { loadDraft, clearDraft, saveOnStepChange } = useDraftPersistence({
    formType: 'sensory_assessment',
    formData: formData as Record<string, unknown>,
    currentStep,
    instrumentId: formData.instrumentId,
    enabled: isNewMode,
  });

  // Auto-resume draft on mount (new-mode only)
  useEffect(() => {
    if (!isNewMode || draftCheckedRef.current) return;
    draftCheckedRef.current = true;

    if (isFresh) {
      clearDraft();
      return;
    }

    const checkDraft = async () => {
      const draft = await loadDraft();
      if (!draft) return;
      setFormData(draft.payload as any);
      const step = draft.currentStep ?? 0;
      setCurrentStep(step);
      setMaxStepReached(step);
      const completed = new Set<number>();
      for (let i = 0; i < step; i++) completed.add(i);
      setCompletedSteps(completed);
      if (draft.instrumentId && draft.instrumentId !== formData.instrumentId) {
        switchInstrument(draft.instrumentId);
      }
    };

    checkDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewMode]);

  // Fetch parent assessment when ?parent= is present
  useEffect(() => {
    if (!parentId) return;
    setParentLoading(true);
    const fetchParent = async () => {
      try {
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(parentId, token);
        const assessment = response.data?.assessment ?? response;
        setParentData({ scores_json: assessment.scores_json ?? {} });
      } catch (err) {
        console.error('Error fetching parent assessment:', err);
      } finally {
        setParentLoading(false);
      }
    };
    fetchParent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  // Per-step validation
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    const fail = (msg: string) => {
      setValidationError(msg);
      return false;
    };

    if (step === 0) {
      if (!formData.child?.id) return fail('Selecione ou cadastre uma criança para continuar.');
    } else if (step === 1) {
      if (!formData.examiner?.name) return fail('Nome do examinador é obrigatório');
      if (!formData.examiner?.profession) return fail('Cargo/Função do examinador é obrigatório');
      if (!formData.examiner?.contact) return fail('Contato do examinador é obrigatório');
    } else if (step === 2) {
      if (!formData.caregiver?.name) return fail('Nome do cuidador é obrigatório');
      if (!formData.caregiver?.relationship) return fail('Relação do cuidador com a criança é obrigatória');
      if (!formData.caregiver?.contact) return fail('Contato do cuidador é obrigatório');
    } else if (step === 3) {
      // No validation for instructions
    }
    // Steps 4-12 are individual sensory sections — no required-field validation

    return true;
  };

  const handleStepBack = () => {
    if (currentStep === 0) return;
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    saveOnStepChange(newStep);
    setValidationError(null);
  };

  const handleStepNext = () => {
    if (!validateStep(currentStep)) return;
    const newStep = currentStep + 1;
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setMaxStepReached((prev) => Math.max(prev, newStep));
    setCurrentStep(newStep);
    saveOnStepChange(newStep);
  };

  const handleStepClick = (i: number) => {
    if (i > maxStepReached) return;
    setValidationError(null);
    setCurrentStep(i);
  };

  useEffect(() => {
    fetchedAssessmentRef.current = false;
    fetchedReportRef.current = false;
    if (!id || isNewMode) return;

    const fetchAssessment = async () => {
      if (fetchedAssessmentRef.current) return;

      try {
        setLoading(true);
        setNotFound(false);
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(id, token);
        const responseData = response.data || response;

        if (responseData.assessment && responseData.responses) {
          const { assessment, responses } = responseData;
          const loadedInstrumentId: string = assessment.instrumentId || DEFAULT_INSTRUMENT_ID;
          const loadedInstrument = getInstrument(loadedInstrumentId);

          const builtSections: Record<string, { items: any[]; rawScore: number; comments: string }> =
            Object.fromEntries(
              loadedInstrument.sections.map((s) => [
                s.key,
                { items: toSensoryItems(s.items), rawScore: 0, comments: '' },
              ]),
            );

          if (Array.isArray(responses)) {
            responses.forEach((r: { itemId: number; response: string; id?: string }) => {
              const sectionKey = findSectionByItemId(loadedInstrument, r.itemId);
              if (!sectionKey) return;
              const section = builtSections[sectionKey];
              const target = section.items.find((it) => it.id === r.itemId);
              if (target) {
                target.response = r.response;
                if (r.id) target.responseId = r.id;
              }
            });
          }

          loadedInstrument.sections.forEach((s) => {
            const scoreField = `${s.key}RawScore`;
            if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
              builtSections[s.key].rawScore = assessment[scoreField];
            }
          });

          if (Array.isArray(assessment.sectionComments)) {
            assessment.sectionComments.forEach((c: { section: string; comments: string }) => {
              if (builtSections[c.section]) {
                builtSections[c.section].comments = c.comments || '';
              }
            });
          }

          setFormData({
            instrumentId: loadedInstrumentId,
            child: {
              name: assessment.childName,
              birthDate: assessment.childBirthDate
                ? new Date(assessment.childBirthDate).toISOString().split('T')[0]
                : '',
              gender: assessment.childGender,
              nationalIdentity: assessment.childNationalIdentity || '',
              otherInfo: assessment.childOtherInfo || '',
              age: assessment.childAge,
            },
            examiner: {
              name: assessment.examinerName,
              profession: assessment.examinerProfession,
              contact: assessment.examinerContact,
            },
            caregiver: {
              name: assessment.caregiverName,
              relationship: assessment.caregiverRelationship,
              contact: assessment.caregiverContact,
            },
            sections: builtSections,
            createdAt: assessment.createdAt,
          });
        } else {
          setFormData((prev) => ({ ...prev, ...responseData, instrumentId: responseData.instrumentId || DEFAULT_INSTRUMENT_ID }));
        }

        setError(null);
        fetchedAssessmentRef.current = true;
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar avaliação. Por favor, tente novamente.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, isNewMode, setFormData, getToken]);

  useEffect(() => {
    if (id && isReportMode) {
      const fetchReport = async () => {
        if (fetchedReportRef.current) return;

        try {
          setLoading(true);
          const token = await getToken();
          await assessmentApi.generateReport(id, token);
          setError(null);
          fetchedReportRef.current = true;
        } catch (err: any) {
          if (err.response && err.response.status === 404) {
            setNotFound(true);
          } else {
            setError('Erro ao gerar relatório. Por favor, tente novamente.');
          }
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [id, isReportMode, getToken]);

  const validateForm = () => {
    setValidationError(null);

    if (!formData.child?.name) return fail('Nome da criança é obrigatório');
    if (!formData.child?.birthDate) return fail('Data de nascimento da criança é obrigatória');
    if (!formData.child?.gender) return fail('Gênero da criança é obrigatório');
    if (!formData.child?.age) return fail('Idade da criança é obrigatória');

    if (!formData.examiner?.name) return fail('Nome do examinador é obrigatório');
    if (!formData.examiner?.profession) return fail('Cargo/Função do examinador é obrigatório');
    if (!formData.examiner?.contact) return fail('Contato do examinador é obrigatório');

    if (!formData.caregiver?.name) return fail('Nome do cuidador é obrigatório');
    if (!formData.caregiver?.relationship) return fail('Relação do cuidador com a criança é obrigatória');
    if (!formData.caregiver?.contact) return fail('Contato do cuidador é obrigatório');

    for (const section of effectiveSections) {
      const sectionData = formData.sections?.[section.key];
      if (!sectionData) continue;
      for (const item of sectionData.items) {
        if (!item.response) {
          return fail('Todos os itens de processamento sensorial são obrigatórios');
        }
      }
    }

    return true;

    function fail(message: string) {
      setValidationError(message);
      return false;
    }
  };

  const buildAssessmentPayload = () => {
    const sectionComments = effectiveSections
      .map((s) => ({ section: s.key, comments: formData.sections?.[s.key]?.comments || '' }))
      .filter((c) => c.comments.trim() !== '');

    const responses: Array<{ itemId: number; response: string }> = [];
    effectiveSections.forEach((s) => {
      formData.sections?.[s.key]?.items.forEach((item) => {
        if (item.response) responses.push({ itemId: item.id, response: item.response });
      });
    });

    return {
      instrumentId: formData.instrumentId,
      child: formData.child,
      examiner: formData.examiner,
      caregiver: formData.caregiver,
      responses,
      sectionComments,
      ...(parentId ? { parentAssessmentId: parentId } : {}),
    };
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = buildAssessmentPayload();

      if (isNewMode) {
        await assessmentApi.createAssessment(payload, token);
        await clearDraft();
      } else if (isEditMode && id) {
        await assessmentApi.updateAssessment(id, payload, token);
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao salvar avaliação. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isNewMode) {
      // In new-mode submit is driven by stepper buttons; prevent implicit form submit
      return;
    }
    handleSubmit(e);
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  const getTitle = () => {
    if (isNewMode) return 'Nova Avaliação';
    if (isEditMode) return 'Editar Avaliação';
    if (isReportMode) return 'Relatório de Avaliação';
    return 'Visualizar Avaliação';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <Flex direction="column" gap="4">
                <InstrumentPicker
                  value={formData.instrumentId}
                  onChange={handleInstrumentChange}
                />
                <AnamneseSelector
                  onSelect={(a: Anamnese) => {
                    updateFormData('child', a.child);
                    updateFormData('caregiver', a.caregiver);
                  }}
                />
              </Flex>
            </GumroadCard>
            <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
              <ChildPicker
                selectedId={formData.child?.id ?? null}
                onSelect={(child: ChildData) => {
                  updateFormData('child', {
                    id: child.id,
                    name: child.name,
                    birthDate: child.birthDate,
                    gender: child.gender ?? '',
                    nationalIdentity: child.nationalIdentity ?? '',
                    otherInfo: child.otherInfo ?? '',
                  });
                }}
              />
            </GumroadCard>
          </>
        );
      case 1:
        return (
          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <ExaminerDataSection
              formData={formData}
              updateFormData={updateFormData}
              disabled={false}
            />
          </GumroadCard>
        );
      case 2:
        return (
          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <CaregiverDataSection
              formData={formData}
              updateFormData={updateFormData}
              disabled={false}
            />
          </GumroadCard>
        );
      case 3:
        return (
          <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <InstructionsSection />
          </GumroadCard>
        );
      default: {
        // Steps PRELUDE_COUNT..(PRELUDE_COUNT + sections.length - 1): one section per step
        const sectionIndex = currentStep - PRELUDE_COUNT;
        const section = effectiveSections[sectionIndex];
        if (!section) return null;
        const sectionData = formData.sections?.[section.key];
        const items = sectionData?.items || [];
        const comments = sectionData?.comments || '';
        return (
          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
            <SensorySection
              title={section.title}
              sectionKey={section.key}
              items={items}
              comments={comments}
              scale={instrument.scale}
              allowedValues={section.allowedValues}
              updateItemResponse={updateItemResponse}
              updateComments={(sectionKey, value) => updateFormData(`sections.${sectionKey}.comments`, value)}
              disabled={false}
            />
          </GumroadCard>
        );
      }
    }
  };

  return (
    <Box width="100%">
      {loading || parentLoading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando dados..." />
          </Flex>
        </GumroadCard>
      ) : notFound ? (
        <NotFound
          title="Avaliação não encontrada"
          message="A avaliação que você está procurando não existe ou foi removida."
        />
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <GumroadText level="body-md" as="p">{error}</GumroadText>
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              Voltar
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <form onSubmit={handleFormSubmit}>
          {/* Header */}
          <Flex
            justify="between"
            align={{ initial: 'start', sm: 'center' }}
            mb="6"
            gap="4"
            direction={{ initial: 'column', sm: 'row' }}
          >
            <Flex direction="column" gap="1">
              <GumroadHeading level="display-sm" as="h1">
                {getTitle()}
              </GumroadHeading>
              <Badge
                color="teal"
                variant="soft"
                style={{
                  alignSelf: 'flex-start',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '9999px',
                  fontFamily: typography.caption.font,
                }}
              >
                {instrument.shortName}
              </Badge>
            </Flex>
            <Flex gap="3" wrap="wrap">
              {!isNewMode && !isEditMode && !isReportMode && (
                <GumroadButton variant="secondary" size="sm" onClick={() => navigate(`/assessment/${id}/edit`)}>
                  Editar
                </GumroadButton>
              )}
              {!isNewMode && !isReportMode && (
                <GumroadButton variant="secondary" size="sm" onClick={() => navigate(`/assessment/${id}/report`)}>
                  Ver Relatório
                </GumroadButton>
              )}
              <GumroadButton variant="secondary" size="sm" onClick={handleClose}>
                Voltar
              </GumroadButton>
            </Flex>
          </Flex>

          {validationError && (
            <GumroadCard color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.lg }}>
              <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                Erros de validação: {validationError}
              </GumroadText>
            </GumroadCard>
          )}

          {isViewMode && id && (
            <ProfessionalSharePanel resourceType="assessment" resourceId={id} />
          )}

          {/* NEW MODE: stepper + one section at a time */}
          {isNewMode ? (
            <>
              <GumroadStepper
                steps={steps}
                current={currentStep}
                completed={completedSteps}
                onStepClick={handleStepClick}
              />

              {renderStepContent()}

              <Flex gap="3" mt="4" justify="end" wrap="wrap">
                <GumroadButton variant="secondary" size="md" onClick={handleClose}>
                  Cancelar
                </GumroadButton>
                {currentStep > 0 && (
                  <GumroadButton variant="secondary" size="md" onClick={handleStepBack}>
                    Voltar
                  </GumroadButton>
                )}
                {currentStep < steps.length - 1 ? (
                  <GumroadButton variant="primary" size="md" onClick={handleStepNext}>
                    Próximo
                  </GumroadButton>
                ) : (
                  <GumroadButton
                    variant="primary"
                    size="md"
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                  >
                    {submitting ? 'Criando...' : 'Criar Avaliação'}
                  </GumroadButton>
                )}
              </Flex>
            </>
          ) : (
            /* EDIT / VIEW / REPORT MODE: all sections at once */
            <>
              {isEditMode && (
                <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                  <Flex direction="column" gap="4">
                    <InstrumentPicker
                      value={formData.instrumentId}
                      onChange={handleInstrumentChange}
                    />
                  </Flex>
                </GumroadCard>
              )}

              <GumroadCard color="cyan" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <ChildDataSection
                  formData={formData}
                  updateFormData={updateFormData}
                  disabled={isViewMode || isReportMode}
                />
              </GumroadCard>

              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <ExaminerDataSection
                  formData={formData}
                  updateFormData={updateFormData}
                  disabled={isViewMode || isReportMode}
                />
              </GumroadCard>

              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <CaregiverDataSection
                  formData={formData}
                  updateFormData={updateFormData}
                  disabled={isViewMode || isReportMode}
                />
              </GumroadCard>

              <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <InstructionsSection />
              </GumroadCard>

              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <SensoryProcessingSection
                  formData={formData}
                  updateItemResponse={updateItemResponse}
                  updateFormData={updateFormData}
                  disabled={isViewMode || isReportMode}
                />
              </GumroadCard>

              <Flex gap="3" mt="4" justify="end" wrap="wrap">
                {!isViewMode && !isReportMode && (
                  <>
                    <GumroadButton variant="secondary" size="md" onClick={handleClose}>
                      Cancelar
                    </GumroadButton>
                    <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                      {submitting ? 'Salvando...' : 'Salvar Alterações'}
                    </GumroadButton>
                  </>
                )}
                {(isViewMode || isReportMode) && (
                  <>
                    <GumroadButton variant="secondary" size="md" onClick={handleClose}>
                      Voltar
                    </GumroadButton>
                    {isViewMode && (
                      <GumroadButton variant="primary" size="md" onClick={() => navigate(`/assessment/${id}/edit`)}>
                        Editar
                      </GumroadButton>
                    )}
                  </>
                )}
              </Flex>
            </>
          )}
        </form>
      )}
    </Box>
  );
};

export default SensoryProfileForm;
