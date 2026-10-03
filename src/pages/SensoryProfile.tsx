/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { assessmentApi, ChildData } from '../services/api';
import { Box, Flex, Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

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
  getInstrument,
  getSectionsForItemIds,
} from '../instruments';
import { toSensoryItems } from '../instruments/types';
import { buildSectionsFromResponses } from '../components/sensory-profile/buildSections';
import { colors, spacing, typography } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GumroadStepper from '../components/design-system/GumroadStepper';
import { useDraftPersistence } from '../hooks/useDraftPersistence';

const PRELUDE_STEP_KEYS = [
  { key: 'child', labelKey: 'assessmentForm.steps.child' },
  { key: 'examiner', labelKey: 'assessmentForm.steps.examiner' },
  { key: 'caregiver', labelKey: 'assessmentForm.steps.caregiver' },
  { key: 'instructions', labelKey: 'assessmentForm.steps.instructions' },
] as const;

const PRELUDE_COUNT = PRELUDE_STEP_KEYS.length; // 4

const SensoryProfileForm: React.FC = () => {
  const { t } = useTranslation();
  // Efeitos de carga usam a tradução mais recente sem depender da identidade de t
  const tRef = useRef(t);
  tRef.current = t;
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
        : window.confirm(t('assessmentForm.confirmSwitchInstrument'));
      if (!confirmed) return;
    }
    switchInstrument(newId);
  };

  const [parentData, setParentData] = useState<{ scores_json: Record<string, unknown> } | null>(null);
  const [parentLoading, setParentLoading] = useState(!!searchParams.get('parent'));
  const [parentError, setParentError] = useState(false);

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
    if (instrument.dynamicSections) {
      // Novo: seções vêm da avaliação-mãe. Visualização/edição: das respostas já carregadas.
      if (parentData) return instrument.dynamicSections(parentData);
      const ids = Object.values(formData.sections ?? {}).flatMap((sec) => sec.items.map((i) => i.id));
      return getSectionsForItemIds(instrument, ids);
    }
    return instrument.sections;
  }, [instrument, parentData, formData.sections]);

  // Sem avaliação-mãe válida, instrumentos de acompanhamento não têm itens para responder
  const needsParent = isNewMode && !!instrument.parentInstrumentId;
  const parentUnavailable =
    needsParent && !parentLoading && (!parentId || parentError || effectiveSections.length === 0);

  const steps = useMemo(
    () => [
      ...PRELUDE_STEP_KEYS.map((st) => ({ key: st.key, label: t(st.labelKey) })),
      ...effectiveSections.map((s) => ({ key: s.key, label: s.title ?? s.key })),
    ],
    [effectiveSections, t],
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
    setParentError(false);
    const fetchParent = async () => {
      try {
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(parentId, token);
        const assessment = response.data?.assessment ?? response.assessment ?? response;
        setParentData({ scores_json: assessment.scores_json ?? assessment.scoresJson ?? {} });
      } catch (err) {
        console.error('Error fetching parent assessment:', err);
        setParentError(true);
      } finally {
        setParentLoading(false);
      }
    };
    fetchParent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  // Seções dinâmicas (ex.: itens reprovados da triagem) entram no formulário quando a avaliação-mãe carrega
  useEffect(() => {
    if (!isNewMode || !instrument.dynamicSections || !parentData) return;
    setFormData((prev) => {
      let changed = false;
      const sections = { ...prev.sections };
      for (const def of effectiveSections) {
        const current = sections[def.key];
        if (!current) {
          sections[def.key] = { items: toSensoryItems(def.items), rawScore: 0, comments: '' };
          changed = true;
        } else {
          // Rascunhos antigos: atualiza descrição e roteiro a partir da definição do instrumento
          const items = current.items.map((it) => {
            const d = def.items.find((x) => x.id === it.id);
            if (!d || (it.description === d.description && it.guidance === d.guidance)) return it;
            changed = true;
            return { ...it, description: d.description, guidance: d.guidance };
          });
          sections[def.key] = { ...current, items };
        }
      }
      return changed ? { ...prev, sections } : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewMode, instrument, parentData, effectiveSections]);

  // Ao trocar de etapa, volta ao topo para o usuário ver o início do conteúdo
  useEffect(() => {
    if (isNewMode) window.scrollTo?.({ top: 0 });
  }, [currentStep, isNewMode]);

  // Per-step validation
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    const fail = (msg: string) => {
      setValidationError(msg);
      return false;
    };

    if (step === 0) {
      if (!formData.child?.selectedChildId) return fail(t('assessmentForm.validation.child'));
    } else if (step === 1) {
      if (!formData.examiner?.name) return fail(t('assessmentForm.validation.examinerName'));
      if (!formData.examiner?.profession) return fail(t('assessmentForm.validation.examinerProfession'));
      if (!formData.examiner?.contact) return fail(t('assessmentForm.validation.examinerContact'));
    } else if (step === 2) {
      if (!formData.caregiver?.name) return fail(t('assessmentForm.validation.caregiverName'));
      if (!formData.caregiver?.relationship) return fail(t('assessmentForm.validation.caregiverRelationship'));
      if (!formData.caregiver?.contact) return fail(t('assessmentForm.validation.caregiverContact'));
    } else if (step === 3) {
      // No validation for instructions
    } else {
      // Etapas de itens: todos precisam de resposta antes de avançar
      const section = effectiveSections[step - PRELUDE_COUNT];
      const missing = section
        ? (formData.sections?.[section.key]?.items ?? []).filter((i) => !i.response).length
        : 0;
      if (missing > 0) return fail(t('assessmentForm.validation.sectionItems', { count: missing }));
    }

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

          const { sections: builtSections, sectionKeys } = buildSectionsFromResponses(loadedInstrument, responses);

          sectionKeys.forEach((key) => {
            const scoreField = `${key}RawScore`;
            if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
              builtSections[key].rawScore = assessment[scoreField];
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
            scoresJson: assessment.scores_json ?? assessment.scoresJson ?? undefined,
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
          setError(tRef.current('assessmentForm.errors.load'));
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
            setError(tRef.current('assessmentForm.errors.report'));
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

    if (!formData.child?.name) return fail(t('assessmentForm.validation.childName'));
    if (!formData.child?.birthDate) return fail(t('assessmentForm.validation.childBirthDate'));
    if (!formData.child?.gender) return fail(t('assessmentForm.validation.childGender'));
    if (!formData.child?.age) return fail(t('assessmentForm.validation.childAge'));

    if (!formData.examiner?.name) return fail(t('assessmentForm.validation.examinerName'));
    if (!formData.examiner?.profession) return fail(t('assessmentForm.validation.examinerProfession'));
    if (!formData.examiner?.contact) return fail(t('assessmentForm.validation.examinerContact'));

    if (!formData.caregiver?.name) return fail(t('assessmentForm.validation.caregiverName'));
    if (!formData.caregiver?.relationship) return fail(t('assessmentForm.validation.caregiverRelationship'));
    if (!formData.caregiver?.contact) return fail(t('assessmentForm.validation.caregiverContact'));

    // Todos os itens de todas as seções são obrigatórios (a API rejeita respostas incompletas)
    const unanswered: string[] = [];
    for (const section of effectiveSections) {
      const items = formData.sections?.[section.key]?.items ?? section.items.map((i) => ({ ...i, response: null }));
      items.forEach((item, idx) => {
        if (!item.response) {
          unanswered.push(
            section.items.length === 1 ? section.title : effectiveSections.length > 1 ? `${section.title} (${idx + 1})` : String(idx + 1),
          );
        }
      });
    }
    if (unanswered.length > 0) {
      return fail(t('assessmentForm.validation.unansweredItems', { count: unanswered.length, items: unanswered.join(', ') }));
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
      ...(parentId && instrument.parentInstrumentId ? { parentAssessmentId: parentId } : {}),
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
      setError(t('assessmentForm.errors.save'));
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
    if (isNewMode) return t('assessmentForm.title.new');
    if (isEditMode) return t('assessmentForm.title.edit');
    if (isReportMode) return t('assessmentForm.title.report');
    return t('assessmentForm.title.view');
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
                selectedId={formData.child?.selectedChildId ?? null}
                onSelect={(child: ChildData) => {
                  updateFormData('child', {
                    selectedChildId: child.id,
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
            <InstructionsSection instrument={instrument} />
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
            <LoadingSpinner size="large" text={t('assessmentForm.loading')} />
          </Flex>
        </GumroadCard>
      ) : notFound ? (
        <NotFound
          title={t('assessmentForm.notFound.title')}
          message={t('assessmentForm.notFound.message')}
        />
      ) : parentUnavailable ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <GumroadText level="body-md" as="p">
              {parentError
                ? t('assessmentForm.parent.loadError')
                : !parentId
                  ? t('assessmentForm.parent.missing')
                  : t('assessmentForm.parent.noFailedItems')}
            </GumroadText>
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('assessmentForm.buttons.back')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <GumroadText level="body-md" as="p">{error}</GumroadText>
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('assessmentForm.buttons.back')}
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
                  {t('assessmentForm.buttons.edit')}
                </GumroadButton>
              )}
              {!isNewMode && !isReportMode && (
                <GumroadButton variant="secondary" size="sm" onClick={() => navigate(`/assessment/${id}/report`)}>
                  {t('assessmentForm.buttons.viewReport')}
                </GumroadButton>
              )}
              <GumroadButton variant="secondary" size="sm" onClick={handleClose}>
                {t('assessmentForm.buttons.back')}
              </GumroadButton>
            </Flex>
          </Flex>

          {validationError && (
            <GumroadCard role="alert" color="salmon" shadow="sm" padding="md" style={{ marginBottom: spacing.lg }}>
              <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
                {t('assessmentForm.validationPrefix')} {validationError}
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
                  {t('assessmentForm.buttons.cancel')}
                </GumroadButton>
                {currentStep > 0 && (
                  <GumroadButton variant="secondary" size="md" onClick={handleStepBack}>
                    {t('assessmentForm.buttons.back')}
                  </GumroadButton>
                )}
                {currentStep < steps.length - 1 ? (
                  <GumroadButton variant="primary" size="md" onClick={handleStepNext}>
                    {t('assessmentForm.buttons.next')}
                  </GumroadButton>
                ) : (
                  <GumroadButton
                    variant="primary"
                    size="md"
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                  >
                    {submitting ? t('assessmentForm.creating') : t('assessmentForm.create')}
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
                <InstructionsSection instrument={instrument} />
              </GumroadCard>

              <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
                <SensoryProcessingSection
                  formData={formData}
                  sections={effectiveSections}
                  updateItemResponse={updateItemResponse}
                  updateFormData={updateFormData}
                  disabled={isViewMode || isReportMode}
                />
              </GumroadCard>

              <Flex gap="3" mt="4" justify="end" wrap="wrap">
                {!isViewMode && !isReportMode && (
                  <>
                    <GumroadButton variant="secondary" size="md" onClick={handleClose}>
                      {t('assessmentForm.buttons.cancel')}
                    </GumroadButton>
                    <GumroadButton variant="primary" size="md" type="submit" disabled={submitting}>
                      {submitting ? t('assessmentForm.saving') : t('assessmentForm.saveChanges')}
                    </GumroadButton>
                  </>
                )}
                {(isViewMode || isReportMode) && (
                  <>
                    <GumroadButton variant="secondary" size="md" onClick={handleClose}>
                      {t('assessmentForm.buttons.back')}
                    </GumroadButton>
                    {isViewMode && (
                      <GumroadButton variant="primary" size="md" onClick={() => navigate(`/assessment/${id}/edit`)}>
                        {t('assessmentForm.buttons.edit')}
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
