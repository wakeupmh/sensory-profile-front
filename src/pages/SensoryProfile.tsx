/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { assessmentApi } from '../services/api';

import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection from '../components/sensory-profile/SensoryProcessingSection';
import InstrumentPicker from '../components/sensory-profile/InstrumentPicker';
import useFormData from '../components/sensory-profile/useFormData';
import AnamneseSelector from '../components/anamnese/AnamneseSelector';
import type { Anamnese } from '../components/anamnese/types';
import { Button, Flex, Text, Box, Card, Heading, Badge } from '@radix-ui/themes';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuthContext } from '../context/AuthContext';
import {
  DEFAULT_INSTRUMENT_ID,
  findSectionByItemId,
  getInstrument,
} from '../instruments';
import { toSensoryItems } from '../instruments/types';

const SensoryProfileForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInstrumentId = searchParams.get('instrument') || DEFAULT_INSTRUMENT_ID;

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

  useEffect(() => {
    if (!id || isNewMode) return;

    const fetchAssessment = async () => {
      if (fetchedAssessmentRef.current) return;

      try {
        setLoading(true);
        setNotFound(false);
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(id, token);

        if (response.assessment && response.responses) {
          const { assessment, responses } = response;
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

          // Rehydrate rawScore per section from the assessment payload if available
          loadedInstrument.sections.forEach((s) => {
            const scoreField = `${s.key}RawScore`;
            if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
              builtSections[s.key].rawScore = assessment[scoreField];
            }
          });

          // Apply section comments if the backend sends them
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
          // Legacy shape fallback — assume default instrument
          setFormData((prev) => ({ ...prev, ...response, instrumentId: response.instrumentId || DEFAULT_INSTRUMENT_ID }));
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

    for (const section of instrument.sections) {
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
    const sectionComments = instrument.sections
      .map((s) => ({ section: s.key, comments: formData.sections?.[s.key]?.comments || '' }))
      .filter((c) => c.comments.trim() !== '');

    const responses: Array<{ itemId: number; response: string }> = [];
    instrument.sections.forEach((s) => {
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
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = buildAssessmentPayload();

      if (isNewMode) {
        await assessmentApi.createAssessment(payload, token);
      } else if (isEditMode && id) {
        await assessmentApi.updateAssessment(id, payload, token);
      }

      navigate('/');
    } catch (err) {
      setError('Erro ao salvar avaliação. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const getTitle = () => {
    if (isNewMode) return 'Nova Avaliação';
    if (isEditMode) return 'Editar Avaliação';
    if (isReportMode) return 'Relatório de Avaliação';
    return 'Visualizar Avaliação';
  };

  return (
    <Box p="4" width="100%">
      {loading ? (
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando dados..." />
          </Flex>
        </Card>
      ) : notFound ? (
        <NotFound
          title="Avaliação não encontrada"
          message="A avaliação que você está procurando não existe ou foi removida."
        />
      ) : error ? (
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <Text color="red">{error}</Text>
            <Button onClick={() => navigate('/')} color="gray">Voltar</Button>
          </Flex>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Flex justify="between" align="center" mb="6">
            <Flex direction="column" gap="1">
              <Heading size="7" color="violet">{getTitle()}</Heading>
              <Badge color="violet" variant="soft" style={{ alignSelf: 'flex-start' }}>
                {instrument.shortName}
              </Badge>
            </Flex>
            <Flex gap="3">
              {!isNewMode && !isEditMode && !isReportMode && (
                <Button onClick={() => navigate(`/assessment/${id}/edit`)}>Editar</Button>
              )}
              {!isNewMode && !isReportMode && (
                <Button onClick={() => navigate(`/assessment/${id}/report`)}>Ver Relatório</Button>
              )}
              <Button onClick={() => navigate('/')} variant="outline" color="gray">Voltar</Button>
            </Flex>
          </Flex>

          {validationError && (
            <Box mb="4" p="3" role="alert" style={{ backgroundColor: '#FFEBEE', borderRadius: '4px' }}>
              <Text color="crimson" weight="bold">Erros de validação: </Text>
              <Text color="crimson">{validationError}</Text>
            </Box>
          )}

          {isNewMode && (
            <>
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
            </>
          )}

          <ChildDataSection
            formData={formData}
            updateFormData={updateFormData}
            disabled={isViewMode || isReportMode}
          />

          <ExaminerDataSection
            formData={formData}
            updateFormData={updateFormData}
            disabled={isViewMode || isReportMode}
          />

          <CaregiverDataSection
            formData={formData}
            updateFormData={updateFormData}
            disabled={isViewMode || isReportMode}
          />

          <InstructionsSection />

          <SensoryProcessingSection
            formData={formData}
            updateItemResponse={updateItemResponse}
            updateFormData={updateFormData}
            disabled={isViewMode || isReportMode}
          />

          <Flex gap="3" mt="4" justify="end">
            {!isViewMode && !isReportMode && (
              <>
                <Button variant="soft" color="gray" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="violet"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Flex gap="2" align="center">
                      <LoadingSpinner size="small" />
                      <Text>{isNewMode ? 'Criando...' : 'Salvando...'}</Text>
                    </Flex>
                  ) : (
                    isNewMode ? 'Criar Avaliação' : 'Salvar Alterações'
                  )}
                </Button>
              </>
            )}
            {(isViewMode || isReportMode) && (
              <>
                <Button variant="soft" color="gray" onClick={handleClose}>
                  Voltar
                </Button>
                {isViewMode && (
                  <Button onClick={() => navigate(`/assessment/${id}/edit`)}>
                    Editar
                  </Button>
                )}
              </>
            )}
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default SensoryProfileForm;
