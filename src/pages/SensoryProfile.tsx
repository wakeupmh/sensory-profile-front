/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../services/api';

import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection from '../components/sensory-profile/SensoryProcessingSection';
import useFormData from '../components/sensory-profile/useFormData';
import { SensorySection } from '../components/sensory-profile/types';
import { Button, Flex, Text, Box, Card, Heading } from '@radix-ui/themes';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuth } from '@clerk/clerk-react';

const SensoryProfileForm: React.FC = () => {
  const { formData, updateFormData, updateItemResponse, setFormData } = useFormData();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const fetchedAssessmentRef = useRef(false);
  const fetchedReportRef = useRef(false);
  
  const isViewMode = !!id && !location.pathname.includes('/edit') && !location.pathname.includes('/report');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isReportMode = !!id && location.pathname.includes('/report');
  const isNewMode = !id;

  useEffect(() => {
    if (id && !isNewMode) {
      const fetchAssessment = async () => {
        if (fetchedAssessmentRef.current) return;
        
        try {
          setLoading(true);
          setNotFound(false);
          const token = await getToken();
          const response = await assessmentApi.getAssessmentById(id, token);
          
          // Verificar se a resposta está no formato novo (com assessment e responses)
          if (response.assessment && response.responses) {
            // Formato novo - transformar para o formato do formData
            const { assessment, responses } = response;
            
            // Create a new formData object based on the response
            const newFormData = {
              ...formData,
              child: {
                name: assessment.childName,
                birthDate: assessment.childBirthDate ? new Date(assessment.childBirthDate).toISOString().split('T')[0] : '',
                gender: assessment.childGender,
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
            };
            
            // Process sensory item responses
            if (responses && responses.length > 0) {
              // Map responses to their respective sections
              const sections = [
                'auditoryProcessing', 'visualProcessing', 'tactileProcessing', 
                'movementProcessing', 'bodyPositionProcessing', 'oralSensitivityProcessing', 
                'socialEmotionalResponses', 'attentionResponses'
              ] as const;
              
              // Update each section with the responses
              sections.forEach(section => {
                const sectionItems = [...newFormData[section].items];
                
                // Update each item with its response from the backend
                sectionItems.forEach(item => {
                  const responseData = responses.find((r: { itemId: number; }) => r.itemId === item.id);
                  if (responseData) {
                    item.response = responseData.response;
                    item.responseId = responseData.id;
                  }
                });
                
                // Update the section in the form data
                newFormData[section] = {
                  ...newFormData[section],
                  items: sectionItems,
                  rawScore: assessment[`${section}RawScore`] || 0
                };
              });
            }
            
            setFormData(newFormData);
          } else {
            setFormData(response);
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
    }
  }, [id, isNewMode, setFormData, getToken, formData]);

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
    
    if (!formData.child?.name) {
      setValidationError('Nome da criança é obrigatório');
      return false;
    }
    if (!formData.child?.birthDate) {
      setValidationError('Data de nascimento da criança é obrigatória');
      return false;
    }
    if (!formData.child?.gender) {
      setValidationError('Gênero da criança é obrigatório');
      return false;
    }
    if (!formData.child?.age) {
      setValidationError('Idade da criança é obrigatória');
      return false;
    }
    
    // Check examiner data
    if (!formData.examiner?.name) {
      setValidationError('Nome do examinador é obrigatório');
      return false;
    }
    if (!formData.examiner?.profession) {
      setValidationError('Cargo/Função do examinador é obrigatório');
      return false;
    }
    if (!formData.examiner?.contact) {
      setValidationError('Contato do examinador é obrigatório');
      return false;
    }
    
    // Check caregiver data
    if (!formData.caregiver?.name) {
      setValidationError('Nome do cuidador é obrigatório');
      return false;
    }
    if (!formData.caregiver?.relationship) {
      setValidationError('Relação do cuidador com a criança é obrigatória');
      return false;
    }
    if (!formData.caregiver?.contact) {
      setValidationError('Contato do cuidador é obrigatório');
      return false;
    }
    
    // Check sensory processing items
    const sections = [
      'auditoryProcessing', 'visualProcessing', 'tactileProcessing', 
      'movementProcessing', 'oralSensitivityProcessing', 'bodyPositionProcessing', 
      'socialEmotionalResponses', 'attentionResponses'
    ] as const;
    
    for (const section of sections) {
      const items = formData[section as keyof typeof formData];
      if (items) {
        for (const item of (items as SensorySection).items) {
          if (!item.response) {
            setValidationError(`Todos os itens de processamento sensorial são obrigatórios`);
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const token = await getToken();
      
      // Enviar os dados no formato original do formData
      if (isNewMode) {
        // Extrair os comentários de cada seção
        const comments = [
          { section: 'auditoryProcessing', comments: formData.auditoryProcessing.comments },
          { section: 'visualProcessing', comments: formData.visualProcessing.comments },
          { section: 'tactileProcessing', comments: formData.tactileProcessing.comments },
          { section: 'movementProcessing', comments: formData.movementProcessing.comments },
          { section: 'bodyPositionProcessing', comments: formData.bodyPositionProcessing.comments },
          { section: 'oralSensitivityProcessing', comments: formData.oralSensitivityProcessing.comments },
          { section: 'socialEmotionalResponses', comments: formData.socialEmotionalResponses.comments },
          { section: 'attentionResponses', comments: formData.attentionResponses.comments }
        ];
        
        // Incluir os comentários no payload
        const dataToCreate = {
          ...formData,
          comments
        };
        
        await assessmentApi.createAssessment(dataToCreate, token);
      } else if (isEditMode && id) {
        // Extrair os comentários de cada seção
        const comments = [
          { section: 'auditoryProcessing', comments: formData.auditoryProcessing.comments },
          { section: 'visualProcessing', comments: formData.visualProcessing.comments },
          { section: 'tactileProcessing', comments: formData.tactileProcessing.comments },
          { section: 'movementProcessing', comments: formData.movementProcessing.comments },
          { section: 'bodyPositionProcessing', comments: formData.bodyPositionProcessing.comments },
          { section: 'oralSensitivityProcessing', comments: formData.oralSensitivityProcessing.comments },
          { section: 'socialEmotionalResponses', comments: formData.socialEmotionalResponses.comments },
          { section: 'attentionResponses', comments: formData.attentionResponses.comments }
        ];
        
        // Para edição, vamos garantir que o ID esteja incluído
        const dataToUpdate = {
          ...formData,
          id: id,
          comments
        };
        
        await assessmentApi.updateAssessment(id, dataToUpdate, token);
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
            <Button onClick={() => navigate('/')} color='gray'>Voltar</Button>
          </Flex>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Flex justify="between" align="center" mb="6">
            <Heading size="7" color='violet'>
              {getTitle()}
            </Heading>
            <Flex gap="3">
              {!isNewMode && !isEditMode && !isReportMode && (
                <Button onClick={() => navigate(`/assessment/${id}/edit`)}>Editar</Button>
              )}
              {!isNewMode && !isReportMode && (
                <Button onClick={() => navigate(`/assessment/${id}/report`)}>Ver Relatório</Button>
              )}
              {(isEditMode) && (
                <Button type="submit" color='violet'>Salvar</Button>
              )}
              {(isNewMode) && (
                <Button type="submit" color='violet'>Nova Avaliação</Button>
              )}
              <Button onClick={() => navigate('/')} variant="outline" color='gray'>Voltar</Button>
            </Flex>
          </Flex>

          {validationError && (
            <Box mb="4" p="3" style={{ backgroundColor: '#FFEBEE', borderRadius: '4px' }}>
              <Text color="crimson" weight="bold">Erros de validação:</Text>
              <Text color="crimson">{validationError}</Text>
            </Box>
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