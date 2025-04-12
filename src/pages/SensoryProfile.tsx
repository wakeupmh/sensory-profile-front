 import * as React from 'react';
import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../services/api';

import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection from '../components/sensory-profile/SensoryProcessingSection';
import useFormData from '../components/sensory-profile/useFormData';
import { Button, Flex, Text, Box, Card, Heading } from '@radix-ui/themes';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';

const SensoryProfileForm: React.FC = () => {
  const { formData, updateFormData, updateItemResponse, setFormData } = useFormData();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isViewMode = !!id && !location.pathname.includes('/edit') && !location.pathname.includes('/report');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isReportMode = !!id && location.pathname.includes('/report');
  const isNewMode = !id;

  useEffect(() => {
    // If we have an ID and we're not in new mode, fetch the assessment data
    if (id && !isNewMode) {
      const fetchAssessment = async () => {
        try {
          setLoading(true);
          setNotFound(false);
          const data = await assessmentApi.getAssessmentById(id);
          setFormData(data);
          setError(null);
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
  }, [id, isNewMode, setFormData]);

  useEffect(() => {
    // If we're in report mode, fetch the report
    if (id && isReportMode) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          await assessmentApi.generateReport(id);
          // Handle report data as needed
          setError(null);
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
  }, [id, isReportMode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (isNewMode) {
        await assessmentApi.createAssessment(formData);
      } else if (isEditMode && id) {
        await assessmentApi.updateAssessment(id, formData);
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
              <Button onClick={() => navigate('/')} variant="outline" color='gray'>Voltar</Button>
            </Flex>
          </Flex>

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
                  onClick={handleSubmit}
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